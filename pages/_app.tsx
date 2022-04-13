import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { store } from "../store";
import useChains from "services/useChains";

function SafeWebCore({ Component, pageProps }: AppProps) {
  useChains();

  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
}

export default SafeWebCore;
