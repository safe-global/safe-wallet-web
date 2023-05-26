const assetsTable = '[aria-labelledby="tableTitle"] > tbody'
const balanceSingleRow = '[aria-labelledby="tableTitle"] > tbody tr'

const TEST_SAFE = 'gor:0x97d314157727D517A706B5D08507A1f9B44AaaE9'
const PAGINATION_TEST_SAFE = 'gor:0x850493a15914aAC05a821A3FAb973b4598889A7b'
const ASSETS_LENGTH = 7
const ASSET_NAME_COLUMN = 0
const TOKEN_AMOUNT_COLUMN = 1
const FIAT_AMOUNT_COLUMN = 2

describe('Assets > Coins', () => {
  // Fiat balance regex
  const fiatRegex = new RegExp(`([0-9]{1,3},)*[0-9]{1,3}.[0-9]{2}`)

  before(() => {
    // Open the Safe used for testing
    cy.visit(`/balances?safe=${TEST_SAFE}`)
    cy.contains('button', 'Accept selection').click()
    // Table is loaded
    cy.contains('Görli Ether')

    cy.contains('button', 'Got it').click()
  })

  describe('should have different tokens', () => {
    it(`should have ${ASSETS_LENGTH} entries in the table`, () => {
      // "Spam" tokens filtered
      cy.get(balanceSingleRow).should('have.length', 3)

      // Enable all tokens
      cy.contains('div', 'Default tokens').click()
      cy.wait(100)
      cy.contains('div', 'All tokens').click()

      cy.get(balanceSingleRow).should('have.length', ASSETS_LENGTH)
    })

    it('should have Dai', () => {
      // Row should have an image with alt text "Dai"
      cy.contains('Dai')
        .parents('tr')
        .within(() => {
          cy.get('img[alt="DAI"]').should('be.visible')
        })

      // Asset name column contains link to block explorer
      cy.contains('Dai')
        .parents('tr')
        .find('td')
        .eq(ASSET_NAME_COLUMN)
        .get('a[aria-label="View on goerli.etherscan.io"]')
        .should('be.visible')

      // Balance should contain DAI
      cy.contains('Dai').parents('tr').find('td').eq(TOKEN_AMOUNT_COLUMN).contains('DAI')
    })

    it('should have Wrapped Ether', () => {
      // Row should have an image with alt text "Wrapped Ether"
      cy.contains('Wrapped Ether')
        .parents('tr')
        .within(() => {
          cy.get('img[alt="WETH"]').should('be.visible')
        })

      // Asset name column contains link to block explorer
      cy.contains('Wrapped Ether')
        .parents('tr')
        .find('td')
        .eq(ASSET_NAME_COLUMN)
        .get('a[aria-label="View on goerli.etherscan.io"]')
        .should('be.visible')

      // Balance should contain WETH
      cy.contains('Wrapped Ether').parents('tr').find('td').eq(TOKEN_AMOUNT_COLUMN).contains('WETH')
    })

    it('should have USD Coin', () => {
      // Row should have an image with alt text "USD Coin"
      cy.contains('USD Coin')
        .parents('tr')
        .within(() => {
          cy.get('img[alt="USDC"]').should('be.visible')
        })

      // Asset name column contains link to block explorer
      cy.contains('USD Coin')
        .parents('tr')
        .find('td')
        .eq(ASSET_NAME_COLUMN)
        .get('a[aria-label="View on goerli.etherscan.io"]')
        .should('be.visible')

      // Balance should contain USDT
      cy.contains('USD Coin').parents('tr').find('td').eq(TOKEN_AMOUNT_COLUMN).contains('USDC')
    })
  })

  describe('values should be formatted as per locale', () => {
    it('should have Token and Fiat balances formated as per specification', () => {
      cy.contains('Dai')
        .parents('tr')
        .within(() => {
          // cy.get('td').eq(TOKEN_AMOUNT_COLUMN).contains('803.292M DAI')
          cy.get('td').eq(TOKEN_AMOUNT_COLUMN).contains('120,496.61 DAI')
          cy.get('td').eq(FIAT_AMOUNT_COLUMN).contains(fiatRegex)
        })

      cy.contains('Wrapped Ether')
        .parents('tr')
        .within(() => {
          cy.get('td').eq(TOKEN_AMOUNT_COLUMN).contains('0.05918 WETH')
          cy.get('td').eq(FIAT_AMOUNT_COLUMN).contains(fiatRegex)
        })

      // Strict match because other tokens contain "Ether" in their name
      cy.contains('Görli Ether')
        .parents('tr')
        .within(() => {
          cy.get('td').eq(TOKEN_AMOUNT_COLUMN).contains('0.14 GOR')
          cy.get('td').eq(FIAT_AMOUNT_COLUMN).contains(fiatRegex)
        })

      cy.contains('Uniswap')
        .parents('tr')
        .within(() => {
          cy.get('td').eq(TOKEN_AMOUNT_COLUMN).contains('0.01828 UNI')
          cy.get('td').eq(FIAT_AMOUNT_COLUMN).contains(fiatRegex)
        })

      cy.contains('USD Coin')
        .parents('tr')
        .within(() => {
          // cy.get('td').eq(TOKEN_AMOUNT_COLUMN).contains('13,636,504 USDC')
          cy.get('td').eq(TOKEN_AMOUNT_COLUMN).contains('131,363 USDC')
          cy.get('td').eq(FIAT_AMOUNT_COLUMN).contains(fiatRegex)
        })

      cy.contains('Gnosis')
        .parents('tr')
        .within(() => {
          cy.get('td').eq(TOKEN_AMOUNT_COLUMN).contains('< 0.00001 GNO')
          cy.get('td').eq(FIAT_AMOUNT_COLUMN).contains(fiatRegex)
        })

      cy.contains(/^0x$/)
        .parents('tr')
        .within(() => {
          cy.get('td').eq(TOKEN_AMOUNT_COLUMN).contains('1.003 ZRX')
          cy.get('td').eq(FIAT_AMOUNT_COLUMN).contains(fiatRegex)
        })
    })
  })

  describe('fiat currency can be changed', () => {
    it('should have USD as default currency', () => {
      // First row Fiat balance should not contain EUR
      cy.get(balanceSingleRow).first().find('td').eq(FIAT_AMOUNT_COLUMN).should('not.contain', 'EUR')
      // First row Fiat balance should contain USD
      cy.get(balanceSingleRow).first().find('td').eq(FIAT_AMOUNT_COLUMN).contains('USD')
    })

    it('should allow changing the currency to EUR', () => {
      // Click on balances currency dropdown
      cy.get('[id="currency"]').click()

      // Select EUR
      cy.get('ul[role="listbox"]').findByText('EUR').click({ force: true })

      // First row Fiat balance should not contain USD
      cy.get(balanceSingleRow).first().find('td').eq(FIAT_AMOUNT_COLUMN).should('not.contain', 'USD')
      // First row Fiat balance should contain EUR
      cy.get(balanceSingleRow).first().find('td').eq(FIAT_AMOUNT_COLUMN).should('contain', 'EUR')
    })
  })

  describe('tokens can be manually hidden', () => {
    it('hide single token', () => {
      // Click hide Dai
      cy.contains('Dai').parents('tr').find('button[aria-label="Hide asset"]').click()
      // time to hide the asset
      cy.wait(350)
      cy.contains('Dai').should('not.exist')
    })

    it('unhide hidden token', () => {
      // Open hide token menu
      cy.contains('1 hidden token').click()
      // uncheck dai token
      cy.contains('Dai').parents('tr').find('input[type="checkbox"]').click()
      // apply changes
      cy.contains('Save').click()
      // Dai token is visible again
      cy.contains('Dai')
      // The menu button shows "Hide tokens" label again
      cy.contains('Hide tokens')
    })
  })

  describe('pagination should work', () => {
    before(() => {
      // Open the Safe used for testing pagination
      cy.visit(`/balances?safe=${PAGINATION_TEST_SAFE}`)
      cy.contains('button', 'Accept selection').click()

      // Table is loaded
      cy.contains('Görli Ether')
      cy.contains('button', 'Got it').click()
      // Enable all tokens
      cy.contains('div', 'Default tokens').click()
      cy.wait(100)
      cy.contains('div', 'All tokens').click()
    })

    it('should allow changing rows per page and navigate to next and previous page', () => {
      // Table should have 25 rows inittially
      cy.contains('Rows per page:').next().contains('25')
      cy.contains('1–25 of 27')
      cy.get(balanceSingleRow).should('have.length', 25)

      // Change to 10 rows per page
      // force click because the center of the element is hidden from the view
      cy.contains('Rows per page:').next().contains('25').click({ force: true })
      cy.get('ul[role="listbox"]').contains('10').click()

      // Table should have 10 rows
      cy.contains('Rows per page:').next().contains('10')
      cy.contains('1–10 of 27')
      cy.get(balanceSingleRow).should('have.length', 10)

      // Click on the next page button
      cy.get('button[aria-label="Go to next page"]').click({ force: true })
      cy.get('button[aria-label="Go to next page"]').click({ force: true })

      // Table should have 7 rows
      cy.contains('21–27 of 27')
      cy.get(balanceSingleRow).should('have.length', 7)

      // Click on the previous page button
      cy.get('button[aria-label="Go to previous page"]').click({ force: true })

      // Table should have 10 rows
      cy.contains('11–20 of 27')
      cy.get(balanceSingleRow).should('have.length', 10)
    })
  })
})
