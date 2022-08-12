const NEW_OWNER = '0x49d4450977E2c95362C13D3a31a09311E0Ea26A6'
const TEST_SAFE = 'rin:0x11Df0fa87b30080d59eba632570f620e37f2a8f7'
const offset = 7

describe('Adding an owner', () => {
  let currentNonce = 0
  before(() => {
    cy.connectE2EWallet()

    cy.visit(`/${TEST_SAFE}/settings/advanced`)
    cy.findByText('Accept selection').click()

    // Advanced Settings page is loaded
    cy.contains('Safe Nonce', { timeout: 10000 })
    // Get current nonce from Settings > Advanced
    cy.findByTestId('current-nonce').then((element) => {
      currentNonce = parseInt(element.text())
    })
  })

  describe('Add new owner', () => {
    it('should add a new owner and change the threshold', () => {
      cy.get('nav[aria-labelledby="nested-list-subheader"]').contains('Owners').click()

      //"add owner" tx so funds are not needed in the safe.
      // Open the add new owner modal
      cy.contains('Add new owner').click()
      cy.contains('p', 'Add new owner').should('be.visible').next().contains('Step 1 of 3').should('be.visible')

      // Fills new owner data
      cy.get('input[placeholder="Owner name*"]').type('New Owner Name')
      cy.get('input[placeholder="Owner address*"]').type(NEW_OWNER)

      // Advances to step 2
      cy.contains('Next').click()
      cy.contains('p', 'Add new owner').should('be.visible').next().contains('Step 2 of 3').should('be.visible')

      // Select 3 owners
      cy.get('[aria-labelledby="mui-component-select-threshold"]').click().get('li').contains('3').click()

      // Input should have value 3
      cy.get('input[name="threshold"]').should('have.value', '3')
      cy.contains('out of 3 owner(s)').should('be.visible')

      // Review step
      cy.contains('Review').click()
      cy.contains('p', 'Add new owner').should('be.visible').next().contains('Step 3 of 3').should('be.visible')

      // Chosen threshold should be in the review modal
      cy.contains('Any transaction requires the confirmation of:')
        .should('be.visible')
        .next()
        .contains('3 out of 3 owner(s)')
        .should('be.visible')
    })

    it('should open Edit estimation information', () => {
      // Estimated gas price is loaded
      cy.contains('Estimated fee price').next().should('not.have.text', '> 0.001 ETH')

      // Open the accordion if gas is loaded
      cy.contains('Estimated fee price').click()

      //Checking that gas limit is not a 0, usually a sign that the estimation failed
      cy.contains('Gas limit').next().should('not.to.be.empty').and('to.not.equal', '0')

      cy.get('[data-track="modals: Edit estimation"]').contains('Edit').click()
    })

    describe('Edit Advanced parameters form', () => {
      before(() => {
        //Adding offset to check the warning message later
        cy.get('label')
          .contains('Safe nonce')
          .next()
          .clear()
          .type(`${currentNonce + offset}`)
      })

      //The following values are fixed to get a specific estimation value in ETH
      it('should show validation errors in the form', () => {
        // Gas limit
        cy.get('label').contains('Gas limit').next().clear().type('-100')
        cy.findByText('Must be greater than or equal to 0')
        cy.get('label').contains('Gas limit').next().clear().type('200000')

        // Max gas price
        cy.get('label').contains('Max fee per gas').next().clear().type('-100')
        cy.findByText('Must be greater than or equal to 0')
        cy.get('label').contains('Max fee per gas').next().clear().type('5')

        // Max prio fee
        cy.get('label').contains('Max priority fee').next().clear().type('-100')
        cy.findByText('Must be greater than or equal to 0')
        cy.get('label').contains('Max priority fee').next().clear().type('7')
        cy.findByText('Maximum value is 5') //It cannot be higher than gasPrice
        cy.get('label').contains('Max priority fee').next().clear().type('5')

        // Accepts the values
        cy.contains('Confirm').click()
      })

      it('should show the edited values', () => {
        //Vefifying that in the dropdown all  the values are there
        cy.contains('Estimated fee price').click()

        // Verify the accordion details fields kept the edited values
        cy.contains('Gas limit').next().should('have.text', '200000')
        cy.contains('Max fee per gas').next().should('have.text', '5')
        cy.contains('Max priority fee').next().should('have.text', '5')
      })
    })

    describe('Displaying error messages for invalid values', () => {
      it('should show the out of order nonce warning', () => {
        cy.contains('Safe nonce')
          .next()
          .should('have.text', `${currentNonce + offset}`)

        //Verifying the warning message of setting a nonce hihgher than "current nonce"
        cy.findByText(
          'transactions will need to be created and executed before this transaction, are you sure you want to do this?',
        ).contains(`${offset}`)
      })

      it('should display a correctly calculated gas price estimation', () => {
        //the result of 200k gaslimit, 5 gasPrice and Fee
        cy.contains('Estimated fee price').next().should('have.text', '0.002 ETH')
      })
    })
  })
})
