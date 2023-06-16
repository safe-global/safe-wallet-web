const SAFE = 'gor:0x97d314157727D517A706B5D08507A1f9B44AaaE9'

const INCOMING = 'Received'
const OUTGOING = 'Sent'
const CONTRACT_INTERACTION = 'Contract interaction'

describe('Transaction history', () => {
  before(() => {
    cy.useProdCGW()

    // Go to the test Safe transaction history
    cy.visit(`/transactions/history?safe=${SAFE}`)
    cy.contains('button', 'Accept selection').click()
  })

  it('should display October 9th transactions', () => {
    const DATE = 'Oct 9, 2022'
    const NEXT_DATE_LABEL = 'Feb 8, 2022'

    // Date label
    cy.contains('div', DATE).should('exist')

    // Next date label
    cy.contains('div', NEXT_DATE_LABEL).scrollIntoView()

    // Transaction summaries from October 9th
    const rows = cy.contains('div', DATE).nextUntil(`div:contains(${NEXT_DATE_LABEL})`)

    rows.should('have.length', 19)

    rows
      // Receive 0.25 GOR
      .last()
      .within(() => {
        // Type
        cy.get('iframe').should('have.attr', 'title', INCOMING)
        cy.contains('div', 'Received').should('exist')

        // Info
        cy.get('img[alt="GOR"]').should('be.visible')
        cy.contains('span', '0.25 GOR').should('exist')

        // Time
        cy.contains('span', '4:56 PM').should('exist')

        // Status
        cy.contains('span', 'Success').should('exist')
      })
      // CowSwap deposit of Wrapped Ether
      .prev()
      .within(() => {
        // Nonce
        cy.contains('0')

        // Type
        // TODO: update next line after fixing the logo
        // cy.find('img').should('have.attr', 'src').should('include', WRAPPED_ETH)
        cy.contains('div', 'Wrapped Ether').should('exist')

        // Info
        cy.contains('div', 'deposit').should('exist')

        // Time
        cy.contains('span', '4:59 PM').should('exist')

        // Status
        cy.contains('span', 'Success').should('exist')
      })
      // CowSwap approval of Wrapped Ether
      .prev()
      .within(() => {
        // Nonce
        cy.contains('1')

        // Type
        // TODO: update next line after fixing the logo
        // cy.find('img').should('have.attr', 'src').should('include', WRAPPED_ETH)
        cy.contains('div', 'Wrapped Ether').should('exist')

        // Info
        cy.contains('div', 'approve').should('exist')

        // Time
        cy.contains('span', '5:00 PM').should('exist')

        // Status
        cy.contains('span', 'Success').should('exist')
      })
      // Contract interaction
      .prev()
      .within(() => {
        // Nonce
        cy.contains('2')

        // Type
        cy.contains('div', 'Contract interaction').should('exist')

        // Time
        cy.contains('span', '5:01 PM').should('exist')

        // Status
        cy.contains('span', 'Success').should('exist')
      })
      // Send 0.11 WETH
      .prev()
      .within(() => {
        // Type
        cy.get('iframe').should('have.attr', 'title', OUTGOING)
        cy.contains('div', 'Sent').should('exist')

        // Info
        cy.contains('span', '-0.11 WETH').should('exist')

        // Time
        cy.contains('span', '5:01 PM').should('exist')

        // Status
        cy.contains('span', 'Success').should('exist')
      })
      // Receive 120 DAI
      .prev()
      .within(() => {
        // Type
        cy.contains('div', 'Received').should('exist')

        // Info
        cy.contains('span', '120,497.61 DAI').should('exist')

        // Time
        cy.contains('span', '5:01 PM').should('exist')

        // Status
        cy.contains('span', 'Success').should('exist')
      })
  })

  it('should expand/collapse all actions', () => {
    // Open the tx details
    cy.contains('div', 'Mar 24, 2023')
      .next()
      .click()
      .within(() => {
        cy.contains('True').should('not.be.visible')
        cy.contains('1337').should('not.be.visible')
        cy.contains('5688').should('not.be.visible')
        cy.contains('Expand all').click()

        // All the values in the actions must be visible
        cy.contains('True').should('exist')
        cy.contains('1337').should('exist')
        cy.contains('5688').should('exist')

        // After collapse all the same values should not be visible
        cy.contains('Collapse all').click()
        cy.contains('True').should('not.be.visible')
        cy.contains('1337').should('not.be.visible')
        cy.contains('5688').should('not.be.visible')
      })
  })
})
