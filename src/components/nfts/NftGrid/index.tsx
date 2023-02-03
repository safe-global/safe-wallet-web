import type { ReactNode, SyntheticEvent } from 'react'
import { useMemo, useState } from 'react'
import { memo } from 'react'
import { useCallback } from 'react'
import { type ReactElement } from 'react'
import {
  Box,
  Checkbox,
  InputAdornment,
  Paper,
  Skeleton,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import NftIcon from '@/public/images/common/nft.svg'
import type { SafeCollectibleResponse } from '@safe-global/safe-gateway-typescript-sdk'
import ImageFallback from '@/components/common/ImageFallback'
import ExternalLink from '@/components/common/ExternalLink'
import useChainId from '@/hooks/useChainId'
import { nftPlatforms } from '../config'
import { OnboardingTooltip } from '@/components/common/OnboardingTooltip'

interface NftsTableProps {
  nfts: SafeCollectibleResponse[]
  selectedNfts: SafeCollectibleResponse[]
  isLoading: boolean
  children?: ReactNode
  onSelect: (item: SafeCollectibleResponse) => void
}

const PAGE_SIZE = 10

const headCells = [
  {
    id: 'collection',
    label: 'Collection',
    width: '35%',
  },
  {
    id: 'id',
    label: 'Token ID',
  },
  {
    id: 'links',
    label: 'Links',
    width: '10%',
    xsHidden: true,
  },
  {
    id: 'checkbox',
    label: '',
    width: '7%',
  },
]

const stopPropagation = (e: SyntheticEvent) => e.stopPropagation()

const NftLogo = memo(function NftLogo({ src, title }: { src: string; title: string }): ReactElement {
  const iconSize = 20

  return (
    <Box width={iconSize} height={iconSize} mr={1} overflow="visible">
      {src ? (
        <ImageFallback
          src={src}
          alt={title}
          fallbackComponent={<SvgIcon component={NftIcon} inheritViewBox width={iconSize} height={iconSize} />}
          fallbackSrc=""
          width="100%"
        />
      ) : null}
    </Box>
  )
})

const NftGrid = ({ nfts, selectedNfts, isLoading, children, onSelect }: NftsTableProps): ReactElement => {
  const chainId = useChainId()
  const linkTemplates = nftPlatforms[chainId]
  // Filter string
  const [filter, setFilter] = useState<string>('')

  const onFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilter(e.target.value.toLowerCase())
    },
    [setFilter],
  )

  // Filter by collection name or token address
  const filteredNfts = useMemo(() => {
    return filter
      ? nfts.filter((nft) => nft.tokenName.toLowerCase().includes(filter) || nft.address.toLowerCase().includes(filter))
      : nfts
  }, [nfts, filter])

  const minRows = Math.min(nfts.length, PAGE_SIZE)

  return (
    <>
      <TableContainer component={Paper}>
        <Table aria-labelledby="tableTitle">
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align="left"
                  padding="normal"
                  sx={{
                    display: headCell.xsHidden ? { xs: 'none', sm: 'table-cell' } : undefined,
                    width: headCell.width,
                  }}
                >
                  {headCell.id === 'collection' ? (
                    <Box display="flex" alignItems="center" alignContent="center" gap={1}>
                      <TextField
                        placeholder="Collection"
                        hiddenLabel
                        variant="standard"
                        size="small"
                        margin="none"
                        onChange={onFilterChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SvgIcon
                                component={FilterAltIcon}
                                inheritViewBox
                                color="border"
                                sx={{ marginTop: -0.5 }}
                              />
                            </InputAdornment>
                          ),
                          disableUnderline: true,
                        }}
                      />
                    </Box>
                  ) : headCell.id === 'links' ? (
                    linkTemplates ? (
                      <OnboardingTooltip
                        text="Please note that the links to OpenSea and Blur are provided only for viewing NFTs. Both these apps do not support the Safe Wallet right now."
                        widgetLocalStorageId="tooltip_nft_links"
                        placement="top"
                      >
                        <span>{headCell.label}</span>
                      </OnboardingTooltip>
                    ) : null
                  ) : (
                    headCell.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredNfts.map((item, index) => (
              <TableRow tabIndex={-1} key={`${item.address}-${item.id}`} onClick={() => onSelect(item)}>
                {/* Collection name */}
                <TableCell>
                  <Box display="flex" alignItems="center" alignContent="center" gap={1}>
                    <NftLogo src={item.logoUri} title={`${item.tokenSymbol}`} />

                    <Typography>{item.tokenName || item.tokenSymbol}</Typography>
                  </Box>
                </TableCell>

                {/* Token ID */}
                <TableCell>
                  <ExternalLink href={linkTemplates ? linkTemplates[0].getUrl(item) : ''} onClick={stopPropagation}>
                    <Typography sx={item.name ? undefined : { wordBreak: 'break-all' }}>
                      {item.name || `${item.tokenSymbol} #${item.id.slice(0, 20)}`}
                    </Typography>
                  </ExternalLink>
                </TableCell>

                {/* Links */}
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  <Box display="flex" alignItems="center" alignContent="center" gap={2.5}>
                    {linkTemplates?.map(({ title, logo, getUrl }) => (
                      <ExternalLink href={getUrl(item)} key={title} onClick={stopPropagation} noIcon>
                        <img src={logo} width={24} height={24} alt={title} />
                      </ExternalLink>
                    ))}
                  </Box>
                </TableCell>

                {/* Checkbox */}
                <TableCell align="right">
                  <Checkbox checked={selectedNfts.includes(item)} />

                  {/* Insert the children at the end of the table */}
                  {index === filteredNfts.length - 1 && children}
                </TableCell>
              </TableRow>
            ))}

            {/* Fill up the table up to min rows when filtering */}
            {filter &&
              Array.from({ length: minRows - filteredNfts.length }).map((_, index) => (
                <TableRow tabIndex={-1} key={index} sx={{ pointerEvents: 'none' }}>
                  {headCells.map((headCell) => (
                    <TableCell
                      key={headCell.id}
                      sx={headCell.xsHidden ? { display: { xs: 'none', sm: 'table-cell' } } : undefined}
                    >
                      <Box height="42px" width="42px" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {/* Show placeholders when loading */}
            {isLoading &&
              Array.from({ length: PAGE_SIZE }).map((_, index) => (
                <TableRow tabIndex={-1} key={index} sx={{ pointerEvents: 'none' }}>
                  {headCells.map((headCell) => (
                    <TableCell
                      key={headCell.id}
                      sx={headCell.xsHidden ? { display: { xs: 'none', sm: 'table-cell' } } : undefined}
                    >
                      <Skeleton variant="rounded" height="30px" sx={{ my: '6px' }} width="100%" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )
}

export default NftGrid
