import { useState, MouseEvent, type ReactElement } from 'react'
import ListItemIcon from '@mui/material/ListItemIcon'
import IconButton from '@mui/material/IconButton'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText'

import { useAppDispatch } from '@/store'
import { removeSafe } from '@/store/addedSafesSlice'
import useAddressBook from '@/hooks/useAddressBook'
import EntryDialog from '@/components/address-book/EntryDialog'

const SafeListContextMenu = ({ chainId, address }: { chainId: string; address: string }): ReactElement => {
  const dispatch = useAppDispatch()
  const addressBook = useAddressBook()
  const name = addressBook?.[address]

  const [anchorEl, setAnchorEl] = useState<HTMLElement | undefined>()
  const [openModal, setOpenModal] = useState<boolean>(false)

  const handleOpenContextMenu = (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
    setAnchorEl(e.currentTarget)
  }

  const handleCloseContextMenu = () => {
    setAnchorEl(undefined)
  }

  const handleRemoveSafe = () => {
    dispatch(removeSafe({ chainId, address }))
  }

  const handleOpenRenameModal = (open: boolean) => () => {
    handleCloseContextMenu()
    setOpenModal(open)
  }

  return (
    <>
      <IconButton edge="end" size="small" onClick={handleOpenContextMenu}>
        <MoreVertIcon sx={({ palette }) => ({ color: palette.border.main })} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={handleCloseContextMenu}
        sx={({ palette }) => ({
          '.MuiPaper-root': { borderRadius: '8px !important', width: '138px' },
          '.MuiList-root': { p: '4px' },
          '.MuiMenuItem-root': {
            paddingLeft: '12px',
            minHeight: '40px',
            '&:hover': { borderRadius: '8px !important', backgroundColor: palette.primary.background },
          },
          '.MuiListItemIcon-root': {
            minWidth: '26px',
          },
        })}
      >
        <MenuItem onClick={handleOpenRenameModal(true)}>
          <ListItemIcon>
            <img src="/images/sidebar/safe-list/pencil.svg" alt="Rename" height="16px" width="16px" />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleRemoveSafe}>
          <ListItemIcon>
            <img src="/images/sidebar/safe-list/trash.svg" alt="Remove" height="16px" width="16px" />
          </ListItemIcon>
          <ListItemText>Remove</ListItemText>
        </MenuItem>
      </Menu>
      {openModal && (
        <EntryDialog handleClose={handleOpenRenameModal(false)} defaultValues={{ name, address }} disableAddressInput />
      )}
    </>
  )
}

export default SafeListContextMenu
