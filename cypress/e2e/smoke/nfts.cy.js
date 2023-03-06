const TEST_SAFE = 'gor:0x97d314157727D517A706B5D08507A1f9B44AaaE9'

describe('Assets > NFTs', () => {
  before(() => {
    cy.connectE2EWallet()

    cy.visit(`/${TEST_SAFE}/balances/nfts`, { failOnStatusCode: false })
    cy.contains('button', 'Accept selection').click()
    cy.contains('E2E Wallet @ Görli')
  })

  describe('should have NFTs', () => {
    it('should have NFTs in the table', () => {
      cy.get('tbody tr').should('have.length', 5)
      cy.contains('Please note that the links to OpenSea')
      cy.contains('button', 'Got it!').click()
      cy.contains('Please note that the links to OpenSea').should('not.exist')
    })

    it('should have info in the NFT row', () => {
      cy.get('tbody tr:first-child').contains('td:first-child', 'BillyNFT721')
      cy.get('tbody tr:first-child').contains('td:first-child', '0x0000...816D')

      cy.get('tbody tr:first-child').contains('td:nth-child(2)', 'Kitaro #261')

      cy.get(
        'tbody tr:first-child td:nth-child(3) a[href="https://testnets.opensea.io/assets/0x000000000faE8c6069596c9C805A1975C657816D/443"]',
      )
    })

    it('should open an NFT preview', () => {
      // Preview the first NFT
      cy.get('tbody tr:first-child td:nth-child(2)').click()

      // Modal
      cy.get('div[role="dialog"]').contains('Kitaro #261')
      cy.get('div[role="dialog"]').contains('Görli')
      cy.get('div[role="dialog"]').contains(
        'a[href="https://testnets.opensea.io/assets/0x000000000faE8c6069596c9C805A1975C657816D/443"]',
        'View on OpenSea',
      )

      // Close the modal
      cy.get('div[role="dialog"] button').click()
      cy.get('div[role="dialog"]').should('not.exist')
    })

    it('should not open an NFT preview for NFTs without one', () => {
      // Click on the third NFT
      cy.get('tbody tr:nth-child(3) td:nth-child(2)').click()
      cy.get('div[role="dialog"]').should('not.exist')
    })

    it('should select and send multiple NFTs', () => {
      // Select three NFTs
      cy.contains('0 NFTs selected')
      cy.contains('button[disabled]', 'Send')
      cy.get('tbody tr:first-child input[type="checkbox"]').click()
      cy.contains('1 NFT selected')
      cy.contains('button:not([disabled])', 'Send 1 NFT')
      cy.get('tbody tr:nth-child(2) input[type="checkbox"]').click()
      cy.contains('2 NFTs selected')
      cy.contains('button', 'Send 2 NFTs')
      cy.get('tbody tr:last-child input[type="checkbox"]').click()
      cy.contains('3 NFTs selected')

      // Deselect one NFT
      cy.get('tbody tr:nth-child(2) input[type="checkbox"]').click()
      cy.contains('2 NFTs selected')

      // Send NFTs
      cy.contains('button', 'Send 2 NFTs').click()

      // Modal appears
      cy.contains('Send NFTs')
      cy.contains('Sending 2 NFTs from')
      cy.contains('Recipient address or ENS *')
      cy.contains('Selected NFTs')
      cy.get('input[name="recipient"]').type('0x97d314157727D517A706B5D08507A1f9B44AaaE9')
      cy.contains('button', 'Next').click()

      // Review modal appears
      cy.contains('Review transaction')
      cy.contains('Sending 2 NFTs from')
      cy.contains('Batched transactions')
      cy.get('b:contains("safeTransferFrom")').should('have.length', 2)
      cy.contains('button:not([disabled])', 'Submit')
    })
  })
})
