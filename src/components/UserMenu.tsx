import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function UserMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      // Error is handled by signOut with toast
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user) {
    return (
      <Link to="/login">
        <Button variant="outline" className="border-slate-700 hover:bg-slate-800">
          Entrar
        </Button>
      </Link>
    );
  }

  // Get user initials for avatar
  const getUserInitial = () => {
    const name = user.user_metadata?.full_name || user.email;
    return name.charAt(0).toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 transition-colors">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg">
            {getUserInitial()}
          </div>
          
          {/* Name (hidden on mobile) */}
          <span className="hidden md:block text-sm font-medium text-white">
            {user.user_metadata?.full_name || user.email?.split('@')[0]}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-56 backdrop-blur-xl bg-slate-900/95 border-slate-700/50"
      >
        <DropdownMenuLabel className="text-slate-400">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-white">
              {user.user_metadata?.full_name || 'Usuário'}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-slate-800" />
        
        <Link to="/profile">
          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Meu Perfil</span>
          </DropdownMenuItem>
        </Link>

        <Link to="/team">
          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Equipe</span>
          </DropdownMenuItem>
        </Link>
        
        <DropdownMenuSeparator className="bg-slate-800" />
        
        <DropdownMenuItem 
          onClick={handleSignOut}
          disabled={isLoggingOut}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoggingOut ? 'Saindo...' : 'Sair'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
