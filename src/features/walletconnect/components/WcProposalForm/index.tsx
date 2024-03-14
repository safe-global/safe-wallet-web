import { WalletConnectContext } from '@/features/walletconnect/WalletConnectContext'

import { asError } from '@/services/exceptions/utils'
import { Button, Checkbox, CircularProgress, Divider, FormControlLabel, Typography } from '@mui/material'
import { type Dispatch, type SetStateAction, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactElement, ChangeEvent } from 'react'
import type { Web3WalletTypes } from '@walletconnect/web3wallet'

import SafeAppIconCard from '@/components/safe-apps/SafeAppIconCard'
import css from './styles.module.css'
import ProposalVerification from './ProposalVerification'
import { CompatibilityWarning } from './CompatibilityWarning'
import useChains from '@/hooks/useChains'
import {
  getPeerName,
  getSupportedChainIds,
  isBlockedBridge,
  isWarnedBridge,
} from '@/features/walletconnect/services/utils'
import { trackEvent } from '@/services/analytics'
import { WALLETCONNECT_EVENTS } from '@/services/analytics/events/walletconnect'
import useSafeInfo from '@/hooks/useSafeInfo'

type ProposalFormProps = {
  proposal: Web3WalletTypes.SessionProposal
  setProposal: Dispatch<SetStateAction<Web3WalletTypes.SessionProposal | undefined>>
}

const WcProposalForm = ({ proposal, setProposal }: ProposalFormProps): ReactElement => {
  const { walletConnect, setError } = useContext(WalletConnectContext)
  const [isApproving, setIsApproving] = useState<boolean>(false)
  const [isRejecting, setIsRejecting] = useState<boolean>(false)

  const { configs } = useChains()
  const { safeLoaded, safe, safeAddress } = useSafeInfo()
  const { chainId } = safe
  const [understandsRisk, setUnderstandsRisk] = useState(false)
  const { proposer } = proposal.params
  const { isScam, origin } = proposal.verifyContext.verified
  const url = proposer.metadata.url || origin

  const chainIds = useMemo(() => getSupportedChainIds(configs, proposal.params), [configs, proposal.params])
  const isUnsupportedChain = !chainIds.includes(chainId)

  const name = getPeerName(proposer) || 'Unknown dApp'
  const isHighRisk = proposal.verifyContext.verified.validation === 'INVALID' || isWarnedBridge(origin, name)
  const isBlocked = isScam || isBlockedBridge(origin)
  const disabled = !safeLoaded || isUnsupportedChain || isBlocked || (isHighRisk && !understandsRisk) || isApproving

  // On session approve
  const onApprove = useCallback(async () => {
    if (!walletConnect || !chainId || !safeAddress || !proposal) return

    const label = proposal?.params.proposer.metadata.url
    trackEvent({ ...WALLETCONNECT_EVENTS.APPROVE_CLICK, label })

    setIsApproving(true)

    try {
      await walletConnect.approveSession(proposal, chainId, safeAddress)
    } catch (e) {
      setIsApproving(false)
      setError(asError(e))
      return
    }

    trackEvent({ ...WALLETCONNECT_EVENTS.CONNECTED, label })
    setIsApproving(false)
    setProposal(undefined)
  }, [walletConnect, chainId, safeAddress, proposal, setProposal, setError])

  // On session reject
  const onReject = useCallback(async () => {
    if (!walletConnect || !proposal) return

    const label = proposal?.params.proposer.metadata.url
    trackEvent({ ...WALLETCONNECT_EVENTS.REJECT_CLICK, label })

    setIsRejecting(true)

    try {
      await walletConnect.rejectSession(proposal)
    } catch (e) {
      setIsRejecting(false)
      setError(asError(e))
    }

    setIsRejecting(false)
    setProposal(undefined)
  }, [walletConnect, proposal, setProposal, setError])

  const onCheckboxClick = useCallback(
    (_: ChangeEvent, checked: boolean) => {
      setUnderstandsRisk(checked)

      if (checked) {
        trackEvent({
          ...WALLETCONNECT_EVENTS.ACCEPT_RISK,
          label: url,
        })
      }
    },
    [url],
  )

  // Track risk/scam/bridge warnings
  useEffect(() => {
    if (isHighRisk || isBlocked) {
      trackEvent({
        ...WALLETCONNECT_EVENTS.SHOW_RISK,
        label: url,
      })
    }
  }, [isHighRisk, isBlocked, url])

  // Track unsupported chain warnings
  useEffect(() => {
    if (isUnsupportedChain) {
      trackEvent({
        ...WALLETCONNECT_EVENTS.UNSUPPORTED_CHAIN,
        label: url,
      })
    }
  }, [url, isUnsupportedChain])

  return (
    <div className={css.container}>
      <Typography variant="body2" color="text.secondary">
        WalletConnect
      </Typography>

      {proposer.metadata.icons[0] && (
        <div className={css.icon}>
          <SafeAppIconCard src={proposer.metadata.icons[0]} width={32} height={32} alt={`${name || 'dApp'} logo`} />
        </div>
      )}

      <Typography mb={1}>
        <b>{name}</b> wants to connect
      </Typography>

      <Typography className={css.origin} mb={3}>
        {proposal.verifyContext.verified.origin}
      </Typography>

      <div className={css.info}>
        <ProposalVerification proposal={proposal} />

        <CompatibilityWarning proposal={proposal} chainIds={chainIds} />
      </div>

      {!isBlocked && isHighRisk && (
        <FormControlLabel
          className={css.checkbox}
          control={<Checkbox checked={understandsRisk} onChange={onCheckboxClick} />}
          label="I understand the risks associated with interacting with this dApp and would like to continue."
        />
      )}

      <Divider flexItem className={css.divider} />

      <div className={css.buttons}>
        <Button variant="danger" onClick={onReject} className={css.button} disabled={isRejecting}>
          {isRejecting ? <CircularProgress size={20} /> : 'Reject'}
        </Button>

        <Button variant="contained" onClick={onApprove} className={css.button} disabled={disabled}>
          {isApproving ? <CircularProgress size={20} /> : 'Approve'}
        </Button>
      </div>
    </div>
  )
}

export default WcProposalForm
