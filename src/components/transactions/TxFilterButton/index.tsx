import { useState } from 'react'
import Button from '@mui/material/Button'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined'
import Box from '@mui/material/Box'
import { useRouter } from 'next/router'
import { hasTxFilterQuery } from '@/utils/txHistoryFilter'
import TxFilterForm, { TxFilterFormFieldNames } from '@/components/transactions/TxFilterForm'

const TxFilterButton = ({ className }: { className?: string }) => {
  const router = useRouter()

  const [showFilter, setShowFilter] = useState(hasTxFilterQuery(router.query))

  const toggleFilter = () => {
    setShowFilter((prev) => !prev)
  }

  const hasFilter = hasTxFilterQuery(router.query)

  return (
    <>
      <Button variant="contained" className={className} onClick={toggleFilter} size="small">
        <FilterAltOutlinedIcon fontSize="small" />
        {hasFilter ? router.query[TxFilterFormFieldNames.FILTER_TYPE_FIELD_NAME] : 'Filter'}
        {showFilter ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
      </Button>
      {showFilter && (
        <Box sx={{ pt: 1 }}>
          <TxFilterForm toggleFilter={toggleFilter} />
        </Box>
      )}
    </>
  )
}

export default TxFilterButton
