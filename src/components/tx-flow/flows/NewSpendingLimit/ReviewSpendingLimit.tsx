import { useState, useEffect, useMemo, useContext } from 'react'
import { useSelector } from 'react-redux'
import { BigNumber } from 'ethers'
import { Typography, Box } from '@mui/material'

import SpendingLimitLabel from '@/components/common/SpendingLimitLabel'
import { getResetTimeOptions } from '@/components/transactions/TxDetails/TxData/SpendingLimits'
import { AmountBlock } from '@/components/tx-flow/flows/TokenTransfer/SendAmountBlock'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import useBalances from '@/hooks/useBalances'
import useChainId from '@/hooks/useChainId'
import { trackEvent, SETTINGS_EVENTS } from '@/services/analytics'
import { createNewSpendingLimitTx } from '@/services/tx/tx-sender'
import { selectSpendingLimits } from '@/store/spendingLimitsSlice'
import { relativeTime } from '@/utils/date'
import { formatVisualAmount } from '@/utils/formatters'
import type { SpendingLimitState } from '@/store/spendingLimitsSlice'
import type { NewSpendingLimitFlowProps } from '.'
import EthHashInfo from '@/components/common/EthHashInfo'
import { SafeTxContext } from '../../SafeTxProvider'

export const ReviewSpendingLimit = ({ params }: { params: NewSpendingLimitFlowProps }) => {
  const [existingSpendingLimit, setExistingSpendingLimit] = useState<SpendingLimitState>()
  const spendingLimits = useSelector(selectSpendingLimits)
  const chainId = useChainId()
  const { balances } = useBalances()
  const { setSafeTx, setSafeTxError } = useContext(SafeTxContext)
  const token = balances.items.find((item) => item.tokenInfo.address === params.tokenAddress)
  const { decimals, symbol } = token?.tokenInfo || {}

  useEffect(() => {
    const existingSpendingLimit = spendingLimits.find(
      (spendingLimit) =>
        spendingLimit.beneficiary === params.beneficiary && spendingLimit.token.address === params.tokenAddress,
    )
    setExistingSpendingLimit(existingSpendingLimit)
  }, [spendingLimits, params])

  useEffect(() => {
    createNewSpendingLimitTx(params, spendingLimits, chainId, decimals, existingSpendingLimit)
      .then(setSafeTx)
      .catch(setSafeTxError)
  }, [chainId, decimals, existingSpendingLimit, params, setSafeTx, setSafeTxError, spendingLimits])

  const isOneTime = params.resetTime === '0'
  const resetTime = useMemo(() => {
    return isOneTime
      ? 'One-time spending limit'
      : getResetTimeOptions(chainId).find((time) => time.value === params.resetTime)?.label
  }, [isOneTime, params.resetTime, chainId])

  const onFormSubmit = () => {
    trackEvent({
      ...SETTINGS_EVENTS.SPENDING_LIMIT.RESET_PERIOD,
      label: resetTime,
    })
  }

  return (
    <SignOrExecuteForm onSubmit={onFormSubmit}>
      {token && (
        <AmountBlock amount={params.amount} tokenInfo={token.tokenInfo}>
          {!!existingSpendingLimit && (
            <>
              <Typography color="error" sx={{ textDecoration: 'line-through' }} component="span">
                {formatVisualAmount(BigNumber.from(existingSpendingLimit.amount), decimals)}
              </Typography>
              {'→'}
            </>
          )}
        </AmountBlock>
      )}
      <Typography color={({ palette }) => palette.text.secondary} pb={1}>
        Beneficiary
      </Typography>

      <Box mb={3}>
        <EthHashInfo address={params.beneficiary} shortAddress={false} hasExplorer showCopyButton />
      </Box>

      <Typography color={({ palette }) => palette.text.secondary}>Reset time</Typography>
      {existingSpendingLimit ? (
        <>
          <SpendingLimitLabel
            label={
              <>
                {existingSpendingLimit.resetTimeMin !== params.resetTime && (
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
