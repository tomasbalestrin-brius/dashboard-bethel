import { useRef } from 'react';
import { Camera, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { cn } from '@/lib/utils';

export function AvatarSection() {
  const { user } = useAuth();
  const { profile, uploadAvatar, loading } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadAvatar(file);
    }
  };

  const getInitials = () => {
    if (profile?.full_name) {
      const names = profile.full_name.split(' ');
      return `${names[0][0]}${names[names.length - 1]?.[0] || ''}`.toUpperCase();
    }
    return user?.email?.[0].toUpperCase() || 'U';
  };

  const memberSince = profile?.created_at
    ? format(new Date(profile.created_at), 'MMM yyyy', { locale: ptBR })
    : '';

  return (
    <div className="backdrop-blur-xl bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Avatar */}
        <div className="relative group">
          <div
            className={cn(
              'w-32 h-32 rounded-full overflow-hidden cursor-pointer',
              'ring-4 ring-purple-500/20 group-hover:ring-purple-500/40 transition-all'
            )}
            onClick={handleAvatarClick}
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-3xl font-bold">
                {getInitials()}
              </div>
            )}
          </div>

          {/* Hover overlay */}
          <div
            className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            onClick={handleAvatarClick}
          >
            <Camera className="w-8 h-8 text-white" />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* User Info */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">
            {profile?.full_name || user?.email?.split('@')[0] || 'Usuário'}
          </h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          {memberSince && (
            <p className="text-xs text-muted-foreground">
              Membro desde {memberSince}
            </p>
          )}
        </div>

        {/* Stats (placeholder) */}
        <div className="grid grid-cols-3 gap-4 w-full pt-4 border-t border-slate-700">
          <div>
            <p className="text-2xl font-bold text-purple-400">12</p>
            <p className="text-xs text-muted-foreground">Produtos</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-pink-400">45</p>
            <p className="text-xs text-muted-foreground">Relatórios</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-400">98%</p>
            <p className="text-xs text-muted-foreground">Precisão</p>
          </div>
        </div>
      </div>
    </div>
  );
}
