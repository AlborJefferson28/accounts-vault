import { LockKey, Plus, Lock, KeyReturn, MagnifyingGlass, Moon, Sun } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AccountCard } from "@/components/AccountCard";
import type { Account } from "@/lib/types";

interface VaultScreenProps {
  accounts: Account[];
  search: string;
  onSearchChange: (value: string) => void;
  onNew: () => void;
  onLock: () => void;
  onCardClick: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export function VaultScreen({
  accounts,
  search,
  onSearchChange,
  onNew,
  onLock,
  onCardClick,
  onEdit,
  onDelete,
  theme,
  onToggleTheme,
}: VaultScreenProps) {
  const q = search.toLowerCase();
  const filtered = accounts.filter(
    (a) =>
      a.name.toLowerCase().includes(q) ||
      a.username.toLowerCase().includes(q)
  );

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <LockKey size={18} weight="duotone" />
          </div>
          <span className="text-sm font-semibold">Vault</span>
          <span className="text-xs text-muted-foreground">
            {accounts.length} cuenta{accounts.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex gap-2">
          <Button size="sm" onClick={onNew}>
            <Plus size={16} weight="bold" />
            Nueva
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={onToggleTheme}>
                {theme === "dark" ? <Sun size={16} weight="duotone" /> : <Moon size={16} weight="duotone" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{theme === "dark" ? "Modo claro" : "Modo oscuro"}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={onLock}>
                <Lock size={16} weight="duotone" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bloquear</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <MagnifyingGlass
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="text"
          placeholder="Buscar cuenta..."
          className="pl-9"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Cards or Empty */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-3">
            <KeyReturn size={24} className="text-muted-foreground" weight="duotone" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {accounts.length ? "Sin resultados" : "Tu bóveda está vacía"}
          </p>
          {!accounts.length && (
            <Button onClick={onNew}>
              <Plus size={16} weight="bold" />
              Agregar primera cuenta
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-2">
          {filtered.map((a) => (
            <AccountCard
              key={a.id}
              account={a}
              onCardClick={onCardClick}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </>
  );
}
