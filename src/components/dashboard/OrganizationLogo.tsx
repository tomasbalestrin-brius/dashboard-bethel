import { useOrganization } from '@/hooks/useOrganization';

export function OrganizationLogo() {
  const { organization } = useOrganization();

  if (!organization) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg animate-pulse">
          D
        </div>
        <div>
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          <div className="h-3 w-16 bg-muted rounded mt-1 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {organization.logo_url ? (
        <img
          src={organization.logo_url}
          alt={organization.name}
          className="w-10 h-10 rounded-lg object-cover"
        />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
          {organization.name[0].toUpperCase()}
        </div>
      )}
      <div>
        <div className="font-bold text-foreground leading-none">
          {organization.name}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">Analytics</div>
      </div>
    </div>
  );
}
