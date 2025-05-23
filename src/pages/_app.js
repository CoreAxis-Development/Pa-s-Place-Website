import Head from 'next/head';
import '../styles/tailwind.css'; // or '../styles/custom.css'

function MyApp({ Component, pageProps }) {
  return (
      <>
        <Head>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Component {...pageProps} />
      </>
  );
}

export default MyApp;