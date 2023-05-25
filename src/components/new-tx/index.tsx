import TxButton, { SendNFTsButton, SendTokensButton } from '@/components/tx/modals/NewTxModal/TxButton'
import { useTxBuilderApp } from '@/hooks/safe-apps/useTxBuilderApp'
import { Box, Typography } from '@mui/material'
import { AppRoutes } from '@/config/routes'
import { useRouter } from 'next/router'
import { type UrlObject } from 'url'
import { ModalContext, ModalType } from '@/services/ModalProvider'
import { useContext } from 'react'

const BUTTONS_HEIGHT = '91px'

const NewTxMenu = () => {
  const { setVisibleModal } = useContext(ModalContext)
  const txBuilder = useTxBuilderApp()
  const router = useRouter()

  const sendTokensLink: UrlObject = {
    pathname: AppRoutes.newTx.sendTokens,
    query: { safe: router.query.safe },
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2} width={452} m="auto">
      <Typography variant="h6" fontWeight={700}>
        New transaction
      </Typography>
      <SendTokensButton
        onClick={() => setVisibleModal({ type: ModalType.SendTokens, props: {} })}
        sx={{ height: BUTTONS_HEIGHT }}
      />

      <SendNFTsButton onClick={() => console.log('open send NFTs flow')} sx={{ height: BUTTONS_HEIGHT }} />

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
