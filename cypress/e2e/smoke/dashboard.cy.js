const SAFE = 'rin:0xB5ef359e8eBDAd1cd7695FFEF3f6F6D7d5e79B08'

describe('Dashboard', () => {
  before(() => {
    // Go to the test Safe home page
    cy.visit(`/${SAFE}/home`, { failOnStatusCode: false })
    cy.contains('button', 'Accept selection').click()
  })

  it('should display the dashboard title', () => {
    cy.contains('main p', 'Dashboard')
  })

  it('should display the overview widget', () => {
    cy.contains('main', SAFE).should('exist')
    cy.contains('main', '1/1')
    cy.get(`main a[href="/balances?safe=${SAFE}"] button`).contains('View assets')
    cy.get(`main a[href="/balances?safe=${SAFE}"]`).contains('Tokens3')
  })

  // it('should display the mobile banner', () => {
  //   const appStoreLink =
  //     'https://apps.apple.com/app/apple-store/id1515759131?pt=119497694&ct=Web%20App%20Dashboard&mt=8'
  //   cy.get(`a[href="${appStoreLink}"]`).should('exist')

  //   cy.get('button[aria-label="Close mobile banner"]').click()
  //   cy.contains('button', 'Already use it!')
  //   cy.contains('button', 'Not interested').click()

  //   cy.get(`a[href="${appStoreLink}"]`).should('not.exist')
  // })

  it('should display the tx queue widget', () => {
    cy.contains('main', 'This Safe has no queued transactions').should('not.exist')

    // Queued txns
    cy.contains(`main a[href="/transactions/queue?safe=${SAFE}"]`, '0' + 'addOwnerWithThreshold' + '1/1').should(
      'exist',
    )

    cy.contains(`main a[href="/transactions/queue?safe=${SAFE}"]`, '2' + 'Send' + '-0.001 USDC' + '1/1').should('exist')

    cy.contains(`a[href="/transactions/queue?safe=${SAFE}"]`, 'View all')
  })

  it('should display the featured Safe Apps', () => {
    cy.contains('main h2', 'Connect & transact')

    // Tx Builder app
    cy.contains('main p', 'Use Transaction Builder')
    cy.get(`a[href*='tx-builder']`).should('exist')

    // WalletConnect app
    cy.contains('main p', 'Use WalletConnect')
    cy.get(`a[href*='wallet-connect']`).should('exist')

    // Featured apps have a Safe-specific link
    cy.get(`main section#featured-safe-apps a[href*="?appUrl=http"]`).should('have.length', 2)
  })

  it('should show the Safe Apps widget', () => {
    cy.contains('main section h2', 'Safe Apps')
    cy.contains('main section ', 'Explore Safe Apps')

    // Regular safe apps
    cy.get(`main section a[href^="/apps?safe=${SAFE}&appUrl=http"]`).should('have.length', 5)
  })
})
