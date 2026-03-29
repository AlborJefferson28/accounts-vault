/** Shared types for the Vault app */

/** Raw row from Supabase vault_entries table */
export interface VaultEntry {
  id: string;
  user_id: string;
  name: string;
  url: string | null;
  username: string;
  icon_id: string;
  enc_pw: string;
  created_at: string;
  updated_at: string;
}

/**
 * Account is the UI-friendly alias with camelCase fields.
 * The service layer maps snake_case → camelCase.
 */
export interface Account {
  id: string;
  name: string;
  url: string;
  username: string;
  iconId: string;
  encPw: string;
}

/** Converts a DB row to the UI Account shape */
export function rowToAccount(row: VaultEntry): Account {
  return {
    id: row.id,
    name: row.name,
    url: row.url ?? "",
    username: row.username,
    iconId: row.icon_id,
    encPw: row.enc_pw,
  };
}

export interface PasswordOptions {
  length: number;
  upper: boolean;
  lower: boolean;
  numbers: boolean;
  symbols: boolean;
}
