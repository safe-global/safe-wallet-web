import { useCallback, useEffect, useState } from 'react'
import { Grid, Box, Button, Divider, Paper, Typography } from '@mui/material'
import Image from 'next/image'

import { PendingSafeData, SAFE_PENDING_CREATION_STORAGE_KEY } from '@/components/create-safe/index'
import { useWeb3 } from '@/hooks/wallets/web3'
import { createNewSafe } from '@/components/create-safe/Review'
import SafeCreationWaiting from '@/public/images/safe-creation.svg'
import SafeCreationPending from '@/public/images/safe-creation-process.gif'
import SafeCreationError from '@/public/images/safe-creation-error.svg'
import { AppRoutes } from '@/config/routes'
import Link from 'next/link'
import useLocalStorage from '@/services/localStorage/useLocalStorage'
import Safe from '@gnosis.pm/safe-core-sdk'

type Props = {
  onClose: () => void
}

enum SafeCreationStatus {
  PENDING = 'PENDING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}

const getStep = (status: SafeCreationStatus) => {
  switch (status) {
    case SafeCreationStatus.PENDING:
      return {
        image: <Image src={SafeCreationPending} alt="" width={111} height={91} />,
        description: 'Transaction is pending.',
        instruction: 'Please do not leave the page.',
      }
    case SafeCreationStatus.ERROR:
      return {
        image: <Image src={SafeCreationError} alt="" />,
        description: 'There was an error.',
        instruction: 'You can Cancel or Retry the Safe creation process.',
      }
    case SafeCreationStatus.SUCCESS:
      return {
        image: <Image src={SafeCreationWaiting} alt="" />,
        description: 'Your safe was successfully created!',
        instruction: 'Press continue to get to your dashboard.',
      }
  }
}

export const CreationStatus = ({ onClose }: Props) => {
  const [status, setStatus] = useState<SafeCreationStatus>(SafeCreationStatus.PENDING)
  const [safeAddress, setSafeAddress] = useState<string>()
  const [creationPromise, setCreationPromise] = useState<Promise<Safe>>()
  const ethersProvider = useWeb3()

  const [pendingSafe, setPendingSafe] = useLocalStorage<PendingSafeData | undefined>(
    SAFE_PENDING_CREATION_STORAGE_KEY,
    undefined,
  )

  const createSafe = useCallback(async () => {
    if (!ethersProvider || !pendingSafe) return

    const callback = (txHash: string) => {
      setPendingSafe({ ...pendingSafe, txHash })
    }

    setStatus(SafeCreationStatus.PENDING)
    const safeCreationPromise = createNewSafe(ethersProvider, {
      safeAccountConfig: {
        threshold: pendingSafe.threshold,
        owners: pendingSafe.owners.map((owner) => owner.address),
      },
      safeDeploymentConfig: {
        saltNonce: pendingSafe.saltNonce,
      },
      callback,
    })
    setCreationPromise(safeCreationPromise)
  }, [ethersProvider, pendingSafe, setPendingSafe])

  useEffect(() => {
    if (pendingSafe?.txHash) {
      setStatus(SafeCreationStatus.PENDING)
      // TODO: monitor existing tx
    }
  }, [pendingSafe])

  useEffect(() => {
    if (creationPromise || pendingSafe?.txHash) return

    createSafe()
  }, [creationPromise, createSafe, pendingSafe?.txHash])

  useEffect(() => {
    if (!creationPromise || !pendingSafe) return

    const resolveSafeCreation = async () => {
      try {
        const safe = await creationPromise

        setStatus(SafeCreationStatus.SUCCESS)
        setSafeAddress(safe.getAddress())
        setPendingSafe(undefined)
      } catch (error) {
        setStatus(SafeCreationStatus.ERROR)
        setPendingSafe({
          ...pendingSafe,
          txHash: undefined,
        })
        console.log(error)
      }
    }

    resolveSafeCreation()
  }, [creationPromise, setPendingSafe])

  const stepInfo = getStep(status)

  return (
    <Paper
      sx={{
        textAlign: 'center',
      }}
    >
      <Box padding={3}>
        {stepInfo.image}
        <Typography variant="h4" marginTop={2}>
          {stepInfo.description}
        </Typography>
      </Box>
      <Box sx={({ palette }) => ({ backgroundColor: palette.primary.main })} padding={3} marginBottom={6}>
        <Typography variant="h4" color="white">
          {stepInfo.instruction}
        </Typography>
      </Box>
      <Divider />
      {status === SafeCreationStatus.ERROR && (
        <Grid container padding={3} justifyContent="center" gap={2}>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={createSafe} variant="contained">
            Retry
          </Button>
        </Grid>
      )}
      {status === SafeCreationStatus.SUCCESS && (
        <Grid container padding={3} justifyContent="center" gap={2}>
          <Link href={`${AppRoutes.safe.home}?safe=${safeAddress}`}>Continue</Link>
        </Grid>
      )}
    </Paper>
  )
}
