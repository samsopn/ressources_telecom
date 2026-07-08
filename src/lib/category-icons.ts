import type { LucideIcon } from "lucide-react";
import {
  Award,
  BookOpen,
  Cable,
  FlaskConical,
  Layers,
  Network,
  Radio,
  Route,
  Shield,
  Wrench,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  route: Route,
  network: Network,
  shield: Shield,
  radio: Radio,
  cable: Cable,
  layers: Layers,
  award: Award,
  "flask-conical": FlaskConical,
  "book-open": BookOpen,
  wrench: Wrench,
};

export function getCategoryIcon(icon?: string | null): LucideIcon {
  if (!icon) return BookOpen;
  return iconMap[icon] ?? BookOpen;
}
