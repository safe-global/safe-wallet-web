import * as constants from '../../support/constants'
describe('Landing page tests', () => {
  it('Verify a user will be redirected to welcome page ', () => {
    cy.clearLocalStorage()
    cy.visit('/')
    cy.url().should('include', constants.welcomeUrl)
  })
})
