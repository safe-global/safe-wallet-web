import { Box, Button, Divider, Grid, Typography } from '@mui/material'

import ChainIndicator from '@/components/common/ChainIndicator'
import EthHashInfo from '@/components/common/EthHashInfo'
import type { StepRenderProps } from '@/components/new-safe/CardStepper/useCardStepper'
import ReviewRow from '@/components/new-safe/ReviewRow'
import css from '@/components/new-safe/create/steps/ReviewStep/styles.module.css'
import layoutCss from '@/components/new-safe/create/styles.module.css'
import type { LoadSafeFormData } from '@/components/new-safe/load'
import { AppRoutes } from '@/config/routes'
import { useCurrentChain } from '@/hooks/useChains'
import { LOAD_SAFE_EVENTS, OPEN_SAFE_LABELS, OVERVIEW_EVENTS, trackEvent } from '@/services/analytics'
import { useAppDispatch } from '@/store'
import { addOrUpdateSafe } from '@/store/addedSafesSlice'
import { upsertAddressBookEntry } from '@/store/addressBookSlice'
import { defaultSafeInfo } from '@/store/safeInfoSlice'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useRouter } from 'next/router'

const SafeReviewStep = ({ data, onBack }: StepRenderProps<LoadSafeFormData>) => {
  const chain = useCurrentChain()
  const dispatch = useAppDispatch()
  const router = useRouter()
  const chainId = chain?.chainId || ''

  const addSafe = () => {
    const safeName = data.name
    const safeAddress = data.address

    dispatch(
      addOrUpdateSafe({
        safe: {
          ...defaultSafeInfo,
          address: { value: safeAddress, name: safeName },
          threshold: data.threshold,
          owners: data.owners.map((owner) => ({
            value: owner.address,
            name: owner.name || owner.ens,
          })),
          chainId,
        },
      }),
    )

    dispatch(
      upsertAddressBookEntry({
        chainId,
        address: safeAddress,
        name: safeName,
      }),
    )

    for (const { address, name, ens } of data.owners) {
      const entryName = name || ens

      if (!entryName) {
        continue
      }

      dispatch(
        upsertAddressBookEntry({
          chainId,
          address,
          name: entryName,
        }),
      )
    }

    trackEvent({
      ...LOAD_SAFE_EVENTS.OWNERS,
      label: data.owners.length,
    })

    trackEvent({
      ...LOAD_SAFE_EVENTS.THRESHOLD,
      label: data.threshold,
    })

    trackEvent({ ...OVERVIEW_EVENTS.OPEN_SAFE, label: OPEN_SAFE_LABELS.after_add })

    router.push({
      pathname: AppRoutes.home,
      query: { safe: `${chain?.shortName}:${safeAddress}` },
    })
  }

  const handleBack = () => {
    onBack(data)
  }

  return (
    <>
      <Box data-sid="24250" className={layoutCss.row}>
        <Grid container spacing={3}>
          <ReviewRow name="Network" value={<ChainIndicator chainId={chain?.chainId} inline />} />
          <ReviewRow name="Name" value={<Typography>{data.name}</Typography>} />
          <ReviewRow
            name="Owners"
            value={
              <Box data-sid="46404" className={css.ownersArray}>
                {data.owners.map((owner, index) => (
                  <EthHashInfo
                    address={owner.address}
                    name={owner.name || owner.ens}
                    shortAddress={false}
                    showPrefix={false}
                    showName
                    hasExplorer
                    showCopyButton
                    key={index}
                  />
                ))}
              </Box>
            }
          />
          <ReviewRow
            name="Threshold"
            value={
              <Typography>
                {data.threshold} out of {data.owners.length} owner(s)
              </Typography>
            }
          />
        </Grid>
      </Box>
      <Divider />
      <Box data-sid="97596" className={layoutCss.row}>
        <Box data-sid="82500" display="flex" flexDirection="row" justifyContent="space-between" gap={3}>
          <Button
            data-sid="46284"
            variant="outlined"
            size="small"
            onClick={handleBack}
            startIcon={<ArrowBackIcon fontSize="small" />}
          >
            Back
          </Button>
          <Button data-sid="26750" onClick={addSafe} variant="contained" size="stretched">
            Add
          </Button>
        </Box>
      </Box>
    </>
  )
}

export default SafeReviewStep
