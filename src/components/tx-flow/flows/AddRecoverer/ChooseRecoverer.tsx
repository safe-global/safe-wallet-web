import { FormControl, Button, CardActions, Divider } from '@mui/material'
import { useForm, FormProvider } from 'react-hook-form'
import type { ReactElement } from 'react'

import AddressBookInput from '@/components/common/AddressBookInput'
import type { AddRecovererFlowProps } from '.'
import TxCard from '../../common/TxCard'
import commonCss from '@/components/tx-flow/common/styles.module.css'

export const ChooseRecoverer = ({
  params,
  onSubmit,
}: {
  params: AddRecovererFlowProps
  onSubmit: (data: AddRecovererFlowProps) => void
}): ReactElement => {
  const formMethods = useForm<AddRecovererFlowProps>({
    defaultValues: params,
    mode: 'onChange',
  })

  /**
   * TODO: Validation
   * - Valid address
   * - Not already added
   * - Owner of Safe
   * - Safe itself
   * - Module itself
   */

  return (
    <TxCard>
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(onSubmit)} className={commonCss.form}>
          <FormControl fullWidth>
            <AddressBookInput name="recoverer" label="Owner address or ENS" required />
          </FormControl>

          <Divider className={commonCss.nestedDivider} />

          <CardActions>
            <Button variant="contained" type="submit">
              Next
            </Button>
          </CardActions>
        </form>
      </FormProvider>
    </TxCard>
  )
}
