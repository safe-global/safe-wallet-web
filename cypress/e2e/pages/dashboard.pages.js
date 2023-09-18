import * as constants from '../../support/constants'

const connectAndTransactStr = 'Connect & transact'
const transactionQueueStr = 'Pending transactions'
const noTransactionStr = 'This Safe has no queued transactions'
const overviewStr = 'Overview'
const viewAssetsStr = 'View assets'
const tokensStr = 'Tokens'
const nftStr = 'NFTs'
const viewAllStr = 'View all'
const transactionBuilderStr = 'Use Transaction Builder'
const walletConnectStr = 'Use WalletConnect'
const safeAppStr = 'Safe Apps'
const exploreSafeApps = 'Explore Safe Apps'

const txBuilder = 'a[href*="tx-builder"]'
const walletConnect = 'a[href*="wallet-connect"]'
const safeSpecificLink = 'a[href*="&appUrl=http"]'

export function verifyConnectTransactStrIsVisible() {
  cy.contains(connectAndTransactStr).should('be.visible')
}

export function verifyOverviewWidgetData() {
  // Alias for the Overview section
  cy.contains('h2', overviewStr).parents('section').as('overviewSection')

  cy.get('@overviewSection').within(() => {
    // Prefix is separated across elements in EthHashInfo
    cy.contains(constants.TEST_SAFE).should('exist')
    cy.contains('1/2')
    cy.get(`a[href="${constants.BALANCE_URL}${encodeURIComponent(constants.TEST_SAFE)}"]`).contains(viewAssetsStr)
    // Text next to Tokens contains a number greater than 0
    cy.contains('p', tokensStr).next().contains('1')
    cy.contains('p', nftStr).next().contains('0')
  })
}

export function verifyTxQueueWidget() {
  // Alias for the Transaction queue section
  cy.contains('h2', transactionQueueStr).parents('section').as('txQueueSection')

  cy.get('@txQueueSection').within(() => {
    // There should be queued transactions
    cy.contains(noTransactionStr).should('not.exist')

    // Queued txns
    cy.contains(`a[href^="/transactions/tx?id=multisig_0x"]`, '13' + 'Send' + '-0.00002 GOR' + '1/1').should('exist')

    cy.contains(`a[href="${constants.transactionQueueUrl}${encodeURIComponent(constants.TEST_SAFE)}"]`, viewAllStr)
  })
}

export function verifyFeaturedAppsSection() {
  // Alias for the featured Safe Apps section
  cy.contains('h2', connectAndTransactStr).parents('section').as('featuredSafeAppsSection')

  // Tx Builder app
  cy.get('@featuredSafeAppsSection').within(() => {
    // Transaction Builder
    cy.contains(transactionBuilderStr)
    cy.get(txBuilder).should('exist')

    // WalletConnect app
    cy.contains(walletConnectStr)
    cy.get(walletConnect).should('exist')

    // Featured apps have a Safe-specific link
    cy.get(safeSpecificLink).should('have.length', 2)
  })
}

export function verifySafeAppsSection() {
  // Create an alias for the Safe Apps section
  cy.contains('h2', safeAppStr).parents('section').as('safeAppsSection')

  cy.get('@safeAppsSection').contains(exploreSafeApps)

  // Regular safe apps
  cy.get('@safeAppsSection').within(() => {
    // Find exactly 5 Safe Apps cards inside the Safe Apps section
    cy.get(`a[href^="${constants.openAppsUrl}${encodeURIComponent(constants.TEST_SAFE)}&appUrl=http"]`).should(
      'have.length',
      5,
    )
  })
}
