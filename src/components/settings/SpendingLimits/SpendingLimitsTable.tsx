import EnhancedTable from '@/components/common/EnhancedTable'
import useBalances from '@/hooks/useBalances'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { formatUnits } from '@ethersproject/units'
import { Box, IconButton } from '@mui/material'
import { relativeTime } from '@/utils/date'
import EthHashInfo from '@/components/common/EthHashInfo'
import { useMemo, useState } from 'react'
import { SpendingLimitState } from '@/store/spendingLimitsSlice'
import { BigNumber } from '@ethersproject/bignumber'
import { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import TxModal from '@/components/tx/TxModal'
import { RemoveSpendingLimit } from '@/components/settings/SpendingLimits/RemoveSpendingLimit'
import useIsGranted from '@/hooks/useIsGranted'
import Track from '@/components/common/Track'
import { SETTINGS_EVENTS } from '@/services/analytics/events/settings'

const headCells = [
  { id: 'beneficiary', label: 'Beneficiary' },
  { id: 'spent', label: 'Spent' },
  { id: 'resetTime', label: 'Reset Time' },
  { id: 'actions', label: 'Actions' },
]

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

  const onRemove = (spendingLimit: SpendingLimitState) => {
    setOpen(true)
    setInitialData(spendingLimit)
  }

  const rows = useMemo(
    () =>
      spendingLimits.map((spendingLimit) => {
        const token = balances.items.find((item) => item.tokenInfo.address === spendingLimit.token)
        const amount = BigNumber.from(spendingLimit.amount)
        const formattedAmount = formatUnits(amount, token?.tokenInfo.decimals)

        return {
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
                <img src={token?.tokenInfo.logoUri} alt={token?.tokenInfo.name} width={24} height={24} />
                {`${spendingLimit.spent} of ${formattedAmount} ${token?.tokenInfo.symbol}`}
              </Box>
            ),
          },
          resetTime: {
            rawValue: spendingLimit.resetTimeMin,
            content: <div>{relativeTime(spendingLimit.lastResetMin, spendingLimit.resetTimeMin)}</div>,
          },
          actions: {
            rawValue: '',
            content: isGranted ? (
              <Track {...SETTINGS_EVENTS.SPENDING_LIMIT.REMOVE_LIMIT}>
                <IconButton onClick={() => onRemove(spendingLimit)} color="error">
                  <DeleteOutlineIcon />
                </IconButton>
              </Track>
            ) : null,
          },
        }
      }),
    [balances.items, isGranted, spendingLimits],
  )

  return (
    <>
      <EnhancedTable rows={rows} headCells={headCells} variant="outlined" />
      {open && <TxModal onClose={() => setOpen(false)} steps={RemoveSpendingLimitSteps} initialData={[initialData]} />}
    </>
  )
}
