import { Typography, Box } from '@mui/material'
import useBalances from '@/hooks/useBalances'
import { useEffect, useState } from 'react'
import useSafeInfo from '@/hooks/useSafeInfo'
import useAsync from '@/hooks/useAsync'
import { MetaTransactionData, SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import { createMultiSendTx } from '@/services/tx/txSender'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import EthHashInfo from '@/components/common/EthHashInfo'
import { getSpendingLimitModuleAddress } from '@/services/contracts/spendingLimitContracts'
import useChainId from '@/hooks/useChainId'
import { useSafeSDK } from '@/hooks/coreSDK/safeCoreSDK'
import { useSelector } from 'react-redux'
import { selectSpendingLimits, SpendingLimitState } from '@/store/spendingLimitsSlice'
import { parseUnits } from '@ethersproject/units'
import { createAddDelegateTx, createResetAllowanceTx, createSetAllowanceTx } from '@/services/tx/spendingLimitParams'
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

const currentMinutes = (): number => Math.floor(Date.now() / (1000 * 60))

export const ReviewSpendingLimit = ({ data, onSubmit }: Props) => {
  const [existingSpendingLimit, setExistingSpendingLimit] = useState<SpendingLimitState>()
  const spendingLimits = useSelector(selectSpendingLimits)
  const { safe } = useSafeInfo()
  const sdk = useSafeSDK()
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

  // Create a safeTx
  const [safeTx, safeTxError] = useAsync<SafeTransaction | undefined>(async () => {
    const spendingLimitAddress = getSpendingLimitModuleAddress(chainId)
    if (!spendingLimitAddress || !sdk) return

    const txs: MetaTransactionData[] = []

    const isSpendingLimitEnabled = await sdk.isModuleEnabled(spendingLimitAddress)
    if (!isSpendingLimitEnabled) {
      const enableModuleTx = await sdk.getEnableModuleTx(spendingLimitAddress)

      const tx = {
        to: enableModuleTx.data.to,
        value: '0',
        data: enableModuleTx.data.data,
      }
      txs.push(tx)
    }

    const existingDelegate = spendingLimits.find((spendingLimit) => spendingLimit.beneficiary === data.beneficiary)
    if (!existingDelegate) {
      txs.push(createAddDelegateTx(data.beneficiary, spendingLimitAddress))
    }

    if (existingSpendingLimit && existingSpendingLimit.spent !== '0') {
      txs.push(createResetAllowanceTx(data.beneficiary, data.tokenAddress, spendingLimitAddress))
    }

    const tx = createSetAllowanceTx(
      data.beneficiary,
      data.tokenAddress,
      parseUnits(data.amount, decimals).toString(),
      parseInt(data.resetTime),
      data.resetTime !== '0' ? currentMinutes() - 30 : 0,
      spendingLimitAddress,
    )

    txs.push(tx)

    return createMultiSendTx(txs)
  }, [chainId, sdk, spendingLimits, data, decimals])

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
