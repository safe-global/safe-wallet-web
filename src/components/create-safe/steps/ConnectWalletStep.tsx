import { Box, Button, Divider, Grid, Paper, Typography } from '@mui/material'
import { StepRenderProps } from '@/components/tx/TxStepper/useTxStepper'
import useWallet from '@/hooks/wallets/useWallet'
import ChainSwitcher from '@/components/common/ChainSwitcher'
import ConnectionOptions from '@/components/common/ConnectWallet/ConnectionOptions'
import { type ConnectedWallet } from '@/hooks/wallets/useOnboard'
import NetworkSelector from '@/components/common/NetworkSelector'
import useIsWrongChain from '@/hooks/useIsWrongChain'

export const ConnectWalletContent = ({
  wallet,
  isWrongChain,
}: {
  wallet: ConnectedWallet | null
  isWrongChain: boolean
}) => {
  return (
    <>
      {wallet && !isWrongChain && <Typography mb={2}>Wallet connected</Typography>}
      {wallet ? (
        <Typography mb={2} component="div">
          Creating a Safe on <NetworkSelector />
        </Typography>
      ) : (
        <>
          <Typography mb={2}>In order to create a Safe you need to connect a wallet</Typography>
          {/* TODO: Embed popper content here */}
          <ConnectionOptions />
        </>
      )}
      {isWrongChain && (
        <Typography mb={2}>
          Your wallet connection must match the selected network. <ChainSwitcher />
        </Typography>
      )}
    </>
  )
}

type Props = {
  onSubmit: StepRenderProps['onSubmit']
  onBack: StepRenderProps['onBack']
}

const ConnectWalletStep = ({ onSubmit, onBack }: Props) => {
  const isWrongChain = useIsWrongChain()
  const wallet = useWallet()

  const isDisabled = !wallet || isWrongChain

  return (
    <Paper>
      <Box padding={3}>
        <ConnectWalletContent wallet={wallet} isWrongChain={isWrongChain} />
      </Box>
      <Divider />
      <Box padding={3}>
        <Grid container alignItems="center" justifyContent="center" spacing={3}>
          <Grid item>
            <Button onClick={onBack}>Cancel</Button>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={() => onSubmit(undefined)} disabled={isDisabled}>
              Continue
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  )
}

export default ConnectWalletStep
