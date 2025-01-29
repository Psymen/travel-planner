"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Hotel, Pin, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface HotelCardProps {
  title: string
  details: {
    checkIn: string
    checkOut: string
    price?: string
    nightlyRate?: number
  }
  isPinned: boolean
  onPinClick?: () => void
  onDelete?: () => void
}

export function HotelCard({ title, details, isPinned, onPinClick, onDelete }: HotelCardProps) {
  const formatPrice = (price?: string | number) => {
    if (!price) return "TBD"
    if (typeof price === "string") return price
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(price)
  }

  const calculateTotalPrice = () => {
    if (!details.nightlyRate || !details.checkIn || !details.checkOut) {
      return formatPrice(details.price)
    }

    const checkIn = new Date(details.checkIn)
    const checkOut = new Date(details.checkOut)
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    const totalPrice = details.nightlyRate * nights

    return formatPrice(totalPrice)
  }

  return (
    <Card className={`bg-[#2a9d8f]/30 dark:bg-[#2a9d8f]/40 ${isPinned ? "border-2 border-[#2a9d8f]" : "border-[#2a9d8f]/20"} h-full flex flex-col group`}>
      <div className="bg-[#2a9d8f] dark:bg-[#2a9d8f] h-16 p-4 flex items-start space-x-3 rounded-t-lg relative">
        <div className="flex items-center gap-3 text-white pt-1 min-w-0">
          <div className="flex flex-col justify-center items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
            <div className="w-1 h-1 rounded-full bg-white/80" />
            <div className="w-1 h-1 rounded-full bg-white/80" />
            <div className="w-1 h-1 rounded-full bg-white/80" />
          </div>
          <Hotel className="h-5 w-5 shrink-0" />
          <h3 className="font-medium text-lg tracking-tight font-display truncate">{title}</h3>
        </div>
      </div>
      <CardContent className="p-4 flex flex-col flex-1">
        <div className="text-base space-y-3 font-body">
          <p className="flex justify-between gap-4">
            <span className="text-[#2a9d8f]/70 dark:text-white/60 shrink-0">Check-in:</span>
            <span className="text-[#2a9d8f] dark:text-white text-right truncate">{details.checkIn}</span>
          </p>
          <p className="flex justify-between gap-4">
            <span className="text-[#2a9d8f]/70 dark:text-white/60 shrink-0">Check-out:</span>
            <span className="text-[#2a9d8f] dark:text-white text-right truncate">{details.checkOut}</span>
          </p>
          {details.nightlyRate && (
            <p className="flex justify-between gap-4">
              <span className="text-[#2a9d8f]/70 dark:text-white/60 shrink-0">Per Night:</span>
              <span className="text-[#2a9d8f] dark:text-white text-right truncate">{formatPrice(details.nightlyRate)}</span>
            </p>
          )}
        </div>
        <div className="flex-1" />
        <Badge variant="secondary" className="bg-[#2a9d8f]/10 dark:bg-white/10 text-[#2a9d8f] dark:text-white text-base font-body w-full justify-center">
          {calculateTotalPrice()}
        </Badge>
        <div className="flex justify-between pt-4 border-t border-[#2a9d8f]/20">
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="text-[#2a9d8f]/60 hover:text-[#2a9d8f] hover:bg-[#2a9d8f]/5 dark:text-white/60 dark:hover:text-white rounded-full h-8 w-8"
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
                  ? "text-[#2a9d8f] bg-[#2a9d8f]/10 hover:bg-[#2a9d8f]/20 dark:bg-white/10 dark:hover:bg-white/20" 
                  : "text-[#2a9d8f]/60 hover:text-[#2a9d8f] hover:bg-[#2a9d8f]/5 dark:text-white/60 dark:hover:text-white"
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