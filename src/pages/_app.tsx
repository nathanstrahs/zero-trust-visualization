import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Provider, Providers } from '@/components/ui/provider';
import { Toaster } from '@/components/ui/toaster';
import { Flex } from '@chakra-ui/react';
import { ColorModeButton } from '@/components/ui/color-mode';

export const App = ({ Component }: AppProps) => (
  <Provider>
    <Component />
    <Toaster />
  </Provider>
)
function MyApp({ Component }: AppProps) {
  return (
    <Providers>
      <Flex as="header" p={4} justifyContent="flex-end">
        <ColorModeButton />
      </Flex>
      <Component />
      <Toaster />
    </Providers>
  );
}

export default MyApp;