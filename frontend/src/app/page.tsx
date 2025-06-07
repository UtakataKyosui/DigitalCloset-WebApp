'use client'

import { ClothesCard } from "@/components/clothes-card"
import { OutfitCard } from "@/components/outfit-card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

const sampleClothes = [
  {
    pid: "1",
    name: "Classic White T-Shirt",
    brand: "Uniqlo",
    category: "Tops",
    size: "M",
    color: "White",
    material: "Cotton",
    price: 15,
    stock: 5
  },
  {
    pid: "2", 
    name: "Dark Denim Jeans",
    brand: "Levi's",
    category: "Bottoms",
    size: "32",
    color: "Dark Blue",
    material: "Denim",
    price: 80,
    stock: 2
  },
  {
    pid: "3",
    name: "Black Leather Boots",
    brand: "Dr. Martens",
    category: "Shoes",
    size: "10",
    color: "Black",
    material: "Leather",
    price: 150,
    stock: 1
  }
]

const sampleOutfits = [
  {
    pid: "1",
    name: "Casual Weekend",
    season: "Spring",
    occasion: "Casual",
    style: "Relaxed",
    notes: "Perfect for a day out with friends",
    clothes_count: 3
  },
  {
    pid: "2",
    name: "Business Casual",
    season: "All Season",
    occasion: "Work",
    style: "Professional",
    notes: "Appropriate for office meetings",
    clothes_count: 4
  }
]

export default function Home() {
  const { isAuthenticated, user, isLoading } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-semibold mb-6 text-foreground">
            デジタルクローゼット
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            Digital Closet
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            あなたの洋服を整理して、素敵なコーディネートを見つけましょう
          </p>
        
        {!isLoading && (
          <div className="mt-12">
            {isAuthenticated ? (
              <div className="space-y-8">
                <div className="bg-card border border-border rounded-xl p-6 max-w-md mx-auto shadow-sm">
                  <p className="text-lg text-foreground text-center mb-2">おかえりなさい、{user?.name}さん</p>
                  <p className="text-muted-foreground text-center">今日はどんなコーディネートにしますか？</p>
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-sm mx-auto">
                  <Link href="/forms" className="flex-1">
                    <Button className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg">
                      アイテムを追加
                    </Button>
                  </Link>
                  <Link href="/clothes" className="flex-1">
                    <Button variant="outline" className="w-full py-3 border-border bg-background hover:bg-accent/50 rounded-lg">
                      洋服を見る
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="bg-card border border-border rounded-xl p-8 max-w-lg mx-auto shadow-sm">
                  <p className="text-xl text-foreground text-center mb-4">デジタルクローゼットへようこそ</p>
                  <p className="text-muted-foreground text-center">ログインして、あなたの洋服を管理しましょう</p>
                </div>
                <div className="flex justify-center">
                  <Link href="/auth">
                    <Button className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg">
                      はじめる
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

        <div className="space-y-16 mt-20">
          <section>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-semibold mb-4 text-foreground">最近の洋服</h2>
              <p className="text-muted-foreground">Recent Clothes</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {sampleClothes.map((item) => (
                <ClothesCard key={item.pid} item={item} />
              ))}
            </div>
          </section>

          <section>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-semibold mb-4 text-foreground">お気に入りのコーディネート</h2>
              <p className="text-muted-foreground">Favorite Outfits</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {sampleOutfits.map((outfit) => (
                <OutfitCard key={outfit.pid} outfit={outfit} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}