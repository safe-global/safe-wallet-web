import { Button, Checkbox, Divider, FormControlLabel, Typography } from '@mui/material'
import { useState } from 'react'
import type { ReactElement } from 'react'
import type { Web3WalletTypes } from '@walletconnect/web3wallet'

import { EIP155 } from '@/services/walletconnect/constants'
import useChains from '@/hooks/useChains'
import { UnsupportedChain } from './UnsupportedChain'
import { getEip155ChainId } from '@/services/walletconnect/utils'
import SafeAppIconCard from '@/components/safe-apps/SafeAppIconCard'
import css from './styles.module.css'
import ProposalVerification from './ProposalVerification'
import useSafeInfo from '@/hooks/useSafeInfo'
import { WrongRequiredChain } from './WrongRequiredChain'

type ProposalFormProps = {
  proposal: Web3WalletTypes.SessionProposal
  onApprove?: () => void
  onReject?: () => void
}

const ProposalForm = ({ proposal, onApprove, onReject }: ProposalFormProps): ReactElement => {
  const [understandsRisk, setUnderstandsRisk] = useState(false)
  const { safe } = useSafeInfo()
  const { configs } = useChains()
  const { requiredNamespaces, optionalNamespaces, proposer } = proposal.params
  const { isScam } = proposal.verifyContext.verified
  const requiredChains = requiredNamespaces[EIP155]?.chains ?? []
  const optionalChains = optionalNamespaces[EIP155]?.chains ?? []

  const chainIds = configs
    .filter((chain) => {
      const eipChainId = getEip155ChainId(chain.chainId)
      return requiredChains.includes(eipChainId) || optionalChains.includes(eipChainId)
    })
    .map((chain) => chain.chainId)

  const supportsSafe = chainIds.includes(safe.chainId)
  const requiresWrongChain = !requiredChains.includes(getEip155ChainId(safe.chainId))

  const isHighRisk = proposal.verifyContext.verified.validation === 'INVALID'
  const disabled = isScam || (isHighRisk && !understandsRisk)

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

        {!supportsSafe ? <UnsupportedChain chainIds={chainIds} /> : requiresWrongChain && <WrongRequiredChain />}
      </div>

      {isHighRisk && supportsSafe && (
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
