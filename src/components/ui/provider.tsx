"use client"

import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { system, sys } from "@/styles/theme"
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
