import { type ReactElement } from 'react'
import { Button } from '@mui/material'

type LoadMoreButtonProps = {
  loading: boolean
  onLoadMore: () => void
}

const LoadMoreButton = ({ loading, onLoadMore }: LoadMoreButtonProps): ReactElement => {
  return (
    <Button onClick={onLoadMore} disabled={loading} variant="outlined">
      Load more
    </Button>
  )
}

export default LoadMoreButton
