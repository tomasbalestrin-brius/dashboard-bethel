import { useMemo } from 'react';
import { Check, Circle } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
}

interface PasswordRequirement {
  label: string;
  met: boolean;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const requirements = useMemo((): PasswordRequirement[] => {
    return [
      { label: 'Mínimo 8 caracteres', met: password.length >= 8 },
      { label: '1 letra maiúscula', met: /[A-Z]/.test(password) },
      { label: '1 número', met: /[0-9]/.test(password) },
      { label: '1 caractere especial (opcional)', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ];
  }, [password]);

  const strength = useMemo(() => {
    const metCount = requirements.filter((r) => r.met).length;
    if (password.length === 0) return { level: 0, label: '', color: '' };
    if (password.length < 6) return { level: 25, label: 'Fraca', color: 'bg-red-500' };
    if (metCount <= 2) return { level: 50, label: 'Média', color: 'bg-yellow-500' };
    if (metCount === 3) return { level: 75, label: 'Boa', color: 'bg-green-400' };
    return { level: 100, label: 'Forte', color: 'bg-green-500' };
  }, [requirements, password]);

  if (password.length === 0) return null;

  return (
    <div className="mt-3 space-y-3">
      {/* Barra de progresso */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Força da senha</span>
          <span className={`font-medium ${
            strength.level >= 75 ? 'text-green-400' :
            strength.level >= 50 ? 'text-yellow-400' :
            'text-red-400'
          }`}>
            {strength.label}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-700 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${strength.color}`}
            style={{ width: `${strength.level}%` }}
          />
        </div>
      </div>

      {/* Lista de requisitos */}
      <div className="space-y-1.5">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            {req.met ? (
              <Check className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
            ) : (
              <Circle className="h-3.5 w-3.5 text-slate-600 flex-shrink-0" />
            )}
            <span className={req.met ? 'text-green-400' : 'text-muted-foreground'}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
