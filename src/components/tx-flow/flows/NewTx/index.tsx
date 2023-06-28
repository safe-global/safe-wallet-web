import { useCallback, useContext } from 'react'
import { SendNFTsButton, SendTokensButton, TxBuilderButton } from '@/components/tx-flow/common/TxButton'
import { Box, Typography } from '@mui/material'
import { TxModalContext } from '../../'
import TokenTransferFlow from '../TokenTransfer'
import css from './styles.module.css'

const buttonSx = { height: '91px' }

const NewTxMenu = () => {
  const { setTxFlow } = useContext(TxModalContext)

  const onTokensClick = useCallback(() => {
    setTxFlow(<TokenTransferFlow />)
  }, [setTxFlow])

  return (
    <Box className={css.wrapper}>
      <Typography variant="h6" fontWeight={700}>
        New transaction
      </Typography>

      <SendTokensButton onClick={onTokensClick} sx={buttonSx} />

      <SendNFTsButton sx={buttonSx} />

      <TxBuilderButton sx={buttonSx} />
    </Box>
  )
}

export default NewTxMenu
