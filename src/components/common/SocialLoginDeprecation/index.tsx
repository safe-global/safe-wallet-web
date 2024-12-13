import { Alert } from '@mui/material'
import Link from 'next/link'
import useWallet from '@/hooks/wallets/useWallet'
import { isSocialLoginWallet } from '@/services/mpc/SocialLoginModule'
import { AppRoutes } from '@/config/routes'
import { useRouter } from 'next/router'

const SocialLoginDeprecation = () => {
  const router = useRouter()
  const wallet = useWallet()
  const isSocialLogin = isSocialLoginWallet(wallet?.label)

  if (!isSocialLogin) return null

  const ownersPage = {
    pathname: AppRoutes.settings.setup,
    query: router.query,
  }

  const settingsPage = {
    pathname: AppRoutes.settings.securityLogin,
    query: router.query,
  }

  return (
    <Alert severity="warning" sx={{ mx: 3, mt: 3 }}>
      The Social Login wallet is deprecated and will be removed on <b>01.05.2024</b>.
      <br />
      Please{' '}
      <Link href={ownersPage}>
        <u>
          <b>swap the signer</b>
        </u>
      </Link>{' '}
      to a different wallet, or{' '}
      <Link href={settingsPage}>
        <u>
          <b>export your private key</b>
        </u>
      </Link>{' '}
      to avoid losing access to your Safe Account.
    </Alert>
  )
}

export default SocialLoginDeprecation
