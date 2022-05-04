import { Button, DialogActions, DialogContent } from '@mui/material'
import css from './styles.module.css'

export const SubmitOwnerTxStep = ({ onBack }: { onBack: () => void }) => {
  return (
    <>
      <DialogContent></DialogContent>
      <DialogActions className={css.dialogFooter}>
        <Button onClick={onBack}>Back</Button>
        <Button variant="contained">Submit</Button>
      </DialogActions>
    </>
  )
}
