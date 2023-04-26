import { TEST_SAFE } from './constants'

describe('The Safe Apps list', () => {
  before(() => {
    cy.visit(`/${TEST_SAFE}/apps`, { failOnStatusCode: false })
    cy.findByText(/accept selection/i).click()
  })

  describe('When searching apps', () => {
    it('should filter the list by app name', () => {
      // Wait for /safe-apps response
      cy.intercept('GET', '/**/safe-apps').then(() => {
        cy.findByRole('textbox').type('walletconnect')
        cy.findAllByRole('link', { name: /logo/i }).should('have.length', 1)
      })
    })

    it('should filter the list by app description', () => {
      cy.findByRole('textbox').clear().type('compose custom contract')
      cy.findAllByRole('link', { name: /logo/i }).should('have.length', 1)
    })

    it('should show a not found text when no match', () => {
      cy.findByRole('textbox').clear().type('atextwithoutresults')
      cy.findByText(/no Safe Apps found/i).should('exist')
    })
  })

  describe('When browsing the apps list', () => {
    it('should allow to pin apps', () => {
      cy.findByRole('textbox').clear()
      cy.findByLabelText(/pin walletconnect/i).click()
      cy.findByLabelText(/pin transaction builder/i).click()
      cy.findByText(/bookmarked Apps/i).click()
      cy.findByText('ALL (2)').should('exist')
    })

    it('should allow to unpin apps', () => {
      cy.findAllByLabelText(/unpin walletConnect/i)
        .first()
        .click()
      cy.findAllByLabelText(/unpin transaction builder/i)
        .first()
        .click()
      cy.findByText('ALL (0)').should('exist')
    })
  })

  describe('When adding a custom app', () => {
    it('should show an error when the app manifest is invalid', () => {
      cy.intercept('GET', 'https://my-invalid-custom-app.com/manifest.json', {
        name: 'My Custom App',
      })
      cy.findByText(/my custom Apps/i).click()
      cy.findByText(/add custom Safe App/i).click({ force: true })
      cy.findByLabelText(/Safe App url/i)
        .clear()
        .type('https://my-invalid-custom-app.com')
      cy.contains("The app doesn't support Safe App functionality").should('exist')
    })

    it('should be added to the list within the custom apps section', () => {
      cy.intercept('GET', 'https://my-valid-custom-app.com/manifest.json', {
        name: 'My Custom App',
        description: 'My Custom App Description',
        icons: [{ src: 'logo.svg', sizes: 'any', type: 'image/svg+xml' }],
      })

      cy.findByLabelText(/Safe App url/i)
        .clear()
        .type('https://my-valid-custom-app.com')
      cy.findByRole('heading', { name: /my custom app/i }).should('exist')
      cy.findByRole('checkbox').click()
      cy.findByRole('button', { name: /add/i }).click()
      cy.findByText('ALL (1)').should('exist')
      cy.findByText(/my custom app description/i).should('exist')
    })
  })
})
