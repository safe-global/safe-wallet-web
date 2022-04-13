import { Identicon } from "@gnosis.pm/safe-react-components";
import { ReactElement } from "react";
import { connect } from "react-redux";
import { RootState } from "../../../store";
import css from "./styles.module.css";

interface SafeInfoProps {
  address: string;
  threshold: number;
  owners: number;
}

export const SafeInfo = (props: SafeInfoProps): ReactElement => {
  return (
    <div className={css.container}>
      <Identicon address={props.address} size="lg" />
    </div>
  );
};

function mapStateToProps(state: RootState): SafeInfoProps {
  const { safeInfo } = state;
  return {
    address: safeInfo.address.value,
    threshold: safeInfo.threshold,
    owners: safeInfo.owners.length,
  };
}

export default connect(mapStateToProps)(SafeInfo);
