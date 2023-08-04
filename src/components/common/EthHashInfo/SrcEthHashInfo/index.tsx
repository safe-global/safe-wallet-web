import { type ReactElement, useState, useCallback } from 'react'
import { isAddress } from 'ethers/lib/utils'
import { useTheme } from '@mui/material/styles'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import useMediaQuery from '@mui/material/useMediaQuery'
import Identicon from '../../Identicon'
import CopyAddressButton from '../../CopyAddressButton'
import ExplorerButton, { type ExplorerButtonProps } from '../../ExplorerButton'
import { shortenAddress } from '@/utils/formatters'

export type EthHashInfoProps = {
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
  ExplorerButtonProps?: ExplorerButtonProps
}

const SrcEthHashInfo = ({
  address,
  customAvatar,
  prefix = '',
  copyPrefix,
  showPrefix,
  shortAddress = true,
  showAvatar = true,
  avatarSize,
  name,
  showCopyButton,
  hasExplorer,
  ExplorerButtonProps,
  children,
}: EthHashInfoProps): ReactElement => {
  const [fallbackToIdenticon, setFallbackToIdenticon] = useState(false)
  const shouldPrefix = isAddress(address)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const onError = useCallback(() => {
    setFallbackToIdenticon(true)
  }, [])

  return (
    <Container>
      {showAvatar && (
        <AvatarContainer size={avatarSize}>
          {!fallbackToIdenticon && customAvatar ? (
            <img src={customAvatar} alt={address} onError={onError} width={avatarSize} height={avatarSize} />
          ) : (
            <Identicon address={address} size={avatarSize} />
          )}
        </AvatarContainer>
      )}

      <Box overflow="hidden">
        {name && (
          <Box sx={{ fontSize: 'body2' }} textOverflow="ellipsis" overflow="hidden" title={name}>
            {name}
          </Box>
        )}

        <AddressContainer>
          <Box fontWeight="inherit" fontSize="inherit">
            {showPrefix && shouldPrefix && prefix && <b>{prefix}:</b>}
            <span>{shortAddress || isMobile ? shortenAddress(address) : address}</span>
          </Box>

          {showCopyButton && (
            <CopyAddressButton prefix={prefix} address={address} copyPrefix={shouldPrefix && copyPrefix} />
          )}

          {hasExplorer && ExplorerButtonProps && (
            <Box color="border.main">
              <ExplorerButton {...ExplorerButtonProps} />
            </Box>
          )}

          {children}
        </AddressContainer>
      </Box>
    </Container>
  )
}

const Container = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5em',
  lineHeight: 1.4,
})

const AvatarContainer = styled('div')<{ size?: number }>(({ size }) => ({
  flexShrink: 0,
  width: size || '2.3em !important',
  height: size || '2.3em !important',
  '> *': {
    width: '100% !important',
    height: '100% !important',
  },
}))

const AddressContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '0.25em',
  whiteSpace: 'nowrap',
})

export default SrcEthHashInfo
