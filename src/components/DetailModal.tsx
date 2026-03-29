import {
  Eye,
  EyeSlash,
  Copy,
  PencilSimple,
  Trash,
  ArrowSquareOut,
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getPlatformIcon } from "@/lib/platform-icons";
import type { Account } from "@/lib/types";

interface DetailModalProps {
  open: boolean;
  account: Account | undefined;
  decryptedPw: string;
  showPw: boolean;
  onTogglePw: () => void;
  onCopyUser: () => void;
  onCopyPw: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function DetailModal({
  open,
  account,
  decryptedPw,
  showPw,
  onTogglePw,
  onCopyUser,
  onCopyPw,
  onEdit,
  onDelete,
  onClose,
}: DetailModalProps) {
  if (!account) return null;

  const { Icon } = getPlatformIcon(account.iconId);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Icon size={20} weight="duotone" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="truncate">{account.name}</DialogTitle>
              {account.url && (
                <p className="text-xs text-muted-foreground truncate">
                  {account.url}
                </p>
              )}
            </div>
            {account.url && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => window.open(account.url.startsWith("http") ? account.url : `https://${account.url}`, "_blank", "noopener")}
                  >
                    <ArrowSquareOut size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Abrir sitio</TooltipContent>
              </Tooltip>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4 border-t pt-4">
          {/* Username */}
          <div className="space-y-2">
            <Label>Usuario</Label>
            <div className="flex gap-1.5 items-center">
              <Input
                value={account.username}
                readOnly
                className="bg-muted"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={onCopyUser}>
                    <Copy size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copiar usuario</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label>Contraseña</Label>
            <div className="flex gap-1.5 items-center">
              <Input
                type={showPw ? "text" : "password"}
                value={decryptedPw}
                readOnly
                className="bg-muted font-mono text-sm"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={onTogglePw}>
                    {showPw ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{showPw ? "Ocultar" : "Ver"}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={onCopyPw}>
                    <Copy size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copiar contraseña</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 sm:justify-between">
          <Button variant="destructive" onClick={onDelete}>
            <Trash size={16} />
            Eliminar
          </Button>
          <Button variant="outline" onClick={onEdit}>
            <PencilSimple size={16} />
            Editar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
