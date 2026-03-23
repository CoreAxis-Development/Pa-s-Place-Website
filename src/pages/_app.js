import "@/styles/globals.css";
import UnderConstruction from "@/components/UnderConstruction";

const isUnderConstruction =
  process.env.NEXT_PUBLIC_UNDER_CONSTRUCTION === "true";

export default function App({ Component, pageProps }) {
  if (isUnderConstruction) {
    return <UnderConstruction />;
  }

  return <Component {...pageProps} />;
}
