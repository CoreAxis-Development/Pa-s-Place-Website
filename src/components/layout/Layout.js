import Head from "next/head";
import Header from "./Header";
import Footer from "./Footer";
import { SITE } from "@/constants/site";

export default function Layout({ children, title, description }) {
  const pageTitle = title ? `${title} | ${SITE.name}` : SITE.name;
  const pageDescription = description || SITE.description;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </>
  );
}
