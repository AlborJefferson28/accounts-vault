import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { generatePassword } from "@/lib/crypto";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { useVault } from "@/hooks/use-vault";
import { AuthScreen } from "@/components/AuthScreen";
import { VaultScreen } from "@/components/VaultScreen";
import { FormModal } from "@/components/FormModal";
import { DetailModal } from "@/components/DetailModal";
import { DeleteModal } from "@/components/DeleteModal";
import type { Account, PasswordOptions } from "@/lib/types";

type ModalType = "form" | "detail" | "delete" | null;

const DEFAULT_PW_OPTS: PasswordOptions = {
  length: 16,
  upper: true,
  lower: true,
  numbers: true,
  symbols: true,
};

export default function App() {
  const { theme, toggleTheme } = useTheme();

  // ── Auth ──
  const { user, screen, loading, authError, masterPw, signIn, signUp, signOut, setScreen } = useAuth();

  // ── Vault data ──
  const { accounts, loadEntries, createEntry, updateEntry, deleteEntry, decryptPassword } = useVault();

  // Load vault entries when user authenticates
  useEffect(() => {
    if (user && screen === "vault") {
      loadEntries();
    }
  }, [user, screen, loadEntries]);

  // ── Search ──
  const [search, setSearch] = useState("");

  // ── Modal state ──
  const [modal, setModal] = useState<ModalType>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // ── Form state ──
  const [formIcon, setFormIcon] = useState("key");
  const [formPw, setFormPw] = useState("");
  const [formPwOpts, setFormPwOpts] = useState<PasswordOptions>(DEFAULT_PW_OPTS);
  const [showFormPw, setShowFormPw] = useState(false);
  const [saving, setSaving] = useState(false);

  // ── Detail state ──
  const [detailDecrypted, setDetailDecrypted] = useState("");
  const [showDetailPw, setShowDetailPw] = useState(false);

  // ── Regen password ──
  const regenPassword = useCallback(
    (opts?: PasswordOptions) => {
      const o = opts ?? formPwOpts;
      return generatePassword(o.length, o.upper, o.lower, o.numbers, o.symbols);
    },
    [formPwOpts]
  );

  // ── Open form ──
  const openForm = useCallback(
    (id: string | null) => {
      setEditId(id);
      if (id) {
        const acc = accounts.find((a) => a.id === id);
        setFormIcon(acc?.iconId ?? "key");
      } else {
        setFormIcon("key");
      }
      setShowFormPw(false);
      setFormPw(regenPassword());
      setModal("form");
    },
    [accounts, regenPassword]
  );

  const closeForm = useCallback(() => {
    setModal(null);
    setEditId(null);
  }, []);

  // ── Save account ──
  const saveAccount = useCallback(
    async (name: string, url: string, username: string) => {
      const pw = formPw;
      if (!name || !username) {
        toast.error("Nombre y usuario son obligatorios");
        return;
      }
      if (!pw) {
        toast.error("La contraseña no puede estar vacía");
        return;
      }
      if (!masterPw || !user) return;

      setSaving(true);

      let success = false;
      if (editId) {
        success = await updateEntry(user.id, masterPw, {
          id: editId,
          name,
          url,
          username,
          iconId: formIcon,
          plainPw: pw,
        });
      } else {
        success = await createEntry(user.id, masterPw, {
          name,
          url,
          username,
          iconId: formIcon,
          plainPw: pw,
        });
      }

      setSaving(false);
      if (success) {
        setModal(null);
        setEditId(null);
      }
    },
    [editId, formIcon, formPw, masterPw, user, createEntry, updateEntry]
  );

  // ── Open detail ──
  const openDetail = useCallback(
    async (id: string) => {
      setDetailId(id);
      setShowDetailPw(false);
      setDetailDecrypted("");
      const acc = accounts.find((a) => a.id === id);
      if (acc?.encPw && masterPw && user) {
        const d = await decryptPassword(acc.encPw, masterPw, user.id);
        setDetailDecrypted(d);
      }
      setModal("detail");
    },
    [accounts, masterPw, decryptPassword]
  );

  const closeDetail = useCallback(() => {
    setModal(null);
    setDetailId(null);
    setDetailDecrypted("");
  }, []);

  // ── Delete ──
  const askDelete = useCallback((id: string) => {
    setDeleteId(id);
    setModal("delete");
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteId) return;
    const ok = await deleteEntry(deleteId);
    if (ok) {
      setModal(null);
      setDeleteId(null);
      setDetailId(null);
    }
  }, [deleteId, deleteEntry]);

  // ── Copy helpers ──
  const copyToClipboard = useCallback(
    async (text: string | undefined, label: string) => {
      if (!text) {
        toast.error("Sin datos para copiar");
        return;
      }
      try {
        await navigator.clipboard.writeText(text);
        toast.success(`${label} copiado`);
      } catch {
        toast.error("No se pudo copiar");
      }
    },
    []
  );

  // ── Loading splash ──
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-sm">Cargando bóveda...</span>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // ── RENDER ──
  // ═══════════════════════════════════════

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      {screen !== "vault" ? (
        <AuthScreen
          mode={screen}
          authError={authError}
          onLogin={signIn}
          onRegister={signUp}
          onToggleMode={() => setScreen(screen === "login" ? "register" : "login")}
        />
      ) : (
        <VaultScreen
          accounts={accounts}
          search={search}
          onSearchChange={setSearch}
          onNew={() => openForm(null)}
          onLock={signOut}
          onCardClick={openDetail}
          onEdit={openForm}
          onDelete={askDelete}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}

      {/* ── Modals ── */}
      <FormModal
        open={modal === "form"}
        editId={editId}
        accounts={accounts}
        formIcon={formIcon}
        onIconChange={setFormIcon}
        formPw={formPw}
        onPwChange={setFormPw}
        formPwOpts={formPwOpts}
        onOptsChange={setFormPwOpts}
        showFormPw={showFormPw}
        onToggleShowPw={() => setShowFormPw((p) => !p)}
        onRegen={() => setFormPw(regenPassword())}
        onCopyPw={() => copyToClipboard(formPw, "Contraseña")}
        saving={saving}
        onSave={saveAccount}
        onClose={closeForm}
      />

      <DetailModal
        open={modal === "detail"}
        account={accounts.find((a) => a.id === detailId) as Account | undefined}
        decryptedPw={detailDecrypted}
        showPw={showDetailPw}
        onTogglePw={() => setShowDetailPw((p) => !p)}
        onCopyUser={() => {
          const acc = accounts.find((a) => a.id === detailId);
          copyToClipboard(acc?.username, "Usuario");
        }}
        onCopyPw={() => copyToClipboard(detailDecrypted, "Contraseña")}
        onEdit={() => {
          const id = detailId;
          closeDetail();
          if (id) openForm(id);
        }}
        onDelete={() => {
          if (detailId) {
            setDeleteId(detailId);
            setModal("delete");
          }
        }}
        onClose={closeDetail}
      />

      <DeleteModal
        open={modal === "delete"}
        onConfirm={confirmDelete}
        onCancel={() => setModal(null)}
      />
    </div>
  );
}
