import { useState, useRef } from "react";
import {
  Eye,
  EyeSlash,
  ArrowsClockwise,
  Copy,
} from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { IconPicker } from "@/components/IconPicker";
import { generatePassword, calcStrength } from "@/lib/crypto";
import type { Account, PasswordOptions } from "@/lib/types";

interface FormModalProps {
  open: boolean;
  editId: string | null;
  accounts: Account[];
  formIcon: string;
  onIconChange: (id: string) => void;
  formPw: string;
  onPwChange: (pw: string) => void;
  formPwOpts: PasswordOptions;
  onOptsChange: (opts: PasswordOptions) => void;
  showFormPw: boolean;
  onToggleShowPw: () => void;
  onRegen: () => void;
  onCopyPw: () => void;
  saving: boolean;
  onSave: (name: string, url: string, username: string) => void;
  onClose: () => void;
}

const PW_CHECKBOXES: { key: keyof PasswordOptions; label: string }[] = [
  { key: "upper", label: "Mayúsculas" },
  { key: "lower", label: "Minúsculas" },
  { key: "numbers", label: "Números" },
  { key: "symbols", label: "Símbolos" },
];

export function FormModal({
  open,
  editId,
  accounts,
  formIcon,
  onIconChange,
  formPw,
  onPwChange,
  formPwOpts,
  onOptsChange,
  showFormPw,
  onToggleShowPw,
  onRegen,
  onCopyPw,
  saving,
  onSave,
  onClose,
}: FormModalProps) {
  const acc = editId ? accounts.find((a) => a.id === editId) : null;
  const str = calcStrength(formPw);

  const nameRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);
  const userRef = useRef<HTMLInputElement>(null);

  const [nameError, setNameError] = useState(false);
  const [userError, setUserError] = useState(false);

  const handleOptChange = (key: keyof PasswordOptions, value: boolean | number) => {
    const next = { ...formPwOpts, [key]: value };
    onOptsChange(next);
    if (typeof value === "boolean") {
      onPwChange(
        generatePassword(next.length, next.upper, next.lower, next.numbers, next.symbols)
      );
    }
  };

  const handleSave = () => {
    const name = nameRef.current?.value.trim() ?? "";
    const url = urlRef.current?.value.trim() ?? "";
    const username = userRef.current?.value.trim() ?? "";

    setNameError(!name);
    setUserError(!username);
    if (!name || !username) return;

    onSave(name, url, username);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {acc ? "Editar cuenta" : "Nueva cuenta"}
          </DialogTitle>
        </DialogHeader>

        {/* Icon picker */}
        <div className="space-y-2">
          <Label>Plataforma</Label>
          <IconPicker value={formIcon} onChange={onIconChange} />
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="form-name">Nombre *</Label>
          <Input
            id="form-name"
            ref={nameRef}
            defaultValue={acc?.name ?? ""}
            placeholder="Ej: Gmail personal"
            className={cn(nameError && "border-destructive")}
          />
        </div>

        {/* URL */}
        <div className="space-y-2">
          <Label htmlFor="form-url">URL</Label>
          <Input
            id="form-url"
            ref={urlRef}
            defaultValue={acc?.url ?? ""}
            placeholder="https://..."
          />
        </div>

        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="form-user">Usuario / Email *</Label>
          <Input
            id="form-user"
            ref={userRef}
            defaultValue={acc?.username ?? ""}
            placeholder="usuario@ejemplo.com"
            className={cn(userError && "border-destructive")}
          />
        </div>

        {/* Password generator */}
        <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
          <Label>
            {acc ? "Contraseña (regenerar o editar)" : "Contraseña generada"}
          </Label>

          {/* Password input + actions row */}
          <div className="flex gap-1.5 items-center">
            <Input
              type={showFormPw ? "text" : "password"}
              value={formPw}
              onChange={(e) => onPwChange(e.target.value)}
              placeholder="Contraseña"
              className="font-mono text-sm bg-background"
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={onToggleShowPw}>
                  {showFormPw ? <EyeSlash size={16} /> : <Eye size={16} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{showFormPw ? "Ocultar" : "Ver"}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={onRegen}>
                  <ArrowsClockwise size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Regenerar</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={onCopyPw}>
                  <Copy size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copiar</TooltipContent>
            </Tooltip>
          </div>

          {/* Strength bar */}
          {formPw && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${str.pct}%`, backgroundColor: str.color }}
                />
              </div>
              <span
                className="text-[11px] font-semibold min-w-16 text-right"
                style={{ color: str.color }}
              >
                {str.label}
              </span>
            </div>
          )}

          {/* Options grid */}
          <div className="grid grid-cols-2 gap-2">
            {PW_CHECKBOXES.map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer"
              >
                <Checkbox
                  checked={formPwOpts[key] as boolean}
                  onCheckedChange={(v) => handleOptChange(key, !!v)}
                />
                {label}
              </label>
            ))}
          </div>

          {/* Length slider */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              Longitud
            </span>
            <Slider
              min={8}
              max={32}
              step={1}
              value={[formPwOpts.length]}
              onValueChange={([v]) => {
                const next = { ...formPwOpts, length: v };
                onOptsChange(next);
                onPwChange(
                  generatePassword(next.length, next.upper, next.lower, next.numbers, next.symbols)
                );
              }}
              className="flex-1"
            />
            <span className="text-sm font-medium min-w-6 text-right">
              {formPwOpts.length}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button disabled={saving} onClick={handleSave}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
