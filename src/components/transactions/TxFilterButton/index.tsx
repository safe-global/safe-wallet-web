import { SyntheticEvent, useState } from 'react'
import { Button, Backdrop, Popper, Box } from '@mui/material'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined'
import TxFilterForm from '@/components/transactions/TxFilterForm'
import { useTxFilter } from '@/utils/tx-history-filter'

const TxFilterButton = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [filter] = useTxFilter()
  const showFilter = Boolean(anchorEl)

  const toggleFilter = (e?: SyntheticEvent<HTMLButtonElement>) => {
    setAnchorEl((prev) => (prev || !e ? null : e.currentTarget))
  }

  return (
    <>
      <Button variant="contained" onClick={toggleFilter} size="small">
        <FilterAltOutlinedIcon fontSize="small" />
        {filter?.type ?? 'Filter'}
        {showFilter ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
      </Button>

      <Backdrop sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showFilter} onClick={() => toggleFilter()}>
        <Popper open={showFilter} anchorEl={anchorEl} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Box p={1}>
            <TxFilterForm toggleFilter={toggleFilter} />
          </Box>
        </Popper>
      </Backdrop>
    </>
  )
}

export default TxFilterButton
