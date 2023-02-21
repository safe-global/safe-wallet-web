import NextLink from 'next/link'
import type { LinkProps } from 'next/link'
import type { ReactElement } from 'react'
import ChevronRight from '@mui/icons-material/ChevronRight'
import { Box } from '@mui/material'
import css from './styles.module.css'
import classNames from 'classnames'
import type { IStream } from '@/components/safe-apps/types'
import { AmtPerMonth } from './AmtPerMonth'
import { TotalStreamed } from './TotalStreamed'
import { shortenAddress } from '@/utils/formatters'

type props = {
  stream: IStream
  url: LinkProps['href']
  username?: string
}

const Stream = ({ stream, url, username }: props): ReactElement => {
  return (
    <NextLink href={url} passHref>
      <a>
        <Box className={classNames(css.gridContainer, css.columnTemplate)}>
          <Box gridArea="nonce">{username || shortenAddress(stream.payeeAddress)}</Box>

          <Box gridArea="icon" marginLeft="12px">
            <ChevronRight color="border" />
          </Box>

          <Box>
            <AmtPerMonth data={stream.amountPerSec} />
          </Box>
          <Box>
            <TotalStreamed data={stream} />
          </Box>
          <Box>{stream.tokenSymbol}</Box>
        </Box>
      </a>
    </NextLink>
  )
}

export default Stream
