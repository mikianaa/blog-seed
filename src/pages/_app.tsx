import type { AppProps } from "next/app";
import Layout from "../components/layout";
import "../styles/globals.css";
import { DefaultSeo } from "next-seo";
import SEO from "../../next-seo.config";
import { Amplify } from "aws-amplify";
import awsExports from "../aws-exports";
import Head from 'next/head';

Amplify.configure(awsExports, { ssr: true });

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <><Head>
      <link rel="icon" href="/favicon.ico" />
    </Head>
      <Layout>
        <DefaultSeo {...SEO} />
        <Component {...pageProps} />
      </Layout></>
  );
}

export default MyApp;