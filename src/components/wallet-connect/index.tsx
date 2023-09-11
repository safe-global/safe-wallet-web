import { Box, Button, IconButton, Paper, Popover, SvgIcon, TextField, Typography } from '@mui/material'
import WcIcon from '@/public/images/apps/wallet-connect.svg'
import { type ChangeEvent, useCallback, useState, useRef } from 'react'
import useWalletConnect, { WC_CONNECT_STATE } from './hooks/useWalletConnect'
import css from './styles.module.css'
import session from '@/services/local-storage/session'
import type { Web3WalletTypes } from '@walletconnect/web3wallet'
import UnreadBadge from '../common/UnreadBadge'

const EVMBasedNamespaces: string = 'eip155'

const extractInformationFromProposal = (sessionProposal: Web3WalletTypes.SessionProposal | undefined) => {
  if (!sessionProposal) {
    return undefined
  }

  const { origin, validation } = sessionProposal.verifyContext.verified
  const requiredNamespaces = sessionProposal.params.requiredNamespaces[EVMBasedNamespaces]

  return { requiredNamespaces, origin, validation }
}

export const ConnectWC = () => {
  const [openModal, setOpenModal] = useState(false)
  const [wcConnectUrl, setWcConnectUrl] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const { wcConnect, wcClientData, wcApproveSession, wcState, sessionProposal } = useWalletConnect()
  const anchorElem = useRef<HTMLButtonElement | null>(null)

  const isConnected = !!wcClientData

  const requiredChains = sessionProposal ? session : []

  const proposalInfo = extractInformationFromProposal(sessionProposal)

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
        <img
          style={{ position: 'absolute', top: '16px', left: '16px', borderRadius: '12px', backgroundColor: '#FFFFFF' }}
          width={16}
          height={16}
          src={wcClientData?.icons[0]}
          alt="App logo"
        ></img>
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
          {WC_CONNECT_STATE.PENDING_SESSION_REQUEST === wcState ? (
            <Box sx={{ padding: 2 }}>
              <Typography variant="h4" fontWeight={700}>
                Session proposal
              </Typography>
              <ul>
                <li>
                  <Typography>
                    Request from <b>{sessionProposal?.verifyContext.verified.origin}</b>
                  </Typography>
                </li>
                <li>
                  <Typography>
                    Required chains <b>{proposalInfo?.requiredNamespaces.chains?.join(', ')}</b>
                  </Typography>
                </li>
                <li>
                  <Typography>
                    Required methods <b>{proposalInfo?.requiredNamespaces.methods?.join(', ')}</b>
                  </Typography>
                </li>
                <li>
                  <Typography>
                    Required events <b>{proposalInfo?.requiredNamespaces.events?.join(', ')}</b>
                  </Typography>
                </li>
              </ul>

              <Box display="flex" flexDirection="row" gap={1}>
                <Button variant="contained" onClick={wcApproveSession}>
                  Approve
                </Button>
                <Button variant="outlined" color="error">
                  Reject
                </Button>
              </Box>
            </Box>
          ) : WC_CONNECT_STATE.CONNECTED === wcState && wcClientData ? (
            <Box sx={{ padding: 2 }}>
              <Typography variant="h4" fontWeight={700}>
                Successfully connected
              </Typography>
              <Box>
                <Typography>
                  Connected to <b>{wcClientData.name}</b>
                </Typography>
                <img width={64} height={64} src={wcClientData.icons[0]} alt="App logo"></img>
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
