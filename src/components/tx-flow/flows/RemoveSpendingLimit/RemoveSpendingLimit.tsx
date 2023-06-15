import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { getSpendingLimitInterface, getSpendingLimitModuleAddress } from '@/services/contracts/spendingLimitContracts'
import useChainId from '@/hooks/useChainId'
import { useContext, useEffect } from 'react'
import { SafeTxContext } from '../../SafeTxProvider'
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

export const RemoveSpendingLimit = ({ params }: { params: SpendingLimitState }) => {
  const { setSafeTx, setSafeTxError } = useContext(SafeTxContext)
  const chainId = useChainId()
  const { balances } = useBalances()
  const token = balances.items.find((item) => item.tokenInfo.address === params.token.address)

  useEffect(() => {
    const spendingLimitAddress = getSpendingLimitModuleAddress(chainId)

    if (!spendingLimitAddress) {
      return
    }

    const spendingLimitInterface = getSpendingLimitInterface()
    const txData = spendingLimitInterface.encodeFunctionData('deleteAllowance', [
      params.beneficiary,
      params.token.address,
    ])

    const txParams = {
      to: spendingLimitAddress,
      value: '0',
      data: txData,
    }

    createTx(txParams).then(setSafeTx).catch(setSafeTxError)
  }, [chainId, params.beneficiary, params.token, setSafeTx, setSafeTxError])

  const onFormSubmit = () => {
    trackEvent(SETTINGS_EVENTS.SPENDING_LIMIT.LIMIT_REMOVED)
  }

  return (
    <SignOrExecuteForm onSubmit={onFormSubmit}>
      {token && (
        <TokenTransferReview
          amount={safeFormatUnits(params.amount, token.tokenInfo.decimals)}
          tokenInfo={token.tokenInfo}
        />
      )}
      <Typography sx={({ palette }) => ({ color: palette.primary.light })}>Beneficiary</Typography>
      <EthHashInfo address={params.beneficiary} showCopyButton hasExplorer shortAddress={false} />
      <Typography mt={2} sx={({ palette }) => ({ color: palette.primary.light })}>
        Reset time
      </Typography>
      <SpendingLimitLabel
        label={relativeTime(params.lastResetMin, params.resetTimeMin)}
        mb={2}
        isOneTime={params.resetTimeMin === '0'}
      />
    </SignOrExecuteForm>
  )
}
