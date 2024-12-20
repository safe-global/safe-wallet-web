import dynamic from 'next/dynamic'
import { useIsRecoverySupported } from '../../hooks/useIsRecoverySupported'

const LazyRecovery = dynamic(() => import('./LazyRecovery'))

function Recovery() {
  const isSupported = useIsRecoverySupported()
  return isSupported ? <LazyRecovery /> : null
}

export default Recovery
