import { formatAmount } from '@/utils/formatNumber'
import { Button } from '@mui/material'
import * as React from 'react'
import { useTimeframeStore } from 'store/timeframe'

// const timeframes = ['hour', 'day', 'week', 'month', 'year'];

export const AmtPerMonth = ({ data }: { data: number | string }) => {
  const timeframe = useTimeframeStore((state) => state.timeframe)
  const setTimeframe = useTimeframeStore((state) => state.setTimeframe)

  function cycleTimeframe(e: any) {
    e.preventDefault()
    e.stopPropagation()
    if (timeframe === 4) {
      setTimeframe(0)
    } else {
      setTimeframe(timeframe + 1)
    }
  }

  return (
    <Button onClick={cycleTimeframe}>
      <span className="slashed-zero tabular-nums dark:text-white">
        {formatAmount(
          timeframe === 0
            ? amtPerHourFormatter(data)
            : timeframe === 1
            ? amtPerDayFormatter(data)
            : timeframe === 2
            ? amtPerWeekFormatter(data)
            : timeframe === 4
            ? amtPerYearFormatter(data)
            : amtPerMonthFormatter(data),
          5,
        )}
      </span>
      <span style={{ whiteSpace: 'nowrap', marginInline: 4, fontSize: 14 }}>{`/ ${
        timeframe === 0
          ? 'hour'
          : timeframe === 1
          ? 'day'
          : timeframe === 2
          ? 'week'
          : timeframe === 4
          ? 'year'
          : 'month'
      }`}</span>
    </Button>
  )
}

interface ISecondsByDuration {
  [key: string]: number
}

const secondsByDuration: ISecondsByDuration = {
  hour: 60 * 60,
  day: 24 * 60 * 60,
  week: 7 * 24 * 60 * 60,
  biweek: 2 * 7 * 24 * 60 * 60,
  month: 30 * 24 * 60 * 60,
  year: 365 * 24 * 60 * 60,
}

export function amtPerHourFormatter(amount: string | number): number {
  return (Number(amount) * secondsByDuration['hour']) / 1e20
}
export function amtPerDayFormatter(amount: string | number): number {
  return (Number(amount) * secondsByDuration['day']) / 1e20
}
export function amtPerWeekFormatter(amount: string | number): number {
  return (Number(amount) * secondsByDuration['week']) / 1e20
}
export function amtPerMonthFormatter(amount: string | number): number {
  return (Number(amount) * secondsByDuration['month']) / 1e20
}
export function amtPerYearFormatter(amount: string | number): number {
  return (Number(amount) * secondsByDuration['year']) / 1e20
}
