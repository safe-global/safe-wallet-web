import { type ReactElement } from 'react'
import { EthHashInfo } from '@safe-global/safe-react-components'
import useAddressBook from '@/hooks/useAddressBook'
import useChainId from '@/hooks/useChainId'
import { useAppSelector } from '@/store'
import { selectSettings } from '@/store/settingsSlice'
import { selectChainById } from '@/store/chainsSlice'

import { getBlockExplorerLink } from '../../../utils/chains'

import type { EthHashInfoProps } from '@safe-global/safe-react-components'

const PrefixedEthHashInfo = ({
  showName = true,
  ...props
}: EthHashInfoProps & { showName?: boolean }): ReactElement => {
  const settings = useAppSelector(selectSettings)
  const currentChainId = useChainId()
  const chain = useAppSelector((state) => selectChainById(state, props.chainId || currentChainId))
  const addressBook = useAddressBook()
  const link = chain ? getBlockExplorerLink(chain, props.address) : undefined
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
