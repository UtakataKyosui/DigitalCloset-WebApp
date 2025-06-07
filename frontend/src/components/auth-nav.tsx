'use client'

import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'

export function AuthNav() {
  const { user, isAuthenticated, logout, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="h-6 w-16 bg-muted/30 rounded animate-pulse"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center space-x-4">
        <a
          href="/auth"
          className="text-muted-foreground hover:text-foreground px-4 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-accent/50"
        >
          ログイン
        </a>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm text-foreground">
        {user?.name}さん
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={logout}
        className="text-sm border-border bg-background hover:bg-accent/50 transition-colors rounded-lg"
      >
        ログアウト
      </Button>
    </div>
  )
}