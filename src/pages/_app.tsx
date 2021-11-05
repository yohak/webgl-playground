import "../styles/html5reset.css";
import "../styles/globals.css";
import { AppProps } from "next/app";
import React from "react";
import { RecoilRoot } from "recoil";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <RecoilRoot>
      <Component {...pageProps} />
    </RecoilRoot>
  );
}

export default MyApp;
