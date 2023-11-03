import TxLayout from '@/components/tx-flow/common/TxLayout'
import SignMessage, { type ConfirmProps, type ProposeProps } from '@/components/tx-flow/flows/SignMessage/SignMessage'
import { Box, Typography } from '@mui/material'
import SafeAppIconCard from '@/components/safe-apps/SafeAppIconCard'

const APP_LOGO_FALLBACK_IMAGE = '/images/apps/apps-icon.svg'
const APP_NAME_FALLBACK = 'Sign message'

export const AppTitle = ({ name, logoUri }: { name?: string | null; logoUri?: string | null }) => {
  const appName = name || APP_NAME_FALLBACK
  const appLogo = logoUri || APP_LOGO_FALLBACK_IMAGE
  return (
    <Box display="flex" alignItems="center">
      <SafeAppIconCard src={appLogo} alt={name || 'The icon of the application'} width={24} height={24} />
      <Typography variant="h4" pl={1}>
        {appName}
      </Typography>
    </Box>
  )
}

const SignMessageFlow = ({ ...props }: ProposeProps | ConfirmProps) => {
  return (
    <TxLayout
      title="Confirm message"
      subtitle={<AppTitle name={props.name} logoUri={props.logoUri} />}
      step={0}
      hideNonce
      isMessage
    >
      <SignMessage {...props} />
    </TxLayout>
  )
}

export default SignMessageFlow
