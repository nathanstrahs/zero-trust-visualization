"use client"

import { ChakraProvider } from "@chakra-ui/react"
import { system, sys, theme } from "@/styles/theme"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={sys}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ColorModeProvider>
      <ChakraProvider value={theme}>{children}</ChakraProvider>
    </ColorModeProvider>
  )
}