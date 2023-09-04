import { SAFE_PERMISSIONS_KEY } from './constants'
const appUrl = 'https://safe-test-app.com'

describe('The Safe permissions system', () => {
  beforeEach(() => {
    cy.fixture('safe-app').then((html) => {
      cy.intercept('GET', `${appUrl}/*`, html)
      cy.intercept('GET', `*/manifest.json`, {
        name: 'Cypress Test App',
        description: 'Cypress Test App Description',
        icons: [{ src: 'logo.svg', sizes: 'any', type: 'image/svg+xml' }],
      })
    })
  })

  describe('When requesting permissions with wallet_requestPermissions', () => {
    it('should show the permissions prompt and return the permissions on accept', () => {
      cy.visitSafeApp(`${appUrl}/request-permissions`)

      cy.findByRole('heading', { name: /permissions request/i }).should('exist')
      cy.findByText(/access to your address book/i).should('exist')

      cy.findByRole('button', { name: /accept/i }).click()

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
          SAFE_PERMISSIONS_KEY,
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
