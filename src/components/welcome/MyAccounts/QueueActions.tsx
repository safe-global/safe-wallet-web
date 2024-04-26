import type { ReactNode } from 'react'
import { Box, Chip, Typography, SvgIcon } from '@mui/material'
import TransactionsIcon from '@/public/images/transactions/transactions.svg'
import WalletIcon from '@/components/common/WalletIcon'
import useWallet from '@/hooks/wallets/useWallet'

const ChipLink = ({ children, color }: { children: ReactNode; color?: string }) => (
  <Chip
    size="small"
    sx={{ backgroundColor: `${color}.background` }}
    label={
      <Typography variant="caption" display="flex" alignItems="center" gap={0.5}>
        {children}
      </Typography>
    }
  />
)

const QueueActions = ({ queued, awaitingConfirmation }: { queued: number; awaitingConfirmation: number }) => {
  const wallet = useWallet()

  if (!queued && !awaitingConfirmation) {
    return null
  }

  return (
    <Box px={2} pb={2} display="flex" gap={1} width="100%" alignItems="center">
      {queued > 0 && (
        <ChipLink>
          <SvgIcon component={TransactionsIcon} inheritViewBox fontSize="small" />
          {queued} pending transaction{queued > 1 ? 's' : ''}
        </ChipLink>
      )}

      {awaitingConfirmation > 0 && (
        <ChipLink color="warning">
          {wallet && <WalletIcon provider={wallet.label} icon={wallet.icon} height={16} />}
          {awaitingConfirmation} to confirm
        </ChipLink>
      )}
    </Box>
  )
}

export default QueueActions
