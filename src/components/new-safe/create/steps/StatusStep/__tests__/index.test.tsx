import { SafeCreationStatus } from '@/components/new-safe/create/steps/StatusStep/useSafeCreation'
import { render } from '@/tests/test-utils'
import { CreateSafeStatus } from '@/components/new-safe/create/steps/StatusStep'
import { type NewSafeFormData } from '@/components/new-safe/create'
import * as useSafeCreation from '@/components/new-safe/create/steps/StatusStep/useSafeCreation'

describe('StatusStep', () => {
  it('should call useSafeCreation with PROCESSING status if relaying', () => {
    const useSafeCreationSpy = jest.spyOn(useSafeCreation, 'useSafeCreation')

    render(
      <CreateSafeStatus
        data={{ willRelay: true } as NewSafeFormData}
        onSubmit={() => {}}
        onBack={() => {}}
        setStep={() => {}}
      />,
    )

    expect(useSafeCreationSpy).toHaveBeenCalledWith(
      undefined,
      expect.anything(),
      SafeCreationStatus.PROCESSING,
      expect.anything(),
      true,
    )
  })
})
