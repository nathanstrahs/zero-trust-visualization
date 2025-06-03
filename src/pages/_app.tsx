import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Provider } from '@/components/ui/provider';
import { Toaster } from '@/components/ui/toaster';


export const App = ({ Component }: AppProps) => (
  <Provider>
    <Component />
    <Toaster />
  </Provider>
)

export default App;