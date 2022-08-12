const SAFE = 'rin:0x87a57cBf742CC1Fc702D0E9BF595b1E056693e2f'

// Logo pathnames
const CONTRACT_INTERACTION = '/app/static/media/custom' // partial filename as build compiles to 'custom.123XYZ.svg'
const WRAPPED_ETH = '/tokens/logos/0xc778417E063141139Fce010982780140Aa0cD5Ab.png'
const MULTI_SEND_CONTRACT = '/contracts/logos/0x40A2aCCbd92BCA938b02010E17A5b8929b49130D.png'
const OUTGOING = '/app/static/media/outgoing' // partial filename as build compiles to 'outgoing.123XYZ.svg'
const ETH = '/chains/4/currency_logo.png'
const INCOMING = '/app/static/media/incoming' // partial filename as build compiles to 'incoming.123XYZ.svg'
const NFT = '/tokens/logos/0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b.png'
const USDC = '/app/static/media/tokens/logos/0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b.png'

describe('Dashboard', () => {
  before(() => {
    // Go to the test Safe transaction history
    cy.visit(`/${SAFE}/transactions/history`)
    cy.contains('a', 'Accept selection').click()
  })

  it('should display June 9th transactions', () => {
    const DATE = 'Jun 9, 2022'

    // Date label
    cy.contains('p', DATE).should('exist')

    // Transaction summaries
    const rows = cy.contains('p', DATE).next().children()

    rows.should('have.length', 1)

    rows
      // testBool contract interaction w/ rin:0x49d4450977E2c95362C13D3a31a09311E0Ea26A6
      .first(($tx) => {
        // Nonce
        cy.wrap($tx).contains('p', '6').should('exist')

        // Type
        cy.wrap($tx).find('img').should('have.attr', 'src').should('include', CONTRACT_INTERACTION)
        cy.wrap($tx).contains('p', 'Contract interaction').should('exist')

        // Info
        cy.wrap($tx).contains('span', 'testBool').should('exist')

        // Time
        cy.wrap($tx).contains('p', '1:53 PM').should('exist')

        // Status
        cy.wrap($tx).contains('p', 'Success').should('exist')
      })
  })
  it('should display June 8th transactions', () => {
    const DATE = 'Jun 8, 2022'

    // Date label
    cy.contains('p', DATE).should('exist')

    // Transaction summaries
    const rows = cy.contains('p', DATE).next().children()

    rows.should('have.length', 1)

    rows
      // testBool contract interaction
      .first(($tx) => {
        // Nonce
        cy.wrap($tx).contains('p', '5').should('exist')

        // Type
        cy.wrap($tx).find('img').should('have.attr', 'src').should('include', CONTRACT_INTERACTION)
        cy.wrap($tx).contains('p', 'Contract interaction').should('exist')

        // Info
        cy.wrap($tx).contains('span', 'testBool').should('exist')

        // Time
        cy.wrap($tx).contains('p', '5:24 PM').should('exist')

        // Status
        cy.wrap($tx).contains('p', 'Success').should('exist')
      })
  })
  it('should display May 30th transactions', () => {
    const DATE = 'May 30, 2022'

    // Date label
    cy.contains('p', DATE).should('exist')

    // Transaction summaries
    const rows = cy.contains('p', DATE).next().children()

    rows.should('have.length', 9)

    rows
      // CowSwap approval of Wrapped Ether
      .first(($tx) => {
        // Nonce
        cy.wrap($tx).contains('p', '4').should('exist')

        // Type
        cy.wrap($tx).find('img').should('have.attr', 'src').should('include', WRAPPED_ETH)
        cy.wrap($tx).contains('p', 'Wrapped Ether').should('exist')

        // Info
        cy.wrap($tx).contains('span', 'approve').should('exist')

        // Time
        cy.wrap($tx).contains('p', '3:27 PM').should('exist')

        // Status
        cy.wrap($tx).contains('p', 'Success').should('exist')
      })
      // CowSwap approval of Wrapped Ether
      .next(($tx) => {
        // Nonce
        cy.wrap($tx).contains('p', '3').should('exist')

        // Type
        cy.wrap($tx).find('img').should('have.attr', 'src').should('include', WRAPPED_ETH)
        cy.wrap($tx).contains('p', 'Wrapped Ether').should('exist')

        // Info
        cy.wrap($tx).contains('span', 'approve').should('exist')

        // Time
        cy.wrap($tx).contains('p', '3:26 PM').should('exist')

        // Status
        cy.wrap($tx).contains('p', 'Success').should('exist')
      })
      // 3 x MultiSendCallOnly actions
      .next(($tx) => {
        // Nonce
        cy.wrap($tx).contains('p', '2').should('exist')

        // Type
        cy.wrap($tx).find('img').should('have.attr', 'src').should('include', MULTI_SEND_CONTRACT)
        cy.wrap($tx).contains('p', 'Gnosis Safe: MultiSendCallOnly').should('exist')

        // Info
        cy.wrap($tx).contains('span', '3 actions').should('exist')

        // Time
        cy.wrap($tx).contains('p', '3:25 PM').should('exist')

        // Status
        cy.wrap($tx).contains('p', 'Success').should('exist')
      })
      // testBool contract interaction
      .next(($tx) => {
        // Nonce
        cy.wrap($tx).contains('p', '1').should('exist')

        // Type
        cy.wrap($tx).find('img').should('have.attr', 'src').should('include', CONTRACT_INTERACTION)
        cy.wrap($tx).contains('p', 'Contract interaction').should('exist')

        // Info
        cy.wrap($tx).contains('span', 'testBool').should('exist')

        // Time
        cy.wrap($tx).contains('p', '3:23 PM').should('exist')

        // Status
        cy.wrap($tx).contains('p', 'Success').should('exist')
      })
      // Send 0.1 ETH
      .next(($tx) => {
        // Nonce
        cy.wrap($tx).contains('p', '0').should('exist')

        // Type
        cy.wrap($tx).find('img').should('have.attr', 'src').should('include', OUTGOING)
        cy.wrap($tx).contains('p', 'Sent').should('exist')

        // Info
        cy.wrap($tx).find('img').should('have.attr', 'src').should('include', ETH)
        cy.wrap($tx).contains('span', '-0.1 ETH').should('exist')

        // Time
        cy.wrap($tx).contains('p', '3:22 PM').should('exist')

        // Status
        cy.wrap($tx).contains('p', 'Success').should('exist')
      })
      // Receive 1 ZORB NFT
      .next(($tx) => {
        // Type
        cy.wrap($tx).find('img').should('have.attr', 'src').should('include', '/app/static/media/incoming.1bf5be26.svg')
        cy.wrap($tx).contains('p', 'Received').should('exist')

        // Info
        cy.wrap($tx).find('img').should('have.attr', 'src').should('include', '/app/static/media/nft_icon.85f106fa.png')
        cy.wrap($tx).contains('span', '+1 ZORB (#3)').should('exist')

        // Time
        cy.wrap($tx).contains('p', '3:21 PM').should('exist')

        // Status
        cy.wrap($tx).contains('p', 'Success').should('exist')
      })
      // Receive 0.3 USDC
      .next(($tx) => {
        // Type
        cy.wrap($tx).find('img').should('have.attr', 'src').should('include', INCOMING)
        cy.wrap($tx).contains('p', 'Received').should('exist')

        // Info
        cy.wrap($tx).find('img').should('have.attr', 'src').should('include', NFT)
        cy.wrap($tx).contains('span', '+0.3 USDC').should('exist')

        // Time
        cy.wrap($tx).contains('p', '3:20 PM').should('exist')

        // Status
        cy.wrap($tx).contains('p', 'Success').should('exist')
      })
      // Receive 0.1 ETH
      .next(($tx) => {
        // Type
        cy.wrap($tx).find('img').should('have.attr', 'src').should('include', USDC)
        cy.wrap($tx).contains('p', 'Received').should('exist')

        // Info
        cy.wrap($tx).find('img').should('have.attr', 'src').should('include', ETH)
        cy.wrap($tx).contains('span', '+0.1 ETH').should('exist')

        // Time
        cy.wrap($tx).contains('p', '3:19 PM').should('exist')

        // Status
        cy.wrap($tx).contains('p', 'Success').should('exist')
      })
  })
})
