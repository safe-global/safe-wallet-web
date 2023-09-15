import { useCallback, useEffect, useState } from 'react'
import { Autocomplete, CircularProgress, InputAdornment, TextField, Typography } from '@mui/material'
import Link from 'next/link'
import css from './styles.module.css'
import EthHashInfo from '@/components/common/EthHashInfo'
import { getSafeInfo, type SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import useChainId from '@/hooks/useChainId'
import { validateAddress } from '@/utils/validation'
import Button from '@mui/material/Button'
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import { parsePrefixedAddress } from '@/utils/addresses'
import { useCurrentChain } from '@/hooks/useChains'
import { getExplorerLink } from '@/utils/gateway'
import SearchIcon from '@mui/icons-material/Search'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'
import { FEATURES, hasFeature } from '@/utils/chains'
import useNameResolver from '@/components/common/AddressInput/useNameResolver'
import { addOrUpdateSafe } from '@/store/addedSafesSlice'
import { defaultSafeInfo } from '@/store/safeInfoSlice'
import { useAppDispatch } from '@/store'
import { AppRoutes } from '@/config/routes'
import { useRouter } from 'next/router'

const validateSafeAddress = async (address: string, chainId: string) => {
  try {
    const safeInfo = await getSafeInfo(chainId, address)
    return safeInfo
  } catch (error) {
    return
  }
}

enum AddressType {
  SafeAccount = 'SafeAccount',
  EOA = 'EOA',
}

const SearchSafeWidget = () => {
  const chainId = useChainId()
  const currentChain = useCurrentChain()
  const [value, setValue] = useState<string>('')
  const [result, setResult] = useState<string>('')
  const [type, setType] = useState<AddressType>()
  const [safe, setSafe] = useState<SafeInfo>()
  const [open, setOpen] = useState<boolean>(false)
  const dispatch = useAppDispatch()
  const router = useRouter()

  const isDomainLookupEnabled = !!currentChain && hasFeature(currentChain, FEATURES.DOMAIN_LOOKUP)
  const { address, resolving } = useNameResolver(isDomainLookupEnabled ? value : '')

  const handleChange = useCallback(
    async (value: string) => {
      setValue(value)
      setOpen(!!value)

      const { address } = parsePrefixedAddress(value)
      const invalidAddress = validateAddress(address)

      if (invalidAddress) return

      const safe = await validateSafeAddress(address, chainId)

      setType(safe ? AddressType.SafeAccount : AddressType.EOA)

      if (safe) {
        setResult(safe.address.name || safe.address.value)
        setSafe(safe)
      } else {
        setResult(address)
      }
    },
    [chainId],
  )

  const handleAddSafe = () => {
    if (!safe) return

    setValue('')
    setResult('')

    dispatch(
      addOrUpdateSafe({
        safe: {
          ...defaultSafeInfo,
          address: { value: result },
          threshold: safe.threshold,
          owners: safe.owners.map((owner) => ({
            value: owner.value,
            name: owner.name,
          })),
          chainId,
        },
      }),
    )

    // TODO: Show notification and track?

    router.push({
      pathname: AppRoutes.home,
      query: { safe: `${currentChain?.shortName}:${result}` },
    })
  }

  const handleOpenSafe = () => {
    if (type === AddressType.SafeAccount) {
      setValue('')
      setResult('')
    }
  }

  useEffect(() => {
    if (!address) return

    void handleChange(address)
  }, [address, handleChange])

  return (
    <Autocomplete
      className={css.autocomplete}
      value={value}
      open={open}
      freeSolo
      onInputChange={(_, value) => handleChange(value)}
      componentsProps={{
        paper: {
          elevation: 2,
        },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          className={css.input}
          placeholder="Safe Account, Address, ENS"
          size="small"
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: '1.25em' }} />
              </InputAdornment>
            ),
            endAdornment: resolving ? (
              <InputAdornment position="end">
                <CircularProgress size={16} />
              </InputAdornment>
            ) : (
              params.InputProps.endAdornment
            ),
          }}
        />
      )}
      renderOption={(props, option) =>
        option ? (
          <Link
            target={type === AddressType.EOA ? '_blank' : '_self'}
            onClick={handleOpenSafe}
            // TODO: clean this up
            href={
              type === AddressType.EOA && currentChain
                ? getExplorerLink(option, currentChain?.blockExplorerUriTemplate).href
                : type === AddressType.SafeAccount
                ? {
                    pathname: AppRoutes.home,
                    query: { safe: `${currentChain?.shortName}:${result}` },
                  }
                : ''
            }
          >
            <Typography variant="body2" {...props} className={css.option}>
              <EthHashInfo address={option || ''} shortAddress={true} avatarSize={24} />
              {type === AddressType.SafeAccount ? (
                <Button
                  className={css.tinyButton}
                  variant="contained"
                  size="small"
                  onClick={handleAddSafe}
                  startIcon={<LibraryAddIcon fontSize="small" />}
                >
                  Add Safe Account
                </Button>
              ) : (
                <Button
                  className={css.tinyButton}
                  variant="contained"
                  size="small"
                  startIcon={<ArrowOutwardIcon fontSize="small" />}
                  target="_blank"
                  href={currentChain ? getExplorerLink(option, currentChain?.blockExplorerUriTemplate).href : ''}
                >
                  View in Explorer
                </Button>
              )}
            </Typography>
          </Link>
        ) : null
      }
      options={[result]}
    />
  )
}

export default SearchSafeWidget
