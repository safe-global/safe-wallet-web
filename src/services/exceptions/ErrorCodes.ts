/**
 * When creating a new error type, please try to group them semantically
 * with the existing errors in the same hundred. For example, if it's
 * related to fetching data from the backend, add it to the 6xx errors.
 * This is not a hard requirement, just a useful convention.
 */
enum ErrorCodes {
  ___0 = '0: No such error code',

  _100 = '100: Invalid input in the address field',
  _101 = '101: Failed to resolve the address',
  _103 = '103: Error creating a SafeTransaction',
  _104 = '104: Invalid chain short name in the URL',
  _105 = '105: Error initializing the Safe Core SDK',
  _106 = '106: Failed to get connected wallet',

  _302 = '302: Error connecting to the wallet',
  _303 = '303: Error creating pairing session',

  _600 = '600: Error fetching Safe info',
  _601 = '601: Error fetching balances',
  _602 = '602: Error fetching history txs',
  _603 = '603: Error fetching queued txs',
  _604 = '604: Error fetching collectibles',
  _607 = '607: Error fetching available currencies',
  _608 = '608: Error fetching messages',
  _609 = '609: Failed to retrieve SpendingLimits module information',
  _610 = '610: Error fetching safes by owner',
  _611 = '611: Error fetching gasPrice',
  _612 = '612: Error estimating gas',
  _616 = '616: Failed to retrieve recommended nonce',
  _619 = '619: Error fetching data from master-copies',
  _620 = '620: Error loading chains',
  _630 = '630: Error fetching remaining hourly relays',
  _631 = '631: Transaction failed to be relayed',
  _632 = '632: Error fetching relay task status',

  _700 = '700: Failed to read from local/session storage',
  _701 = '701: Failed to write to local/session storage',
  _702 = '702: Failed to remove from local/session storage',
  _703 = '703: Error importing an address book',
  _704 = '704: Error importing global data',

  _800 = '800: Safe creation tx failed',
  _801 = '801: Failed to send a tx with a spending limit',
  _804 = '804: Error processing a transaction',
  _806 = '806: Failed to remove module',
  _807 = '807: Failed to remove guard',
  _808 = '808: Failed to get transaction origin',

  _900 = '900: Error loading Safe App',
  _901 = '901: Error processing Safe Apps SDK request',
  _902 = '902: Error loading Safe Apps list',
  _903 = '903: Error loading Safe App manifest',
  _905 = '905: Third party cookies are disabled',
}

export default ErrorCodes
