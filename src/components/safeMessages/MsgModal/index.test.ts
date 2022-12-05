import * as gateway from '@gnosis.pm/safe-react-gateway-sdk'

import { _isSafeMessageProposal } from '@/components/safeMessages/MsgModal/index'

describe('MsgModal', () => {
  describe('isSafeMessageProposal', () => {
    it('should return true for a Safe message proposal', () => {
      jest.spyOn(gateway, 'getSafeMessage').mockImplementation(() => Promise.reject())
      expect(_isSafeMessageProposal('1', '0x123')).resolves.toBe(true)
    })
    it('should return false for a Safe message confirmation', () => {
      jest
        .spyOn(gateway, 'getSafeMessage')
        .mockImplementation(() => Promise.resolve({} as Omit<gateway.SafeMessage, 'type'>))
      expect(_isSafeMessageProposal('1', '0x123')).resolves.toBe(false)
    })
  })
})
