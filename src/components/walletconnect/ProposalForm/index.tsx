import { Button, Checkbox, Divider, FormControlLabel, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import type { ReactElement } from 'react'
import type { Web3WalletTypes } from '@walletconnect/web3wallet'

import SafeAppIconCard from '@/components/safe-apps/SafeAppIconCard'
import css from './styles.module.css'
import ProposalVerification from './ProposalVerification'
import { ChainWarning } from './ChainWarning'
import useChains from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'
import { getSupportedChainIds } from '@/services/walletconnect/utils'

type ProposalFormProps = {
  proposal: Web3WalletTypes.SessionProposal
  onApprove?: () => void
  onReject?: () => void
}

const ProposalForm = ({ proposal, onApprove, onReject }: ProposalFormProps): ReactElement => {
  const { configs } = useChains()
  const { safe } = useSafeInfo()
  const [understandsRisk, setUnderstandsRisk] = useState(false)
  const { proposer } = proposal.params
  const { isScam } = proposal.verifyContext.verified

  const chainIds = useMemo(() => getSupportedChainIds(configs, proposal.params), [configs, proposal.params])
  const supportsCurrentChain = chainIds.includes(safe.chainId)

  const isHighRisk = proposal.verifyContext.verified.validation === 'INVALID'
  const disabled = !supportsCurrentChain || isScam || (isHighRisk && !understandsRisk)

  return (
    <div className={css.container}>
      <Typography variant="body2" color="text.secondary">
        WalletConnect
      </Typography>

      <div className={css.icon}>
        <SafeAppIconCard
          src={proposer.metadata.icons[0]}
          width={32}
          height={32}
          alt={`${proposer.metadata.name} logo`}
        />
      </div>

      <Typography mb={1}>{proposer.metadata.name} wants to connect</Typography>

      <Typography className={css.origin} mb={3}>
        {proposal.verifyContext.verified.origin}
      </Typography>

      <div className={css.info}>
        <ProposalVerification proposal={proposal} />

        <ChainWarning proposal={proposal} chainIds={chainIds} />
      </div>

      {supportsCurrentChain && isHighRisk && (
        <FormControlLabel
          className={css.checkbox}
          control={<Checkbox checked={understandsRisk} onChange={(_, checked) => setUnderstandsRisk(checked)} />}
          label="I understand the risks of interacting with this dApp and would like to continue."
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

export default ProposalForm
