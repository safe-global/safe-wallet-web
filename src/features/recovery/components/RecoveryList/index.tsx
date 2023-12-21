import dynamic from 'next/dynamic'
import { useIsRecoverySupported } from '../../hooks/useIsRecoverySupported'

const LazyRecoveryList = dynamic(() => import('./LazyRecoveryList'))

const RecoveryList = () => {
  const supportsRecovery = useIsRecoverySupported()
  return supportsRecovery ? <LazyRecoveryList /> : null
}

export default RecoveryList
