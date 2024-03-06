import ChainIndicator from '@/components/common/ChainIndicator'
import SafeAppIconCard from '@/components/safe-apps/SafeAppIconCard'
import WarningIcon from '@/public/images/notifications/warning.svg'
import Divider from '@mui/material/Divider'
import SvgIcon from '@mui/material/SvgIcon'
import Typography from '@mui/material/Typography'
import { Box } from '@mui/system'
import type { SafeAppData } from '@safe-global/safe-gateway-typescript-sdk'

type DetailsProps = {
  app: SafeAppData
  showDefaultListWarning: boolean
}

const SafeAppDetails = ({ app, showDefaultListWarning }: DetailsProps) => (
  <Box data-sid="58254" sx={{ display: 'flex', flexDirection: 'column' }}>
    <Box data-sid="21221" sx={{ display: 'flex', mb: 4 }}>
      <SafeAppIconCard src={app.iconUrl} alt={app.name} width={90} height={90} />

      <Box data-sid="35517" sx={{ ml: 8 }}>
        <Typography variant="h3" fontWeight={700}>
          {app.name}
        </Typography>
        <Typography variant="body2" mt={1}>
          {app.description}
        </Typography>
      </Box>
    </Box>
    <Divider />
    <Box data-sid="82548" sx={{ mt: 4 }}>
      <Typography variant="body1">Safe App URL</Typography>
      <Typography
        variant="body2"
        sx={({ palette, shape }) => ({
          mt: 1,
          p: 1,
          backgroundColor: palette.primary.background,
          display: 'inline-block',
          borderRadius: shape.borderRadius,
        })}
        fontWeight={700}
      >
        {app.url}
      </Typography>
    </Box>
    <Box data-sid="45557" sx={{ mt: 2 }}>
      <Typography variant="body1">Available networks</Typography>
      <Box data-sid="68865" sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
        {app.chainIds.map((chainId) => (
          <ChainIndicator key={chainId} chainId={chainId} inline showUnknown={false} />
        ))}
      </Box>
    </Box>
    <Divider sx={{ mt: 4 }} />
    {showDefaultListWarning && (
      <Box data-sid="83548" sx={{ display: 'flex', flexDirection: 'column', mt: 4 }}>
        <Box data-sid="57446" sx={{ mb: 4 }}>
          <Box data-sid="47631" sx={{ display: 'flex' }}>
            {/* 
            //@ts-ignore - "warning.dark" is a present in the palette */}
            <SvgIcon component={WarningIcon} inheritViewBox color="warning.dark" />
            <Typography variant="h5" sx={({ palette }) => ({ color: palette.warning.dark })}>
              Warning
            </Typography>
          </Box>
          <Typography variant="body1" mt={1} sx={({ palette }) => ({ color: palette.warning.dark })}>
            The application is not in the default Safe App list
          </Typography>
          <Typography variant="body2" mt={2}>
            Check the app link and ensure it comes from a trusted source
          </Typography>
        </Box>
        <Divider />
      </Box>
    )}
  </Box>
)

export { SafeAppDetails }
