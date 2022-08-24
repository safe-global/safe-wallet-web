import type { ReactElement } from 'react'

import Redirect from '@/components/common/Redirect'
import { AppRoutes } from '@/config/routes'

const Settings = (): ReactElement => {
  return <Redirect pathname={AppRoutes.safe.settings.setup} />
}

export default Settings
