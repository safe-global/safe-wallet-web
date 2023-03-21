import { Box, Button, Grid, SvgIcon, Typography } from '@mui/material'
import CheckIcon from '@/public/images/common/check.svg'
import { type StepRenderProps } from '@/components/relaying-education-series/RelaySeriesStepper/useEducationSeriesStepper'

const Benefits = ({ onBack, onNext, onClose }: Partial<StepRenderProps>) => {
  return (
    <Box>
      <Grid container mb={5}>
        <Grid item xs={1}>
          <SvgIcon component={CheckIcon} sx={{ color: 'secondary.main' }} inheritViewBox />
        </Grid>
        <Grid item xs={11}>
          <Typography fontWeight={700}>Free 5 transactions per hour</Typography>
          <Typography color="label.secondary">
            We pay for your Safe transactions for up to five transactions per hour on Gnosis chain
          </Typography>
        </Grid>
      </Grid>
      <Grid container mb={5}>
        <Grid item xs={1}>
          <SvgIcon component={CheckIcon} sx={{ color: 'secondary.main' }} inheritViewBox />
        </Grid>
        <Grid item xs={11}>
          {/* TODO: title to be updated */}
          <Typography fontWeight={700}>Smooth execution</Typography>
          <Typography color="label.secondary">
            You can use your owner keys as &quot;throw-away accounts&quot; or &quot;signing-only accounts&quot; to make
            execution more smooth (e.g from your mobile device)
          </Typography>
        </Grid>
      </Grid>
      <Grid container mb={5}>
        <Grid item xs={1}>
          <SvgIcon component={CheckIcon} sx={{ color: 'secondary.main' }} inheritViewBox />
        </Grid>
        <Grid item xs={11}>
          {/* TODO: title to be updated */}
          <Typography fontWeight={700}>TBD</Typography>
          <Typography color="label.secondary">
            You don’t have to distribute ETH (or other chain-specific native assets) amongst signer keys
          </Typography>
        </Grid>
      </Grid>
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Button variant="outlined" size="stretched" onClick={onBack}>
          Back
        </Button>
        <Button variant="contained" size="stretched" onClick={onNext}>
          Next
        </Button>
      </Box>
    </Box>
  )
}

export default Benefits
