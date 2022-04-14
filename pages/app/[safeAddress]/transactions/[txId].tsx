import type {NextPage} from "next";
import {useRouter} from "next/router";

const SingleTransaction: NextPage = () => {
  const router = useRouter()
  let { txId = '' } = router.query
  return <main>Single view for {txId}</main>
};

export default SingleTransaction;
