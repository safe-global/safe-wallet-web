import useSafeAddress from "@/hooks/useSafeAddress"
import EthHashInfo from "@/components/common/EthHashInfo"
import { useAppSelector } from "@/store"
import { selectAllAddedSafes } from "@/store/addedSafesSlice"
import { Input, MenuItem, Select } from "@mui/material"
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import useChainId from "@/hooks/useChainId"
import useOwnedSafes from "@/hooks/useOwnedSafes"
import { uniqBy } from "lodash"
import ChainIndicator from "../ChainIndicator"

const SafeSwitcher = () => {
  const chainId = useChainId()
  const safeAddress = useSafeAddress()
  const ownedSafes = useOwnedSafes()
  const addedSafes = useAppSelector(selectAllAddedSafes)

  const owned = Object.entries(ownedSafes).map(([ chainId, safes ]) => {
    return safes.map((address) => ({
      address,
      chainId
    }))
  })

  let allSafes = Object.entries(addedSafes).map(([chainId, safes]) => {
    return Object.keys(safes).map((address) => ({
      address,
      chainId
    }))
  }).concat(owned).flatMap((safes) => safes)

  if (!allSafes.some((safe) => safe.address === safeAddress && safe.chainId === chainId)) {
    allSafes.push({
      address: safeAddress,
      chainId
    })
  }

  allSafes = uniqBy(allSafes, (safe) => safe.address + safe.chainId)

  const onChange = (e: any) => {
    console.log(e)
  }

  return safeAddress ? (
    <Select
      value={`${chainId}:${safeAddress}`}
      onChange={onChange}
      size="small"
      variant="standard"
      IconComponent={ExpandMoreIcon}
      MenuProps={{
        sx: {
          '& .MuiPaper-root': {
            mt: 2,
          },
        },
      }}
      sx={{
        '&:before': {
          display: 'none'
        },
        '& .MuiSelect-select': {
          py: 0,
        },
        '& svg path': {
          fill: ({ palette }) => palette.border.main,
        },
      }}
    >
      {allSafes.map((safe) => (
        <MenuItem key={safe.chainId + safe.address} value={`${safe.chainId}:${safe.address}`}>
          {safe.address !== safeAddress && (
            <><ChainIndicator chainId={safe.chainId} inline />&nbsp;&nbsp;</>
          )}
          <EthHashInfo address={safe.address} chainId={safe.chainId} showAvatar={safe.address !== safeAddress} showName={safe.address !== safeAddress} />
        </MenuItem>
      ))}
      <MenuItem>
        <Input value="✎ Paste Safe address" fullWidth sx={{ color: '#999' }} />
      </MenuItem>
    </Select>
  ) : null
}

export default SafeSwitcher
