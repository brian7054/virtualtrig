// pages/_app.js
import Head from "next/head";
import "../styles/globals.css";
import Navbar from "../components/Navbar";
import { ClerkProvider } from "@clerk/nextjs";

const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function App({ Component, pageProps }) {
  const AppShell = (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Component {...pageProps} />
      </main>
    </div>
  );

  return (
    <>
      <Head>
        <title>VIRTUALtrig — Make trig click</title>
        <meta name="theme-color" content="#0B1220" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      {pk ? (
        <ClerkProvider publishableKey={pk}>
          {AppShell}
        </ClerkProvider>
      ) : (
        AppShell
      )}
    </>
  );
}
