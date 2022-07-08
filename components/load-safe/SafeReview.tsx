import React from 'react'
import { Box, Button, Divider, Grid, Paper, Typography } from '@mui/material'
import { StepRenderProps } from '@/components/tx/TxStepper/useTxStepper'
import ChainIndicator from '@/components/common/ChainIndicator'
import EthHashInfo from '../common/EthHashInfo'
import { LoadSafeFormData } from '@/components/load-safe/index'
import { useAppDispatch, useAppSelector } from '@/store'
import { addOrUpdateSafe } from '@/store/addedSafesSlice'
import { useRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'
import { selectChainById } from '@/store/chainsSlice'

type Props = {
  params: LoadSafeFormData
  onBack: StepRenderProps['onBack']
}

const SafeReview = ({ params, onBack }: Props) => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const chain = useAppSelector((state) => selectChainById(state, params.safeInfo.chainId))

  const addSafe = () => {
    dispatch(addOrUpdateSafe({ safe: params.safeInfo }))
    router.push({
      pathname: AppRoutes.safe.index,
      query: { safe: `${chain?.shortName}:${params.safeInfo.address.value}` },
    })
  }

  return (
    <Paper>
      <Grid container>
        <Grid item md={4}>
          <Box padding={3}>
            <Typography mb={3}>Details</Typography>
            <Typography variant="caption" color="text.secondary">
              Network
            </Typography>
            <Typography mb={3}>
              <ChainIndicator inline />
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Name of the Safe
            </Typography>
            <Typography mb={3}>{params.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              Any transaction requires the confirmation of:
            </Typography>
            <Typography mb={3}>
              {params.safeInfo.threshold} out of {params.safeInfo.owners.length}
            </Typography>
          </Box>
        </Grid>
        <Grid item md={8} borderLeft="1px solid #ddd">
          <Box padding={3}>{params.safeInfo.owners.length} Safe owners</Box>
          <Divider />
          {params.safeInfo.owners.map((owner) => {
            return <EthHashInfo key={owner.value} address={owner.value} name={owner.name} shortAddress={false} />
          })}
          <Divider />
        </Grid>
      </Grid>
      <Divider />
      <Box padding={3}>
        <Grid container alignItems="center" justifyContent="center" spacing={3}>
          <Grid item>
            <Button onClick={onBack}>Back</Button>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={addSafe}>
              Add
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  )
}

export default SafeReview
