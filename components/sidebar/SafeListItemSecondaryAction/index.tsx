import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Link, { LinkProps } from 'next/link'

import { useAppSelector } from '@/store'
import { selectAddedSafes } from '@/store/addedSafesSlice'
import useWallet from '@/hooks/wallets/useWallet'
import useChains from '@/hooks/useChains'
import { isOwner } from '@/utils/transaction-guards'

import css from './styles.module.css'

const SafeListItemSecondaryAction = ({
  chainId,
  address,
  onClick,
  href,
}: {
  chainId: string
  address: string
  onClick: () => void
  href?: LinkProps['href']
}) => {
  const { configs } = useChains()
  const wallet = useWallet()
  const addedSafes = useAppSelector((state) => selectAddedSafes(state, chainId))
  const isAdded = !!addedSafes?.[address]
  const isSafeOwner = isOwner(addedSafes?.[address]?.owners, wallet?.address)

  if (!isAdded && href) {
    return (
      <Link href={href} passHref>
        <Button
          className={css.addButton}
          sx={({ palette }) => ({
            '&:hover': {
              backgroundColor: palette.primary.background,
            },
          })}
          size="small"
          disableElevation
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
        >
          Add Safe
        </Button>
      </Link>
    )
  }

  if (!isSafeOwner) {
    return (
      <Typography variant="body2" display="flex" sx={({ palette }) => ({ color: palette.border.main })}>
        <img src="/images/sidebar/safe-list/eye.svg" alt="Read only" height="16px" width="16px" /> Read only
      </Typography>
    )
  }

  if (addedSafes?.[address]?.ethBalance) {
    const { nativeCurrency } = configs.find((chain) => chain.chainId === chainId) || {}

    return (
      <Typography variant="body2" fontWeight={700}>
        {addedSafes[address].ethBalance} {nativeCurrency?.symbol || 'ETH'}
      </Typography>
    )
  }

  return null
}

export default SafeListItemSecondaryAction
