import ExternalLink from '@/components/common/ExternalLink'
import ModalDialog from '@/components/common/ModalDialog'
import useChainId from '@/hooks/useChainId'
import { CircularProgress } from '@mui/material'
import type { SafeCollectibleResponse } from '@safe-global/safe-gateway-typescript-sdk'
import { nftPlatforms } from '../config'
import css from './styles.module.css'

const NftPreviewModal = ({ nft, onClose }: { nft?: SafeCollectibleResponse; onClose: () => void }) => {
  const chainId = useChainId()
  const linkTemplate = nftPlatforms[chainId]?.[0]
  const title = nft ? nft.name || `${nft.tokenSymbol} #${nft.id.slice(0, 20)}` : ''

  return (
    <ModalDialog
      open={!!nft?.imageUri}
      onClose={onClose}
      dialogTitle={title}
      fullScreen
      sx={{ margin: [0, 2], '.MuiPaper-root': { borderRadius: [0, '6px'] } }}
    >
      {nft && (
        <div data-sid="33193" className={css.wrapper}>
          <div data-sid="79287" className={css.imageWrapper} onClick={onClose}>
            <img src={nft.imageUri} alt={nft.name} />

            <CircularProgress className={css.loader} />
          </div>

          {linkTemplate && <ExternalLink href={linkTemplate.getUrl(nft)}>View on {linkTemplate.title}</ExternalLink>}
        </div>
      )}
    </ModalDialog>
  )
}

export default NftPreviewModal
