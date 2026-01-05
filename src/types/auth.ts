// Roles do sistema multi-tenant
export type UserRole =
  | 'owner'      // Proprietário da organização (máximo controle)
  | 'admin'      // Administrador: acesso total + personalização
  | 'gestor'     // Gestor: acesso a SDR + Monetização
  | 'sdr'        // SDR: acesso apenas à seção SDR
  | 'comercial'  // Comercial: acesso apenas à Monetização
  | 'member'     // Membro genérico
  | 'viewer';    // Visualizador (apenas leitura)

// Tipos de módulos disponíveis
export type ModuleType =
  | 'dashboard'
  | 'resumo'
  | 'roi'
  | 'custos'
  | 'insights'
  | 'comparar-funis'
  | 'exportar'
  | 'aquisicao'
  | 'sdr'
  | 'monetizacao'
  | 'settings';

// Interface de permissões de módulo
export interface ModulePermission {
  moduleName: ModuleType;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  permissions: string[];
}

export interface Session {
  user: Omit<User, 'password'>;
  timestamp: number;
}

export const USERS: User[] = [
  {
    id: 1,
    email: 'admin@bethel.com',
    password: 'Bethel2024!',
    name: 'Administrador',
    role: 'admin',
    permissions: ['all']
  },
  {
    id: 2,
    email: 'time.cleiton@bethel.com',
    password: 'Cleiton2024!',
    name: 'Time Cleiton',
    role: 'team',
    permissions: ['view_cleiton', 'export']
  },
  {
    id: 3,
    email: 'time.julia@bethel.com',
    password: 'Julia2024!',
    name: 'Time Julia',
    role: 'team',
    permissions: ['view_julia', 'export']
  },
  {
    id: 4,
    email: 'viewer@bethel.com',
    password: 'Viewer2024!',
    name: 'Visualizador',
    role: 'viewer',
    permissions: ['view_all']
  }
];
