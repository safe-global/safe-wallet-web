import { Button, Divider, Typography } from '@mui/material'
import type { Web3WalletTypes } from '@walletconnect/web3wallet'

import { EIP155 } from '@/services/walletconnect/constants'
import useChains from '@/hooks/useChains'
import ChainIndicator from '@/components/common/ChainIndicator'
import { getEip155ChainId } from '@/services/walletconnect/utils'
import SafeAppIconCard from '@/components/safe-apps/SafeAppIconCard'
import css from './styles.module.css'
import ProposalVerification from './ProposalVerification'

type ProposalFormProps = {
  proposal: Web3WalletTypes.SessionProposal
  onApprove?: () => void
  onReject?: () => void
}

const ProposalForm = ({ proposal, onApprove, onReject }: ProposalFormProps) => {
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

  return (
    <div className={css.container}>
      <Typography variant="h4" fontWeight={700}>
        WalletConnect
      </Typography>

      <SafeAppIconCard src={proposer.metadata.icons[0]} width={32} height={32} alt={`${proposer.metadata.name} logo`} />

      <Typography>
        {proposer.metadata.name}
        <br />
        wants to connect
      </Typography>

      <Typography>{proposal.verifyContext.verified.origin}</Typography>

      <Divider flexItem />

      <div>
        <Typography mb={1}>Requested chains</Typography>
        <div>
          {chainIds.map((chainId) => (
            <ChainIndicator inline chainId={chainId} key={chainId} className={css.chain} />
          ))}
        </div>
      </div>

      <Divider flexItem />

      <div>
        <Typography mb={1}>Requested methods</Typography>
        <div>
          {requiredNamespaces[EIP155]?.methods.map((method) => (
            <span className={css.method} key={method}>
              {method}
            </span>
          ))}
        </div>
      </div>

      <Divider flexItem />

      <ProposalVerification proposal={proposal} />

      <Button variant="text" size="small" fullWidth onClick={onReject}>
        Reject
      </Button>

      <Button variant="contained" size="small" fullWidth onClick={onApprove} disabled={isScam}>
        Approve
      </Button>
    </div>
  )
}

export default ProposalForm
