const RINKEBY_TEST_SAFE = 'rin:0xFfDC1BcdeC18b1196e7FA04246295DE3A17972Ac'
const intercomIframe = 'iframe[id="intercom-frame"]'
const intercomButton = '[aria-label="Open Intercom Messenger"]'
const fakeIntercomButton = 'img[alt="Open Intercom"]'

describe('Intercom and cookie prefs', () => {
  it('should show the Intercom chat if cookies are enabled', () => {
    cy.visit('/')

    // Don't accept Intercom cookies
    cy.contains('a', 'Accept selection').click()

    // Click on the Intercom button
    cy.get(fakeIntercomButton).click()

    // Cookie preferences appear
    cy.contains(
      'You attempted to open the customer support chat. Please accept the community support & updates cookies',
    )

    cy.contains('a', 'Accept all').click()

    // Intercom is now active
    cy.get(intercomIframe).should('exist')
    cy.get(fakeIntercomButton).should('not.exist')
    cy.get(intercomButton).click()
    cy.get('#intercom-container').should('exist')

    // Intercom should be disabled on a Safe App page
    cy.visit(`/${RINKEBY_TEST_SAFE}/apps?appUrl=https://safe-apps.dev.gnosisdev.com/drain-safe`)
    cy.get(intercomButton).should('not.exist')

    // Go to Settings and change the cookie settings
    cy.visit(`/${RINKEBY_TEST_SAFE}/settings`)
    cy.get(intercomIframe).should('exist')
    cy.contains('button', 'Preferences').click()
    cy.contains('Community support & updates').click()
    cy.contains('a', 'Accept selection').click()

    // Intercom should be now disabled
    cy.get(intercomButton).should('not.exist')
    cy.get(fakeIntercomButton).should('be.visible')
  })
})
