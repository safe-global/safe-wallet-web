import { Skeleton } from '@mui/material'

const SkeletonTxList = () => {
  const label = <Skeleton variant="text" width="10em" sx={{ mt: '20px', mb: 1 }} />

  const item = (i: number) => <Skeleton key={String(i)} height={54} sx={{ mb: '6px' }} variant="rounded" />

  return (
    <>
      {label}
      {Array.from(Array(3).keys()).map(item)}

      {label}
      {Array.from(Array(2).keys()).map(item)}
    </>
  )
}

export default SkeletonTxList
