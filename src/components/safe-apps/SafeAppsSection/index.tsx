import { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import { CollapsibleSection } from './CollapsibleSection'
import { DefaultSection } from './DefaultSection'

type Props = {
  title: string
  collapsible?: boolean
  prependAddCustomAppCard?: boolean
  apps: SafeAppData[]
  onAddCustomApp?: (app: SafeAppData) => void
}

const SafeAppsSection = ({
  title,
  collapsible = false,
  prependAddCustomAppCard = false,
  apps,
  onAddCustomApp,
}: Props) => {
  if (collapsible) {
    return <CollapsibleSection title={title} apps={apps} />
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
