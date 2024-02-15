import CounterfactualSuccessScreen from '@/features/counterfactual/CounterfactualSuccessScreen'
import dynamic from 'next/dynamic'
import useIsCounterfactualSafe from '@/features/counterfactual/hooks/useIsCounterfactualSafe'

const LazyCounterfactual = dynamic(() => import('./LazyCounterfactual'))

function CounterfactualHooks() {
  const isCounterfactualSafe = useIsCounterfactualSafe()

  return (
    <>
      <CounterfactualSuccessScreen />
      {isCounterfactualSafe && <LazyCounterfactual />}
    </>
  )
}

export default CounterfactualHooks
