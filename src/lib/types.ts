/** Shared types for the Vault app */

export interface Account {
  id: string;
  name: string;
  url: string;
  username: string;
  iconId: string;
  encPw: string;
}

export interface PasswordOptions {
  length: number;
  upper: boolean;
  lower: boolean;
  numbers: boolean;
  symbols: boolean;
}
