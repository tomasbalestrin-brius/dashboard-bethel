export type UserRole = 'admin' | 'team' | 'viewer';

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
