import type { ReactElement } from 'react'
import { Box, Button, Divider, Paper, Stack, SvgIcon, Typography, useMediaQuery, useTheme } from '@mui/material'
import Link from 'next/link'
import InfoIcon from '@/public/images/notifications/info.svg'
import css from './styles.module.css'
import { shortenAddress } from '@/utils/formatters'
import { useRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'

type Props = {
  address: string
}

export const BlockedAddress = (props: Props): ReactElement => {
  const { address } = props
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const displayAddress = isMobile ? shortenAddress(address) : address
  const router = useRouter()

  const handleDismissButton = () => {
    router.push(AppRoutes.home)
  }

  return (
    <div className={css.container}>
      <Paper sx={{ maxWidth: '500px' }}>
        <Stack padding="var(--space-3)" gap={2} display="flex" alignItems="center" borderBottom="1px solid #DCDEE0">
          <Typography color="var(--color-text-Secondary, #A1A3A7)">{displayAddress}</Typography>

          <Box className={css.iconCircle}>
            <SvgIcon component={InfoIcon} inheritViewBox fontSize="medium" />
          </Box>
          <Typography variant="h3" fontWeight={700}>
            Blocked Address
          </Typography>
          <Typography variant="body2">
            This signer address is blocked by the Safe interface, due to being associated with the blocked activities by
            the U.S. Department of Treasury in the Specially Designated Nationals (SDN) list.{' '}
          </Typography>
          <Divider />
        </Stack>
        <Box display="flex" justifyContent="center" pt={3} pb={2}>
          <Link href={{ pathname: AppRoutes.home, query: router.query }}>
            <Button variant="contained">Got it</Button>
          </Link>
        </Box>
      </Paper>
    </div>
  )
}

export default BlockedAddress
