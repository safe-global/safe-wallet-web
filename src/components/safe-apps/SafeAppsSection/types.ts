import type { SafeAppData } from '@safe-global/safe-gateway-typescript-sdk'
import type { SafeAppCardVariants } from '@/components/safe-apps/AppCard'

type SectionProps = {
  title: string
  prependAddCustomAppCard?: boolean
  apps: SafeAppData[]
  allApps: SafeAppData[]
  pinnedIds?: Set<number>
  onAddCustomApp?: (app: SafeAppData) => void
  onPinApp?: (appId: number) => void
  onDeleteApp?: (app: SafeAppData) => void
  cardVariant?: SafeAppCardVariants
}

type BranchingSectionProps = SectionProps & { collapsible?: boolean }

export type { SectionProps, BranchingSectionProps }
