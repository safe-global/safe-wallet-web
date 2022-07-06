import { useState, MouseEvent, type ReactElement } from 'react'
import ListItemIcon from '@mui/material/ListItemIcon'
import IconButton from '@mui/material/IconButton'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText'

import { useAppDispatch } from '@/store'
import { removeSafe } from '@/store/addedSafesSlice'

const SafeListContextMenu = ({ chainId, address }: { chainId: string; address: string }): ReactElement => {
  const dispatch = useAppDispatch()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | undefined>()

  const handleClick = (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
    setAnchorEl(e.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(undefined)
  }

  const handleRemove = () => {
    dispatch(removeSafe({ chainId, address }))
  }
  return (
    <>
      <IconButton
        edge="end"
        size="small"
        onClick={(e) => {
          e.stopPropagation()
          handleClick(e)
        }}
      >
        <MoreVertIcon sx={({ palette }) => ({ color: palette.gray.main })} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={handleClose}
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
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <img src="/images/sidebar/safe-list/pencil.svg" alt="Rename" height="16px" width="16px" />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleRemove}>
          <ListItemIcon>
            <img src="/images/sidebar/safe-list/trash.svg" alt="Remove" height="16px" width="16px" />
          </ListItemIcon>
          <ListItemText>Remove</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}

export default SafeListContextMenu
