import { Button, Divider, Typography } from '@mui/material'
import type { Web3WalletTypes } from '@walletconnect/web3wallet'
import type { ReactElement } from 'react'

import { EIP155 } from '@/services/walletconnect/constants'
import useChains from '@/hooks/useChains'
import { UnsupportedChain } from './UnsupportedChain'
import { getEip155ChainId } from '@/services/walletconnect/utils'
import SafeAppIconCard from '@/components/safe-apps/SafeAppIconCard'
import css from './styles.module.css'
import ProposalVerification from './ProposalVerification'
import useSafeInfo from '@/hooks/useSafeInfo'

type ProposalFormProps = {
  proposal: Web3WalletTypes.SessionProposal
  onApprove?: () => void
  onReject?: () => void
}

const ProposalForm = ({ proposal, onApprove, onReject }: ProposalFormProps): ReactElement => {
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

        {!supportsSafe && <UnsupportedChain chainIds={chainIds} />}
      </div>

      <Divider flexItem className={css.divider} />

      <div className={css.buttons}>
        <Button variant="danger" onClick={onReject} className={css.button}>
          Reject
        </Button>

        <Button variant="contained" onClick={onApprove} className={css.button} disabled={!supportsSafe && !isScam}>
          Approve
        </Button>
      </div>
    </div>
  )
}

export default ProposalForm
