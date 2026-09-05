import {
  Award,
  BookOpen,
  Building2,
  Cloud,
  Cpu,
  Database,
  GraduationCap,
  Globe,
  Landmark,
  Lightbulb,
  Mail,
  Map,
  Network,
  Radio,
  Satellite,
  Server,
  ShieldCheck,
  Signal,
  Sparkles,
  Users,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * Allow-list of icons the CMS may reference.
 *
 * The database stores a name, never a component, so an editor picking an icon
 * cannot reach anything outside this map. Anything unrecognised falls back to
 * Sparkles rather than crashing a public page.
 */
export const ICONS = {
  Award,
  BookOpen,
  Building2,
  Cloud,
  Cpu,
  Database,
  GraduationCap,
  Globe,
  Landmark,
  Lightbulb,
  Mail,
  Map,
  Network,
  Radio,
  Satellite,
  Server,
  ShieldCheck,
  Signal,
  Sparkles,
  Users,
  Wifi,
  Zap,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export const ICON_NAMES = Object.keys(ICONS) as IconName[];

export function resolveIcon(name: string | null | undefined): LucideIcon {
  return ICONS[name as IconName] ?? Sparkles;
}
