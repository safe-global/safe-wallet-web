import { Typography, Box } from '@mui/material'
import useBalances from '@/hooks/useBalances'
import { useEffect, useMemo, useState } from 'react'
import useAsync from '@/hooks/useAsync'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import EthHashInfo from '@/components/common/EthHashInfo'
import useChainId from '@/hooks/useChainId'
import { useSelector } from 'react-redux'
import type { SpendingLimitState } from '@/store/spendingLimitsSlice'
import { selectSpendingLimits } from '@/store/spendingLimitsSlice'
import { getResetTimeOptions } from '@/components/transactions/TxDetails/TxData/SpendingLimits'
import { BigNumber } from '@ethersproject/bignumber'
import { formatVisualAmount } from '@/utils/formatters'
import { relativeTime } from '@/utils/date'
import { trackEvent, SETTINGS_EVENTS } from '@/services/analytics'
import { TokenTransferReview } from '@/components/tx/modals/TokenTransferModal/ReviewTokenTx'
import SpendingLimitLabel from '@/components/common/SpendingLimitLabel'
import type { NewSpendingLimitData } from '@/services/tx/tx-sender'
import { createNewSpendingLimitTx } from '@/services/tx/tx-sender'

type Props = {
  data: NewSpendingLimitData
  onSubmit: () => void
}

export const ReviewSpendingLimit = ({ data, onSubmit }: Props) => {
  const [existingSpendingLimit, setExistingSpendingLimit] = useState<SpendingLimitState>()
  const spendingLimits = useSelector(selectSpendingLimits)
  const chainId = useChainId()
  const { balances } = useBalances()

  useEffect(() => {
    const existingSpendingLimit = spendingLimits.find(
      (spendingLimit) =>
        spendingLimit.beneficiary === data.beneficiary && spendingLimit.token.address === data.tokenAddress,
    )
    setExistingSpendingLimit(existingSpendingLimit)
  }, [spendingLimits, data])

  const token = balances.items.find((item) => item.tokenInfo.address === data.tokenAddress)
  const { decimals, symbol } = token?.tokenInfo || {}

  const isOneTime = data.resetTime === '0'
  const resetTime = useMemo(() => {
    return isOneTime
      ? 'One-time spending limit'
      : getResetTimeOptions(chainId).find((time) => time.value === data.resetTime)?.label
  }, [isOneTime, data.resetTime, chainId])

  const [safeTx, safeTxError] = useAsync<SafeTransaction | undefined>(() => {
    return createNewSpendingLimitTx(data, spendingLimits, chainId, decimals, existingSpendingLimit)
  }, [data, spendingLimits, chainId, decimals, existingSpendingLimit])

  const onFormSubmit = () => {
    trackEvent({
      ...SETTINGS_EVENTS.SPENDING_LIMIT.RESET_PERIOD,
      label: resetTime,
    })

    onSubmit()
  }

  return (
    <SignOrExecuteForm safeTx={safeTx} onSubmit={onFormSubmit} error={safeTxError}>
      {token && (
        <TokenTransferReview amount={data.amount} tokenInfo={token.tokenInfo}>
          {!!existingSpendingLimit && (
            <>
              <Typography color="error" sx={{ textDecoration: 'line-through' }} component="span" fontSize={20}>
                {formatVisualAmount(BigNumber.from(existingSpendingLimit.amount), decimals)} {symbol}
              </Typography>
              {' → '}
            </>
          )}
        </TokenTransferReview>
      )}
      <Typography color={({ palette }) => palette.text.secondary} pb={1}>
        Beneficiary
      </Typography>

      <Box mb={3}>
        <EthHashInfo address={data.beneficiary} shortAddress={false} hasExplorer showCopyButton />
      </Box>

      <Typography color={({ palette }) => palette.text.secondary}>Reset time</Typography>
      {existingSpendingLimit ? (
        <>
          <SpendingLimitLabel
            label={
              <>
                {existingSpendingLimit.resetTimeMin !== data.resetTime && (
                  <>
                    <Typography color="error" sx={{ textDecoration: 'line-through' }} display="inline" component="span">
                      {relativeTime(existingSpendingLimit.lastResetMin, existingSpendingLimit.resetTimeMin)}
                    </Typography>
                    {' → '}
                  </>
                )}
                <Typography display="inline" component="span">
                  {resetTime}
                </Typography>
              </>
            }
            isOneTime={existingSpendingLimit.resetTimeMin === '0'}
            mb={2}
          />
          <Typography color="error" mb={2}>
            You are about to replace an existent spending limit
          </Typography>
        </>
      ) : (
        <SpendingLimitLabel
          label={resetTime || 'One-time spending limit'}
          mb={2}
          isOneTime={!!resetTime && isOneTime}
        />
      )}
    </SignOrExecuteForm>
  )
}
