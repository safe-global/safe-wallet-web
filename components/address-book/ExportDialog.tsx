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

const getCsvData = (addressBook: AddressBook, chainId: string) => {
  const COL_1 = 'address'
  const COL_2 = 'name'
  const COL_3 = 'chainId'

  const csvData = Object.entries(addressBook).reduce<{ [COL_1]: string; [COL_2]: string; [COL_3]: string }[]>(
    (acc, [address, name]) => {
      acc.push({
        [COL_1]: address,
        [COL_2]: name,
        [COL_3]: chainId,
      })
      return acc
    },
    [],
  )

  return csvData
}

const ExportDialog = ({ handleClose }: { handleClose: () => void }): ReactElement => {
  const chain = useCurrentChain()
  const addressBook = useAddressBook()
  const length = Object.keys(addressBook).length

  const { CSVDownloader, Type } = useCSVDownloader()

  const filename = `${chain!.chainName.toLowerCase()}-address-book-${new Date().toISOString().slice(0, 10)}`

  const csvData = useMemo(() => {
    if (!chain) {
      return []
    }

    return getCsvData(addressBook, chain.chainId)
  }, [addressBook, chain])

  return (
    <ModalDialog open onClose={handleClose} title="Export address book">
      <DialogContent>
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

        <Button
          variant="contained"
          disableElevation
          onClick={handleClose}
          disabled={!chain?.chainId}
          component={({ children, ...props }) => (
            <CSVDownloader filename={filename} bom config={{ delimiter: ',' }} data={csvData} {...props}>
              {children}
            </CSVDownloader>
          )}
        >
          Export
        </Button>
      </DialogActions>
    </ModalDialog>
  )
}

export default ExportDialog
