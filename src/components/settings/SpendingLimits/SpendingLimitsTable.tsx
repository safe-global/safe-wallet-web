import EnhancedTable from '@/components/common/EnhancedTable'
import useBalances from '@/hooks/useBalances'
import DeleteIcon from '@/public/images/common/delete.svg'
import { safeFormatUnits } from '@/utils/formatters'
import { Box, IconButton, SvgIcon } from '@mui/material'
import { relativeTime } from '@/utils/date'
import EthHashInfo from '@/components/common/EthHashInfo'
import { useMemo, useState } from 'react'
import type { SpendingLimitState } from '@/store/spendingLimitsSlice'
import { BigNumber } from '@ethersproject/bignumber'
import type { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import TxModal from '@/components/tx/TxModal'
import { RemoveSpendingLimit } from '@/components/settings/SpendingLimits/RemoveSpendingLimit'
import useIsGranted from '@/hooks/useIsGranted'
import Track from '@/components/common/Track'
import { SETTINGS_EVENTS } from '@/services/analytics/events/settings'
import TokenIcon from '@/components/common/TokenIcon'
import SpendingLimitLabel from '@/components/common/SpendingLimitLabel'

const RemoveSpendingLimitSteps: TxStepperProps['steps'] = [
  {
    label: 'Remove spending limit',
    render: (data, onSubmit) => <RemoveSpendingLimit data={data as SpendingLimitState} onSubmit={onSubmit} />,
  },
]

export const SpendingLimitsTable = ({ spendingLimits }: { spendingLimits: SpendingLimitState[] }) => {
  const [open, setOpen] = useState<boolean>(false)
  const [initialData, setInitialData] = useState<SpendingLimitState>()
  const { balances } = useBalances()
  const isGranted = useIsGranted()

  const shouldHideactions = !isGranted

  const onRemove = (spendingLimit: SpendingLimitState) => {
    setOpen(true)
    setInitialData(spendingLimit)
  }

  const headCells = useMemo(
    () => [
      { id: 'beneficiary', label: 'Beneficiary' },
      { id: 'spent', label: 'Spent' },
      { id: 'resetTime', label: 'Reset time' },
      { id: 'actions', label: 'Actions', sticky: true, hide: shouldHideactions },
    ],
    [shouldHideactions],
  )

  const rows = useMemo(
    () =>
      spendingLimits.map((spendingLimit) => {
        const token = balances.items.find((item) => item.tokenInfo.address === spendingLimit.token)
        const amount = BigNumber.from(spendingLimit.amount)
        const formattedAmount = safeFormatUnits(amount, token?.tokenInfo.decimals)

        const spent = BigNumber.from(spendingLimit.spent)
        const formattedSpent = safeFormatUnits(spent, token?.tokenInfo.decimals)

        return {
          cells: {
            beneficiary: {
              rawValue: spendingLimit.beneficiary,
              content: (
                <EthHashInfo address={spendingLimit.beneficiary} shortAddress={false} hasExplorer showCopyButton />
              ),
            },
            spent: {
              rawValue: spendingLimit.spent,
              content: (
                <Box display="flex" alignItems="center" gap={1}>
                  <TokenIcon logoUri={token?.tokenInfo.logoUri} tokenSymbol={token?.tokenInfo.symbol} />
                  {`${formattedSpent} of ${formattedAmount} ${token?.tokenInfo.symbol}`}
                </Box>
              ),
            },
            resetTime: {
              rawValue: spendingLimit.resetTimeMin,
              content: (
                <SpendingLimitLabel
                  label={relativeTime(spendingLimit.lastResetMin, spendingLimit.resetTimeMin)}
                  isOneTime={spendingLimit.resetTimeMin === '0'}
                />
              ),
            },
            actions: {
              rawValue: '',
              sticky: true,
              hide: shouldHideactions,
              content: (
                <Track {...SETTINGS_EVENTS.SPENDING_LIMIT.REMOVE_LIMIT}>
                  <IconButton onClick={() => onRemove(spendingLimit)} color="error" size="small">
                    <SvgIcon component={DeleteIcon} inheritViewBox color="error" fontSize="small" />
                  </IconButton>
                </Track>
              ),
            },
          },
        }
      }),
    [balances.items, shouldHideactions, spendingLimits],
  )

  return (
    <>
      <EnhancedTable rows={rows} headCells={headCells} />
      {open && <TxModal onClose={() => setOpen(false)} steps={RemoveSpendingLimitSteps} initialData={[initialData]} />}
    </>
  )
}
