import * as constants from '../../support/constants'
describe('Landing page', () => {
  it('redirects to welcome page', () => {
    cy.visit('/')
    cy.url().should('include', constants.welcomeUrl)
  })
})
