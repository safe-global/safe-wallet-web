import { useState } from 'react'
import { Button, ListItemText, MenuItem, SvgIcon } from '@mui/material'
import ContextMenu from '@/components/common/ContextMenu'
import TransactionsIcon from '@/public/images/transactions/transactions.svg'
import CheckIcon from '@/public/images/common/check.svg'
import { SortBy } from './utils'

type SortByButtonProps = {
  sortBy: SortBy
  onSortByChange: (sortBy: SortBy) => void
}

const SortByButton = ({ sortBy, onSortByChange }: SortByButtonProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | undefined>()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(undefined)
  }

  const handleSortChange = (newSortBy: SortBy) => {
    onSortByChange(newSortBy)
    handleClose()
  }

  return (
    <>
      <Button
        onClick={handleClick}
        startIcon={<SvgIcon component={TransactionsIcon} inheritViewBox />}
        sx={{ color: 'text.secondary' }}
        size="small"
      >
        Sort
      </Button>

      <ContextMenu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={handleClose}
        sx={{
          '& .MuiPaper-root': { minWidth: '250px' },
          '& .Mui-selected, & .Mui-selected:hover': {
            backgroundColor: `background.paper`,
          },
        }}
      >
        <MenuItem disabled>
          <ListItemText>Sort by</ListItemText>
        </MenuItem>
        <MenuItem
          sx={{ borderRadius: 0 }}
          onClick={() => handleSortChange(SortBy.LAST_VISITED)}
          selected={sortBy === SortBy.LAST_VISITED}
        >
          <ListItemText sx={{ mr: 2 }}>Most recent</ListItemText>
          {sortBy === SortBy.LAST_VISITED && <CheckIcon sx={{ ml: 1 }} />}
        </MenuItem>
        <MenuItem onClick={() => handleSortChange(SortBy.NAME)} selected={sortBy === SortBy.NAME}>
          <ListItemText>Name</ListItemText>
          {sortBy === SortBy.NAME && <CheckIcon sx={{ ml: 1 }} />}
        </MenuItem>
      </ContextMenu>
    </>
  )
}

export default SortByButton
