const TEST_SAFE = 'rin:0x11Df0fa87b30080d59eba632570f620e37f2a8f7'
const RECIPIENT_ENS = 'diogo.eth'
const RECIPIENT_ADDRESS = '0x6a5602335a878ADDCa4BF63a050E34946B56B5bC'
const SAFE_NONCE = '6'

describe('Tx Modal', () => {
  before(() => {
    cy.connectE2EWallet()

    // Open the Safe used for testing
    cy.visit(`/${TEST_SAFE}`)
    cy.contains('a', 'Accept selection').click()
  })

  describe('Send funds modal', () => {
    describe('Send Funds form', () => {
      before(() => {
        // Open Send Funds Modal
        cy.contains('New Transaction').click()
        cy.contains('Send funds').click()
      })

      it('should display Send Funds modal with all the form elements', () => {
        // Modal header
        cy.contains('Send funds')
          .should('be.visible')
          .next()
          .contains('Step 1 of 2')
          .should('be.visible')
          .next()
          // Current network is same as Safe
          .contains('Rinkeby')
          .should('be.visible')

        // It contains the form elements
        cy.get('form').within(() => {
          // Sending from the current Safe address
          const [chainPrefix, safeAddress] = TEST_SAFE.split(':')
          cy.contains(chainPrefix)
          cy.contains(safeAddress)

          // Recipient field
          cy.get('#address-book-input').should('be.visible')

          // Token selector
          cy.contains('Select an asset*').should('be.visible')

          // Amount field
          cy.contains('Amount').should('be.visible')
        })

        // Review button is disabled
        cy.get('button[type="submit"]').should('be.disabled')
      })

      it('should resolve the ENS name', () => {
        // Fills recipient with ens
        cy.get('label[for="address-book-input"]').next().type(RECIPIENT_ENS)

        // Waits for resolving the ENS
        cy.contains(RECIPIENT_ADDRESS).should('be.visible')
      })

      it('should have all tokens available in the token selector', () => {
        // Click on the Token selector
        cy.contains('Select an asset*').click()

        const ownedTokens = ['Dai', 'Wrapped Ether', 'Ether', 'Uniswap', 'Gnosis', '0x', 'USD Coin']
        ownedTokens.forEach((token) => {
          cy.get('ul[role="listbox"]').contains(token)
        })
      })

      it('should validate token amount', () => {
        // Select a token
        cy.get('ul[role="listbox"]').contains('Gnosis').click()

        // Insert an incorrect amount
        cy.get('input[placeholder="Amount*"]').type('0.4')

        // Selecting more than the balance is not allowed
        cy.contains('Maximum value is 0.000004')

        // Form field contains an error class
        cy.get('input[placeholder="Amount*"]')
          // Parent div is MuiInputBase-root
          .parent('div')
          .should(($div) => {
            // Turn the classList into an array
            const classList = Array.from($div[0].classList)
            expect(classList).to.include('MuiInputBase-root').and.to.include('Mui-error')
          })

        // Insert a correct amount
        cy.get('input[placeholder="Amount*"]').clear().type('0.000002')

        // Form field does not contain an error class
        cy.get('input[placeholder="Amount*"]')
          // Parent div is MuiInputBase-root
          .parent('div')
          .should(($div) => {
            // Turn the classList into an array
            const classList = Array.from($div[0].classList)
            // Check if it contains the error class
            expect(classList).to.include('MuiInputBase-root').and.not.to.include('Mui-error')
          })

        // Click Send max fills the input with token total amount
        cy.contains('Send max').click()
        cy.get('input[placeholder="Amount*"]').should('have.value', '0.000004')
      })

      it('should advance to the Review step', () => {
        // Clicks Review
        cy.contains('Review').click()

        // Modal step 2
        cy.contains('Step 2 of 2').should('be.visible')
      })
    })

    describe('Review modal', () => {
      before(() => {
        // Wait max 10s for estimate to finish
        cy.contains('Submit', { timeout: 10000 })
      })

      it('should have the same parameters as the previous step', () => {
        // Sender
        cy.contains('Sending from').parent().next().contains(TEST_SAFE)
        // Recipient
        cy.contains('Recipient').parent().next().contains(RECIPIENT_ADDRESS)

        // Token value
        cy.contains('0.000004 GNO')
      })

      it('should contain a correctly estimated gas limit value', () => {
        const GAS_LIMIT = '79804' // gas limit is deterministic

        // Estimated gas price is loaded
        cy.contains('Estimated fee price').next().should('not.have.text', '> 0.001 ETH')

        // Click Advanced parameters
        cy.contains('Estimated fee price').click()

        // Find Gas limit
        cy.contains('Gas limit').next().contains(GAS_LIMIT).should('be.visible')

        // Close info again
        cy.contains('Estimated fee price').click()
      })

      it('should contain the Safe nonce upon clicking Advanced parameters', () => {
        // Click Advanced parameters
        cy.contains('Advanced parameters').click()
        // Find Safe nonce
        cy.contains('Safe nonce').next().contains(SAFE_NONCE).should('be.visible')

        // Close dialog again
        cy.contains('Advanced parameters').click()
      })
    })
  })
})
