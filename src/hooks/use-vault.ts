import { useState, useCallback } from "react";
import { toast } from "sonner";
import { vaultService } from "@/services/vault.service";
import { doEncrypt, doDecrypt } from "@/lib/crypto";
import type { Account } from "@/lib/types";

export interface UseVaultReturn {
  accounts: Account[];
  loading: boolean;
  loadEntries: () => Promise<void>;
  createEntry: (
    userId: string,
    masterPw: string,
    payload: { name: string; url: string; username: string; iconId: string; plainPw: string }
  ) => Promise<boolean>;
  updateEntry: (
    userId: string,
    masterPw: string,
    payload: { id: string; name: string; url: string; username: string; iconId: string; plainPw: string }
  ) => Promise<boolean>;
  deleteEntry: (id: string) => Promise<boolean>;
  decryptPassword: (encPw: string, masterPw: string, userId: string) => Promise<string>;
}

export function useVault(): UseVaultReturn {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await vaultService.getEntries();
      setAccounts(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al cargar cuentas";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const createEntry = useCallback(
    async (
      userId: string,
      masterPw: string,
      payload: { name: string; url: string; username: string; iconId: string; plainPw: string }
    ): Promise<boolean> => {
      try {
        const enc_pw = await doEncrypt(payload.plainPw, masterPw, userId);
        const created = await vaultService.createEntry(userId, {
          name: payload.name,
          url: payload.url,
          username: payload.username,
          icon_id: payload.iconId,
          enc_pw,
        });
        setAccounts((prev) =>
          [...prev, created].sort((a, b) => a.name.localeCompare(b.name))
        );
        toast.success("Cuenta creada ✓");
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error al crear cuenta";
        toast.error(msg);
        return false;
      }
    },
    []
  );

  const updateEntry = useCallback(
    async (
      userId: string,
      masterPw: string,
      payload: { id: string; name: string; url: string; username: string; iconId: string; plainPw: string }
    ): Promise<boolean> => {
      try {
        const enc_pw = await doEncrypt(payload.plainPw, masterPw, userId);
        const updated = await vaultService.updateEntry(payload.id, {
          name: payload.name,
          url: payload.url,
          username: payload.username,
          icon_id: payload.iconId,
          enc_pw,
        });
        setAccounts((prev) =>
          prev.map((a) => (a.id === payload.id ? updated : a))
        );
        toast.success("Cuenta actualizada ✓");
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error al actualizar cuenta";
        toast.error(msg);
        return false;
      }
    },
    []
  );

  const deleteEntry = useCallback(async (id: string): Promise<boolean> => {
    try {
      await vaultService.deleteEntry(id);
      setAccounts((prev) => prev.filter((a) => a.id !== id));
      toast.success("Cuenta eliminada");
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al eliminar cuenta";
      toast.error(msg);
      return false;
    }
  }, []);

  const decryptPassword = useCallback(
    async (encPw: string, masterPw: string, userId: string): Promise<string> => {
      return (await doDecrypt(encPw, masterPw, userId)) ?? "";
    },
    []
  );

  return { accounts, loading, loadEntries, createEntry, updateEntry, deleteEntry, decryptPassword };
}
