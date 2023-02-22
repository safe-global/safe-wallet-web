import NextLink from 'next/link'
import type { LinkProps } from 'next/link'
import type { ReactElement } from 'react'
import ChevronRight from '@mui/icons-material/ChevronRight'
import { Box, Button, SvgIcon } from '@mui/material'
import css from './styles.module.css'
import classNames from 'classnames'
import type { IStream } from '@/components/safe-apps/types'
import { AmtPerMonth } from './AmtPerMonth'
import { TotalStreamed } from './TotalStreamed'
import { shortenAddress } from '@/utils/formatters'
import TgIcon from '@/public/images/apps/telegram.svg'

type props = {
  stream: IStream
  url: LinkProps['href']
  username?: string
}

const Stream = ({ stream, url, username }: props): ReactElement => {
  const handleTgClick = (e: any) => {
    e.preventDefault()
    e.stopPropagation()
    if (username) {
      window.open(`https://t.me/${username}`, '_blank')
    }
  }
  return (
    <NextLink href={url} passHref>
      <a>
        <Box className={classNames(css.gridContainer, css.columnTemplate)}>
          <Box gridArea="username">
            <Button sx={{ display: 'flex', alignItems: 'center', color: 'white' }} onClick={handleTgClick}>
              <SvgIcon component={TgIcon} inheritViewBox fontSize="small" sx={{ path: { fill: 'white' }, mr: 1 }} />
              {username || '—'}
            </Button>
          </Box>
          <Box gridArea="address">{shortenAddress(stream.payeeAddress)}</Box>
          <Box gridArea="amountPerSec">
            <AmtPerMonth data={stream.amountPerSec} />
          </Box>
          <Box gridArea="streamed">
            <TotalStreamed data={stream} />
          </Box>
          <Box gridArea="symbol">{stream.tokenSymbol}</Box>

          <Box gridArea="icon" marginLeft="12px">
            <ChevronRight color="border" />
          </Box>
        </Box>
      </a>
    </NextLink>
  )
}

export default Stream
