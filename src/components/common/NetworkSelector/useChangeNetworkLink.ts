import { AppRoutes } from '@/config/routes'
import useWallet from '@/hooks/wallets/useWallet'
import { useRouter } from 'next/router'

export const useChangeNetworkLink = (networkShortName: string) => {
  const router = useRouter()
  const isWalletConnected = !!useWallet()
  const pathname = router.pathname

  const shouldKeepPath = !router.query.safe

  const route = {
    pathname: shouldKeepPath ? pathname : isWalletConnected ? AppRoutes.welcome.accounts : AppRoutes.welcome.index,
    query: {
      chain: networkShortName,
    } as {
      chain: string
      safeViewRedirectURL?: string
    },
  }

  if (router.query?.safeViewRedirectURL) {
    route.query.safeViewRedirectURL = router.query?.safeViewRedirectURL.toString()
  }

  return route
}
