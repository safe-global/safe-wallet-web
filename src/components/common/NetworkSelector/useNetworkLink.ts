import { AppRoutes } from '@/config/routes'
import useWallet from '@/hooks/wallets/useWallet'
import { useRouter } from 'next/router'

const useNetworkLink = (shortName: string) => {
  const router = useRouter()
  const isWalletConnected = !!useWallet()

  const shouldKeepPath = !router.query.safe

  const route = {
    pathname: shouldKeepPath
      ? router.pathname
      : isWalletConnected
      ? AppRoutes.welcome.accounts
      : AppRoutes.welcome.index,
    query: {
      chain: shortName,
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

export default useNetworkLink
