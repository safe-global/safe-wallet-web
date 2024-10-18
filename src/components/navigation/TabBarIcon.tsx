import { SafeFontIcon, IconProps } from '@/src/components/SafeFontIcon'

export function TabBarIcon({ name, ...rest }: IconProps) {
  return <SafeFontIcon size={28} name={name} {...rest} />
}
