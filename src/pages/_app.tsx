import { AppProps } from 'next/app';
import Layout from '../components/layout';
import '../styles/globals.css';
import SEO from '../../next-seo.config';
import { DefaultSeo } from 'next-seo';

function MyApp({ Component, pageProps } : AppProps) {
    return (
      <Layout>
        <DefaultSeo {...SEO} />
        <Component {...pageProps} />
      </Layout>
    );
  }
  
export default MyApp;