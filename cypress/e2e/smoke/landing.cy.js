describe('Landing page', () => {
  it('redirects to welcome page', () => {
    cy.visit('/')

    cy.url().should('include', '/welcome')
  })

  it('features discoverability cookies', () => {
    cy.visit('/')

    let preferencesModal = cy.contains('We use cookies to provide').parent()

    preferencesModal.contains('Accept selection').click()
    preferencesModal.should('not.exist')

    cy.contains("What's New").click()

    //The modal was closed, so the element has to be set again
    preferencesModal = cy.contains('We use cookies to provide').parent()

    preferencesModal.contains('accept the "Updates & Feedback"')

    //TODO: understand why after every contains the next search is on the child instead of the current DOM object.
    //Solved for now "going back" to the parent every time
    preferencesModal.parent().contains('Updates (Beamer)').click()
    preferencesModal.parent().contains('Accept selection').click()
    preferencesModal.should('not.exist')

    // Open the features discoverability section
    // cy.wait(3000) // TODO: wait for Beamer cookies to be set
    // cy.contains("What's New").click()
    // cy.get('#beamerOverlay .iframeCointaner').should('exist')
  })
})
