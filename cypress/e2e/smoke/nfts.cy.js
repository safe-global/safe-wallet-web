import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as nfts from '../pages/nfts.pages'

const nftsName = 'BillyNFT721'
const nftsAddress = '0x0000...816D'
const nftsTokenID = 'Kitaro World #261'
const nftsLink = 'https://testnets.opensea.io/assets/0x000000000faE8c6069596c9C805A1975C657816D/443'

describe('Assets > NFTs', () => {
  before(() => {
    cy.clearLocalStorage()
    cy.visit(constants.balanceNftsUrl + constants.GOERLI_TEST_SAFE)
    main.acceptCookies()
    cy.contains(constants.goerlyE2EWallet)
  })

  describe('should have NFTs', () => {
    it('should have NFTs in the table', () => {
      nfts.verifyNFTNumber(5)
    })

    it('should have info in the NFT row', () => {
      nfts.verifyDataInTable(nftsName, nftsAddress, nftsTokenID, nftsLink)
    })

    it('should open an NFT preview', () => {
      nfts.openFirstNFT()
      nfts.verifyNameInNFTModal(nftsTokenID)
      nfts.preventBaseMainnetGoerliFromBeingSelected()
      nfts.verifyNFTModalLink(nftsLink)
      nfts.closeNFTModal()
    })

    it('should not open an NFT preview for NFTs without one', () => {
      nfts.clickOnThirdNFT()
      nfts.verifyNFTModalDoesNotExist()
    })

    it('should select and send multiple NFTs', () => {
      nfts.verifyInitialNFTData()
      nfts.selectNFTs(3)
      nfts.deselectNFTs([2], 3)
      nfts.sendNFT(2)
      nfts.verifyNFTModalData()
      nfts.typeRecipientAddress(constants.GOERLI_TEST_SAFE)
      nfts.clikOnNextBtn()
      nfts.verifyReviewModalData(2)
    })
  })
})
