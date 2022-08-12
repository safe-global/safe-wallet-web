describe('Landing page', () => {
  it('redirects to welcome page', () => {
    cy.visit('/')

    cy.url().should('include', '/app/welcome')
  })

  it('features discoverability cookies', () => {
    cy.visit('/')

    cy.findByTestId('cookies-banner-form').contains('We use cookies to provide you with the best experience')

    cy.findByTestId('cookies-banner-form').contains('Accept selection').click()

    cy.findByTestId('cookies-banner-form').should('not.exist')

    cy.contains("What's new").click()

    cy.findByTestId('cookies-banner-form').contains('We use cookies to provide you with the best experience')
    cy.findByTestId('cookies-banner-form').contains('Please accept the community support & updates cookies.')

    cy.findByTestId('cookies-banner-form').contains('Community support & updates').click()
    cy.findByTestId('cookies-banner-form').contains('Accept selection').click()
    cy.findByTestId('cookies-banner-form').should('not.exist')

    // Open the features discoverability section
    cy.wait(3000) // TODO: wait for Beamer cookies to be set
    cy.contains("What's new").click()
    cy.get('#beamerOverlay .iframeCointaner').should('exist')
  })
})
