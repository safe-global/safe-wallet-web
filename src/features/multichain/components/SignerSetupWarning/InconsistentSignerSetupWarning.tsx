import { useIsMultichainSafe } from '../../hooks/useIsMultichainSafe'
import { useCurrentChain } from '@/hooks/useChains'
import ErrorMessage from '@/components/tx/ErrorMessage'
import useSafeAddress from '@/hooks/useSafeAddress'
import { useAppSelector } from '@/store'
import { selectUndeployedSafes } from '@/store/slices'
import { useAllSafesGrouped } from '@/components/welcome/MyAccounts/useAllSafesGrouped'
import { sameAddress } from '@/utils/addresses'
import useSafeOverviews from '@/components/welcome/MyAccounts/useSafeOverviews'
import { useMemo } from 'react'
import { getDeviatingSetups, getSafeSetups } from '@/components/welcome/MyAccounts/utils/multiChainSafe'
import ChainIndicator from '@/components/common/ChainIndicator'

export const InconsistentSignerSetupWarning = () => {
  const isMultichainSafe = useIsMultichainSafe()
  const safeAddress = useSafeAddress()
  const currentChain = useCurrentChain()
  const undeployedSafes = useAppSelector(selectUndeployedSafes)
  const { allMultiChainSafes } = useAllSafesGrouped()

  const multiChainGroup = allMultiChainSafes?.find((account) => sameAddress(safeAddress, account.safes[0].address))
  const [safeOverviews] = useSafeOverviews(multiChainGroup?.safes ?? [])

  const safeSetups = useMemo(
    () => getSafeSetups(multiChainGroup?.safes ?? [], safeOverviews ?? [], undeployedSafes),
    [multiChainGroup?.safes, safeOverviews, undeployedSafes],
  )
  const deviatingSetups = getDeviatingSetups(safeSetups, currentChain?.chainId)
  // todo: remove filter. make sure undefineds make sense
  const deviatingChainIds = deviatingSetups
    .map((setup) => setup?.chainId)
    .filter((setup): setup is string => Boolean(setup))

  if (!isMultichainSafe || !deviatingChainIds.length) return

  return (
    <ErrorMessage level="warning" title="Signers are not consistent">
      Signers are different on these networks of this account:
      {deviatingChainIds.map((chainId) => (
        <ChainIndicator inline key={chainId} chainId={chainId} showUnknown={false} />
      ))}
      To manage your account easier and to prevent lose of funds, we recommend keeping the same signers.
    </ErrorMessage>
  )
}
