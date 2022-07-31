import { useState, type ReactElement } from 'react'
import { Box, Button, type ButtonProps, DialogContent } from '@mui/material'
import ModalDialog from '@/components/common/ModalDialog'
import TokenTransferModal from '../TokenTransferModal'
import AssetsIcon from '@/public/images/sidebar/assets.svg'
import NftIcon from '@/public/images/sidebar/nfts.svg'

const TxButton = (props: ButtonProps & { iconSize?: number }) => (
  <Button
    variant="contained"
    fullWidth
    {...props}
    sx={
      props.iconSize
        ? {
            '& svg': {
              height: `${props.iconSize}px`,
              width: 'auto',
              my: `${(24 - props.iconSize) / 2}px`,
              ml: `${props.iconSize - 24}px`,
            },
          }
        : undefined
    }
  />
)

const NewTxModal = ({ onClose }: { onClose: () => void }): ReactElement => {
  const [tokenModalOpen, setTokenModalOpen] = useState<boolean>(false)
  // const [nftsModalOpen, setNftModalOpen] = useState<boolean>(false)

  return (
    <>
      <ModalDialog open dialogTitle="New transaction" onClose={onClose}>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" gap={2} pt={6} pb={4} width={240} m="auto">
            <TxButton onClick={() => setTokenModalOpen(true)} startIcon={<AssetsIcon />} iconSize={24}>
              Send tokens
            </TxButton>

            <TxButton onClick={() => alert('Implement me')} startIcon={<NftIcon />} iconSize={18}>
              Send NFTs
            </TxButton>
          </Box>
        </DialogContent>
      </ModalDialog>

      {tokenModalOpen && <TokenTransferModal onClose={() => setTokenModalOpen(false)} />}
    </>
  )
}

export default NewTxModal
