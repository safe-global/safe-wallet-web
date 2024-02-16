import { AppRoutes } from '@/config/routes'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { type ElementType, useContext } from 'react'
import { Box, ButtonBase, Grid, SvgIcon, Typography } from '@mui/material'
import ModalDialog from '@/components/common/ModalDialog'
import { TxModalContext } from '@/components/tx-flow'
import { AddOwnerFlow, TokenTransferFlow, UpsertRecoveryFlow } from '@/components/tx-flow/flows'
const ActivateAccountFlow = dynamic(() => import('./ActivateAccountFlow'))
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import { useTxBuilderApp } from '@/hooks/safe-apps/useTxBuilderApp'
import AssetsIcon from '@/public/images/sidebar/assets.svg'
import SaveAddressIcon from '@/public/images/common/save-address.svg'
import RecoveryPlus from '@/public/images/common/recovery-plus.svg'
import SwapIcon from '@/public/images/common/swap.svg'
import SafeLogo from '@/public/images/logo-no-text.svg'
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined'

import css from './styles.module.css'

const TxButton = ({
  title,
  description,
  icon,
  onClick,
}: {
  title: string
  description?: string
  icon: ElementType
  onClick: () => void
}) => {
  return (
    <ButtonBase className={css.newTxButton} onClick={onClick}>
      <div className={css.iconBg}>
        <SvgIcon component={icon} fontSize="small" inheritViewBox />
      </div>
      <Box>
        <Typography fontWeight="bold">{title}</Typography>
        {description && (
          <Typography variant="body2" color="primary.light">
            {description}
          </Typography>
        )}
      </Box>
      <SvgIcon component={ChevronRightRoundedIcon} color="border" sx={{ ml: 'auto' }} />
    </ButtonBase>
  )
}

const FirstTxFlow = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const txBuilder = useTxBuilderApp()
  const router = useRouter()
  const { setTxFlow } = useContext(TxModalContext)

  const handleClick = (onClick: () => void) => {
    onClose()
    onClick()
  }

  const onSendToken = () => {
    setTxFlow(<TokenTransferFlow />)
  }

  const onActivateSafe = () => {
    setTxFlow(<ActivateAccountFlow />)
  }

  const onAddSigner = () => {
    setTxFlow(<AddOwnerFlow />)
  }

  const onRecovery = () => {
    setTxFlow(<UpsertRecoveryFlow />)
  }

  const onSwap = () => {
    // TODO: Pre-filter DeFi category apps
    router.push({ pathname: AppRoutes.apps.index, query: router.query })
  }

  const onCustomTransaction = () => {
    if (!txBuilder) return

    router.push(txBuilder.link)
  }

  return (
    <ModalDialog open={open} dialogTitle="Create new transaction" hideChainIndicator onClose={onClose}>
      <Grid container justifyContent="center" flexDirection="column" p={3} spacing={2}>
        <Grid item>
          <TxButton
            title="Activate Safe now"
            description="Pay a one-time network fee to deploy your safe onchain"
            icon={SafeLogo}
            onClick={() => handleClick(onActivateSafe)}
          />
        </Grid>

        <Grid item>
          <TxButton
            title="Add another signer"
            description="Improve the security of your Safe Account"
            icon={SaveAddressIcon}
            onClick={() => handleClick(onAddSigner)}
          />
        </Grid>

        <Grid item>
          <TxButton
            title="Set up recovery"
            description="Ensure you never lose access to your funds"
            icon={RecoveryPlus}
            onClick={() => handleClick(onRecovery)}
          />
        </Grid>

        <Grid item>
          <TxButton
            title="Swap tokens"
            description="Explore Safe Apps and trade any token"
            icon={SwapIcon}
            onClick={() => handleClick(onSwap)}
          />
        </Grid>

        {txBuilder && (
          <Grid item>
            <TxButton
              title="Custom transaction"
              description="Compose custom contract interactions"
              icon={HandymanOutlinedIcon}
              onClick={() => handleClick(onCustomTransaction)}
            />
          </Grid>
        )}

        <Grid item>
          <TxButton title="Send token" icon={AssetsIcon} onClick={() => handleClick(onSendToken)} />
        </Grid>
      </Grid>
    </ModalDialog>
  )
}

export default FirstTxFlow
