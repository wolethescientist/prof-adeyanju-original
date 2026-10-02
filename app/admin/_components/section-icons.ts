import {
  Award,
  Gauge,
  GraduationCap,
  Hash,
  Images,
  ListChecks,
  Medal,
  Microscope,
  MoveHorizontal,
  Newspaper,
  Rocket,
  Route,
  type LucideIcon,
} from "lucide-react";
import type { SectionIcon } from "@/lib/cms/registry";

/** The icon for each CMS section, by the name the registry gives it. */
export const SECTION_ICONS: Record<SectionIcon, LucideIcon> = {
  Award,
  Newspaper,
  Rocket,
  Gauge,
  Medal,
  Route,
  Microscope,
  GraduationCap,
  ListChecks,
  Hash,
  MoveHorizontal,
  Images,
};
