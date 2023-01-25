import { type ReactElement } from 'react'
import useAddressBook from '@/hooks/useAddressBook'
import { useAppSelector } from '@/store'
import { selectSettings } from '@/store/settingsSlice'
import { selectChainById } from '@/store/chainsSlice'
import useChainId from '@/hooks/useChainId'
import { EthHashInfo } from '@safe-global/safe-react-components'
import { getBlockExplorerLink } from '../../../utils/chains'
import { useCurrentChain } from '../../../hooks/useChains'

type EthHashInfoProps = {
  address: string
  chainId?: string
  name?: string | null
  showAvatar?: boolean
  showCopyButton?: boolean
  prefix?: string
  showPrefix?: boolean
  copyPrefix?: boolean
  shortAddress?: boolean
  customAvatar?: string
  hasExplorer?: boolean
  avatarSize?: number
  children?: React.ReactNode
}

const PrefixedEthHashInfo = ({
  showName = true,
  ...props
}: EthHashInfoProps & { showName?: boolean }): ReactElement => {
  const settings = useAppSelector(selectSettings)
  const currentChain = useCurrentChain()
  const currentChainId = useChainId()
  const chain = useAppSelector((state) => selectChainById(state, props.chainId || currentChainId))
  const addressBook = useAddressBook()
  const link = currentChain ? getBlockExplorerLink(currentChain, props.address) : undefined

  const name = showName ? props.name || addressBook[props.address] : undefined

  return (
    <EthHashInfo
      prefix={chain?.shortName}
      showPrefix={settings.shortName.show}
      copyPrefix={settings.shortName.copy}
      {...props}
      name={name}
      ExplorerButtonProps={{ title: link?.title || '', href: link?.href || '' }}
    >
      {props.children}
    </EthHashInfo>
  )
}

export default PrefixedEthHashInfo
