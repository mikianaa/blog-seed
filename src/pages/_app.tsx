import { AppProps } from "next/app";
import Layout from "../components/layout";
import "../styles/globals.css";
import SEO from "../../next-seo.config";
import { DefaultSeo } from "next-seo";
import { SessionProvider } from "next-auth/react";

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Layout>
        <DefaultSeo {...SEO} />
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  );
}

export default MyApp;
