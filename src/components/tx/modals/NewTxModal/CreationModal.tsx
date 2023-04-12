import { Box, DialogContent } from '@mui/material'
import Link from 'next/link'

import ModalDialog from '@/components/common/ModalDialog'
import { useTxBuilderApp } from '@/hooks/safe-apps/useTxBuilderApp'
import TxButton, { SendNFTsButton, SendTokensButton } from './TxButton'
import useIsOnlySpendingLimitBeneficiary from '@/hooks/useIsOnlySpendingLimitBeneficiary'

const CreationModal = ({
  open,
  onClose,
  onTokenModalOpen,
  onNFTModalOpen,
  onContractInteraction,
  shouldShowTxBuilder,
}: {
  open: boolean
  onClose: () => void
  onTokenModalOpen: () => void
  onNFTModalOpen?: () => void
  onContractInteraction: () => void
  shouldShowTxBuilder: boolean
}) => {
  const isOnlySpendingLimitBeneficiary = useIsOnlySpendingLimitBeneficiary()
  const txBuilder = useTxBuilderApp()

  return (
    <ModalDialog open={open} dialogTitle="New transaction" onClose={onClose}>
      <DialogContent>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2} pt={7} pb={4} width={240} m="auto">
          <SendTokensButton onClick={onTokenModalOpen} />

          {!isOnlySpendingLimitBeneficiary && (
            <>
              {onNFTModalOpen && <SendNFTsButton onClick={onNFTModalOpen} />}

              {txBuilder && txBuilder.app && shouldShowTxBuilder && (
                <Link href={txBuilder.link} passHref>
                  <a style={{ width: '100%' }}>
                    <TxButton
                      startIcon={<img src={txBuilder.app.iconUrl} height={20} width="auto" alt={txBuilder.app.name} />}
                      variant="outlined"
                      onClick={onContractInteraction}
                    >
                      Contract interaction
                    </TxButton>
                  </a>
                </Link>
              )}
            </>
          )}
        </Box>
      </DialogContent>
    </ModalDialog>
  )
}

export default CreationModal
