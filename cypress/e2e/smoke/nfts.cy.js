import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as nfts from '../pages/nfts.pages'

const nftsName = 'BillyNFT721'
const nftsAddress = '0x0000...816D'
const nftsTokenID = 'Kitaro World #261'
const nftsLink = 'https://testnets.opensea.io/assets/0x000000000faE8c6069596c9C805A1975C657816D/443'

describe('NFTs tests', () => {
  before(() => {
    cy.clearLocalStorage()
    cy.visit(constants.balanceNftsUrl + constants.GOERLI_TEST_SAFE)
    main.acceptCookies()
    cy.contains(constants.goerlyE2EWallet)
  })

  it('Verify that NFTs exist in the table [C56123]', () => {
    nfts.verifyNFTNumber(5)
  })

  it('Verify NFT row contains data [C56124]', () => {
    nfts.verifyDataInTable(nftsName, nftsAddress, nftsTokenID, nftsLink)
  })

  it('Verify NFT preview window can be opened [C56125]', () => {
    nfts.openFirstNFT()
    nfts.verifyNameInNFTModal(nftsTokenID)
    nfts.preventBaseMainnetGoerliFromBeingSelected()
    nfts.verifyNFTModalLink(nftsLink)
    nfts.closeNFTModal()
  })

  it('Verify NFT open does not open if no NFT exits [C56126]', () => {
    nfts.clickOnThirdNFT()
    nfts.verifyNFTModalDoesNotExist()
  })

  it('Verify multipls NFTs can be selected and reviewed [C56127]', () => {
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
