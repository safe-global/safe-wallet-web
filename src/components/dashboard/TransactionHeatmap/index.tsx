import { Box, Paper, Typography } from '@mui/material'
import { WidgetBody, WidgetContainer } from '../styled'
import { useEffect, useState } from 'react'
import useTxHistory from '@/hooks/useTxHistory'
import { isTransactionListItem } from '@/utils/transaction-guards'
import { Heatmap } from './Heatmap'

const TWELVE_WEEKS_IN_MS = 1000 * 60 * 60 * 24 * 7 * 12
const DAY_IN_MS = 1000 * 60 * 60 * 24

const getStartTimestamp = () => {
  // Monday 52 weeks ago
  const oneYearAgo = Date.now() - TWELVE_WEEKS_IN_MS
  const dayOfWeek = new Date(oneYearAgo).getDay()
  // We want to set the day to Sunday 00:00h
  return new Date(oneYearAgo - dayOfWeek * DAY_IN_MS).setHours(0, 0, 0, 0)
}

const TransactionHeatmap = () => {
  const [heatMapData, setHeatMapData] = useState<number[]>([])

  const txHistory = useTxHistory()
  const startTimestamp = getStartTimestamp()
  const dataSize = Math.ceil((Date.now() - startTimestamp) / DAY_IN_MS)

  const dataWidth = Math.ceil(dataSize / 7) * 20 + 32

  useEffect(() => {
    const newData = Array.from(new Array(dataSize)).map(() => 0)
    if (txHistory.loading || txHistory.page === undefined) {
      setHeatMapData(newData.map(() => Math.floor(Math.random() * 6)))
    }
    const entries = txHistory.page?.results
    entries?.forEach((entry) => {
      if (!isTransactionListItem(entry)) {
        return
      }

      const indexOfDay = Math.floor((entry.transaction.timestamp - startTimestamp) / (1000 * 60 * 60 * 24))
      if (indexOfDay >= 0 && indexOfDay < dataSize) {
        // count the day up by 1
        newData[indexOfDay] = newData[indexOfDay] + 1
      }
    })
    setHeatMapData(newData)
  }, [txHistory, startTimestamp, dataSize])

  return (
    <WidgetContainer>
      <WidgetBody>
        <Box>
          <Typography component="h2" variant="subtitle1" fontWeight={700} mb={2}>
            Activity Chart
          </Typography>
          <Paper>
            {txHistory.loading ? (
              <Typography>Loading...</Typography>
            ) : (
              <Heatmap width={dataWidth} heatMapData={heatMapData} />
            )}
          </Paper>
        </Box>
      </WidgetBody>
    </WidgetContainer>
  )
}

export default TransactionHeatmap
