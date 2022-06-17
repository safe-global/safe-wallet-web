import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import SvgIcon from '@mui/material/SvgIcon'

import { useAppSelector } from '@/store'
import { selectAddedSafes } from '@/store/addedSafesSlice'
import useWallet from '@/services/wallets/useWallet'
import useChains from '@/services/useChains'
import Eye from './assets/Eye.svg'

import css from './styles.module.css'

const SafeListSecondaryAction = ({
  chainId,
  address,
  handleAddSafe,
}: {
  chainId: string
  address: string
  handleAddSafe: () => void
}) => {
  const { configs } = useChains()
  const wallet = useWallet()
  const addedSafes = useAppSelector((state) => selectAddedSafes(state, chainId))
  const isAdded = !!addedSafes[address]
  const isOwner = addedSafes[address]?.owners.some(
    ({ value }) => value.toLowerCase() === wallet?.address?.toLowerCase(),
  )

  if (!isAdded) {
    return (
      <Button
        className={css.addButton}
        sx={({ palette }) => ({
          color: palette.primary.main,
          '&:hover': {
            // @ts-expect-error type '200' can't be used to index type 'PaletteColor'
            backgroundColor: palette.primary[200],
          },
        })}
        size="small"
        disableElevation
        onClick={(e) => {
          e.stopPropagation()
          handleAddSafe()
        }}
      >
        Add Safe
      </Button>
    )
  }

  if (!isOwner) {
    return (
      <Typography variant="caption" display="flex" sx={({ palette }) => ({ color: palette.secondaryBlack[300] })}>
        <SvgIcon component={Eye} inheritViewBox />, Read only
      </Typography>
    )
  }

  if (addedSafes[address]?.ethBalance) {
    const { nativeCurrency } = configs.find((chain) => chain.chainId === chainId) || {}

    return (
      <Typography variant="subtitle2" fontWeight={700}>
        {addedSafes[address].ethBalance} {nativeCurrency?.symbol || 'ETH'}
      </Typography>
    )
  }

  return null
}

export default SafeListSecondaryAction
