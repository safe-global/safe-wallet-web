import { useState } from 'react'
import Button from '@mui/material/Button'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined'
import Box from '@mui/material/Box'
import TxFilterForm from '@/components/transactions/TxFilterForm'
import { useTxFilter } from '@/utils/tx-history-filter'

const TxFilterButton = ({ className }: { className?: string }) => {
  const [filter] = useTxFilter()

  const [showFilter, setShowFilter] = useState(false)

  const toggleFilter = () => {
    setShowFilter((prev) => !prev)
  }

  return (
    <>
      <Button variant="contained" className={className} onClick={toggleFilter} size="small">
        <FilterAltOutlinedIcon fontSize="small" />
        {filter?.type ?? 'Filter'}
        {showFilter ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
      </Button>
      {showFilter && (
        <Box sx={{ pt: 1 }}>
          <TxFilterForm />
        </Box>
      )}
    </>
  )
}

export default TxFilterButton
