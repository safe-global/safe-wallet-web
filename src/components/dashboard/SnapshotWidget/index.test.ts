import { _getProposalNumber, _getProposalTitle } from '.'

describe('SnapshotWidget', () => {
  describe('getProposalNumber', () => {
    it('should return proposal numbers from differently formatted titles', () => {
      const proposalNumber = _getProposalNumber('SEP #1: SafeDAO Participation Agreement')
      expect(proposalNumber).toBe('SEP #1')

      const proposalNumber2 = _getProposalNumber(
        '[SEP #2] Community Initiative To Unpause Token Contract (Enabling Transferability)',
      )
      expect(proposalNumber2).toBe('SEP #2')
    })
  })
  describe('getProposalTitle', () => {
    it('should strip differently formatted proposal numbers', () => {
      const proposalNumber = _getProposalTitle('SEP #1: SafeDAO Participation Agreement')
      expect(proposalNumber).toBe('SafeDAO Participation Agreement')

      const proposalNumber2 = _getProposalTitle(
        '[SEP #2] Community Initiative To Unpause Token Contract (Enabling Transferability)',
      )
      expect(proposalNumber2).toBe('Community Initiative To Unpause Token Contract (Enabling Transferability)')
    })
  })
})
