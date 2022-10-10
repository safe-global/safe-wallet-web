import { useState, type ReactElement } from 'react'
import { Box, Button, type ButtonProps, DialogContent, SvgIcon } from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/router'
import type { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import ModalDialog from '@/components/common/ModalDialog'
import TokenTransferModal from '../TokenTransferModal'
import AssetsIcon from '@/public/images/sidebar/assets.svg'
import NftIcon from '@/public/images/common/nft.svg'
import type { NftTransferParams } from '../NftTransferModal'
import NftTransferModal from '../NftTransferModal'
import { trackEvent, MODALS_EVENTS } from '@/services/analytics'
import { SendAssetsField } from '../TokenTransferModal/SendAssetsForm'
import { useRemoteSafeApps } from '@/hooks/safe-apps/useRemoteSafeApps'
import { AppRoutes } from '@/config/routes'
import { SafeAppsTag } from '@/config/constants'

const TxButton = (props: ButtonProps) => (
  <Button variant="contained" sx={{ '& svg path': { fill: 'currentColor' } }} fullWidth {...props} />
)

const useTxBuilderApp = (): SafeAppData | undefined => {
  const [remoteApps] = useRemoteSafeApps()
  return remoteApps?.find((app) => app.tags?.includes(SafeAppsTag.TX_BUILDER))
}

const NewTxModal = ({ onClose, recipient }: { onClose: () => void; recipient?: string }): ReactElement => {
  const [tokenModalOpen, setTokenModalOpen] = useState<boolean>(false)
  const [nftsModalOpen, setNftModalOpen] = useState<boolean>(false)
  const router = useRouter()
  const txBuilderApp = useTxBuilderApp()

  // These cannot be Track components as they intefere with styling
  const onTokenModalOpen = () => {
    trackEvent(MODALS_EVENTS.SEND_FUNDS)
    setTokenModalOpen(true)
  }

  const onNFTModalOpen = () => {
    trackEvent(MODALS_EVENTS.SEND_COLLECTIBLE)
    setNftModalOpen(true)
  }

  const onContractInteraction = () => {
    trackEvent(MODALS_EVENTS.CONTRACT_INTERACTION)
    onClose()
  }

  return (
    <>
      <ModalDialog open dialogTitle="New transaction" onClose={onClose}>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" gap={2} pt={7} pb={4} width={240} m="auto">
            <TxButton onClick={onTokenModalOpen} startIcon={<SvgIcon component={AssetsIcon} inheritViewBox />}>
              Send tokens
            </TxButton>

            <TxButton onClick={onNFTModalOpen} startIcon={<SvgIcon component={NftIcon} inheritViewBox />}>
              Send NFTs
            </TxButton>

            {txBuilderApp && (
              <Link
                href={{
                  pathname: AppRoutes.apps,
                  query: { safe: router.query.safe, appUrl: txBuilderApp.url },
                }}
                passHref
              >
                <TxButton
                  startIcon={<img src={txBuilderApp.iconUrl} height={20} width="auto" alt={txBuilderApp.name} />}
                  variant="outlined"
                  onClick={onContractInteraction}
                >
                  Contract interaction
                </TxButton>
              </Link>
            )}
          </Box>
        </DialogContent>
      </ModalDialog>

      {tokenModalOpen && (
        <TokenTransferModal onClose={onClose} initialData={[{ [SendAssetsField.recipient]: recipient }]} />
      )}

      {nftsModalOpen && <NftTransferModal onClose={onClose} initialData={[{ recipient } as NftTransferParams]} />}
    </>
  )
}

export default NewTxModal
