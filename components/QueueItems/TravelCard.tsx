"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plane, Pin, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TravelCardProps {
  title: string
  details: {
    airline: string
    departureTime: string
    arrivalTime: string
    price: string
    duration: string
  }
  isPinned: boolean
  onPinClick?: () => void
  onDelete?: () => void
}

export function TravelCard({ title, details, isPinned, onPinClick, onDelete }: TravelCardProps) {
  const formatPrice = (price?: string) => {
    if (!price) return "TBD"
    // If price is already formatted (starts with $), return as is
    if (price.startsWith('$')) return price
    // Otherwise, format the number
    const amount = parseFloat(price)
    if (isNaN(amount)) return 'TBD'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <Card className={`bg-[#264653]/30 dark:bg-[#264653]/40 ${isPinned ? "border-2 border-[#264653]" : "border-[#264653]/20"} h-full flex flex-col group`}>
      <div className="bg-[#264653] dark:bg-[#264653] h-16 p-4 flex items-start space-x-3 rounded-t-lg relative">
        <div className="flex items-center gap-3 text-white pt-1 min-w-0">
          <div className="flex flex-col justify-center items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
            <div className="w-1 h-1 rounded-full bg-white/80" />
            <div className="w-1 h-1 rounded-full bg-white/80" />
            <div className="w-1 h-1 rounded-full bg-white/80" />
          </div>
          <Plane className="h-5 w-5 shrink-0" />
          <h3 className="font-medium text-lg tracking-tight font-display truncate">{title}</h3>
        </div>
      </div>
      <CardContent className="p-4 flex flex-col flex-1">
        <div className="text-base space-y-3 font-body">
          <p className="flex justify-between gap-4">
            <span className="text-[#264653]/70 dark:text-white/60 shrink-0">Airline:</span>
            <span className="text-[#264653] dark:text-white text-right truncate">{details.airline}</span>
          </p>
          <p className="flex justify-between gap-4">
            <span className="text-[#264653]/70 dark:text-white/60 shrink-0">Departure:</span>
            <span className="text-[#264653] dark:text-white text-right truncate">{details.departureTime}</span>
          </p>
          <p className="flex justify-between gap-4">
            <span className="text-[#264653]/70 dark:text-white/60 shrink-0">Arrival:</span>
            <span className="text-[#264653] dark:text-white text-right truncate">{details.arrivalTime}</span>
          </p>
          <p className="flex justify-between gap-4">
            <span className="text-[#264653]/70 dark:text-white/60 shrink-0">Duration:</span>
            <span className="text-[#264653] dark:text-white text-right truncate">{details.duration}</span>
          </p>
        </div>
        <div className="flex-1" />
        <Badge variant="secondary" className="bg-[#264653]/10 dark:bg-white/10 text-[#264653] dark:text-white text-base font-body w-full justify-center">
          {formatPrice(details.price)}
        </Badge>
        <div className="flex justify-between pt-4 border-t border-[#264653]/20">
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="text-[#264653]/60 hover:text-[#264653] hover:bg-[#264653]/5 dark:text-white/60 dark:hover:text-white rounded-full h-8 w-8"
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
                  ? "text-[#264653] bg-[#264653]/10 hover:bg-[#264653]/20 dark:bg-white/10 dark:hover:bg-white/20" 
                  : "text-[#264653]/60 hover:text-[#264653] hover:bg-[#264653]/5 dark:text-white/60 dark:hover:text-white"
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