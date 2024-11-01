import { useState } from 'react'
import { Button, ListItemText, MenuItem, SvgIcon } from '@mui/material'
import ContextMenu from '@/components/common/ContextMenu'
import TransactionsIcon from '@/public/images/transactions/transactions.svg'
import CheckIcon from '@/public/images/common/check.svg'
import { OrderByOption } from '@/store/orderByPreferenceSlice'

type SortByButtonProps = {
  sortBy: OrderByOption
  onSortByChange: (sortBy: OrderByOption) => void
}

const SortByButton = ({ sortBy, onSortByChange }: SortByButtonProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | undefined>()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(undefined)
  }

  const handleSortChange = (newSortBy: OrderByOption) => {
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
          onClick={() => handleSortChange(OrderByOption.LAST_VISITED)}
          selected={sortBy === OrderByOption.LAST_VISITED}
        >
          <ListItemText sx={{ mr: 2 }}>Most recent</ListItemText>
          {sortBy === OrderByOption.LAST_VISITED && <CheckIcon sx={{ ml: 1 }} />}
        </MenuItem>
        <MenuItem onClick={() => handleSortChange(OrderByOption.NAME)} selected={sortBy === OrderByOption.NAME}>
          <ListItemText>Name</ListItemText>
          {sortBy === OrderByOption.NAME && <CheckIcon sx={{ ml: 1 }} />}
        </MenuItem>
      </ContextMenu>
    </>
  )
}

export default SortByButton
