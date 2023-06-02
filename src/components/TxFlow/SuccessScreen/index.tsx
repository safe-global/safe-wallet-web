import StatusMessage from '@/components/TxFlow/SuccessScreen/StatusMessage'
import StatusStepper from '@/components/TxFlow/SuccessScreen/StatusStepper'
import { AppRoutes } from '@/config/routes'
import useSafeAddress from '@/hooks/useSafeAddress'
import { Button, Container, Divider, Paper } from '@mui/material'
import classnames from 'classnames'
import Link from 'next/link'
import { type UrlObject } from 'url'
import css from './styles.module.css'
import { useAppSelector } from '@/store'
import { selectPendingTxById } from '@/store/pendingTxsSlice'
import { useEffect, useState } from 'react'
import { getBlockExplorerLink } from '@/utils/chains'
import { useCurrentChain } from '@/hooks/useChains'

export const SuccessScreen = ({ txId }: { txId: string }) => {
  const [localTxHash, setLocalTxHash] = useState<string>('')
  const safeAddress = useSafeAddress()
  const chain = useCurrentChain()
  const pendingTx = useAppSelector((state) => selectPendingTxById(state, txId))
  const { txHash = '', status } = pendingTx || {}

  useEffect(() => {
    if (!txHash) return

    setLocalTxHash(txHash)
  }, [txHash])

  const homeLink: UrlObject = {
    pathname: AppRoutes.home,
    query: { safe: safeAddress },
  }

  const txLink = chain ? getBlockExplorerLink(chain, localTxHash) : undefined

  return (
    <Container
      component={Paper}
      disableGutters
      sx={{
        textAlign: 'center',
      }}
      maxWidth="md"
    >
      <div className={css.row}>
        {/* TODO: figure out the isError logic */}
        <StatusMessage status={status} isError={false} />
      </div>

      <Divider />
      <div className={css.row}>
        <StatusStepper status={status} txHash={localTxHash} />
      </div>

      <Divider />
      <div className={classnames(css.row, css.buttons)}>
        <Link href={homeLink} passHref>
          <Button variant="outlined" size="small">
            Back to dashboard
          </Button>
        </Link>
        {txLink && (
          <Button href={txLink.href} target="_blank" rel="noreferrer" variant="outlined" size="small">
            View transaction
          </Button>
        )}
      </div>
    </Container>
  )
}
