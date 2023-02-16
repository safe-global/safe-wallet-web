import type { ReactNode, SyntheticEvent } from 'react'
import { useMemo, useState } from 'react'
import { useCallback } from 'react'
import { type ReactElement } from 'react'
import {
  Box,
  Checkbox,
  InputAdornment,
  Paper,
  Skeleton,
  SvgIcon,
  type SvgIconProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Tooltip,
} from '@mui/material'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import NftIcon from '@/public/images/common/nft.svg'
import type { SafeCollectibleResponse } from '@safe-global/safe-gateway-typescript-sdk'
import ExternalLink from '@/components/common/ExternalLink'
import useChainId from '@/hooks/useChainId'
import { nftPlatforms } from '../config'
import { OnboardingTooltip } from '@/components/common/OnboardingTooltip'
import EthHashInfo from '@/components/common/EthHashInfo'

interface NftsTableProps {
  nfts: SafeCollectibleResponse[]
  selectedNfts: SafeCollectibleResponse[]
  isLoading: boolean
  children?: ReactNode
  onSelect: (item: SafeCollectibleResponse) => void
  onPreview: (item: SafeCollectibleResponse) => void
}

const PAGE_SIZE = 10
const INITIAL_SKELETON_SIZE = 3

const headCells = [
  {
    id: 'collection',
    label: 'Collection',
    width: '35%',
  },
  {
    id: 'id',
    label: 'Token ID',
    width: '35%',
  },
  {
    id: 'links',
    label: 'Links',
    width: '23%',
    xsHidden: true,
  },
  {
    id: 'checkbox',
    label: '',
    width: '7%',
  },
]

const stopPropagation = (e: SyntheticEvent) => e.stopPropagation()

const NftIndicator = ({ color }: { color: SvgIconProps['color'] }) => (
  <SvgIcon component={NftIcon} inheritViewBox width={20} height={20} color={color} sx={{ ml: 0.25 }} />
)

const activeNftIcon = <NftIndicator color="primary" />

const inactiveNftIcon = (
  <Tooltip title="There's no preview for this NFT" placement="top" arrow>
    <span>
      <NftIndicator color="border" />
    </span>
  </Tooltip>
)

const linksHeader = (
  <OnboardingTooltip
    text="Please note that the links to OpenSea and Blur are provided only for viewing NFTs. Both these apps do not support the Safe Wallet right now."
    widgetLocalStorageId="tooltip_nft_links"
    placement="top"
  >
    <span>Links</span>
  </OnboardingTooltip>
)

const NftGrid = ({ nfts, selectedNfts, isLoading, children, onSelect, onPreview }: NftsTableProps): ReactElement => {
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

  const onCheckboxClick = (e: React.SyntheticEvent, item: SafeCollectibleResponse) => {
    e.stopPropagation()
    onSelect(item)
  }

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
                      linksHeader
                    ) : null
                  ) : (
                    headCell.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredNfts.map((item, index) => {
              const onClick = () => onPreview(item)
              const sx = item.imageUri ? { cursor: 'pointer' } : undefined

              return (
                <TableRow tabIndex={-1} key={`${item.address}-${item.id}`}>
                  {/* Collection name */}
                  <TableCell onClick={onClick} sx={sx}>
                    <Box display="flex" alignItems="center" gap={2}>
                      {item.imageUri ? activeNftIcon : inactiveNftIcon}

                      <div>
                        <Typography>{item.tokenName || item.tokenSymbol}</Typography>

                        <Typography fontSize="small" color="text.secondary" component="div">
                          <EthHashInfo
                            address={item.address}
                            showAvatar={false}
                            showName={false}
                            showCopyButton
                            hasExplorer
                          />
                        </Typography>
                      </div>
                    </Box>
                  </TableCell>

                  {/* Token ID */}
                  <TableCell onClick={onClick} sx={sx}>
                    <Typography sx={item.name ? undefined : { wordBreak: 'break-all' }}>
                      {item.name || `${item.tokenSymbol} #${item.id.slice(0, 20)}`}
                    </Typography>
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
                    <Checkbox checked={selectedNfts.includes(item)} onClick={(e) => onCheckboxClick(e, item)} />

                    {/* Insert the children at the end of the table */}
                    {index === filteredNfts.length - 1 && children}
                  </TableCell>
                </TableRow>
              )
            })}

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
              Array.from({ length: nfts.length ? PAGE_SIZE : INITIAL_SKELETON_SIZE }).map((_, index) => (
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
