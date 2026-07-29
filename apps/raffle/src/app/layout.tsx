import type { PropsWithChildren } from 'react';
import type { Metadata } from 'next';

import { LayoutBackground } from '@ergo-raffle/ui-kit';

import { Footer, Header } from '@/components';

import { AppProviders } from './(providers)';
import { fraunces, karla, poppins } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ergo Raffle',
  description: 'Ergo raffle is a crowdfunding system based on ergo contracts'
};

export const revalidate = 30;

const RootLayout = async ({ children }: PropsWithChildren) => (
  <html
    lang="en"
    className={`
        ${fraunces.variable}
        ${poppins.variable}
        ${karla.variable} 
      `}
    suppressHydrationWarning
  >
    <body className="antialiased">
      <AppProviders>
        <LayoutBackground>
          <Header />
          <div className="container min-h-dvh">{children}</div>
          <Footer />
        </LayoutBackground>
      </AppProviders>
    </body>
  </html>
);
export default RootLayout;
