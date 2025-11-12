import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session, USERS } from '@/types/auth';

interface AuthContextType {
  currentUser: Omit<User, 'password'> | null;
  login: (email: string, password: string, remember: boolean) => { success: boolean; message?: string };
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Omit<User, 'password'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão existente
    const savedSession = localStorage.getItem('dashboard_session') || sessionStorage.getItem('dashboard_session');
    if (savedSession) {
      try {
        const session: Session = JSON.parse(savedSession);
        // Verificar se sessão não expirou (24h)
        const expiryTime = 24 * 60 * 60 * 1000;
        if (Date.now() - session.timestamp < expiryTime) {
          setCurrentUser(session.user);
        } else {
          localStorage.removeItem('dashboard_session');
          sessionStorage.removeItem('dashboard_session');
        }
      } catch (e) {
        console.error('Sessão inválida');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string, remember: boolean) => {
    const user = USERS.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return { success: false, message: 'Email ou senha incorretos' };
    }

    const { password: _, ...userWithoutPassword } = user;
    setCurrentUser(userWithoutPassword);

    const session: Session = {
      user: userWithoutPassword,
      timestamp: Date.now()
    };

    if (remember) {
      localStorage.setItem('dashboard_session', JSON.stringify(session));
    } else {
      sessionStorage.setItem('dashboard_session', JSON.stringify(session));
    }

    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('dashboard_session');
    sessionStorage.removeItem('dashboard_session');
  };

  const hasPermission = (permission: string) => {
    if (!currentUser) return false;
    return currentUser.permissions.includes('all') || currentUser.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, hasPermission, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
