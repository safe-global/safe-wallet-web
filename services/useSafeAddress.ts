import { useRouter } from "next/router";
import { shortNames } from "config/chans";

const useSafeAddress = (): { address: string, chainId: string } => {
  const router = useRouter();
  let { safeAddress = '' } = router.query;
  if (Array.isArray(safeAddress)) safeAddress = safeAddress[0]
  const [ prefix, address ] = safeAddress.split(':');
  const chainId = shortNames[prefix];
  return { address, chainId };
}

export default useSafeAddress
