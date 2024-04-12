import '@stakekit/widget/style.css'
import { SKApp } from '@stakekit/widget'
import css from './styles.module.css'
import PageHeader from '../common/PageHeader'
import { useSKProvider } from './use-sk-provider'
import { useSKTheme } from './use-sk-theme'
import { useHasFeature } from '../../hooks/useChains'
import { FEATURES } from '../../utils/chains'
import { Container, Grid } from '@mui/material'

export const Widget = () => {
  const theme = useSKTheme()
  const providerParams = useSKProvider()
  const isStakeFeatureEnabled = useHasFeature(FEATURES.STAKE)

  if (!isStakeFeatureEnabled) {
    return (
      <Container>
        <Grid container justifyContent="center">
          <div>Staking is not supported on this chain</div>
        </Grid>
      </Container>
    )
  }

  if (!providerParams) return null

  return (
    <div className={css.widgetRoot}>
      <PageHeader title="Stake" noBorder />

      <main className={css.widgetMain}>
        <SKApp theme={theme} {...providerParams} disableGasCheck />
      </main>
    </div>
  )
}
