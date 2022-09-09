const balanceSingleRow = '[aria-labelledby="tableTitle"] > tbody tr'
const assetsTable = '[aria-labelledby="tableTitle"] > tbody'

const TEST_SAFE = 'rin:0x656c1121a6f40d25C5CFfF0Db08938DB7633B2A3'
const ASSETS_LENGTH = 25
const ASSET_NAME_COLUMN = 0
const TOKEN_AMOUNT_COLUMN = 1
const FIAT_AMOUNT_COLUMN = 2

describe('Assets > Coins', () => {
  // Fiat balance regex
  const fiatRegex = new RegExp(`([0-9]{1,3},)*[0-9]{1,3}.[0-9]{2}`)
  // Token balance regex
  const tokenRegex = new RegExp(`([0-9]{1,3},)*[0-9]{1,3}.[0-9]{2,5}`)

  before(() => {
    // Open the Safe used for testing
    cy.visit(`/${TEST_SAFE}/balances`)
    cy.contains('button', 'Accept selection').click()
  })

  describe('should have different tokens', () => {
    it(`should have ${ASSETS_LENGTH} entries in the table`, () => {
      cy.get(assetsTable).find('tr').should('have.length', ASSETS_LENGTH)
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
        .get('a[aria-label="View on rinkeby.etherscan.io"]')
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
        .get('a[aria-label="View on rinkeby.etherscan.io"]')
        .should('be.visible')

      // Balance should contain WETH
      cy.contains('Wrapped Ether').parents('tr').find('td').eq(TOKEN_AMOUNT_COLUMN).contains('WETH')
    })

    it('should have USDT Coin', () => {
      // Row should have an image with alt text "USDT Coin"
      cy.contains('Compound USDT')
        .parents('tr')
        .within(() => {
          cy.get('img[alt="USDT"]').should('be.visible')
        })

      // Asset name column contains link to block explorer
      cy.contains('Compound USDT')
        .parents('tr')
        .find('td')
        .eq(ASSET_NAME_COLUMN)
        .get('a[aria-label="View on rinkeby.etherscan.io"]')
        .should('be.visible')

      // Balance should contain USDT
      cy.contains('Compound USDT').parents('tr').find('td').eq(TOKEN_AMOUNT_COLUMN).contains('USDT')
    })
  })

  describe.skip('values should be formatted as per locale', () => {
    it('should have Token and Fiat balances formated as per locales', () => {
      // Verify all assets
      Array.from(Array(ASSETS_LENGTH).keys()).forEach((row) => {
        // Token balance is formatted as per tokenRegex
        cy.get(balanceSingleRow)
          .eq(row)
          .find('td')
          .eq(TOKEN_AMOUNT_COLUMN)
          .should(($div) => {
            const text = $div.text()
            expect(text).to.match(tokenRegex)
          })

          // Fiat balance is formatted as per fiatRegex
          .get(balanceSingleRow)
          .eq(row)
          .find('td')
          .eq(FIAT_AMOUNT_COLUMN)
          .should(($div) => {
            const text = $div.text()
            expect(text).to.match(fiatRegex)
          })
      })
    })
  })

  describe('fiat currency can be changed', () => {
    it('should have ETH as default currency', () => {
      // First row Fiat balance should not contain EUR
      cy.get(balanceSingleRow).first().find('td').eq(FIAT_AMOUNT_COLUMN).should('not.contain', '€')
      // First row Fiat balance should contain ETH
      cy.get(balanceSingleRow).first().find('td').eq(TOKEN_AMOUNT_COLUMN).contains('ETH')
    })

    it('should allow changing the currency to EUR', () => {
      // Click on balances currency dropdown
      cy.get('[id="currency"]').click()

      // Select EUR
      cy.get('ul[role="listbox"]').findByText('EUR').click()

      // First row Fiat balance should not contain USDT
      cy.get(balanceSingleRow).first().find('td').eq(FIAT_AMOUNT_COLUMN).should('not.contain', 'USDT')
      // First row Fiat balance should contain EUR
      cy.get(balanceSingleRow).first().find('td').eq(FIAT_AMOUNT_COLUMN).contains('€')
    })
  })

  describe('pagination should work', () => {
    it('should should allow 25 rows per page and navigate to next and previous page', () => {
      // Click on the pagination select dropdown
      cy.get('[aria-haspopup="listbox"]').contains('25').click()

      // Select 25 rows per page
      cy.get('[aria-haspopup="listbox"]').get('li[role="option"]').contains('25').click()

      // Table should have 25 rows
      cy.contains('1–25 of 27')
      cy.get(balanceSingleRow).should('have.length', 25)

      // Click on the next page button
      cy.get('button[aria-label="Go to next page"]').click()

      // Table should have 1 rows
      cy.contains('26–27 of 27')
      cy.get(balanceSingleRow).should('have.length', 2)

      // Click on the previous page button
      cy.get('button[aria-label="Go to previous page"]').click()

      // Table should have 25 rows
      cy.contains('1–25 of 27')
      cy.get(balanceSingleRow).should('have.length', 25)
    })
  })

  describe('should open assets modals', () => {
    const receiveAssetsModalTestId = '[aria-labelledby=":r1i:"]'

    it('should open the Receive assets modal', () => {
      // Assets table container should exist
      cy.get('[data-track="overview: Show Safe QR code"]').should('be.visible').click()

      // The Receive Assets modal should be present
      cy.get(receiveAssetsModalTestId).should('be.visible')

      // Receive assets should be present
      cy.get(receiveAssetsModalTestId).findByText('Receive assets').should('be.visible')

      // The Receive screen should have the correct address
      const [, safeAddress] = TEST_SAFE.split(':')
      cy.get(receiveAssetsModalTestId).findByText(safeAddress).should('be.visible')

      // Checking and unchecking the QR code
      cy.get(receiveAssetsModalTestId).find('[type="checkbox"]').should('be.checked')

      cy.get(receiveAssetsModalTestId).find('[type="checkbox"]').uncheck()
      .should('not.be.checked')

      // Click in the Done button
      cy.get(receiveAssetsModalTestId).find('[data-testid="CloseIcon"]').click()

      // The Receive screen should be hidden
      cy.get(receiveAssetsModalTestId).should('not.exist')
    })
  })
})
