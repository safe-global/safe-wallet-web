import * as constants from '../../support/constants'

describe('Beamer', () => {
  it('should require accept "Updates" cookies to display Beamer', () => {
    // Disable PWA, otherwise it will throw a security error
    cy.visit(`/address-book?safe=${constants.GOERLI_TEST_SAFE}`)

    // Way to select the cookies banner without an id
    cy.contains('Accept selection').click()

    // Open What's new
    cy.contains("What's new").click()

    // Tells that the user has to accept "Beamer" cookies
    cy.contains('accept the "Beamer" cookies')

    // "Beamer" is checked when the banner opens
    cy.get('input[id="beamer"]').should('be.checked')
    // Accept "Updates & Feedback" cookies
    cy.contains('Accept selection').click()
    cy.contains('Accept selection').should('not.exist')

    // wait for Beamer cookies to be set
    cy.wait(600)

    // Open What's new
    cy.contains("What's new").click({ force: true }) // clicks through the "lastPostTitle"

    cy.get('#beamerOverlay .iframeCointaner').should('exist')
  })
})
