import { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import { CollapsibleSection } from './CollapsibleSection'
import { DefaultSection } from './DefaultSection'
import { SafeAppCardVariants } from '../AppCard'

type Props = {
  title: string
  collapsible?: boolean
  prependAddCustomAppCard?: boolean
  apps: SafeAppData[]
  onAddCustomApp?: (app: SafeAppData) => void
  cardVariant?: SafeAppCardVariants
}

const SafeAppsSection = ({
  title,
  collapsible = false,
  prependAddCustomAppCard = false,
  apps,
  onAddCustomApp,
  cardVariant = 'default',
}: Props) => {
  if (collapsible) {
    return <CollapsibleSection title={title} apps={apps} cardVariant={cardVariant} />
  }

  return (
    <DefaultSection
      title={title}
      apps={apps}
      prependAddCustomAppCard={prependAddCustomAppCard}
      onAddCustomApp={onAddCustomApp}
    />
  )
}

export { SafeAppsSection }
