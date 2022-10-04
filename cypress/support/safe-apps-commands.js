const TEST_SAFE = 'rin:0x4483bAaB2c2EB667f0541464266a1c1a8778151a'

Cypress.Commands.add('visitSafeApp', (appUrl, testSafe = TEST_SAFE) => {
  cy.on('window:before:load', (window) => {
    // Does not work unless `JSON.stringify` is used
    window.localStorage.setItem(
      'SAFE_v2__SAFE_APPS_INFO_MODAL',
      JSON.stringify({
        4: { consentsAccepted: true },
      }),
    )
  })

  cy.visit(`/${testSafe}/apps?appUrl=${encodeURIComponent(appUrl)}`, {
    failOnStatusCode: false,
    onBeforeLoad: (win) => {
      win.addEventListener('message', cy.stub().as('safeAppsMessage'))
    },
  })
})
