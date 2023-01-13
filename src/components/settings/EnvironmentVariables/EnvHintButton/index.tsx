import Link from 'next/link'
import { useRouter } from 'next/router'
import { SvgIcon, IconButton, Tooltip } from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { AppRoutes } from '@/config/routes'
import { useAppSelector } from '@/store'
import { isEnvInitialState } from '@/store/settingsSlice'

const EnvHintButton = () => {
  const router = useRouter()
  const isInitialState = useAppSelector(isEnvInitialState)

  if (isInitialState) {
    return null
  }

  return (
    <Link href={{ pathname: AppRoutes.settings.environmentVariables, query: router.query }} passHref>
      <Tooltip title="Default environment has been changed" placement="top">
        <IconButton size="small" color="warning" sx={{ justifySelf: 'flex-end', marginLeft: 'auto' }} disableRipple>
          <SvgIcon component={WarningAmberIcon} inheritViewBox />
        </IconButton>
      </Tooltip>
    </Link>
  )
}

export default EnvHintButton
