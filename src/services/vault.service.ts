import { supabase } from "@/lib/supabase";
import type { Account, VaultEntry } from "@/lib/types";
import { rowToAccount } from "@/lib/types";

export const vaultService = {
  /** Fetch all vault entries for the authenticated user */
  async getEntries(): Promise<Account[]> {
    const { data, error } = await supabase
      .from("vault_entries")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return (data as VaultEntry[]).map(rowToAccount);
  },

  /** Create a new vault entry */
  async createEntry(
    userId: string,
    payload: {
      name: string;
      url: string;
      username: string;
      icon_id: string;
      enc_pw: string;
    }
  ): Promise<Account> {
    const { data, error } = await supabase
      .from("vault_entries")
      .insert({ ...payload, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return rowToAccount(data as VaultEntry);
  },

  /** Update an existing vault entry */
  async updateEntry(
    id: string,
    payload: {
      name?: string;
      url?: string;
      username?: string;
      icon_id?: string;
      enc_pw?: string;
    }
  ): Promise<Account> {
    const { data, error } = await supabase
      .from("vault_entries")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return rowToAccount(data as VaultEntry);
  },

  /** Delete a vault entry by id */
  async deleteEntry(id: string): Promise<void> {
    const { error } = await supabase
      .from("vault_entries")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
