import { useState } from "react";
import { LockKey, Warning } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginScreenProps {
  isNew: boolean;
  loginError: string;
  onLogin: (pw: string) => void;
}

export function LoginScreen({ isNew, loginError, onLogin }: LoginScreenProps) {
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSubmit = () => onLogin(pw);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <LockKey size={32} weight="duotone" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight">Vault</h1>
            <p className="text-sm text-muted-foreground">
              {isNew ? "Crear nueva bóveda" : "Acceso seguro"}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inp-master">Contraseña madre</Label>
            <Input
              id="inp-master"
              type="password"
              placeholder="Mínimo 4 caracteres"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {isNew && (
            <div className="space-y-2">
              <Label htmlFor="inp-confirm">Confirmar contraseña</Label>
              <Input
                id="inp-confirm"
                type="password"
                placeholder="Repite la contraseña"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          )}

          {loginError && (
            <p className="text-sm font-medium text-destructive">{loginError}</p>
          )}

          <Button className="w-full" size="lg" onClick={handleSubmit}>
            {isNew ? "Crear bóveda" : "Desbloquear"}
          </Button>

          {isNew && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground justify-center">
              <Warning size={14} weight="fill" className="text-amber-500 shrink-0" />
              Sin esta contraseña no podrás recuperar tus datos.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
