import TxButton, { SendNFTsButton, SendTokensButton } from '@/components/tx-flow/common/TxButton'
import { useTxBuilderApp } from '@/hooks/safe-apps/useTxBuilderApp'
import { Box, Typography } from '@mui/material'
import { TxModalContext } from '../../'
import { useContext } from 'react'
import TokenTransferFlow from '../TokenTransfer'

const BUTTONS_HEIGHT = '91px'

const NewTxMenu = () => {
  const { setTxFlow } = useContext(TxModalContext)
  const txBuilder = useTxBuilderApp()

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2} width={452} m="auto">
      <Typography variant="h6" fontWeight={700}>
        New transaction
      </Typography>

      <SendTokensButton onClick={() => setTxFlow(<TokenTransferFlow />)} sx={{ height: BUTTONS_HEIGHT }} />

      <SendNFTsButton onClick={() => console.log('Route to NFTs')} sx={{ height: BUTTONS_HEIGHT }} />

      {txBuilder && txBuilder.app && (
        <TxButton
          startIcon={<img src={txBuilder.app.iconUrl} height={20} width="auto" alt={txBuilder.app.name} />}
          variant="outlined"
          onClick={() => console.log('open contract interaction flow')}
          sx={{ height: BUTTONS_HEIGHT }}
        >
          Contract interaction
        </TxButton>
      )}
    </Box>
  )
}

export default NewTxMenu
