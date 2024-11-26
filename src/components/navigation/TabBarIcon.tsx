import { SafeFontIcon, IconProps } from '@/src/components/SafeFontIcon/SafeFontIcon'

export function TabBarIcon({ name, ...rest }: IconProps) {
  return <SafeFontIcon testID={`tab-bar-${name}-icon`} size={28} name={name} {...rest} />
}
