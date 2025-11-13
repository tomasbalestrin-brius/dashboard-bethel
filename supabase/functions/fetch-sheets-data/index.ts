import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { range, gid } = await req.json();
    
    if (!range) {
      throw new Error('range é obrigatório');
    }

    console.log(`🔄 Buscando dados - Range: ${range}${gid ? `, GID: ${gid}` : ''}`);

    // Configurar credenciais do service account
    const serviceAccountJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT');
    if (!serviceAccountJson) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT não configurado');
    }

    console.log('📝 Service account configurado, iniciando autenticação...');

    let credentials;
    try {
      credentials = JSON.parse(serviceAccountJson);
      
      // Validar se tem as propriedades necessárias
      if (!credentials.client_email || !credentials.private_key) {
        throw new Error('Service account JSON inválido: faltam client_email ou private_key');
      }
    } catch (e) {
      console.error('Erro ao parsear credentials:', e);
      throw new Error('GOOGLE_SERVICE_ACCOUNT deve conter um JSON válido com todo o conteúdo do arquivo service account');
    }
    
    // Helper para base64url encoding
    const base64url = (input: string): string => {
      return btoa(input)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    };

    // Obter access token usando JWT
    const jwtHeader = base64url(JSON.stringify({
      alg: "RS256",
      typ: "JWT"
    }));

    const now = Math.floor(Date.now() / 1000);
    const jwtClaimSet = base64url(JSON.stringify({
      iss: credentials.client_email,
      scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now
    }));

    // Importar chave privada
    const pemHeader = "-----BEGIN PRIVATE KEY-----";
    const pemFooter = "-----END PRIVATE KEY-----";
    const privateKeyPem = credentials.private_key;
    
    // Extrair o conteúdo da chave sem os headers
    let pemContents = privateKeyPem;
    if (privateKeyPem.includes(pemHeader)) {
      pemContents = privateKeyPem
        .replace(pemHeader, '')
        .replace(pemFooter, '')
        .replace(/\s/g, '');
    }
    
    // Decodificar base64 para binário
    const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
    
    const privateKey = await crypto.subtle.importKey(
      "pkcs8",
      binaryDer,
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256",
      },
      false,
      ["sign"]
    );

    // Assinar JWT
    const dataToSign = `${jwtHeader}.${jwtClaimSet}`;
    const signature = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      privateKey,
      new TextEncoder().encode(dataToSign)
    );

    // Converter signature para base64url
    const signatureArray = new Uint8Array(signature);
    const signatureBase64 = base64url(String.fromCharCode(...signatureArray));

    const jwt = `${jwtHeader}.${jwtClaimSet}.${signatureBase64}`;

    // Obter access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Erro ao obter token: ${tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // ID da planilha
    const SHEET_ID = '1V0-yWzGbDWUEQ21CPtNcHrzPQfLTXKHNBYUlSfzO2Pc';

    // Buscar dados da planilha - usando apenas o range sem especificar a aba
    const sheetsResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!sheetsResponse.ok) {
      const errorText = await sheetsResponse.text();
      console.error('❌ Erro da API Google Sheets:', errorText);
      
      let errorDetail = '';
      try {
        const errorJson = JSON.parse(errorText);
        errorDetail = errorJson.error?.message || '';
      } catch (e) {
        errorDetail = errorText;
      }
      
      if (sheetsResponse.status === 403) {
        throw new Error('Acesso negado. Certifique-se de que a service account tem permissão para visualizar a planilha.');
      } else if (sheetsResponse.status === 404) {
        throw new Error(`Planilha ou range não encontrado. Range: ${range}`);
      } else if (sheetsResponse.status === 400) {
        throw new Error(`Range inválido: ${range}. Verifique se o nome da aba está correto na planilha. Detalhes: ${errorDetail}`);
      } else if (sheetsResponse.status === 429) {
        throw new Error('Limite de requisições excedido. Aguarde alguns segundos.');
      }
      
      throw new Error(`Erro ao buscar dados (${sheetsResponse.status}): ${errorDetail || sheetsResponse.statusText}`);
    }

    const sheetsData = await sheetsResponse.json();

    if (!sheetsData.values) {
      console.log('⚠️ Nenhum dado encontrado');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Nenhum dado encontrado na planilha' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`✅ Dados recebidos: ${sheetsData.values.length} linhas`);

    return new Response(
      JSON.stringify({
        success: true,
        data: sheetsData.values,
        range: sheetsData.range,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Erro ao buscar dados:', error);
    
    let errorMessage = 'Erro ao carregar dados';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        status: statusCode, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
