import { Typography, Box } from '@mui/material'
import useBalances from '@/hooks/useBalances'
import { useEffect, useState } from 'react'
import useSafeInfo from '@/hooks/useSafeInfo'
import useAsync from '@/hooks/useAsync'
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import EthHashInfo from '@/components/common/EthHashInfo'
import useChainId from '@/hooks/useChainId'
import { useSelector } from 'react-redux'
import { selectSpendingLimits, SpendingLimitState } from '@/store/spendingLimitsSlice'
import { createNewSpendingLimitTx } from '@/services/tx/spendingLimitParams'
import { RESET_TIME_OPTIONS } from '@/components/settings/SpendingLimits/NewSpendingLimit/steps/SpendingLimitForm'
import { TokenIcon } from '@/components/common/TokenAmount'
import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits } from 'ethers/lib/utils'
import { relativeTime } from '@/utils/date'

export type NewSpendingLimitData = {
  beneficiary: string
  tokenAddress: string
  amount: string
  resetTime: string
}

type Props = {
  data: NewSpendingLimitData
  onSubmit: (data: null) => void
}

export const ReviewSpendingLimit = ({ data, onSubmit }: Props) => {
  const [existingSpendingLimit, setExistingSpendingLimit] = useState<SpendingLimitState>()
  const spendingLimits = useSelector(selectSpendingLimits)
  const { safe } = useSafeInfo()
  const chainId = useChainId()
  const { balances } = useBalances()

  useEffect(() => {
    const existingSpendingLimit = spendingLimits.find(
      (spendingLimit) => spendingLimit.beneficiary === data.beneficiary && spendingLimit.token === data.tokenAddress,
    )
    setExistingSpendingLimit(existingSpendingLimit)
  }, [spendingLimits, data])

  const token = balances.items.find((item) => item.tokenInfo.address === data.tokenAddress)
  const { decimals, logoUri, symbol } = token?.tokenInfo || {}

  const resetTime =
    data.resetTime === '0'
      ? 'One-time spending limit'
      : RESET_TIME_OPTIONS.find((time) => time.value === data.resetTime)?.label

  const [safeTx, safeTxError] = useAsync<SafeTransaction | undefined>(async () => {
    return createNewSpendingLimitTx(data, spendingLimits, chainId, decimals, existingSpendingLimit)
  }, [data, spendingLimits, chainId, decimals, existingSpendingLimit])

  return (
    <SignOrExecuteForm safeTx={safeTx} isExecutable={safe.threshold === 1} onSubmit={onSubmit} error={safeTxError}>
      <Box textAlign="center" mb={3}>
        <TokenIcon logoUri={logoUri} tokenSymbol={symbol} />

        {existingSpendingLimit ? (
          <Box display="flex" alignItems="center" justifyContent="center" gap="4px">
            <Typography color="error" sx={{ textDecoration: 'line-through' }}>
              {formatUnits(BigNumber.from(existingSpendingLimit.amount), decimals)} {symbol}
            </Typography>
            {' →'}
            <Typography>
              {data.amount} {symbol}
            </Typography>
          </Box>
        ) : (
          <Typography variant="h4">
            {data.amount} {symbol}
          </Typography>
        )}
      </Box>
      <Typography color={({ palette }) => palette.text.secondary} pb={1}>
        Beneficiary
      </Typography>

      <Box mb={3}>
        <EthHashInfo address={data.beneficiary} shortAddress={false} hasExplorer showCopyButton />
      </Box>

      <Typography color={({ palette }) => palette.text.secondary}>Reset Time</Typography>
      {existingSpendingLimit ? (
        <>
          <Box display="flex" alignItems="center" gap="4px" mb={2}>
            <Typography color="error" sx={{ textDecoration: 'line-through' }}>
              {relativeTime(existingSpendingLimit.lastResetMin, existingSpendingLimit.resetTimeMin)}
            </Typography>
            {' →'}
            <Typography>{resetTime}</Typography>
          </Box>
          <Typography color="error" mb={2}>
            You are about to replace an existent spending limit
          </Typography>
        </>
      ) : (
        <Typography mb={2}>{resetTime}</Typography>
      )}
    </SignOrExecuteForm>
  )
}
