const RINKEBY_TEST_SAFE = 'rin:0x11Df0fa87b30080d59eba632570f620e37f2a8f7'

describe('Safe Apps List', () => {
  before(() => {
    cy.visit(`/${RINKEBY_TEST_SAFE}/apps`, { failOnStatusCode: false })
    cy.contains('button', 'Accept selection').click()
  })

  describe('When adding text to the search input', () => {
    it('should filter the list by app name', () => {
      cy.get('input[type="text"]').type('walletconnect')
      cy.get('main').find('a[rel=noreferrer]').should('have.length', 1)
    })
    it('should filter the list by app description', () => {
      cy.get('input[type="text"]').clear().type('a safe app to compose custom transactions')
      cy.get('main').find('a[rel=noreferrer]').should('have.length', 1)
    })
  })

  describe('When adding text to the search input', () => {
    it('should allow to pin apps', () => {
      cy.get('input[type="text"]').clear()
      cy.get('[aria-label="Pin WalletConnect"]').click()
      cy.get('[aria-label="Pin Transaction Builder"]').click()
      cy.contains('Pinned apps (2)').should('be.visible')
    })

    it('should allow to unpin apps', () => {
      cy.get('[aria-label="Unpin WalletConnect"]').first().click()
      cy.get('[aria-label="Unpin Transaction Builder"]').first().click()
      cy.contains('Pinned apps (0)').should('be.visible')
    })
  })
})
