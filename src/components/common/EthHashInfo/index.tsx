import { type ReactElement } from 'react'
import useAddressBook from '@/hooks/useAddressBook'
import useChainId from '@/hooks/useChainId'
import { useAppSelector } from '@/store'
import { selectSettings } from '@/store/settingsSlice'
import { selectChainById } from '@/store/chainsSlice'
import { getBlockExplorerLink } from '@/utils/chains'
import css from './styles.module.css'
import { Emoji } from './AddressEmoji'
import SrcEthHashInfo, { type EthHashInfoProps } from './SrcEthHashInfo'

const EthHashInfo = ({
  showName = true,
  avatarSize = 44,
  ...props
}: EthHashInfoProps & { showName?: boolean }): ReactElement => {
  const settings = useAppSelector(selectSettings)
  const currentChainId = useChainId()
  const chain = useAppSelector((state) => selectChainById(state, props.chainId || currentChainId))
  const addressBook = useAddressBook()
  const link = chain ? getBlockExplorerLink(chain, props.address) : undefined
  const name = showName ? props.name || addressBook[props.address] : undefined
  const showEmoji = settings.addressEmojis && props.showAvatar !== false && !props.customAvatar && avatarSize >= 20

  return (
    <div className={css.container}>
      <SrcEthHashInfo
        prefix={chain?.shortName}
        showPrefix={settings.shortName.show}
        copyPrefix={settings.shortName.copy}
        {...props}
        name={name}
        customAvatar={props.customAvatar}
        ExplorerButtonProps={{ title: link?.title || '', href: link?.href || '' }}
        avatarSize={avatarSize}
      >
        {props.children}
      </SrcEthHashInfo>
      {showEmoji && <Emoji address={props.address} size={avatarSize} />}
    </div>
  )
}

export default EthHashInfo
