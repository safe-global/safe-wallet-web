import { useState, MouseEvent, type ReactElement } from 'react'
import ListItemIcon from '@mui/material/ListItemIcon'
import IconButton from '@mui/material/IconButton'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText'

import useAddressBook from '@/hooks/useAddressBook'
import EntryDialog from '@/components/address-book/EntryDialog'
import SafeListRemoveDialog from '@/components/sidebar/SafeListRemoveDialog'
import { useAppSelector } from '@/store'
import { selectAddedSafes } from '@/store/addedSafesSlice'

import css from './styles.module.css'

enum ModalType {
  RENAME = 'rename',
  REMOVE = 'remove',
}

const defaultOpen = { [ModalType.RENAME]: false, [ModalType.REMOVE]: false }

const SafeListContextMenu = ({ address, chainId }: { address: string; chainId: string }): ReactElement => {
  const addedSafes = useAppSelector((state) => selectAddedSafes(state, chainId))
  const isAdded = !!addedSafes?.[address]

  const addressBook = useAddressBook()
  const name = addressBook?.[address]

  const [anchorEl, setAnchorEl] = useState<HTMLElement | undefined>()
  const [open, setOpen] = useState<typeof defaultOpen>(defaultOpen)

  const handleOpenContextMenu = (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
    setAnchorEl(e.currentTarget)
  }

  const handleCloseContextMenu = () => {
    setAnchorEl(undefined)
  }

  const handleOpenModal = (type: keyof typeof open) => () => {
    handleCloseContextMenu()
    setOpen((prev) => ({ ...prev, [type]: true }))
  }

  const handleCloseModal = () => {
    setOpen(defaultOpen)
  }

  return (
    <>
      <IconButton edge="end" size="small" onClick={handleOpenContextMenu}>
        <MoreVertIcon sx={({ palette }) => ({ color: palette.border.main })} />
      </IconButton>
      <Menu
        className={css.menu}
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={handleCloseContextMenu}
        sx={({ palette }) => ({
          '.MuiMenuItem-root:hover': {
            backgroundColor: palette.primary.background,
          },
        })}
      >
        <MenuItem onClick={handleOpenModal(ModalType.RENAME)}>
          <ListItemIcon>
            <img src="/images/sidebar/safe-list/pencil.svg" alt="Rename" height="16px" width="16px" />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>

        {isAdded && (
          <MenuItem onClick={handleOpenModal(ModalType.REMOVE)}>
            <ListItemIcon>
              <img src="/images/sidebar/safe-list/trash.svg" alt="Remove" height="16px" width="16px" />
            </ListItemIcon>
            <ListItemText>Remove</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {open[ModalType.RENAME] && (
        <EntryDialog handleClose={handleCloseModal} defaultValues={{ name, address }} disableAddressInput />
      )}

      {open[ModalType.REMOVE] && (
        <SafeListRemoveDialog handleClose={handleCloseModal} address={address} chainId={chainId} />
      )}
    </>
  )
}

export default SafeListContextMenu
