import type { ReactElement } from 'react'
import styled from '@emotion/styled'
import NextLink from 'next/link'
import type { LinkProps } from 'next/link'
import { Link } from '@mui/material'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

export const WidgetContainer = styled.section`
  display: flex;
  flex-direction: column;
  height: 100%;
`

export const WidgetTitle = styled.h2`
  margin-top: 0;
`

export const WidgetBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
`

export const Card = styled.div`
  background: var(--color-background-paper);
  padding: var(--space-3);
  border-radius: 6px;
  flex-grow: 1;
  position: relative;
  box-sizing: border-box;
  height: 100%;
  overflow: hidden;

  & h2 {
    margin-top: 0;
  }
`

const StyledLink = styled(Link)`
  text-decoration: none;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: var(--space-1);
  margin-bottom: 10px;
  padding-right: 17px;
`

export const ViewAllLink = ({ url, text }: { url: LinkProps['href']; text?: string }): ReactElement => (
  <NextLink href={url} passHref legacyBehavior>
    <StyledLink data-testid="view-all-link">
      {text || 'View all'} <ChevronRightIcon />
    </StyledLink>
  </NextLink>
)
