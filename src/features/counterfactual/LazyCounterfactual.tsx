import usePendingSafeNotifications from '@/features/counterfactual/hooks/usePendingSafeNotifications'
import usePendingSafeStatus from '@/features/counterfactual/hooks/usePendingSafeStatuses'

const LazyCounterfactual = () => {
  usePendingSafeStatus()
  usePendingSafeNotifications()

  return null
}

export default LazyCounterfactual
