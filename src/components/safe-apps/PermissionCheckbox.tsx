import { Checkbox, FormControlLabel } from '@mui/material'

type PermissionsCheckboxProps = {
  label: string
  name: string
  checked: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void
}

const PermissionsCheckbox = ({ label, checked, onChange, name }: PermissionsCheckboxProps): React.ReactElement => (
  <FormControlLabel
    sx={({ palette }) => ({
      flex: 1,
      '.MuiIconButton-root:not(.Mui-checked)': {
        color: palette.text.disabled,
      },
    })}
    control={<Checkbox checked={checked} onChange={onChange} name={name} />}
    label={label}
  />
)

export default PermissionsCheckbox
