import type { ComponentType } from "react";
import type { IconProps } from "@phosphor-icons/react";
import {
  GoogleLogo,
  GithubLogo,
  TwitterLogo,
  InstagramLogo,
  FacebookLogo,
  LinkedinLogo,
  Package,
  FilmStrip,
  SpotifyLogo,
  DiscordLogo,
  SlackLogo,
  AppleLogo,
  MicrosoftOutlookLogo,
  NotionLogo,
  FigmaLogo,
  Triangle,
  Lightning,
  Bank,
  EnvelopeSimple,
  Cloud,
  Key,
} from "@phosphor-icons/react";

export interface PlatformIcon {
  id: string;
  label: string;
  Icon: ComponentType<IconProps>;
}

export const PLATFORM_ICONS: PlatformIcon[] = [
  { id: "google", label: "Google", Icon: GoogleLogo },
  { id: "github", label: "GitHub", Icon: GithubLogo },
  { id: "twitter", label: "Twitter", Icon: TwitterLogo },
  { id: "instagram", label: "Instagram", Icon: InstagramLogo },
  { id: "facebook", label: "Facebook", Icon: FacebookLogo },
  { id: "linkedin", label: "LinkedIn", Icon: LinkedinLogo },
  { id: "amazon", label: "Amazon", Icon: Package },
  { id: "netflix", label: "Netflix", Icon: FilmStrip },
  { id: "spotify", label: "Spotify", Icon: SpotifyLogo },
  { id: "discord", label: "Discord", Icon: DiscordLogo },
  { id: "slack", label: "Slack", Icon: SlackLogo },
  { id: "apple", label: "Apple", Icon: AppleLogo },
  { id: "microsoft", label: "Microsoft", Icon: MicrosoftOutlookLogo },
  { id: "notion", label: "Notion", Icon: NotionLogo },
  { id: "figma", label: "Figma", Icon: FigmaLogo },
  { id: "vercel", label: "Vercel", Icon: Triangle },
  { id: "supabase", label: "Supabase", Icon: Lightning },
  { id: "bank", label: "Banco", Icon: Bank },
  { id: "email", label: "Email", Icon: EnvelopeSimple },
  { id: "cloud", label: "Cloud", Icon: Cloud },
  { id: "key", label: "Otro", Icon: Key },
];

const fallback = PLATFORM_ICONS[PLATFORM_ICONS.length - 1];

export function getPlatformIcon(id: string): PlatformIcon {
  return PLATFORM_ICONS.find((i) => i.id === id) ?? fallback;
}
