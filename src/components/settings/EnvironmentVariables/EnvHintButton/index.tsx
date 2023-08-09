import Link from 'next/link'
import { useRouter } from 'next/router'
import { SvgIcon, IconButton, Tooltip } from '@mui/material'
import { AppRoutes } from '@/config/routes'
import { useAppSelector } from '@/store'
import { isEnvInitialState, selectTenderly } from '@/store/settingsSlice'
import css from './styles.module.css'
import AlertIcon from '@/public/images/common/alert.svg'
import useChainId from '@/hooks/useChainId'
import useWallet from '@/hooks/wallets/useWallet'

const EnvHintButton = () => {
  const router = useRouter()
  const chainId = useChainId()
  const wallet = useWallet()
  const isInitialState = useAppSelector((state) => isEnvInitialState(state, chainId))
  const customTenderlyUrl = useAppSelector(selectTenderly)

  if (isInitialState || (wallet && customTenderlyUrl)) {
    return null
  }

  return (
    <Link href={{ pathname: AppRoutes.settings.environmentVariables, query: router.query }} passHref>
      <Tooltip title="Default environment has been changed" placement="top" arrow>
        <IconButton
          className={css.button}
          size="small"
          color="warning"
          sx={{ justifySelf: 'flex-end', marginLeft: { sm: '0', md: 'auto' } }}
          disableRipple
        >
          <SvgIcon component={AlertIcon} inheritViewBox fontSize="small" />
        </IconButton>
      </Tooltip>
    </Link>
  )
}

export default EnvHintButton
