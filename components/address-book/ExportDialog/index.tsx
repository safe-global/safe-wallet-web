import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { useCSVDownloader } from 'react-papaparse'
import { useMemo, type ReactElement } from 'react'

import ModalDialog from '@/components/common/ModalDialog'
import useAddressBook from '@/hooks/useAddressBook'
import { useCurrentChain } from '@/hooks/useChains'
import { AddressBook } from '@/store/addressBookSlice'

const COL_1 = 'address'
const COL_2 = 'name'
const COL_3 = 'chainId'

type CsvData = { [COL_1]: string; [COL_2]: string; [COL_3]: string }[]
export const _getCsvData = (addressBook: AddressBook, chainId: string) => {
  const csvData = Object.entries(addressBook).reduce<CsvData>((acc, [address, name]) => {
    acc.push({
      [COL_1]: address,
      [COL_2]: name,
      [COL_3]: chainId,
    })
    return acc
  }, [])

  return csvData
}

const ExportDialog = ({ handleClose }: { handleClose: () => void }): ReactElement => {
  const chain = useCurrentChain()
  const addressBook = useAddressBook()
  const length = Object.keys(addressBook).length

  const { CSVDownloader } = useCSVDownloader()

  // rinkeby-address-book-1970-01-01
  const filename = `${chain!.chainName.toLowerCase()}-address-book-${new Date().toISOString().slice(0, 10)}`

  const csvData = useMemo(() => {
    if (!chain) {
      return []
    }

    return _getCsvData(addressBook, chain.chainId)
  }, [addressBook, chain])

  return (
    <ModalDialog open onClose={handleClose} dialogTitle="Export address book">
      <DialogContent sx={{ p: '24px !important' }}>
        <Typography>
          You&apos;re about to export a CSV file with{' '}
          <b>
            {length} address book {length === 1 ? 'entry' : 'entries'}
          </b>
          .
          <br />
          <Link
            href="https://help.gnosis-safe.io/en/articles/5299068-address-book-export-and-import"
            target="_blank"
            rel="noreferrer"
            title="Learn about the address book import and export"
          >
            Learn about the address book import and export
          </Link>
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <CSVDownloader filename={filename} bom config={{ delimiter: ',' }} data={csvData} style={{ order: 2 }}>
          <Button variant="contained" disableElevation onClick={handleClose} disabled={!chain?.chainId}>
            Export
          </Button>
        </CSVDownloader>
      </DialogActions>
    </ModalDialog>
  )
}

export default ExportDialog
