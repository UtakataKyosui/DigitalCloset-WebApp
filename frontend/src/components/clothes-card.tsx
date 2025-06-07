import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ClothesItem {
  pid: string
  name: string
  brand?: string
  category: string
  size?: string
  color?: string
  material?: string
  price?: number
  stock: number
}

interface ClothesCardProps {
  item: ClothesItem
}

export function ClothesCard({ item }: ClothesCardProps) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{item.name}</CardTitle>
          <Badge variant="secondary">{item.category}</Badge>
        </div>
        {item.brand && (
          <CardDescription className="text-sm text-muted-foreground">
            {item.brand}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {item.color && (
              <Badge variant="outline" className="text-xs">
                {item.color}
              </Badge>
            )}
            {item.size && (
              <Badge variant="outline" className="text-xs">
                Size {item.size}
              </Badge>
            )}
            {item.material && (
              <Badge variant="outline" className="text-xs">
                {item.material}
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between text-sm">
            {item.price && (
              <span className="font-semibold">${item.price}</span>
            )}
            <span className={`${item.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}