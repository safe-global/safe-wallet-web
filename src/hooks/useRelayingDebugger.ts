import { FEATURES, hasFeature } from '@/utils/chains'
import { useCurrentChain } from '@/hooks/useChains'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import type { Setter } from '@/services/local-storage/useLocalStorage'

const LS_KEY = 'debugRelay'

export const useRelayingDebugger = (): [boolean, Setter<boolean>] => {
  const currentChain = useCurrentChain()
  const canRelay = !!currentChain && hasFeature(currentChain, FEATURES.RELAYING)

  const [isRelayingEnabled = canRelay, setIsRelayingEnabled] = useLocalStorage<boolean>(LS_KEY)

  return [isRelayingEnabled, setIsRelayingEnabled]
}
