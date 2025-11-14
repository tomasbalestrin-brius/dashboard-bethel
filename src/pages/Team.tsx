import { useState, useEffect } from 'react';
import { useOrganization } from '@/hooks/useOrganization';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseTyped as supabase } from '@/lib/supabase-typed';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Mail, MoreVertical, Plus, Shield, Trash2, UserPlus, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface MemberWithProfile {
  id: string;
  role: string;
  joined_at: string;
  user_id: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  };
  users: {
    email: string;
  };
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  created_at: string;
  expires_at: string;
  status: string;
}

export default function Team() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { organization, canManageMembers, userRole, removeMember, updateMemberRole, inviteMember } = useOrganization();
  
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberWithProfile | null>(null);
  
  // Invite form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (organization) {
      fetchMembers();
      fetchInvitations();
    }
  }, [organization]);

  const fetchMembers = async () => {
    if (!organization) return;

    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          id,
          role,
          joined_at,
          user_id,
          profiles!inner (
            full_name,
            avatar_url
          )
        `)
        .eq('organization_id', organization.id)
        .order('joined_at', { ascending: false });

      if (error) throw error;

      // Buscar emails dos usuários
      const membersWithEmails = await Promise.all(
        (data || []).map(async (member: any) => {
          const { data: userData } = await supabase.auth.admin.getUserById(member.user_id);
          return {
            ...member,
            users: {
              email: userData?.user?.email || 'Email não disponível',
            },
          };
        })
      );

      setMembers(membersWithEmails as MemberWithProfile[]);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitations = async () => {
    if (!organization) return;

    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;

    setInviting(true);
    const result = await inviteMember(inviteEmail, inviteRole);
    setInviting(false);

    if (result?.success) {
      setInviteDialogOpen(false);
      setInviteEmail('');
      setInviteRole('member');
      await fetchInvitations();
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedMember) return;

    const result = await removeMember(selectedMember.id);
    if (result?.success) {
      await fetchMembers();
      setDeleteDialogOpen(false);
      setSelectedMember(null);
    }
  };

  const handleChangeRole = async (memberId: string, newRole: 'admin' | 'member' | 'viewer') => {
    const result = await updateMemberRole(memberId, newRole);
    if (result?.success) {
      await fetchMembers();
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('invitations')
        .update({ status: 'cancelled' })
        .eq('id', inviteId);

      if (error) throw error;

      toast({ title: 'Convite cancelado!' });
      await fetchInvitations();
    } catch (error: any) {
      toast({
        title: 'Erro ao cancelar convite',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      owner: { variant: 'default' as const, label: 'Proprietário' },
      admin: { variant: 'secondary' as const, label: 'Administrador' },
      member: { variant: 'outline' as const, label: 'Membro' },
      viewer: { variant: 'outline' as const, label: 'Visualizador' },
    };
    const config = variants[role as keyof typeof variants] || variants.member;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getRoleDescription = (role: string) => {
    const descriptions = {
      admin: 'Pode gerenciar membros e configurações',
      member: 'Pode visualizar e editar dados',
      viewer: 'Apenas visualização',
    };
    return descriptions[role as keyof typeof descriptions] || '';
  };

  const currentMemberCount = members.length + invitations.length;
  const maxMembers = organization?.max_users || 3;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground mt-4">Carregando equipe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Equipe</h1>
              <p className="text-muted-foreground mt-1">
                {currentMemberCount} de {maxMembers} membros
              </p>
            </div>
          </div>

          {canManageMembers && (
            <Button onClick={() => setInviteDialogOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Convidar Membro
            </Button>
          )}
        </div>

        {/* Members List */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Membros Ativos</h2>
          
          {members.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nenhum membro ainda
            </div>
          ) : (
            <div className="space-y-4">
              {members.map((member) => {
                const isCurrentUser = member.user_id === user?.id;
                const isOwner = member.role === 'owner';
                const canEdit = canManageMembers && !isCurrentUser && !isOwner;

                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    {/* Avatar */}
                    {member.profiles.avatar_url ? (
                      <img
                        src={member.profiles.avatar_url}
                        alt={member.profiles.full_name || 'Avatar'}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        {(member.profiles.full_name || member.users.email)[0].toUpperCase()}
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {member.profiles.full_name || member.users.email.split('@')[0]}
                        </span>
                        {isCurrentUser && (
                          <Badge variant="outline" className="text-xs">
                            Você
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {member.users.email}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Entrou {formatDistanceToNow(new Date(member.joined_at), { 
                          addSuffix: true,
                          locale: ptBR 
                        })}
                      </p>
                    </div>

                    {/* Role Badge */}
                    <div>{getRoleBadge(member.role)}</div>

                    {/* Actions */}
                    {canEdit && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {member.role !== 'admin' && (
                            <DropdownMenuItem
                              onClick={() => handleChangeRole(member.id, 'admin')}
                            >
                              <Shield className="w-4 h-4 mr-2" />
                              Promover a Admin
                            </DropdownMenuItem>
                          )}
                          {member.role === 'admin' && (
                            <DropdownMenuItem
                              onClick={() => handleChangeRole(member.id, 'member')}
                            >
                              Rebaixar a Membro
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setSelectedMember(member);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Pending Invitations */}
        {invitations.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Convites Pendentes</h2>
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-border"
                >
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Mail className="w-6 h-6 text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{invitation.email}</div>
                    <p className="text-sm text-muted-foreground">
                      Expira {formatDistanceToNow(new Date(invitation.expires_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>

                  <div>{getRoleBadge(invitation.role)}</div>

                  {canManageMembers && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCancelInvite(invitation.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Invite Dialog */}
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convidar Membro</DialogTitle>
              <DialogDescription>
                Envie um convite para um novo membro se juntar à {organization?.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Função</Label>
                <Select value={inviteRole} onValueChange={(v: any) => setInviteRole(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div>
                        <div className="font-medium">Administrador</div>
                        <div className="text-xs text-muted-foreground">
                          {getRoleDescription('admin')}
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="member">
                      <div>
                        <div className="font-medium">Membro</div>
                        <div className="text-xs text-muted-foreground">
                          {getRoleDescription('member')}
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="viewer">
                      <div>
                        <div className="font-medium">Visualizador</div>
                        <div className="text-xs text-muted-foreground">
                          {getRoleDescription('viewer')}
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setInviteDialogOpen(false)}
                disabled={inviting}
              >
                Cancelar
              </Button>
              <Button onClick={handleInvite} disabled={!inviteEmail.trim() || inviting}>
                {inviting ? 'Enviando...' : 'Enviar Convite'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover membro?</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover {selectedMember?.profiles.full_name || selectedMember?.users.email} da equipe?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleRemoveMember} className="bg-destructive text-destructive-foreground">
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
