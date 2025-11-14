import { supabase } from '@/integrations/supabase/client';

// Wrapper tipado para contornar problema de tipos após migração
export const supabaseTyped = supabase as any;
