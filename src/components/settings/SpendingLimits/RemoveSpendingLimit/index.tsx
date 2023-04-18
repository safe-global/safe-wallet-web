import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { getSpendingLimitInterface, getSpendingLimitModuleAddress } from '@/services/contracts/spendingLimitContracts'
import useChainId from '@/hooks/useChainId'
import useAsync from '@/hooks/useAsync'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import EthHashInfo from '@/components/common/EthHashInfo'
import { Typography } from '@mui/material'
import type { SpendingLimitState } from '@/store/spendingLimitsSlice'
import { relativeTime } from '@/utils/date'
import { trackEvent, SETTINGS_EVENTS } from '@/services/analytics'
import useBalances from '@/hooks/useBalances'
import { TokenTransferReview } from '@/components/tx/modals/TokenTransferModal/ReviewTokenTx'
import { safeFormatUnits } from '@/utils/formatters'
import SpendingLimitLabel from '@/components/common/SpendingLimitLabel'
import { createTx } from '@/services/tx/tx-sender'

export const RemoveSpendingLimit = ({ data, onSubmit }: { data: SpendingLimitState; onSubmit: () => void }) => {
  const chainId = useChainId()
  const { balances } = useBalances()
  const token = balances.items.find((item) => item.tokenInfo.address === data.token.address)

  const [safeTx, safeTxError] = useAsync<SafeTransaction>(() => {
    const spendingLimitAddress = getSpendingLimitModuleAddress(chainId)
    if (!spendingLimitAddress) return

    const spendingLimitInterface = getSpendingLimitInterface()
    const txData = spendingLimitInterface.encodeFunctionData('deleteAllowance', [data.beneficiary, data.token.address])

    const txParams = {
      to: spendingLimitAddress,
      value: '0',
      data: txData,
    }

    return createTx(txParams)
  }, [chainId, data.beneficiary, data.token])

  const onFormSubmit = () => {
    trackEvent(SETTINGS_EVENTS.SPENDING_LIMIT.LIMIT_REMOVED)

    onSubmit()
  }

  return (
    <SignOrExecuteForm safeTx={safeTx} onSubmit={onFormSubmit} error={safeTxError}>
      {token && (
        <TokenTransferReview
          amount={safeFormatUnits(data.amount, token.tokenInfo.decimals)}
          tokenInfo={token.tokenInfo}
        />
      )}
      <Typography sx={({ palette }) => ({ color: palette.primary.light })}>Beneficiary</Typography>
      <EthHashInfo address={data.beneficiary} showCopyButton hasExplorer shortAddress={false} />
      <Typography mt={2} sx={({ palette }) => ({ color: palette.primary.light })}>
        Reset time
      </Typography>
      <SpendingLimitLabel
        label={relativeTime(data.lastResetMin, data.resetTimeMin)}
        mb={2}
        isOneTime={data.resetTimeMin === '0'}
      />
    </SignOrExecuteForm>
  )
}
