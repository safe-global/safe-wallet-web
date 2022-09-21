import { useState, type ReactElement } from 'react'
import { Box, Button, type ButtonProps, DialogContent, SvgIcon } from '@mui/material'
import ModalDialog from '@/components/common/ModalDialog'
import TokenTransferModal from '../TokenTransferModal'
import AssetsIcon from '@/public/images/sidebar/assets.svg'
import NftIcon from '@/public/images/sidebar/nfts.svg'
import NftTransferModal from '../NftTransferModal'
import { trackEvent, MODALS_EVENTS } from '@/services/analytics'

const TxButton = (props: ButtonProps) => (
  <Button variant="contained" sx={{ '& svg path': { fill: 'currentColor' } }} fullWidth {...props} />
)

const NewTxModal = ({ onClose }: { onClose: () => void }): ReactElement => {
  const [tokenModalOpen, setTokenModalOpen] = useState<boolean>(false)
  const [nftsModalOpen, setNftModalOpen] = useState<boolean>(false)

  // These cannot be Track components as they intefere with styling
  const onTokenModalOpen = () => {
    trackEvent(MODALS_EVENTS.SEND_FUNDS)
    setTokenModalOpen(true)
  }

  const onNFTModalOpen = () => {
    trackEvent(MODALS_EVENTS.SEND_COLLECTIBLE)
    setNftModalOpen(true)
  }

  return (
    <>
      <ModalDialog open dialogTitle="New transaction" onClose={onClose}>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" gap={2} pt={7} pb={4} width={240} m="auto">
            <TxButton onClick={onTokenModalOpen} startIcon={<SvgIcon component={AssetsIcon} inheritViewBox />}>
              Send tokens
            </TxButton>

            <TxButton onClick={onNFTModalOpen} startIcon={<SvgIcon component={NftIcon} />}>
              Send NFTs
            </TxButton>
          </Box>
        </DialogContent>
      </ModalDialog>

      {tokenModalOpen && <TokenTransferModal onClose={onClose} />}

      {nftsModalOpen && <NftTransferModal onClose={onClose} />}
    </>
  )
}

export default NewTxModal
