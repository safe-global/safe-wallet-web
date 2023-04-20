import EthHashInfo from '@/components/common/EthHashInfo'
import useSafeInfo from '@/hooks/useSafeInfo'
import { Paper, Grid, Typography, Box } from '@mui/material'

import css from './styles.module.css'
import { RemoveModule } from '@/components/settings/SafeModules/RemoveModule'
import ExternalLink from '@/components/common/ExternalLink'

const NoModules = () => {
  return (
    <Typography mt={2} color={({ palette }) => palette.primary.light}>
      No modules enabled
    </Typography>
  )
}

const ModuleDisplay = ({ moduleAddress, chainId, name }: { moduleAddress: string; chainId: string; name?: string }) => {
  return (
    <Box className={css.container}>
      <EthHashInfo
        name={name}
        shortAddress={false}
        address={moduleAddress}
        showCopyButton
        chainId={chainId}
        hasExplorer
      />
      <RemoveModule address={moduleAddress} />
    </Box>
  )
}

const SafeModules = () => {
  const { safe } = useSafeInfo()
  const safeModules = safe.modules || []

  return (
    <Paper sx={{ padding: 4 }}>
      <Grid container direction="row" justifyContent="space-between" spacing={3}>
        <Grid item lg={4} xs={12}>
          <Typography variant="h4" fontWeight={700}>
            Safe Account modules
          </Typography>
        </Grid>

        <Grid item xs>
          <Box>
            <Typography>
              Modules allow you to customize the access-control logic of your Safe Account. Modules are potentially
              risky, so make sure to only use modules from trusted sources. Learn more about modules{' '}
              <ExternalLink href="https://docs.safe.global/contracts/modules-1">here</ExternalLink>
            </Typography>
            {safeModules.length === 0 ? (
              <NoModules />
            ) : (
              safeModules.map((module) => (
                <ModuleDisplay
                  key={module.value}
                  chainId={safe.chainId}
                  moduleAddress={module.value}
                  name={module.name}
                />
              ))
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default SafeModules
