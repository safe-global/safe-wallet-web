import EnhancedTable from '@/components/common/EnhancedTable'
import useBalances from '@/hooks/useBalances'
import { SafeBalanceResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { formatUnits } from '@ethersproject/units'
import { Box } from '@mui/material'
import { relativeTime } from '@/utils/date'
import EthHashInfo from '@/components/common/EthHashInfo'
import { useMemo } from 'react'
import { SpendingLimitState } from '@/store/spendingLimitsSlice'
import { BigNumber } from '@ethersproject/bignumber'

const headCells = [
  { id: 'beneficiary', label: 'Beneficiary' },
  { id: 'spent', label: 'Spent' },
  { id: 'resetTime', label: 'Reset Time' },
]

const getSpendingLimitRows = (spendingLimits: SpendingLimitState[], balances: SafeBalanceResponse) => {
  return spendingLimits.map((spendingLimit) => {
    const token = balances.items.find((item) => item.tokenInfo.address === spendingLimit.token)
    const amount = BigNumber.from(spendingLimit.amount)
    const formattedAmount = formatUnits(amount, token?.tokenInfo.decimals)

    return {
      beneficiary: {
        rawValue: spendingLimit.beneficiary,
        content: <EthHashInfo address={spendingLimit.beneficiary} shortAddress={false} hasExplorer showCopyButton />,
      },
      spent: {
        rawValue: spendingLimit.spent,
        content: (
          <Box display="flex" alignItems="center" gap={1}>
            <img src={token?.tokenInfo.logoUri} alt={token?.tokenInfo.name} width={24} height={24} />
            {`${spendingLimit.spent} of ${formattedAmount} ${token?.tokenInfo.symbol}`}
          </Box>
        ),
      },
      resetTime: {
        rawValue: spendingLimit.resetTimeMin,
        content: <div>{relativeTime(spendingLimit.lastResetMin, spendingLimit.resetTimeMin)}</div>,
      },
    }
  })
}

export const SpendingLimitsTable = ({ spendingLimits }: { spendingLimits: SpendingLimitState[] }) => {
  const { balances } = useBalances()
  const rows = useMemo(() => getSpendingLimitRows(spendingLimits, balances), [balances, spendingLimits])
  return <EnhancedTable rows={rows} headCells={headCells} />
}
