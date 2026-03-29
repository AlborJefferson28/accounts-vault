import { useState } from "react";
import { LockKey, Warning, EnvelopeSimple } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthScreenProps {
  mode: "login" | "register";
  authError: string;
  onLogin: (email: string, password: string) => void;
  onRegister: (email: string, password: string) => void;
  onToggleMode: () => void;
}

export function AuthScreen({
  mode,
  authError,
  onLogin,
  onRegister,
  onToggleMode,
}: AuthScreenProps) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [localError, setLocalError] = useState("");

  const isRegister = mode === "register";

  const handleSubmit = () => {
    setLocalError("");
    if (!email || !email.includes("@")) {
      setLocalError("Ingresa un correo válido");
      return;
    }
    if (!pw || pw.length < 6) {
      setLocalError("Mínimo 6 caracteres");
      return;
    }
    if (isRegister && pw !== confirm) {
      setLocalError("Las contraseñas no coinciden");
      return;
    }
    if (isRegister) {
      onRegister(email, pw);
    } else {
      onLogin(email, pw);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  const displayError = localError || authError;

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
              {isRegister ? "Crear nueva cuenta" : "Acceso seguro"}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="inp-email">Correo electrónico</Label>
            <div className="relative">
              <EnvelopeSimple
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="inp-email"
                type="email"
                placeholder="usuario@ejemplo.com"
                className="pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="inp-master">Contraseña</Label>
            <Input
              id="inp-master"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete={isRegister ? "new-password" : "current-password"}
            />
          </div>

          {/* Confirm (register only) */}
          {isRegister && (
            <div className="space-y-2">
              <Label htmlFor="inp-confirm">Confirmar contraseña</Label>
              <Input
                id="inp-confirm"
                type="password"
                placeholder="Repite la contraseña"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="new-password"
              />
            </div>
          )}

          {/* Error */}
          {displayError && (
            <p className="text-sm font-medium text-destructive">{displayError}</p>
          )}

          <Button className="w-full" size="lg" onClick={handleSubmit}>
            {isRegister ? "Crear cuenta" : "Iniciar sesión"}
          </Button>

          {/* Toggle mode */}
          <p className="text-center text-sm text-muted-foreground">
            {isRegister ? "¿Ya tienes cuenta?" : "¿Sin cuenta?"}{" "}
            <button
              type="button"
              onClick={onToggleMode}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {isRegister ? "Iniciar sesión" : "Registrarte"}
            </button>
          </p>

          {isRegister && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground justify-center">
              <Warning size={14} weight="fill" className="text-amber-500 shrink-0" />
              Tu contraseña es la clave de cifrado de la bóveda.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
