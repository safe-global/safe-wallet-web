import EthHashInfo from '@/components/common/EthHashInfo'
import ModalDialog from '@/components/common/ModalDialog'
import useSafeInfo from '@/hooks/useSafeInfo'
import { usePathname, useSearchParams } from 'next/navigation'
import Link, { type LinkProps } from 'next/link'
import { Box, Button, ButtonBase, Divider, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { MERCURYO_URL, MOONPAY_URL, SafeAppsTag } from '@/config/constants'
import { AppRoutes } from '@/config/routes'
import { useRemoteSafeApps } from '@/hooks/safe-apps/useRemoteSafeApps'
import madProps from '@/utils/mad-props'
import { type ReactNode, useMemo, useState } from 'react'
import Track from '../Track'
import { OVERVIEW_EVENTS } from '@/services/analytics'
import RampLogo from '@/public/images/common/ramp_logo.svg'
import MercuryoLogo from '@/public/images/common/mercuryo_logo.svg'
import MoonPayLogo from '@/public/images/common/moonpay_logo.svg'
import css from './styles.module.css'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'

const useOnrampAppUrl = (): string | undefined => {
  const [onrampApps] = useRemoteSafeApps(SafeAppsTag.ONRAMP)
  return onrampApps?.[0]?.url
}

const useBuyCryptoHref = (): LinkProps['href'] | undefined => {
  const query = useSearchParams()
  const safe = query.get('safe')
  const appUrl = useOnrampAppUrl()

  return useMemo(() => {
    if (!safe || !appUrl) return undefined
    return { pathname: AppRoutes.apps.open, query: { safe, appUrl } }
  }, [safe, appUrl])
}

const buttonStyles = {
  minHeight: '40px',
}

const BuyCryptoOption = ({ name, children }: { name: string; children: ReactNode }) => {
  return (
    <ButtonBase className={css.button}>
      <Typography display="flex" alignItems="center" fontWeight="bold" fontSize="18px" gap={1}>
        {children}
        {name}
      </Typography>
      <ChevronRightRoundedIcon color="border" />
    </ButtonBase>
  )
}

const _BuyCryptoButton = ({ href, pagePath }: { href?: LinkProps['href']; pagePath: string }) => {
  const [open, setOpen] = useState<boolean>(false)
  const { safeAddress } = useSafeInfo()

  const toggleDialog = () => {
    setOpen((prev) => !prev)
  }

  const moonPayLink = `${MOONPAY_URL}?defaultCurrencyCode=eth&walletAddress=${safeAddress}`
  const mercuryoLink = MERCURYO_URL

  return (
    <>
      <Track {...OVERVIEW_EVENTS.BUY_CRYPTO_BUTTON} label={pagePath}>
        <Button variant="contained" size="small" sx={buttonStyles} startIcon={<AddIcon />} onClick={toggleDialog}>
          Buy crypto
        </Button>
      </Track>
      <ModalDialog open={open} onClose={toggleDialog} dialogTitle="Buy crypto with fiat" hideChainIndicator>
        <Box px={4} pb={5} pt={4}>
          <Typography>Choose one of the available options</Typography>
          {href && (
            <Box position="relative">
              <Track {...OVERVIEW_EVENTS.SELECT_ONRAMP_APP} label="Ramp">
                <Link href={href} passHref>
                  <BuyCryptoOption name="Ramp">
                    <RampLogo />
                  </BuyCryptoOption>
                </Link>
              </Track>
              <div className={css.badge}>Safe integrated app</div>
            </Box>
          )}

          <Track {...OVERVIEW_EVENTS.SELECT_ONRAMP_APP} label="MoonPay">
            <Link href={moonPayLink} passHref target="_blank">
              <BuyCryptoOption name="MoonPay">
                <MoonPayLogo />
              </BuyCryptoOption>
            </Link>
          </Track>

          <Track {...OVERVIEW_EVENTS.SELECT_ONRAMP_APP} label="Mercuryo">
            <Link href={mercuryoLink} passHref target="_blank">
              <BuyCryptoOption name="Mercuryo">
                <MercuryoLogo />
              </BuyCryptoOption>
            </Link>
          </Track>

          <Divider sx={{ my: 4 }} />

          <Typography mb={2}>
            Make sure to use your correct account address when interacting with these apps:
          </Typography>

          <Box bgcolor="background.main" p={2} borderRadius="6px" alignSelf="flex-start">
            <EthHashInfo address={safeAddress} shortAddress={false} showCopyButton hasExplorer avatarSize={24} />
          </Box>
        </Box>
      </ModalDialog>
    </>
  )
}

const BuyCryptoButton = madProps(_BuyCryptoButton, {
  href: useBuyCryptoHref,
  pagePath: usePathname,
})

export default BuyCryptoButton
