import { Button, Checkbox, Divider, FormControlLabel, Typography } from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'
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
  onApprove?: () => void
  onReject?: () => void
}

const WcProposalForm = ({ proposal, onApprove, onReject }: ProposalFormProps): ReactElement => {
  const { configs } = useChains()
  const { safeLoaded, safe } = useSafeInfo()
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
  const disabled = !safeLoaded || isUnsupportedChain || isBlocked || (isHighRisk && !understandsRisk)

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
        <Button variant="danger" onClick={onReject} className={css.button}>
          Reject
        </Button>

        <Button variant="contained" onClick={onApprove} className={css.button} disabled={disabled}>
          Approve
        </Button>
      </div>
    </div>
  )
}

export default WcProposalForm
