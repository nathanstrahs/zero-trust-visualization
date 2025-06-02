import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { defaultSystem } from '@chakra-ui/react';
import { Provider } from '@/components/ui/provider';


// export default function App({ Component, pageProps }: AppProps) {
//   return (
//     <ChakraProvider theme={customtheme}>
//       <Component {...pageProps} />
//     </ChakraProvider>
//   );
// }


export const App = ({ Component }: AppProps) => (
  <Provider>
    <Component />
  </Provider>
)

export default App;