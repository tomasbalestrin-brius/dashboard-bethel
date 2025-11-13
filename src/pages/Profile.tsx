import { User, Lock, Settings, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AvatarSection } from '@/components/profile/AvatarSection';
import { PersonalInfoTab } from '@/components/profile/PersonalInfoTab';
import { SecurityTab } from '@/components/profile/SecurityTab';
import { PreferencesTab } from '@/components/profile/PreferencesTab';
import { DeleteAccountTab } from '@/components/profile/DeleteAccountTab';
import { useProfile } from '@/hooks/useProfile';
import { CardSkeleton } from '@/components/SkeletonLoader';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function Profile() {
  const { loading } = useProfile();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">Perfil</span>
        </nav>

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
            Meu Perfil
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie suas informações pessoais e configurações
          </p>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <AvatarSection />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="w-full justify-start bg-slate-800/50 border border-slate-700 p-1 rounded-lg">
                <TabsTrigger
                  value="personal"
                  className="flex items-center gap-2 data-[state=active]:bg-purple-600"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Informações Pessoais</span>
                  <span className="sm:hidden">Pessoal</span>
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="flex items-center gap-2 data-[state=active]:bg-purple-600"
                >
                  <Lock className="w-4 h-4" />
                  Segurança
                </TabsTrigger>
                <TabsTrigger
                  value="preferences"
                  className="flex items-center gap-2 data-[state=active]:bg-purple-600"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Preferências</span>
                  <span className="sm:hidden">Config</span>
                </TabsTrigger>
                <TabsTrigger
                  value="delete"
                  className="flex items-center gap-2 data-[state=active]:bg-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Excluir</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="personal">
                  <PersonalInfoTab />
                </TabsContent>

                <TabsContent value="security">
                  <SecurityTab />
                </TabsContent>

                <TabsContent value="preferences">
                  <PreferencesTab />
                </TabsContent>

                <TabsContent value="delete">
                  <DeleteAccountTab />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
