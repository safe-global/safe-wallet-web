import { Box, Button, Divider, Grid, Paper, Typography } from '@mui/material'
import type { StepRenderProps } from '@/components/tx/TxStepper/useTxStepper'
import useWallet from '@/hooks/wallets/useWallet'
import ChainSwitcher from '@/components/common/ChainSwitcher'
import WalletDetails from '@/components/common/ConnectWallet/WalletDetails'
import PairingDetails from '@/components/common/PairingDetails'
import { type ConnectedWallet } from '@/hooks/wallets/useOnboard'
import NetworkSelector from '@/components/common/NetworkSelector'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import { useCurrentChain } from '@/hooks/useChains'
import { isPairingSupported } from '@/services/pairing/utils'

import css from '@/components/create-safe/steps/styles.module.css'
import useSetCreationStep from '@/components/create-safe/useSetCreationStep'

export const ConnectWalletContent = ({
  wallet,
  isWrongChain,
}: {
  wallet: ConnectedWallet | null
  isWrongChain: boolean
}) => {
  const chain = useCurrentChain()
  const isSupported = isPairingSupported(chain?.disabledWallets)

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
          <div className={css.connectionOptions}>
            <div className={css.wallet}>
              <WalletDetails />
            </div>

            {isSupported && (
              <div className={css.pairing}>
                <PairingDetails />
              </div>
            )}
          </div>
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
  setStep: StepRenderProps['setStep']
}

const ConnectWalletStep = ({ onSubmit, onBack, setStep }: Props) => {
  useSetCreationStep(setStep)
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
            <Button onClick={() => onBack()}>Cancel</Button>
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
