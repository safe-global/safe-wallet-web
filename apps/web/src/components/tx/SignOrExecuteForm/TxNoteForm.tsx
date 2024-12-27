import { useCallback, useState } from 'react'
import { InputAdornment, Stack, TextField, Typography } from '@mui/material'
import TxCard from '@/components/tx-flow/common/TxCard'
import InfoIcon from '@/public/images/notifications/info.svg'

const MAX_NOTE_LENGTH = 120

const TxNoteForm = ({ onSubmit }: { onSubmit: (note: string) => void }) => {
  const [note, setNote] = useState('')

  const onInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNote(e.target.value)
  }, [])

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSubmit(e.target.value.slice(0, MAX_NOTE_LENGTH))
    },
    [onSubmit],
  )

  return (
    <TxCard>
      <Stack direction="row" alignItems="center" gap={1}>
        <Typography variant="h5">What does this transaction do?</Typography>
        <Typography variant="body2" color="text.secondary">
          Optional
        </Typography>
      </Stack>

      <TextField
        name="note"
        label="Add description"
        fullWidth
        slotProps={{
          htmlInput: { maxLength: MAX_NOTE_LENGTH },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <Typography variant="caption" mt={3}>
                  {note.length}/{MAX_NOTE_LENGTH}
                </Typography>
              </InputAdornment>
            ),
          },
        }}
        onInput={onInput}
        onChange={onChange}
      />

      <Typography variant="caption" color="text.secondary" display="flex" alignItems="center">
        <InfoIcon height="1.2em" />
        This description will be publicly visible and accessible to anyone.
      </Typography>
    </TxCard>
  )
}

export default TxNoteForm
