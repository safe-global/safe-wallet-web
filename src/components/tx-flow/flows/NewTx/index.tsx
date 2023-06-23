import { useCallback, useContext } from 'react'
import { useRouter } from 'next/router'
import TxButton, { SendNFTsButton, SendTokensButton } from '@/components/tx-flow/common/TxButton'
import { useTxBuilderApp } from '@/hooks/safe-apps/useTxBuilderApp'
import { Box, Typography } from '@mui/material'
import { TxModalContext } from '../../'
import TokenTransferFlow from '../TokenTransfer'
import { AppRoutes } from '@/config/routes'
import css from './styles.module.css'
import Link from 'next/link'

const BUTTONS_HEIGHT = '91px'

const NewTxMenu = () => {
  const router = useRouter()
  const { setTxFlow } = useContext(TxModalContext)
  const txBuilder = useTxBuilderApp()

  const onNftsClick = useCallback(() => {
    router.push({
      pathname: AppRoutes.balances.nfts,
      query: { safe: router.query.safe },
    })
  }, [router])

  const onTokensClick = useCallback(() => {
    setTxFlow(<TokenTransferFlow />)
  }, [setTxFlow])

  return (
    <Box className={css.wrapper}>
      <Typography variant="h6" fontWeight={700}>
        New transaction
      </Typography>

      <SendTokensButton onClick={onTokensClick} sx={{ height: BUTTONS_HEIGHT }} />

      <SendNFTsButton onClick={onNftsClick} sx={{ height: BUTTONS_HEIGHT }} />

      {txBuilder && txBuilder.app && (
        <Link href={txBuilder.link} passHref>
          <a style={{ width: '100%' }}>
            <TxButton
              startIcon={<img src={txBuilder.app.iconUrl} height={20} width="auto" alt={txBuilder.app.name} />}
              variant="outlined"
              onClick={() => console.log('open contract interaction flow')}
              sx={{ height: BUTTONS_HEIGHT }}
            >
              Contract interaction
            </TxButton>
          </a>
        </Link>
      )}
    </Box>
  )
}

export default NewTxMenu
