const RINKEBY_TEST_SAFE = 'rin:0x11Df0fa87b30080d59eba632570f620e37f2a8f7'

describe('Safe Apps List', () => {
  before(() => {
    cy.visit(`/${RINKEBY_TEST_SAFE}/apps`, { failOnStatusCode: false })
    cy.contains('button', 'Accept selection').click()
  })

  describe('When searching apps', () => {
    it('should filter the list by app name', () => {
      cy.get('input[type="text"]').type('walletconnect')
      cy.get('main').find('a[rel=noreferrer]').should('have.length', 1)
    })
    it('should filter the list by app description', () => {
      cy.get('input[type="text"]').clear().type('a safe app to compose custom transactions')
      cy.get('main').find('a[rel=noreferrer]').should('have.length', 1)
    })
  })

  describe('When browsing the apps list', () => {
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

  describe('When adding a custom app', () => {
    it('should show an error when the app manifest is invalid', () => {
      cy.intercept('GET', 'https://my-invalid-custom-app.com/manifest.json', {
        name: 'My Custom App',
      })
      cy.contains('Add custom app').click({ force: true })
      cy.get('input[name="appUrl"]').clear().type('https://my-invalid-custom-app.com')
      cy.contains("The app doesn't support Safe App functionality").should('be.visible')
    })

    it('should be appended to the list in the custom apps section', () => {
      cy.intercept('GET', 'https://my-valid-custom-app.com/manifest.json', {
        name: 'My Custom App',
        description: 'My Custom App Description',
        iconPath: 'http://via.placeholder.com/32',
      })
      cy.get('input[name="appUrl"]').clear().type('https://my-valid-custom-app.com')
      cy.get('input[disabled]').should('have.value', 'My Custom App')
      cy.get('input[name="riskAcknowledgement"]').click()
      cy.get('button[type="submit"]').click()
      cy.contains('Pinned apps (0)').should('be.visible')
    })
  })
})
