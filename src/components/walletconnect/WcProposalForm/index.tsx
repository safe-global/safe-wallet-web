import { Button, Checkbox, Divider, FormControlLabel, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import type { ReactElement } from 'react'
import type { Web3WalletTypes } from '@walletconnect/web3wallet'

import SafeAppIconCard from '@/components/safe-apps/SafeAppIconCard'
import css from './styles.module.css'
import ProposalVerification from './ProposalVerification'
import { CompatibilityWarning } from './CompatibilityWarning'
import useChains from '@/hooks/useChains'
import { getPeerName, getSupportedChainIds, isBlockedBridge, isWarnedBridge } from '@/services/walletconnect/utils'
import useChainId from '@/hooks/useChainId'

type ProposalFormProps = {
  proposal: Web3WalletTypes.SessionProposal
  onApprove?: () => void
  onReject?: () => void
}

const WcProposalForm = ({ proposal, onApprove, onReject }: ProposalFormProps): ReactElement => {
  const { configs } = useChains()
  const chainId = useChainId()
  const [understandsRisk, setUnderstandsRisk] = useState(false)
  const { proposer } = proposal.params
  const { isScam, origin } = proposal.verifyContext.verified

  const chainIds = useMemo(() => getSupportedChainIds(configs, proposal.params), [configs, proposal.params])
  const isUnsupportedChain = !chainIds.includes(chainId)

  const isHighRisk = proposal.verifyContext.verified.validation === 'INVALID' || isWarnedBridge(origin)
  const disabled = isUnsupportedChain || isScam || isBlockedBridge(origin) || (isHighRisk && !understandsRisk)
  const name = getPeerName(proposer) || 'Unknown dApp'

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

      {!isUnsupportedChain && isHighRisk && (
        <FormControlLabel
          className={css.checkbox}
          control={<Checkbox checked={understandsRisk} onChange={(_, checked) => setUnderstandsRisk(checked)} />}
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
