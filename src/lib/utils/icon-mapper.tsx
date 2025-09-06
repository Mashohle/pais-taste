import { 
  UtensilsCrossed, 
  Store, 
  Wrench, 
  Car, 
  Scissors,
  Building,
  ShoppingBag,
  Settings,
  Users,
  Calendar,
  LucideIcon
} from 'lucide-react'

// Map of icon names to React components
const ICON_MAP: Record<string, LucideIcon> = {
  UtensilsCrossed,
  Store,
  Wrench,
  Car,
  Scissors,
  Building,
  ShoppingBag,
  Settings,
  Users,
  Calendar
}

interface IconProps {
  name: string
  className?: string
  size?: number
}

export function DynamicIcon({ name, className, size }: IconProps) {
  const IconComponent = ICON_MAP[name] || Building // Default fallback icon
  
  return <IconComponent className={className} size={size} />
}

export function getIconComponent(name: string): LucideIcon {
  return ICON_MAP[name] || Building
}