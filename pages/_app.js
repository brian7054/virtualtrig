// pages/_app.js
import Head from "next/head";
import "../styles/globals.css";
import Navbar from "../components/Navbar";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>VIRTUALtrig — Make trig click</title>
        <meta name="theme-color" content="#0B1220" />

        {/* Favicons (auto light/dark) */}
        <link
          rel="icon"
          href="/favicon-light.svg"
          type="image/svg+xml"
          media="(prefers-color-scheme: light)"
        />
        <link
          rel="icon"
          href="/favicon-dark.svg"
          type="image/svg+xml"
          media="(prefers-color-scheme: dark)"
        />

        {/* Optional PNG fallbacks (uncomment after generating) */}
        {/*
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        */}

        {/* Open Graph */}
        <meta property="og:title" content="VIRTUALtrig" />
        <meta
          property="og:description"
          content="Interactive unit circle, AI tutoring, and practice that makes trig click."
        />
        <meta property="og:image" content="/social-card.png" />
        <meta property="og:type" content="website" />
      </Head>

      <Navbar />
      <Component {...pageProps} />
    </>
  );
}