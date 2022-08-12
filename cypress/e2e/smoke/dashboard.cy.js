const SAFE = 'rin:0xB5ef359e8eBDAd1cd7695FFEF3f6F6D7d5e79B08'

describe('Dashboard', () => {
  before(() => {
    // Go to the test Safe home page
    cy.visit(`/${SAFE}/home`)
    cy.contains('a', 'Accept selection').click()
  })

  it('should display the dashboard title', () => {
    cy.contains('main h1', 'Dashboard')
  })

  it('should display the overview widget', () => {
    cy.contains('main p', SAFE).should('exist')
    cy.contains('main', '1/1')
    cy.get(`main a[href="/app/${SAFE}/balances"] button`).contains('View Assets')
    cy.get(`main a[href="/app/${SAFE}/balances"]`).contains('Tokens3')
    cy.contains(`main a[href="/app/${SAFE}/balances/nfts"]`, 'NFTs0')
  })

  it('should display the mobile banner', () => {
    const appStoreLink =
      'https://apps.apple.com/app/apple-store/id1515759131?pt=119497694&ct=Web%20App%20Dashboard&mt=8'
    cy.get(`a[href="${appStoreLink}"]`).should('exist')

    cy.get('button[aria-label="Close mobile banner"]').click()
    cy.contains('button', 'Already use it!')
    cy.contains('button', 'Not interested').click()

    cy.get(`a[href="${appStoreLink}"]`).should('not.exist')
  })

  it('should display the tx queue widget', () => {
    cy.contains('main', 'This Safe has no queued transactions').should('not.exist')

    // Queued txns
    cy.contains(`main a[href="/app/${SAFE}/transactions/queue"]`, '0' + 'addOwnerWithThreshold' + '1/1').should('exist')

    cy.contains(`main a[href="/app/${SAFE}/transactions/queue"]`, '2' + 'Send' + '-0.001 USDC' + '1/1').should('exist')

    cy.contains(`a[href="/app/${SAFE}/transactions/queue"]`, 'View All')
  })

  it('should display the featured Safe Apps', () => {
    cy.contains('main h2', 'Connect & Transact')

    // Tx Builder app
    cy.contains('main p', 'Use Transaction Builder')
    cy.get(`a[href*='/tx-builder']`).should('exist')

    // WalletConnect app
    cy.contains('main p', 'Use WalletConnect')
    cy.get(`a[href*='/wallet-connect']`).should('exist')

    // Featured apps have a Safe-specific link
    cy.get(`main section#featured-safe-apps a[href^="/app/${SAFE}/apps?appUrl=http"]`).should('have.length', 2)
  })

  it('should show the Safe Apps widget', () => {
    cy.contains('main section#safe-apps h2', 'Safe Apps')
    cy.contains('main section#safe-apps a[href="/app/apps"] button', 'Explore Safe Apps')

    // Regular safe apps
    cy.get(`main section#safe-apps a[href^="/app/${SAFE}/apps?appUrl=http"]`).should('have.length', 5)
  })
})
