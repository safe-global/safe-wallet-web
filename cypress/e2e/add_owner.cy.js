const NEW_OWNER = '0xE297437d6b53890cbf004e401F3acc67c8b39665'
const TEST_SAFE = 'gor:0x97d314157727D517A706B5D08507A1f9B44AaaE9'
const offset = 7

describe('Adding an owner', () => {
  before(() => {
    cy.connectE2EWallet()

    cy.visit(`/${TEST_SAFE}/settings/setup`)
    cy.contains('button', 'Accept selection').click()

    // Advanced Settings page is loaded
    cy.contains('Safe nonce', { timeout: 10000 })
  })

  describe('Add new owner', () => {
    it('should add a new owner and change the threshold', () => {
      // "add owner" tx so funds are not needed in the safe.
      // Open the add new owner modal
      cy.contains('Add new owner').click()
      cy.contains('h2', 'Add new owner').should('be.visible')
      cy.contains('h2', 'Step 1 out of 3').should('be.visible')

      // Fills new owner data
      cy.get('input[placeholder="New owner"]').type('New Owner Name')
      cy.get('input[name="address"]').type(NEW_OWNER)

      // Advances to step 2
      cy.contains('Next').click()
      cy.contains('h2', 'Set threshold').should('be.visible')
      cy.contains('h2', 'Step 2 out of 3').should('be.visible')

      // Select 2 owners
      cy.get('div[aria-haspopup="listbox"]').contains('1').click()
      cy.get('li[role="option"]').contains('2').click()

      // Input should have value 3
      cy.get('div[aria-haspopup="listbox"]').contains('2').should('be.visible')
      cy.contains('out of 2 owner(s)').should('be.visible')

      // Review step
      cy.contains('Next').click()
      cy.contains('h2', 'Review transaction').should('be.visible')
      cy.contains('h2', 'Step 3 out of 3').should('be.visible')

      // Chosen threshold should be in the review modal
      cy.contains('h2', 'Review transaction')
        .next()
        .contains('Any transaction requires the confirmation of:')
        .next()
        .find('b', '2')
        // 2 out of 2
        .should('have.length', 2)
    })

    it('should open Edit estimation information', () => {
      // Estimated gas price is loaded
      cy.contains('Estimated fee').next().should('not.have.text', '> 0.001 ETH')

      // Open the accordion if gas is loaded
      cy.contains('Estimated fee').click()

      //Checking that gas limit is not a 0, usually a sign that the estimation failed
      cy.contains('Gas limit').next().should('not.to.be.empty').and('to.not.equal', '0')

      cy.contains('button', 'Edit').click()
    })

    describe('Edit Advanced parameters form', () => {
      //The following values are fixed to get a specific estimation value in ETH
      it('should show validation errors in the form', () => {
        // Gas limit
        cy.get('label').contains('Gas limit').next().clear().type('-100')
        cy.findByText('Gas limit must be at least 21000')
        cy.get('label').contains('Gas limit').next().clear().type('200000')

        // Max gas price
        cy.get('label').contains('Max fee').next().clear().type('-100')
        cy.get('label').contains('Max fee').next().get('input[aria-invalid="true"]')
        cy.get('label').contains('Max fee').next().clear().type('5')
        cy.get('label').contains('Max fee').next().get('input[aria-invalid="false"]')

        // Max prio fee
        cy.get('label').contains('Max priority fee').next().clear().type('-100')
        cy.get('label').contains('Max priority fee').next().get('input[aria-invalid="true"]')
        cy.get('label').contains('Max priority fee').next().clear().type('7')
        cy.get('label').contains('Max priority fee').next().get('input[aria-invalid="false"]')

        // Accepts the values
        cy.contains('Confirm').click()
      })

      it('should show the edited values', () => {
        //Verifying that in the dropdown all  the values are there
        cy.contains('Estimated fee').click()

        // Verify the accordion details fields kept the edited values
        cy.contains('div', 'Gas limit').next().should('have.text', '200000')
        cy.contains('Max fee').next().should('have.text', '5')
        cy.contains('Max priority fee').next().should('have.text', '7')
      })
    })
  })
})
