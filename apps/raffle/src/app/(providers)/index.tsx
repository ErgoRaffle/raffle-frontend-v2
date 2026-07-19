'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import {
  type AnchorComponent,
  FrameworkProvider,
  type ImageComponent as ImageComponentType,
  ThemeProvider,
  Toaster
} from '@ergo-raffle/ui-kit';

import { WalletDialog } from '@/components';
import { WalletProvider } from '@/providers';

const Anchor: AnchorComponent = (props) => <Link {...props} />;
const ImageComponent: ImageComponentType = (props) => <Image {...props} />;

export const AppProviders = ({ children }: { children: ReactNode }) => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <Toaster />
    <FrameworkProvider components={{ Anchor, Image: ImageComponent }}>
      <WalletProvider>
        {children}
        <WalletDialog />
      </WalletProvider>
    </FrameworkProvider>
  </ThemeProvider>
);
