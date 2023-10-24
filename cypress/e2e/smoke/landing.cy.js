import * as constants from '../../support/constants'
describe('Landing page tests', () => {
  it('Verify a user will be redirected to welcome page [C56116]', () => {
    cy.clearLocalStorage()
    cy.visit('/')
    cy.url().should('include', constants.welcomeUrl)
  })
})
