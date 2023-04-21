import { BROWSER_PERMISSIONS_KEY, SAFE_PERMISSIONS_KEY } from './constants'
import { TEST_SAFE } from './constants'

let $dapps = []

describe('The Safe Apps permissions settings section', () => {
  before(() => {
    cy.on('window:before:load', (window) => {
      window.localStorage.setItem(
        BROWSER_PERMISSIONS_KEY,
        JSON.stringify({
          'https://app1.com': [
            { feature: 'camera', status: 'granted' },
            { feature: 'fullscreen', status: 'granted' },
            { feature: 'geolocation', status: 'granted' },
          ],
          'https://app2.com': [{ feature: 'microphone', status: 'granted' }],
          'https://app3.com': [{ feature: 'camera', status: 'denied' }],
        }),
      )
      window.localStorage.setItem(
        SAFE_PERMISSIONS_KEY,
        JSON.stringify({
          'https://app2.com': [
            {
              invoker: 'https://app1.com',
              parentCapability: 'requestAddressBook',
              date: 1666103778276,
              caveats: [],
            },
          ],
          'https://app4.com': [
            {
              invoker: 'https://app3.com',
              parentCapability: 'requestAddressBook',
              date: 1666103787026,
              caveats: [],
            },
          ],
        }),
      )
    })

    cy.visit(`${TEST_SAFE}/settings/safe-apps`, { failOnStatusCode: false })
    cy.findByText(/accept selection/i).click()
  })

  it('should show the permissions configuration for each stored app', () => {
    cy.findAllByRole('heading', { level: 5 }).should('have.length', 4)
  })

  describe('For each app', () => {
    before(() => {
      cy.get('main .MuiPaper-root > .MuiGrid-item').then((items) => {
        $dapps = items
      })
    })

    it('app1 should have camera, full screen and geo permissions', () => {
      cy.wrap($dapps[0])
        .findByText(/https:\/\/app1.com/i)
        .should('exist')
      cy.wrap($dapps[0])
        .findByText(/camera/i)
        .should('exist')
      cy.wrap($dapps[0])
        .findByText(/fullscreen/i)
        .should('exist')
      cy.wrap($dapps[0])
        .findByText(/geolocation/i)
        .should('exist')

      cy.wrap($dapps[0]).findAllByRole('checkbox').should('have.checked')
    })

    it('app2 should have address book and microphone permissions', () => {
      cy.wrap($dapps[1])
        .findByText(/https:\/\/app2.com/i)
        .should('exist')
      cy.wrap($dapps[1])
        .findByText(/address book/i)
        .should('exist')
      cy.wrap($dapps[1])
        .findByText(/microphone/i)
        .should('exist')

      cy.wrap($dapps[1]).findAllByRole('checkbox').should('have.checked')
    })

    it('app3 should have camera permissions', () => {
      cy.wrap($dapps[2])
        .findByText(/https:\/\/app3.com/i)
        .should('exist')
      cy.wrap($dapps[2])
        .findByText(/camera/i)
        .should('exist')

      cy.wrap($dapps[2])
        .findByLabelText(/camera/i)
        .should('have.not.checked')
    })

    it('app4 should have address book permissions', () => {
      cy.wrap($dapps[3])
        .findByText(/https:\/\/app4.com/i)
        .should('exist')
      cy.wrap($dapps[3])
        .findByText(/address book/i)
        .should('exist')

      cy.wrap($dapps[3])
        .findByLabelText(/address book/i)
        .should('have.checked')
    })

    it('should allow to allow all or clear all the checkboxes at once', () => {
      cy.wrap($dapps[1])
        .findByText(/clear all/i)
        .click()
      cy.wrap($dapps[1]).findAllByRole('checkbox').should('have.not.checked')

      cy.wrap($dapps[1])
        .findByText(/allow all/i)
        .click()
      cy.wrap($dapps[1]).findAllByRole('checkbox').should('have.checked')
    })

    it('should allow to remove apps and reflect it in the localStorage', () => {
      cy.wrap($dapps[0]).find('svg').last().click()
      cy.wrap($dapps[2])
        .find('svg')
        .last()
        .click()
        .should(() => {
          const storedBrowserPermissions = JSON.parse(localStorage.getItem(BROWSER_PERMISSIONS_KEY))
          const browserPermissions = Object.values(storedBrowserPermissions)

          expect(browserPermissions).to.have.length(1)
          expect(browserPermissions[0][0].feature).to.eq('microphone')
          expect(browserPermissions[0][0].status).to.eq('granted')

          const storedSafePermissions = JSON.parse(localStorage.getItem(SAFE_PERMISSIONS_KEY))
          const safePermissions = Object.values(storedSafePermissions)

          expect(safePermissions).to.have.length(2)
          expect(safePermissions[0][0].parentCapability).to.eq('requestAddressBook')
          expect(safePermissions[1][0].parentCapability).to.eq('requestAddressBook')
        })
    })
  })
})
