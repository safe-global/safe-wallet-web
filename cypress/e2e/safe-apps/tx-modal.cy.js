const RINKEBY_TEST_SAFE = 'rin:0x11Df0fa87b30080d59eba632570f620e37f2a8f7'
const appUrl = 'https://safe-test-app.vercel.app/'

describe('Safe Apps List', () => {
  before(() => {
    cy.on('window:before:load', (window) => {
      // Does not work unless `JSON.stringify` is used
      window.localStorage.setItem(
        'SAFE_v2__SAFE_APPS_INFO_MODAL',
        JSON.stringify({
          4: { consentsAccepted: true },
        }),
      )
      window.localStorage.setItem(
        'SAFE_v2__BROWSER_PERMISSIONS',
        JSON.stringify({
          'https://safe-test-app.vercel.app/': [
            { feature: 'camera', status: 'granted' },
            { feature: 'fullscreen', status: 'granted' },
            { feature: 'geolocation', status: 'granted' },
          ],
        }),
      )
    })
    cy.connectE2EWallet()
    cy.visit(`/${RINKEBY_TEST_SAFE}/apps?appUrl=${encodeURIComponent(appUrl)}`, {
      failOnStatusCode: false,
    })
    cy.contains('button', 'Accept selection').click()
  })

  describe('When creating a transaction from an app', () => {
    it('should show the transaction popup', () => {
      cy.frameLoaded('iframe[id*="iframe"]')
      cy.wait(2000)
      cy.enter('iframe[id*="iframe"]').then((getBody) => {
        getBody().contains('Trigger dummy tx (safe.txs.send)').click()
      })
    })
  })
})
