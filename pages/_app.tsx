import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ChakraProvider } from "@chakra-ui/react"
import { ReactJSXElement } from '@emotion/react/types/jsx-namespace'

function MyApp({ Component, pageProps }: AppProps):ReactJSXElement {
  return <ChakraProvider><Component {...pageProps} /></ChakraProvider>
}

export default MyApp
