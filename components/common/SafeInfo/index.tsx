import { ReactElement } from "react";
import { connect } from "react-redux";
import { RootState } from "../../../store";
import Identicon from "../Identicon";
import css from "./styles.module.css";

interface SafeInfoProps {
  address: string;
  threshold: number;
  owners: number;
}

export const SafeInfo = (props: SafeInfoProps): ReactElement => {
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

function mapStateToProps(state: RootState): SafeInfoProps {
  const { safeInfo } = state;
  return {
    address: safeInfo.address.value,
    threshold: safeInfo.threshold,
    owners: safeInfo.owners.length,
  };
}

export default connect(mapStateToProps)(SafeInfo);
