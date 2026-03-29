import { useState, useCallback } from "react";
import { toast } from "sonner";
import { doEncrypt, doDecrypt, generatePassword } from "@/lib/crypto";
import { useTheme } from "@/hooks/use-theme";
import { LoginScreen } from "@/components/LoginScreen";
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

  // ── Auth state ──
  const [screen, setScreen] = useState<"login" | "vault">("login");
  const [masterPw, setMasterPw] = useState<string | null>(null);
  const [masterHash, setMasterHash] = useState<string | null>(null);

  // ── Data ──
  const [accounts, setAccounts] = useState<Account[]>([]);
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

  // ── Login state ──
  const [loginError, setLoginError] = useState("");

  // ── Regen password ──
  const regenPassword = useCallback(
    (opts?: PasswordOptions) => {
      const o = opts ?? formPwOpts;
      return generatePassword(o.length, o.upper, o.lower, o.numbers, o.symbols);
    },
    [formPwOpts]
  );

  // ── Login ──
  const handleLogin = useCallback(
    async (pwValue: string) => {
      setLoginError("");
      if (!pwValue || pwValue.length < 4) {
        setLoginError("Mínimo 4 caracteres");
        return;
      }
      if (!masterHash) {
        const confirmEl = document.getElementById(
          "inp-confirm"
        ) as HTMLInputElement | null;
        if (!confirmEl || confirmEl.value !== pwValue) {
          setLoginError("Las contraseñas no coinciden");
          return;
        }
        const hash = await doEncrypt("VAULT_OK", pwValue);
        setMasterHash(hash);
        setMasterPw(pwValue);
        setScreen("vault");
      } else {
        const check = await doDecrypt(masterHash, pwValue);
        if (check === "VAULT_OK") {
          setMasterPw(pwValue);
          setScreen("vault");
        } else {
          setLoginError("Contraseña incorrecta");
        }
      }
    },
    [masterHash]
  );

  // ── Lock ──
  const lockVault = useCallback(() => {
    setMasterPw(null);
    setScreen("login");
    setModal(null);
    setLoginError("");
  }, []);

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

      setSaving(true);
      const encPw = await doEncrypt(pw, masterPw!);

      if (editId) {
        setAccounts((prev) =>
          prev.map((a) =>
            a.id === editId
              ? { ...a, name, url, username, iconId: formIcon, encPw }
              : a
          )
        );
        toast.success("Cuenta actualizada ✓");
      } else {
        setAccounts((prev) => [
          ...prev,
          { id: "a" + Date.now(), name, url, username, iconId: formIcon, encPw },
        ]);
        toast.success("Cuenta creada ✓");
      }

      setSaving(false);
      setModal(null);
      setEditId(null);
    },
    [editId, formIcon, formPw, masterPw]
  );

  // ── Open detail ──
  const openDetail = useCallback(
    async (id: string) => {
      setDetailId(id);
      setShowDetailPw(false);
      setDetailDecrypted("");
      const acc = accounts.find((a) => a.id === id);
      if (acc?.encPw) {
        const d = await doDecrypt(acc.encPw, masterPw!);
        setDetailDecrypted(d ?? "");
      }
      setModal("detail");
    },
    [accounts, masterPw]
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

  const confirmDelete = useCallback(() => {
    setAccounts((prev) => prev.filter((a) => a.id !== deleteId));
    setModal(null);
    setDeleteId(null);
    setDetailId(null);
    toast.success("Cuenta eliminada");
  }, [deleteId]);

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

  // ═══════════════════════════════════════
  // ── RENDER ──
  // ═══════════════════════════════════════

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      {screen === "login" ? (
        <LoginScreen
          isNew={!masterHash}
          loginError={loginError}
          onLogin={handleLogin}
        />
      ) : (
        <VaultScreen
          accounts={accounts}
          search={search}
          onSearchChange={setSearch}
          onNew={() => openForm(null)}
          onLock={lockVault}
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
        account={accounts.find((a) => a.id === detailId)}
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
