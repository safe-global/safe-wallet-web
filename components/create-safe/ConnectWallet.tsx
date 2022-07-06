import React, { MouseEvent, useState } from 'react'
import { Box, Button, Divider, Grid, Paper, Typography, Menu, MenuItem } from '@mui/material'
import { StepRenderProps } from '@/components/tx/TxStepper/useTxStepper'
import useChains from '@/hooks/useChains'
import { useRouter } from 'next/router'
import ChainIndicator from '@/components/common/ChainIndicator'

type Props = {
  onSubmit: StepRenderProps['onSubmit']
  onBack: StepRenderProps['onBack']
}

const ConnectWallet = ({ onSubmit, onBack }: Props) => {
  const router = useRouter()
  const { data: configs } = useChains()
  const [anchorElement, setAnchorElement] = useState<HTMLButtonElement | null>(null)

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorElement(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorElement(null)
  }

  const handleNetworkSwitch = (event: MouseEvent<HTMLLIElement>) => {
    router.replace({ pathname: router.pathname, query: { ...router.query, chain: event.currentTarget.dataset.chain } })
    handleClose()
  }

  return (
    <Paper>
      <Box padding={3}>
        <Typography variant="body1">
          Select network on which to create your Safe. The app is currently pointing to <ChainIndicator inline />
        </Typography>
        <Button onClick={handleClick}>Switch network</Button>
        <Menu
          open={Boolean(anchorElement)}
          anchorEl={anchorElement}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          {configs?.results.map((chain) => {
            return (
              <MenuItem key={chain.chainId} data-chain={chain.shortName} onClick={handleNetworkSwitch}>
                <ChainIndicator chainId={chain.chainId} inline />
              </MenuItem>
            )
          })}
        </Menu>
      </Box>
      <Divider />
      <Box padding={3}>
        <Grid container alignItems="center" justifyContent="center" spacing={3}>
          <Grid item>
            <Button onClick={onBack}>Cancel</Button>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={onSubmit}>
              Continue
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  )
}

export default ConnectWallet
