"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="sg-touch-target relative w-[44px] h-[44px] flex items-center justify-center rounded-full bg-[#f9ecde] dark:bg-[#1a2418] shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-[rgba(238,224,210,0.4)] dark:border-[rgba(161,212,148,0.2)] hover:scale-110 transition-transform duration-200 cursor-pointer"
      aria-label="Toggle theme"
    >
      <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-[#154212]" />
      <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-[#a1d494]" />
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
