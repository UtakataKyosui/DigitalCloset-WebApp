import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Coordinate {
  pid: string
  name: string
  season?: string
  occasion?: string
  style?: string
  notes?: string
  clothes_count?: number
}

interface OutfitCardProps {
  outfit: Coordinate
}

export function OutfitCard({ outfit }: OutfitCardProps) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-lg">{outfit.name}</CardTitle>
        {outfit.notes && (
          <CardDescription className="text-sm">
            {outfit.notes}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {outfit.season && (
              <Badge variant="default" className="text-xs">
                {outfit.season}
              </Badge>
            )}
            {outfit.occasion && (
              <Badge variant="secondary" className="text-xs">
                {outfit.occasion}
              </Badge>
            )}
            {outfit.style && (
              <Badge variant="outline" className="text-xs">
                {outfit.style}
              </Badge>
            )}
          </div>
          {outfit.clothes_count && (
            <div className="text-sm text-muted-foreground">
              {outfit.clothes_count} {outfit.clothes_count === 1 ? 'item' : 'items'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}