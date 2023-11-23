import { Button, Grid, Paper, SvgIcon, Typography } from '@mui/material'
import { VisibilityOutlined } from '@mui/icons-material'
import { useState } from 'react'
import type { ReactElement } from 'react'

import ExternalLink from '@/components/common/ExternalLink'
import AddEmailDialog from './AddEmailDialog'
import EditIcon from '@/public/images/common/edit.svg'

import css from './styles.module.css'

export function RecoveryEmail(): ReactElement {
  const [addEmail, setAddEmail] = useState(false)

  const onAdd = () => {
    setAddEmail(true)
  }

  const onReveal = () => {
    // TODO: Implement
  }

  const onChange = () => {}

  const onClose = () => {}

  const randomString = Math.random().toString(36)

  return (
    <>
      <Paper sx={{ p: 4, mb: 2 }}>
        <Grid container spacing={3}>
          <Grid item sm={4} xs={12}>
            <Typography variant="h4" fontWeight={700}>
              Recovery email
            </Typography>
          </Grid>

          <Grid item xs>
            <Typography mb={2}>
              Receive important notifications about recovery attempts and their status. No spam. We promise!{' '}
              {/* TODO: Add link */}
              <ExternalLink href="#">Learn more</ExternalLink>
            </Typography>

            <div className={css.display}>
              <div className={css.email}>
                <VisibilityOutlined fontSize="small" />
                <Typography variant="body2" fontWeight={700}>
                  {randomString + randomString}
                </Typography>
                <div className={css.blur} />
              </div>

              <div className={css.buttons}>
                <Button
                  onClick={onReveal}
                  variant="contained"
                  size="small"
                  startIcon={<VisibilityOutlined />}
                  className={css.button}
                  disableElevation
                >
                  Reveal
                </Button>
                <Button
                  onClick={onChange}
                  variant="contained"
                  size="small"
                  startIcon={<SvgIcon component={EditIcon} inheritViewBox />}
                  className={css.button}
                  disableElevation
                >
                  Change
                </Button>
              </div>
            </div>

            <Button variant="contained" onClick={onAdd}>
              Add email address
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <AddEmailDialog open={addEmail} onClose={onClose} />
    </>
  )
}
