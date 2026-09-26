// Jednobojni inline SVG ikoni (lucide). Boja preko `currentColor` — kontejneru daj
// `text-navy`/`text-orange`. Za inline u tekstu/gumbu: `inline-flex items-center gap-1.5`.
// Zamjena za šarene emojije (vidi sectorIcon mapu za sektorske/kategorijske oznake baštine).
import {
  Check,
  CreditCard,
  Lock,
  Share,
  X,
  Archive,
  Award,
  Banknote,
  BookOpen,
  Castle,
  FileText,
  Handshake,
  Landmark,
  Lightbulb,
  MessageCircle,
  Milestone,
  ScrollText,
  Search,
  Shield,
  Vote,
  type LucideIcon,
} from 'lucide-react';

export {
  Check,
  CreditCard,
  Lock,
  Share,
  X,
  Archive,
  Award,
  Banknote,
  BookOpen,
  Castle,
  FileText,
  Handshake,
  Landmark,
  Lightbulb,
  MessageCircle,
  Milestone,
  ScrollText,
  Search,
  Shield,
  Vote,
};
export type { LucideIcon };

/** Sektorske/kategorijske ikone objekata baštine (zamjena za emoji `Record<string,string>`). */
export const sectorIcon: Record<string, LucideIcon> = {
  'Obnova spomenika': Castle,
  'Skrb o spomeniku': Landmark,
  Digitalizacija: Archive,
  'Spomen-obilježje': Milestone,
  Edukacija: ScrollText,
  Izdavaštvo: BookOpen,
};
