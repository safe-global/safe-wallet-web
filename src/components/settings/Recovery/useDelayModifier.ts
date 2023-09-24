import { getDelayModifiers } from '@/services/recovery/delay-modifier'
import type { Delay } from '@gnosis.pm/zodiac'

import useSafeInfo from '@/hooks/useSafeInfo'
import { useWeb3 } from '@/hooks/wallets/web3'
import useAsync from '@/hooks/useAsync'

export function useDelayModifier() {
  const { safe } = useSafeInfo()
  const web3 = useWeb3()

  return useAsync<Delay>(() => {
    if (!web3) {
      return
    }

    // TODO: Handle multiple delay modifiers
    return getDelayModifiers(safe.chainId, safe.modules, web3).then((delayModifiers) => delayModifiers[0])
    // Need to check length of modules array to prevent new request every time Safe info polls
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safe.chainId, safe.modules?.length, web3])
}
