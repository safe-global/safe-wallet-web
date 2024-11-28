import { Chip, SvgIcon, Tooltip, Typography } from '@mui/material'
import InfoIcon from '@/public/images/notifications/info.svg'

const TxProposalChip = () => {
  return (
    <Tooltip title="This transaction was created by a Proposer. Reject or confirm it to proceed.">
      <span>
        <Chip
          sx={{ backgroundColor: 'background.main', color: 'primary.light' }}
          size="small"
          label={
            <Typography
              variant="caption"
              fontWeight="bold"
              display="flex"
              alignItems="center"
              justifyContent="center"
              gap={0.7}
            >
              <SvgIcon component={InfoIcon} inheritViewBox fontSize="small" />
              <Typography data-testid="proposal-status" variant="caption" fontWeight="bold">
                Proposal
              </Typography>
            </Typography>
          }
        />
      </span>
    </Tooltip>
  )
}

export default TxProposalChip
