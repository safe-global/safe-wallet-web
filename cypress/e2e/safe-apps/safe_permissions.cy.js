const RINKEBY_TEST_SAFE = 'rin:0x4483bAaB2c2EB667f0541464266a1c1a8778151a'
const appUrl = 'https://safe-test-app.com'

describe('The Safe permissions system', () => {
  beforeEach(() => {
    cy.fixture('safe-app').then((html) => {
      cy.intercept('GET', `${appUrl}/*`, html)
      cy.intercept('GET', `*/manifest.json`, {
        name: 'Cypress Test App',
        description: 'Cypress Test App Description',
        iconPath: 'http://via.placeholder.com/32',
      })
    })
  })

  describe('When requesting permissions with wallet_requestPermissions', () => {
    it('should show the permissions prompt and return the permissions on accept', () => {
      cy.visitSafeApp(`${appUrl}/request-permissions`)

      cy.contains('Permissions Request').should('be.visible')
      cy.contains(`${appUrl} is requesting permissions for`).should('be.visible')
      cy.contains('Access to your address book').should('be.visible')

      cy.contains('Accept').click()

      cy.get('@safeAppsMessage').should('have.been.calledWithMatch', {
        data: [
          {
            invoker: 'https://safe-test-app.com',
            parentCapability: 'requestAddressBook',
            date: Cypress.sinon.match.number,
            caveats: [],
          },
        ],
      })
    })
  })

  describe('When trying to get the current permissions with wallet_getPermissions', () => {
    it('should return the current permissions', () => {
      cy.on('window:before:load', (window) => {
        window.localStorage.setItem(
          'SAFE_v2__SAFE_PERMISSIONS',
          JSON.stringify({
            [appUrl]: [
              {
                invoker: appUrl,
                parentCapability: 'requestAddressBook',
                date: 1111111111111,
                caveats: [],
              },
            ],
          }),
        )
      })

      cy.visitSafeApp(`${appUrl}/get-permissions`)

      cy.get('@safeAppsMessage').should('have.been.calledWithMatch', {
        data: [
          {
            invoker: appUrl,
            parentCapability: 'requestAddressBook',
            date: Cypress.sinon.match.number,
            caveats: [],
          },
        ],
      })
    })
  })
})
