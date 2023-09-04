import { TEST_SAFE } from './constants'

describe('The Safe Apps info modal', () => {
  before(() => {
    cy.visit(`/${TEST_SAFE}/apps`, { failOnStatusCode: false })
    cy.findByText(/accept selection/i).click()
  })

  describe('when opening a Safe App from the app list', () => {
    it('should show the preview drawer', () => {
      cy.findByRole('link', { name: /logo.*walletconnect/i }).click()
      cy.findByRole('presentation').within((presentation) => {
        cy.findByRole('heading', { name: /walletconnect/i }).should('exist')
        cy.findByText('Connect your Safe to any dApp that supports WalletConnect').should('exist')
        cy.findByText(/available networks/i).should('exist')
        cy.findByLabelText(/pin walletconnect/i).click()
        cy.findByLabelText(/unpin walletconnect/i)
          .should('exist')
          .click()
        cy.findByLabelText(/pin walletconnect/i).should('exist')
        cy.findByLabelText(/close walletconnect preview/i).click()
      })
      cy.findByRole('presentation').should('not.exist')
    })
  })
})
