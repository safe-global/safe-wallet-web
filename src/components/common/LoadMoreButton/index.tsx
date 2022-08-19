import { type ReactElement } from 'react'
import { Button } from '@mui/material'

const LoadMoreButton = ({ onLoadMore }: { onLoadMore: () => void }): ReactElement => {
  return (
    <Button onClick={onLoadMore} variant="outlined">
      Load more
    </Button>
  )
}

export default LoadMoreButton
