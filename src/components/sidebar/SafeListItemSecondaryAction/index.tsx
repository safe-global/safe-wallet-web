import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import type { LinkProps } from 'next/link'
import Link from 'next/link'
import VisibilityIcon from '@mui/icons-material/Visibility'

import { useAppSelector } from '@/store'
import { selectAddedSafes } from '@/store/addedSafesSlice'
import useWallet from '@/hooks/wallets/useWallet'
import useChains from '@/hooks/useChains'
import { isOwner } from '@/utils/transaction-guards'

import css from './styles.module.css'
import { formatAmount } from '@/utils/formatNumber'

const SafeListItemSecondaryAction = ({
  chainId,
  address,
  onClick,
  href,
}: {
  chainId: string
  address: string
  onClick?: () => void
  href?: LinkProps['href']
}) => {
  const { configs } = useChains()
  const wallet = useWallet()
  const addedSafes = useAppSelector((state) => selectAddedSafes(state, chainId))
  const isAdded = !!addedSafes?.[address]
  const isAddedSafeOwner = isOwner(addedSafes?.[address]?.owners, wallet?.address)

  if (!isAdded && href) {
    return (
      <Link href={href} passHref>
        <Button
          className={css.addButton}
          size="small"
          disableElevation
          onClick={(e) => {
            e.stopPropagation()
            onClick?.()
          }}
        >
          Add
        </Button>
      </Link>
    )
  }

  if (!isAddedSafeOwner) {
    return (
      <Typography
        variant="body2"
        display="flex"
        alignItems="center"
        sx={({ palette }) => ({ color: palette.border.main })}
      >
        <VisibilityIcon fontSize="inherit" sx={{ marginRight: 1 }} /> Read only
      </Typography>
    )
  }

  const balance = addedSafes?.[address]?.ethBalance

  if (balance) {
    const { nativeCurrency } = configs.find((chain) => chain.chainId === chainId) || {}

    return (
      <Typography variant="body2" fontWeight={700}>
        {formatAmount(balance)} {nativeCurrency?.symbol || 'ETH'}
      </Typography>
    )
  }

  return null
}

export default SafeListItemSecondaryAction
