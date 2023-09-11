import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  IconButton,
  Paper,
  Popover,
  SvgIcon,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import WcIcon from '@/public/images/apps/wallet-connect.svg'
import { type ChangeEvent, useCallback, useState, useRef } from 'react'
import useWalletConnect, { WC_CONNECT_STATE } from './hooks/useWalletConnect'
import css from './styles.module.css'
import type { Web3WalletTypes } from '@walletconnect/web3wallet'
import LogoutIcon from '@mui/icons-material/Logout'
import useChains from '@/hooks/useChains'
import ChainIndicator from '../common/ChainIndicator'
import useSafeInfo from '@/hooks/useSafeInfo'

const EVMBasedNamespaces: string = 'eip155'

const extractInformationFromProposal = (sessionProposal: Web3WalletTypes.SessionProposal | undefined) => {
  if (!sessionProposal) {
    return undefined
  }

  const { origin, validation } = sessionProposal.verifyContext.verified
  const metadata = sessionProposal.params.proposer.metadata
  const requiredNamespaces = sessionProposal.params.requiredNamespaces[EVMBasedNamespaces]

  return { requiredNamespaces, origin, validation, metadata }
}

export const ConnectWC = () => {
  const [openModal, setOpenModal] = useState(false)
  const [wcConnectUrl, setWcConnectUrl] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const { wcConnect, wcDisconnect, wcClientData, wcApproveSession, acceptInvalidSession, wcState, sessionProposal } =
    useWalletConnect()
  const anchorElem = useRef<HTMLButtonElement | null>(null)
  const chains = useChains()
  const { safe } = useSafeInfo()

  const isConnected = !!wcClientData

  const proposalInfo = extractInformationFromProposal(sessionProposal)

  const unsupportedChains = proposalInfo?.requiredNamespaces.chains?.find(
    (chain) => safe.chainId !== chain.slice(EVMBasedNamespaces.length + 1),
  )

  console.log('Unsupported chains', unsupportedChains)

  console.log('WcClientData', wcClientData)

  const handleWidgetIconClick = () => {
    setOpenModal((prev) => !prev)
  }

  const onConnect = useCallback(
    async (uri: string) => {
      await wcConnect(uri)
      setIsConnecting(false)
    },
    [wcConnect],
  )

  const onChangeWcUrl = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = event.target.value
    setWcConnectUrl(newValue)
  }

  const onPaste = useCallback(
    (event: React.ClipboardEvent) => {
      const connectWithUri = (data: string) => {
        if (data.startsWith('wc')) {
          setIsConnecting(true)
          onConnect(data)
        }
      }

      setWcConnectUrl('')

      if (wcClientData) {
        return
      }

      const items = event.clipboardData.items

      for (const index in items) {
        const item = items[index]

        if (item.kind === 'string' && item.type === 'text/plain') {
          connectWithUri(event.clipboardData.getData('Text'))
        }
      }
    },
    [wcClientData, onConnect],
  )

  return (
    <>
      <IconButton onClick={handleWidgetIconClick} ref={anchorElem}>
        <SvgIcon component={WcIcon} inheritViewBox fontSize="small" />
        {wcClientData?.icons[0] && (
          <img
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              borderRadius: '12px',
              backgroundColor: '#FFFFFF',
            }}
            width={16}
            height={16}
            src={wcClientData?.icons[0]}
            alt="App logo"
          ></img>
        )}
      </IconButton>
      <Popover
        open={openModal}
        anchorEl={anchorElem.current}
        onClose={() => setOpenModal(false)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        sx={{ mt: 1 }}
      >
        <Paper className={css.wrapper}>
          <div className={css.popoverHeader}>
            <div>
              <Typography variant="h4" component="span" fontWeight={700}>
                Connect via Wallet Connect
              </Typography>
            </div>
          </div>
          {WC_CONNECT_STATE.PENDING_SESSION_REQUEST === wcState && sessionProposal ? (
            <Box sx={{ padding: 2 }}>
              <Box display="flex" flexDirection="column" gap={1} alignItems="center">
                <img width={32} height={32} src={proposalInfo?.metadata.icons[0]} alt="AppLogo" />
                <Typography>
                  <b>{proposalInfo?.metadata.name}</b> wants to connect.
                </Typography>
                <Typography color="text.secondary" fontWeight={400}>
                  {sessionProposal.verifyContext.verified.origin}
                </Typography>
              </Box>
              <Card sx={{ padding: 1, mt: 2, border: ({ palette }) => `1px solid ${palette.border.light}` }}>
                <Box display="flex" flexDirection="column" gap={1} alignItems="center">
                  <Typography variant="h5" fontWeight={700}>
                    Requested permissions
                  </Typography>
                  {proposalInfo?.requiredNamespaces.methods.map((method) => (
                    <Typography key={method}>{method}</Typography>
                  ))}
                </Box>
              </Card>
              <Card sx={{ padding: 1, mt: 2, mb: 2, border: ({ palette }) => `1px solid ${palette.border.light}` }}>
                <Box display="flex" flexDirection="column" gap={1} alignItems="center">
                  <Typography variant="h5" fontWeight={700}>
                    Requested chains
                  </Typography>
                  {proposalInfo?.requiredNamespaces.chains?.map((chain) => {
                    const chainWithoutPrefix = chain.slice(EVMBasedNamespaces.length + 1)
                    const chainConfig = chains.configs.find((config) => config.chainId === chainWithoutPrefix)
                    return <ChainIndicator inline chainId={chainConfig?.chainId} key={chain} />
                  })}
                </Box>
              </Card>
              {unsupportedChains && unsupportedChains.length > 0 && (
                <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
                  <AlertTitle sx={{ fontWeight: 700 }}>Unsupported networks requested</AlertTitle>
                  The dApp requested networks that different from your opened Safe.
                </Alert>
              )}

              <Box display="flex" flexDirection="row" gap={1}>
                <Button variant="contained" onClick={wcApproveSession}>
                  Approve
                </Button>
                <Button variant="outlined" color="error">
                  Reject
                </Button>
              </Box>
            </Box>
          ) : WC_CONNECT_STATE.APPROVE_INVALID_SESSION === wcState ? (
            <Box sx={{ padding: 2 }}>
              <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
                <AlertTitle sx={{ fontWeight: 700 }}>Mismatching network</AlertTitle>
                The dApp did not accept the Safe&apos;s network. Do you still want to proceed?
              </Alert>
              <Box display="flex" flexDirection="row" gap={1}>
                <Button variant="contained" onClick={acceptInvalidSession}>
                  Proceed anyway
                </Button>
                <Button variant="outlined" color="error">
                  Abort
                </Button>
              </Box>
            </Box>
          ) : WC_CONNECT_STATE.CONNECTED === wcState && wcClientData ? (
            <Box sx={{ padding: 2 }}>
              <Box display="flex" flexDirection="row" gap={1} alignItems="center" justifyContent="space-between">
                <img width={32} height={32} src={wcClientData.icons[0]} alt="App logo"></img>
                <Typography fontWeight={700}>{wcClientData.name}</Typography>

                <Tooltip title="Logout">
                  <IconButton sx={{ ml: 'auto' }} onClick={wcDisconnect}>
                    <LogoutIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          ) : (
            <Box sx={{ padding: 2 }}>
              <Typography>Paste the WC URL to connect with wc</Typography>
              <TextField
                placeholder="wc:"
                label="Wallet Connect URI"
                onPaste={onPaste}
                onChange={onChangeWcUrl}
              ></TextField>
            </Box>
          )}
        </Paper>
      </Popover>
    </>
  )
}
