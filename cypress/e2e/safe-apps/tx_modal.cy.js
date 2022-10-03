const RINKEBY_TEST_SAFE = 'rin:0x4483bAaB2c2EB667f0541464266a1c1a8778151a'
const appUrl = 'http://safe-test-app'

describe('Safe Apps List', () => {
  before(() => {
    cy.fixture('safe-app').then((html) => {
      cy.intercept('GET', `${appUrl}/*`, html)
      cy.intercept('GET', `*/manifest.json`, {
        name: 'Cypress Test App',
        description: 'Cypress Test App Description',
        iconPath: 'http://via.placeholder.com/32',
      })
    })

    cy.on('window:before:load', (window) => {
      // Does not work unless `JSON.stringify` is used
      window.localStorage.setItem(
        'SAFE_v2__SAFE_APPS_INFO_MODAL',
        JSON.stringify({
          4: { consentsAccepted: true },
        }),
      )
    })
    cy.visit(`/${RINKEBY_TEST_SAFE}/apps?appUrl=${encodeURIComponent(appUrl + '/dummy')}`, {
      failOnStatusCode: false,
    })
    cy.contains('button', 'Accept selection').click()
  })

  describe('When creating a transaction from an app', () => {
    it('should show the transaction popup', () => {
      cy.contains('Cypress Test App').should('be.visible')
    })
  })
})
