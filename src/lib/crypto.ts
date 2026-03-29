// ── Crypto helpers ──
const enc = new TextEncoder();
const dec = new TextDecoder();

async function deriveKey(pw: string): Promise<CryptoKey> {
  const km = await crypto.subtle.importKey(
    "raw",
    enc.encode(pw),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("vault-salt-2024"),
      iterations: 50000,
      hash: "SHA-256",
    },
    km,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function doEncrypt(text: string, pw: string): Promise<string> {
  const key = await deriveKey(pw);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(text)
  );
  const out = new Uint8Array(12 + ct.byteLength);
  out.set(iv);
  out.set(new Uint8Array(ct), 12);
  return btoa(String.fromCharCode(...out));
}

export async function doDecrypt(
  b64: string,
  pw: string
): Promise<string | null> {
  try {
    const key = await deriveKey(pw);
    const buf = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const res = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: buf.slice(0, 12) },
      key,
      buf.slice(12)
    );
    return dec.decode(res);
  } catch {
    return null;
  }
}

// ── Password generator ──
export function generatePassword(
  length: number,
  useUpper: boolean,
  useLower: boolean,
  useNumbers: boolean,
  useSymbols: boolean
): string {
  let chars = "";
  if (useUpper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (useLower) chars += "abcdefghijklmnopqrstuvwxyz";
  if (useNumbers) chars += "0123456789";
  if (useSymbols) chars += "!@#$%^&*()-_=+[]{}";
  if (!chars) chars = "abcdefghijklmnopqrstuvwxyz";
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((v) => chars[v % chars.length])
    .join("");
}

export interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  pct: number;
}

export function calcStrength(pw: string): PasswordStrength {
  if (!pw) return { score: 0, label: "", color: "", pct: 0 };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 14) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 2) return { score, label: "Débil", color: "#E24B4A", pct: 25 };
  if (score <= 3)
    return { score, label: "Regular", color: "#EF9F27", pct: 50 };
  if (score <= 4)
    return { score, label: "Buena", color: "#1D9E75", pct: 75 };
  return { score, label: "Muy fuerte", color: "#0F6E56", pct: 100 };
}
