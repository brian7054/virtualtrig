import '../styles/globals.css';
import Navbar from '../components/Navbar';

import Head from "next/head";
import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>VIRTUALtrig — Make trig click</title>
        <meta name="theme-color" content="#0B1220" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <!-- Optional fallbacks if/when you add PNGs -->
        <!-- <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" /> -->
        <!-- <link rel="apple-touch-icon" href="/apple-touch-icon.png" /> -->
        <meta property="og:title" content="VIRTUALtrig" />
        <meta property="og:description" content="Interactive unit circle, AI tutoring, and practice that makes trig click." />
        <meta property="og:image" content="/virtualtrig-wordmark.svg" />
        <meta property="og:type" content="website" />
<link rel="icon" href="/favicon-light.svg" type="image/svg+xml" media="(prefers-color-scheme: light)" />
<link rel="icon" href="/favicon-dark.svg"  type="image/svg+xml" media="(prefers-color-scheme: dark)" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
<meta property="og:image" content="/social-card.png" />
<meta name="theme-color" content="#0B1220" />

      </Head>
      <Component {...pageProps} />
    </>
  );
}


export default function App({ Component, pageProps }) {
  return (
    <>
      <Navbar />
      <Component {...pageProps} />
    </>
  );
}
