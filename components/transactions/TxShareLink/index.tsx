import { ReactElement, MouseEvent } from 'react'
import { IconButton, Link } from '@mui/material'
import ShareIcon from '@mui/icons-material/Share'
import { AppRoutes } from '@/config/routes'
import { useRouter } from 'next/router'

const TxShareLink = ({ id }: { id: string }): ReactElement => {
  const router = useRouter()
  const { safe = '' } = router.query
  const href = AppRoutes.safe.transactions.tx.replace('/safe/', `/${safe}/`).replace(/$/, `?id=${id}`)

  const onClick = (e: MouseEvent) => {
    if (!e.ctrlKey && !e.metaKey) {
      e.preventDefault()
    }

    // copy href to clipboard
    navigator.clipboard.writeText(location.origin + href)
  }

  return (
    <IconButton component={Link} aria-label="Share" href={href} onClick={onClick}>
      <ShareIcon />
    </IconButton>
  )
}

export default TxShareLink
