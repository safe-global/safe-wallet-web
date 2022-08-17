import { type ReactNode, type ReactElement, type SyntheticEvent } from 'react'
import { Box, Link } from '@mui/material'
import ArrowBack from '@mui/icons-material/ArrowBack'
import ArrowForward from '@mui/icons-material/ArrowForward'

type PaginationProps = {
  page?: string
  nextPage?: string | null
  prevPage?: string | null
  onPageChange: (url?: string) => void
}

const disabledLinkStyle = {
  color: 'action.disabled',
  pointerEvents: 'none',
  textDecoration: 'none',
}

const iconStyle = {
  height: '0.7em',
  verticalAlign: 'text-bottom',
}

const LinkButton = (props: { children: ReactNode; onClick: () => void; disabled: boolean }): ReactElement => {
  const onClick = (e: SyntheticEvent) => {
    e.preventDefault()
    props.onClick?.()
  }

  return (
    <Link component="button" fontSize="medium" onClick={onClick} sx={props.disabled ? disabledLinkStyle : undefined}>
      {props.children}
    </Link>
  )
}

const Pagination = ({ page, nextPage, prevPage, onPageChange }: PaginationProps): ReactElement => {
  const onNext = () => {
    onPageChange(nextPage || undefined)
  }

  const onPrev = () => {
    onPageChange(prevPage || undefined)
  }

  const onFirst = () => {
    onPageChange(undefined)
  }

  const isFirstPage = !prevPage || page === prevPage
  const isLastPage = !nextPage || page === nextPage

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <LinkButton onClick={onFirst} disabled={isFirstPage}>
        First page
      </LinkButton>

      <LinkButton onClick={onPrev} disabled={isFirstPage}>
        <ArrowBack sx={iconStyle} />
        Previous page
      </LinkButton>

      <LinkButton onClick={onNext} disabled={isLastPage}>
        Next page
        <ArrowForward sx={iconStyle} />
      </LinkButton>
    </Box>
  )
}

export default Pagination
