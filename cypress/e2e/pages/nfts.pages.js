import * as constants from '../../support/constants'

const nftModal = 'div[role="dialog"]'
const nftModalCloseBtn = 'button[aria-label="close"]'
const recipientInput = 'input[name="recipient"]'

const noneNFTSelected = '0 NFTs selected'
const sendNFTStr = 'Send NFTs'
const recipientAddressStr = 'Recipient address or ENS'
const selectedNFTStr = 'Selected NFTs'
const executeBtnStr = 'Execute'
const nextBtnStr = 'Next'
const sendStr = 'Send'
const toStr = 'To'
const transferFromStr = 'safeTransferFrom'

function verifyTableRows(number) {
  cy.get('tbody tr').should('have.length', number)
}

export function verifyNFTNumber(number) {
  verifyTableRows(number)
}

export function verifyDataInTable(name, address, tokenID, link) {
  cy.get('tbody tr:first-child').contains('td:first-child', name)
  cy.get('tbody tr:first-child').contains('td:first-child', address)
  cy.get('tbody tr:first-child').contains('td:nth-child(2)', tokenID)
  cy.get(`tbody tr:first-child td:nth-child(3) a[href="${link}"]`)
}

export function openFirstNFT() {
  cy.get('tbody tr:first-child td:nth-child(2)').click()
}

export function verifyNameInNFTModal(name) {
  cy.get(nftModal).contains(name)
}

export function preventBaseMainnetGoerliFromBeingSelected() {
  cy.get(nftModal).contains(constants.networks.goerli)
}

export function verifyNFTModalLink(link) {
  cy.get(nftModal).contains(`a[href="${link}"]`, 'View on OpenSea')
}

export function closeNFTModal() {
  cy.get(nftModalCloseBtn).click()
  cy.get(nftModal).should('not.exist')
}

export function clickOnThirdNFT() {
  cy.get('tbody tr:nth-child(3) td:nth-child(2)').click()
}
export function verifyNFTModalDoesNotExist() {
  cy.get(nftModal).should('not.exist')
}

export function selectNFTs(numberOfNFTs) {
  for (let i = 1; i <= numberOfNFTs; i++) {
    cy.get(`tbody tr:nth-child(${i}) input[type="checkbox"]`).click()
    cy.contains(`${i} NFT${i > 1 ? 's' : ''} selected`)
  }
  cy.contains('button', `Send ${numberOfNFTs} NFT${numberOfNFTs > 1 ? 's' : ''}`)
}

export function deselectNFTs(checkboxIndexes, checkedItems) {
  let total = checkedItems - checkboxIndexes.length

  checkboxIndexes.forEach((index) => {
    cy.get(`tbody tr:nth-child(${index}) input[type="checkbox"]`).uncheck()
  })

  cy.contains(`${total} NFT${total !== 1 ? 's' : ''} selected`)
  if (total === 0) {
    verifyInitialNFTData()
  }
}

export function verifyInitialNFTData() {
  cy.contains(noneNFTSelected)
  cy.contains('button[disabled]', 'Send')
}

export function sendNFT(numberOfCheckedNFTs) {
  cy.contains('button', `Send ${numberOfCheckedNFTs} NFT${numberOfCheckedNFTs !== 1 ? 's' : ''}`).click()
}

export function verifyNFTModalData() {
  cy.contains(sendNFTStr)
  cy.contains(recipientAddressStr)
  cy.contains(selectedNFTStr)
}

export function typeRecipientAddress(address) {
  cy.get(recipientInput).type(address)
}

export function clikOnNextBtn() {
  cy.contains('button', nextBtnStr).click()
}

export function verifyReviewModalData(NFTcount) {
  cy.contains(sendStr)
  cy.contains(toStr)
  cy.wait(1000)
  cy.get(`b:contains(${transferFromStr})`).should('have.length', NFTcount)
  cy.contains('button:not([disabled])', executeBtnStr)
  if (NFTcount > 1) {
    const numbersArr = Array.from({ length: NFTcount }, (_, index) => index + 1)
    numbersArr.forEach((number) => {
      cy.contains(number.toString()).should('be.visible')
    })
  }
}
