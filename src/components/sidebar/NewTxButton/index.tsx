import { type ReactElement } from 'react'
import Button from '@mui/material/Button'
import css from './styles.module.css'
import CheckWallet from '@/components/common/CheckWallet'
import type { UrlObject } from 'url'
import { AppRoutes } from '@/config/routes'
import { useRouter } from 'next/router'
import Link from 'next/link'

const NewTxButton = (): ReactElement => {
  const router = useRouter()

  const newTxLink: UrlObject = {
    pathname: AppRoutes.newTx.index,
    query: { safe: router.query.safe },
  }

  return (
    <CheckWallet allowSpendingLimit>
      {(isOk) => (
        <Link href={newTxLink} passHref>
          <Button variant="contained" size="small" disabled={!isOk} fullWidth className={css.button} disableElevation>
            New transaction
          </Button>
        </Link>
      )}
    </CheckWallet>
  )
}

export default NewTxButton
