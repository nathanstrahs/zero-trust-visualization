import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Providers } from '@/components/ui/provider';
import { Toaster } from '@/components/ui/toaster';
import { Flex } from '@chakra-ui/react';
import { ColorModeButton } from '@/components/ui/color-mode';
import { ApplicableProvider } from '@/contexts/ExpansionContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Providers>
      <ApplicableProvider>
        <Flex as="header" p={4} justifyContent="flex-end">
          <ColorModeButton />
        </Flex>
        <Component {...pageProps} />
        <Toaster />
      </ApplicableProvider>
    </Providers>
  );
}

export default MyApp;