import type { MouseEvent } from 'react'
import { type ReactElement, useState } from 'react'
import IconButton from '@mui/material/IconButton'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import MenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText'

import useAddressBook from '@/hooks/useAddressBook'
import EntryDialog from '@/components/address-book/EntryDialog'
import ContextMenu from '@/components/common/ContextMenu'
import TokenTransferModal from '@/components/tx/modals/TokenTransferModal'
import type { Transfer } from '@safe-global/safe-gateway-typescript-sdk'
import { TransferDirection } from '@safe-global/safe-gateway-typescript-sdk'
import { ZERO_ADDRESS } from '@safe-global/safe-core-sdk/dist/src/utils/constants'
import { isERC20Transfer, isNativeTokenTransfer } from '@/utils/transaction-guards'
import { trackEvent, TX_LIST_EVENTS } from '@/services/analytics'
import { safeFormatUnits } from '@/utils/formatters'
import CheckWallet from '@/components/common/CheckWallet'

enum ModalType {
  SEND_AGAIN = 'SEND_AGAIN',
  ADD_TO_AB = 'ADD_TO_AB',
}

const ETHER = 'ether'

const defaultOpen = { [ModalType.SEND_AGAIN]: false, [ModalType.ADD_TO_AB]: false }

const TransferActions = ({ address, txInfo }: { address: string; txInfo: Transfer }): ReactElement => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | undefined>()
  const [open, setOpen] = useState<typeof defaultOpen>(defaultOpen)
  const addressBook = useAddressBook()
  const name = addressBook?.[address]

  const handleOpenContextMenu = (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
    setAnchorEl(e.currentTarget)
  }

  const handleCloseContextMenu = () => {
    setAnchorEl(undefined)
  }

  const handleOpenModal = (type: keyof typeof open, event?: typeof TX_LIST_EVENTS.ADDRESS_BOOK) => () => {
    handleCloseContextMenu()
    setOpen((prev) => ({ ...prev, [type]: true }))

    if (event) {
      trackEvent(event)
    }
  }

  const handleCloseModal = () => {
    setOpen(defaultOpen)
  }

  const recipient = txInfo.recipient.value
  const tokenAddress = isNativeTokenTransfer(txInfo.transferInfo) ? ZERO_ADDRESS : txInfo.transferInfo.tokenAddress

  const amount = isNativeTokenTransfer(txInfo.transferInfo)
    ? safeFormatUnits(txInfo.transferInfo.value, ETHER)
    : isERC20Transfer(txInfo.transferInfo)
    ? safeFormatUnits(txInfo.transferInfo.value, txInfo.transferInfo.decimals)
    : undefined

  const isOutgoingTx = txInfo.direction.toUpperCase() === TransferDirection.OUTGOING
  const canSendAgain =
    isOutgoingTx && (isNativeTokenTransfer(txInfo.transferInfo) || isERC20Transfer(txInfo.transferInfo))

  return (
    <>
      <IconButton edge="end" size="small" onClick={handleOpenContextMenu} sx={{ ml: '4px' }}>
        <MoreHorizIcon sx={({ palette }) => ({ color: palette.border.main })} fontSize="small" />
      </IconButton>
      <ContextMenu anchorEl={anchorEl} open={!!anchorEl} onClose={handleCloseContextMenu}>
        {canSendAgain && (
          <CheckWallet>
            {(isOk) => (
              <MenuItem onClick={handleOpenModal(ModalType.SEND_AGAIN, TX_LIST_EVENTS.SEND_AGAIN)} disabled={!isOk}>
                <ListItemText>Send again</ListItemText>
              </MenuItem>
            )}
          </CheckWallet>
        )}

        <MenuItem onClick={handleOpenModal(ModalType.ADD_TO_AB, TX_LIST_EVENTS.ADDRESS_BOOK)}>
          <ListItemText>Add to address book</ListItemText>
        </MenuItem>
      </ContextMenu>

      {open[ModalType.SEND_AGAIN] && (
        <TokenTransferModal onClose={handleCloseModal} initialData={[{ recipient, tokenAddress, amount }]} />
      )}

      {open[ModalType.ADD_TO_AB] && (
        <EntryDialog handleClose={handleCloseModal} defaultValues={{ name, address }} disableAddressInput />
      )}
    </>
  )
}

export default TransferActions
