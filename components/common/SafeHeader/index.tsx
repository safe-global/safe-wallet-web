import { ReactElement } from "react";
import { connect } from "react-redux";
import { RootState } from "../../../store";
import Identicon from "../Identicon";
import css from "./styles.module.css";

interface SafeHeaderProps {
  address: string;
  threshold: number;
  owners: number;
}

export const SafeHeader = (props: SafeHeaderProps): ReactElement => {
  return (
    <div className={css.container}>
      <Identicon address={props.address} />
      <div>
        {props.threshold}/{props.owners}
      </div>
      {props.address}
    </div>
  );
};

function mapStateToProps(state: RootState): SafeHeaderProps {
  const { safeInfo } = state;
  return {
    address: safeInfo.address.value,
    threshold: safeInfo.threshold,
    owners: safeInfo.owners.length,
  };
}

export default connect(mapStateToProps)(SafeHeader);
