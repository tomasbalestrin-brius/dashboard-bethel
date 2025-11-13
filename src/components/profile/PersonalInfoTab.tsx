import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Building2, Briefcase, Phone, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LoadingButton } from '@/components/auth/LoadingButton';
import { ProfileCard } from './ProfileCard';
import { useProfile } from '@/hooks/useProfile';

const personalInfoSchema = z.object({
  full_name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').nullable(),
  company: z.string().nullable(),
  role: z.string().nullable(),
  phone: z.string().nullable(),
  bio: z.string().max(500, 'Bio deve ter no máximo 500 caracteres').nullable(),
});

type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

export function PersonalInfoTab() {
  const { profile, updateProfile } = useProfile();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    reset,
    watch,
  } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      company: profile?.company || '',
      role: profile?.role || '',
      phone: profile?.phone || '',
      bio: profile?.bio || '',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name || '',
        company: profile.company || '',
        role: profile.role || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: PersonalInfoFormData) => {
    await updateProfile(data);
    reset(data);
  };

  const bioLength = watch('bio')?.length || 0;

  return (
    <ProfileCard
      title="Informações Pessoais"
      description="Atualize seus dados pessoais"
      icon={<User className="w-5 h-5" />}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="full_name" className="text-sm font-semibold text-slate-300">
            Nome completo
          </label>
          <Input
            id="full_name"
            placeholder="Seu nome completo"
            className="h-11 bg-slate-900/50 border-slate-700"
            {...register('full_name')}
          />
          {errors.full_name && (
            <p className="text-sm text-red-400">{errors.full_name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="company" className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Empresa (opcional)
            </label>
            <Input
              id="company"
              placeholder="Nome da sua empresa"
              className="h-11 bg-slate-900/50 border-slate-700"
              {...register('company')}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Cargo (opcional)
            </label>
            <Input
              id="role"
              placeholder="Seu cargo"
              className="h-11 bg-slate-900/50 border-slate-700"
              {...register('role')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Telefone (opcional)
          </label>
          <Input
            id="phone"
            type="tel"
            placeholder="(11) 99999-9999"
            className="h-11 bg-slate-900/50 border-slate-700"
            {...register('phone')}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="bio" className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Bio (opcional)
          </label>
          <Textarea
            id="bio"
            placeholder="Conte um pouco sobre você..."
            className="min-h-[100px] bg-slate-900/50 border-slate-700"
            {...register('bio')}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            {errors.bio && <span className="text-red-400">{errors.bio.message}</span>}
            <span className="ml-auto">{bioLength}/500</span>
          </div>
        </div>

        <LoadingButton
          type="submit"
          loading={isSubmitting}
          disabled={!isDirty}
          className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          Salvar alterações
        </LoadingButton>
      </form>
    </ProfileCard>
  );
}
