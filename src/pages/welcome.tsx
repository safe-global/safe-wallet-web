import type { NextPage } from 'next'
import Head from 'next/head'

import { List, Paper } from '@mui/material'
import { Stack } from '@mui/system'
import useOwnedSafes from '@/hooks/useOwnedSafes'
import useChainId from '@/hooks/useChainId'
import SafeCardItem from '@/components/sidebar/SafeCardItem'
import { AppRoutes } from '@/config/routes'
import { useRouter } from 'next/router'
import { useAppSelector } from '@/store'
import { selectChainById } from '@/store/chainsSlice'

const Welcome: NextPage = () => {
  const ownedSafes = useOwnedSafes()
  const chainId = useChainId()
  const ownedSafesOnChain = ownedSafes[chainId] ?? []
  const router = useRouter()
  const chain = useAppSelector((state) => selectChainById(state, chainId))
  const shortName = chain?.shortName || ''

  return (
    <>
      <Head>
        <title>Safe – Welcome</title>
      </Head>
      <Stack alignItems={'center'} pt={5}>
        <Paper sx={{ p: 2 }}>
          <Stack alignItems={'center'}>
            <List disablePadding>
              {ownedSafesOnChain.map((address) => (
                <SafeCardItem
                  selected={false}
                  key={address}
                  address={address}
                  chainId={chainId}
                  onClick={() =>
                    router.push({
                      pathname: AppRoutes.home,
                      query: { safe: `${shortName}:${address}` },
                    })
                  }
                />
              ))}
            </List>
          </Stack>
        </Paper>
      </Stack>
    </>
  )
}

export default Welcome
