import { useState, MouseEvent, type ReactElement } from 'react'
import Image from 'next/image'
import ListItemIcon from '@mui/material/ListItemIcon'
import IconButton from '@mui/material/IconButton'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

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
        sx={{
          paddingRight: 0,
          '&:hover': {
            backgroundColor: 'unset',
          },
        }}
        onClick={(e) => {
          e.stopPropagation()
          handleClick(e)
        }}
      >
        <MoreVertIcon sx={({ palette }) => ({ color: palette.secondaryBlack[300] })} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={handleClose}
        sx={({ palette }) => ({
          '.MuiPaper-root': { borderRadius: '8px !important', width: '138px', padding: '2px' },
          '.MuiList-root': { p: '4px' },
          '.MuiMenuItem-root': {
            '&:hover': { borderRadius: '8px !important', backgroundColor: palette.gray[300] },
          },
        })}
      >
        <MenuItem onClick={handleClose} sx={{ '.MuiListItemIcon-root': { minWidth: '22px' } }}>
          <ListItemIcon>
            <Image src="/images/sidebar/safe-list/pencil.svg" alt="Rename" height="16px" width="16px" />
          </ListItemIcon>{' '}
          Rename
        </MenuItem>
        <MenuItem onClick={handleRemove} sx={{ '.MuiListItemIcon-root': { minWidth: '22px' } }}>
          <ListItemIcon>
            <Image src="/images/sidebar/safe-list/trash.svg" alt="Remove" height="16px" width="16px" />
          </ListItemIcon>{' '}
          Remove
        </MenuItem>
      </Menu>
    </>
  )
}

export default SafeListContextMenu
