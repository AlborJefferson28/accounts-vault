import { getPlatformIcon } from "@/lib/platform-icons";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PencilSimple, Trash } from "@phosphor-icons/react";
import type { Account } from "@/lib/types";

interface AccountCardProps {
  account: Account;
  onCardClick: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function AccountCard({
  account,
  onCardClick,
  onEdit,
  onDelete,
}: AccountCardProps) {
  const { Icon } = getPlatformIcon(account.iconId);

  return (
    <div
      className="group flex items-center gap-3 rounded-lg border bg-card p-3 cursor-pointer transition-colors hover:bg-accent/50"
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest("[data-actions]")) {
          onCardClick(account.id);
        }
      }}
    >
      {/* Icon */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon size={20} weight="duotone" />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{account.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {account.username}
        </p>
      </div>

      {/* Actions */}
      <div
        data-actions
        className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(account.id)}
            >
              <PencilSimple size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Editar</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(account.id)}
            >
              <Trash size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Eliminar</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
