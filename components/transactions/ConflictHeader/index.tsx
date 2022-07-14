import { ReactElement } from 'react'
import { Box, Link, Paper, Typography } from '@mui/material'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import css from './styles.module.css'

const ConflictHeader = ({ nonce }: { nonce: number }): ReactElement => {
  return (
    <Paper sx={{ padding: 2 }} variant="outlined">
      <Box className={css.disclaimerContainer}>
        <Typography alignSelf="flex-start">{`${nonce}`}</Typography>
        <Box className={css.alignItemsWithMargin}>
          <Typography>
            These transactions conflict as they use the same nonce. Executing one will automatically replace the
            other(s).{' '}
          </Typography>
        </Box>

        <Link
          href="https://help.gnosis-safe.io/en/articles/4730252-why-are-transactions-with-the-same-nonce-conflicting-with-each-other"
          target="_blank"
          rel="noreferrer"
          title="Why are transactions with the same nonce conflicting with each other?"
        >
          <Box className={css.alignItemsWithMargin}>
            Learn more
            <OpenInNewRoundedIcon fontSize="small" />
          </Box>
        </Link>
      </Box>
    </Paper>
  )
}

export default ConflictHeader
