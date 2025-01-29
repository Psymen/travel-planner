"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Compass, Pin, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ActivityCardProps {
  title: string
  details: {
    date: string
    description: string
    price?: string | number
  }
  isPinned: boolean
  onPinClick?: () => void
  onDelete?: () => void
}

export function ActivityCard({ title, details, isPinned, onPinClick, onDelete }: ActivityCardProps) {
  const formatPrice = (price?: string | number) => {
    if (!price) return "TBD"
    if (typeof price === "string") return price
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(price)
  }

  return (
    <Card className={`bg-[#e76f51]/30 dark:bg-[#e76f51]/40 ${isPinned ? "border-2 border-[#e76f51]" : "border-[#e76f51]/20"} h-full flex flex-col group`}>
      <div className="bg-[#e76f51] dark:bg-[#e76f51] h-16 p-4 flex items-start space-x-3 rounded-t-lg relative">
        <div className="flex items-center gap-3 text-white pt-1 min-w-0">
          <div className="flex flex-col justify-center items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
            <div className="w-1 h-1 rounded-full bg-white/80" />
            <div className="w-1 h-1 rounded-full bg-white/80" />
            <div className="w-1 h-1 rounded-full bg-white/80" />
          </div>
          <Compass className="h-5 w-5 shrink-0" />
          <h3 className="font-medium text-lg tracking-tight font-display truncate">{title}</h3>
        </div>
      </div>
      <CardContent className="p-4 flex flex-col flex-1">
        <div className="text-base space-y-3 font-body">
          <p className="flex justify-between gap-4">
            <span className="text-[#e76f51]/70 dark:text-white/60 shrink-0">Date:</span>
            <span className="text-[#e76f51] dark:text-white text-right truncate">{details.date}</span>
          </p>
          <p className="mt-2 text-[#e76f51] dark:text-white leading-relaxed line-clamp-3">{details.description}</p>
        </div>
        <div className="flex-1" />
        <Badge variant="secondary" className="bg-[#e76f51]/10 dark:bg-white/10 text-[#e76f51] dark:text-white text-base font-body w-full justify-center">
          {formatPrice(details.price)}
        </Badge>
        <div className="flex justify-between pt-4 border-t border-[#e76f51]/20">
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="text-[#e76f51]/60 hover:text-[#e76f51] hover:bg-[#e76f51]/5 dark:text-white/60 dark:hover:text-white rounded-full h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          {onPinClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onPinClick}
              className={`${
                isPinned 
                  ? "text-[#e76f51] bg-[#e76f51]/10 hover:bg-[#e76f51]/20 dark:bg-white/10 dark:hover:bg-white/20" 
                  : "text-[#e76f51]/60 hover:text-[#e76f51] hover:bg-[#e76f51]/5 dark:text-white/60 dark:hover:text-white"
              } rounded-full h-8 w-8`}
            >
              <Pin className={`h-4 w-4 ${isPinned ? "fill-current" : ""}`} />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 