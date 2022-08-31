import { useState } from 'react'
import Button from '@mui/material/Button'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined'
import Box from '@mui/material/Box'
import TxFilterForm from '@/components/transactions/TxFilterForm'
import { useTxFilter } from '@/utils/tx-history-filter'

const TxFilterButton = () => {
  const [filter] = useTxFilter()

  const [showFilter, setShowFilter] = useState(false)

  const toggleFilter = () => {
    setShowFilter((prev) => !prev)
  }

  return (
    <>
      <Button variant="contained" onClick={toggleFilter} size="small">
        <FilterAltOutlinedIcon fontSize="small" />
        {filter?.type ?? 'Filter'}
        {showFilter ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
      </Button>

      {showFilter && (
        <Box pt={1} width="100%">
          <TxFilterForm toggleFilter={toggleFilter} />
        </Box>
      )}
    </>
  )
}

export default TxFilterButton
