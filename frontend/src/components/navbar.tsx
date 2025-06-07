"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AuthNav } from "@/components/auth-nav"

export function Navbar() {
  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container flex h-16 items-center px-6">
        <div className="mr-8 flex">
          <Link href="/" className="mr-8 flex items-center space-x-3">
            <span className="text-xl font-semibold text-foreground">
              デジタルクローゼット
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/forms" className="text-muted-foreground hover:text-foreground transition-colors">
              アイテム追加
            </Link>
            <Link href="/clothes" className="text-muted-foreground hover:text-foreground transition-colors">
              洋服
            </Link>
            <Link href="/coordinates" className="text-muted-foreground hover:text-foreground transition-colors">
              コーディネート
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search can go here later */}
          </div>
          <nav className="flex items-center space-x-2">
            <AuthNav />
          </nav>
        </div>
      </div>
    </nav>
  )
}