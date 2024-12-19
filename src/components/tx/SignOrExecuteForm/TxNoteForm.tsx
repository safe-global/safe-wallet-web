import { useState } from 'react'
import { Button, Stack, TextField, Typography } from '@mui/material'
import TxCard from '@/components/tx-flow/common/TxCard'

const TxNoteForm = ({ onSubmit }: { onSubmit: (note: string) => void }) => {
  const [note, setNote] = useState('')

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const value = formData.get('note') as string
    if (value) {
      onSubmit(value)
      setNote(value)
    }
  }

  return (
    <TxCard>
      <form onSubmit={onFormSubmit}>
        <Typography variant="h6">Add a note</Typography>

        <TextField name="note" label="Transaction description" fullWidth margin="normal" disabled={!!note} />

        <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-end" sx={{ mt: 1 }}>
          <Typography variant="caption" flex={1}>
            Attention: transaction notes are public
          </Typography>
          {note && <Typography variant="body2">Note added</Typography>}
          <Button variant="outlined" type="submit" disabled={!!note}>
            Add note
          </Button>
        </Stack>
      </form>
    </TxCard>
  )
}

export default TxNoteForm
