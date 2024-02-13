import dynamic from 'next/dynamic'
import useIsCounterfactualSafe from '@/features/counterfactual/hooks/useIsCounterfactualSafe'

const LazyCounterfactual = dynamic(() => import('./LazyCounterfactual'))

function Counterfactual() {
  const isCounterfactualSafe = useIsCounterfactualSafe()
  return isCounterfactualSafe ? <LazyCounterfactual /> : null
}

export default Counterfactual
