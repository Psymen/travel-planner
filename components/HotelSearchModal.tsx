"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Loader2, Star, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { searchHotels, calculateTotalPrice } from "@/lib/hotel-service"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface Hotel {
  id: string;
  name: string;
  description: string;
  nightlyRate: number;
  rating: number;
  amenities: string[];
  location: string;
}

interface HotelSearchModalProps {
  onSubmit: (hotelDetails: {
    name: string;
    checkIn: Date;
    checkOut: Date;
    nightlyRate: number;
  }) => void;
  trigger?: React.ReactNode;
}

export function HotelSearchModal({ onSubmit, trigger }: HotelSearchModalProps) {
  const { toast } = useToast()
  const [selectedHotel, setSelectedHotel] = React.useState<Hotel | null>(null)
  const [checkIn, setCheckIn] = React.useState<Date>()
  const [checkOut, setCheckOut] = React.useState<Date>()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [hotels, setHotels] = React.useState<Hotel[]>([])
  const [showHotels, setShowHotels] = React.useState(false)
  const [totalPrice, setTotalPrice] = React.useState<number | null>(null)

  const hasInvalidDates = React.useMemo(() => {
    if (!checkIn || !checkOut) return false;
    return checkIn >= checkOut;
  }, [checkIn, checkOut]);

  const handleSearch = async () => {
    if (checkIn && checkOut && !hasInvalidDates) {
      setLoading(true)
      try {
        const hotelOptions = await searchHotels('Paris') // TODO: Make location dynamic
        setHotels(hotelOptions)
        setShowHotels(true)
        setOpen(false)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load hotel options. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
  }

  React.useEffect(() => {
    // Always calculate a price, even with invalid dates
    const price = calculateTotalPrice(
      selectedHotel?.nightlyRate,
      checkIn,
      checkOut
    )
    setTotalPrice(price)
  }, [selectedHotel, checkIn, checkOut])

  const handleSubmit = () => {
    if (selectedHotel && checkIn && checkOut) {
      onSubmit({
        name: selectedHotel.name,
        checkIn,
        checkOut,
        nightlyRate: selectedHotel.nightlyRate,
      })
      setShowHotels(false)
      setSelectedHotel(null)
      setCheckIn(undefined)
      setCheckOut(undefined)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || <Button variant="outline">Add Hotel</Button>}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Book Hotel</DialogTitle>
            <DialogDescription>
              First, select your check-in and check-out dates.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col space-y-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "justify-start text-left font-normal",
                      !checkIn && "text-muted-foreground",
                      hasInvalidDates && "border-red-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkIn ? format(checkIn, "PPP") : <span>Check-in date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={checkIn}
                    onSelect={setCheckIn}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "justify-start text-left font-normal",
                      !checkOut && "text-muted-foreground",
                      hasInvalidDates && "border-red-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkOut ? format(checkOut, "PPP") : <span>Check-out date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={checkOut}
                    onSelect={setCheckOut}
                    initialFocus
                    disabled={(date) => date < (checkIn || new Date())}
                  />
                </PopoverContent>
              </Popover>
              {hasInvalidDates && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Check-out date must be after check-in date
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={handleSearch}
              disabled={!checkIn || !checkOut || hasInvalidDates || loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Search Hotels
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showHotels} onOpenChange={setShowHotels}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Available Hotels</DialogTitle>
            <DialogDescription>
              Select a hotel for your stay from {checkIn && format(checkIn, "PPP")} to {checkOut && format(checkOut, "PPP")}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] rounded-md border p-4">
            <div className="grid gap-4">
              {hotels.map((hotel) => (
                <Card 
                  key={hotel.id}
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-accent",
                    selectedHotel?.id === hotel.id && "border-primary"
                  )}
                  onClick={() => setSelectedHotel(hotel)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{hotel.name}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span className="text-sm">{hotel.rating}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{hotel.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(hotel.nightlyRate)}</p>
                        <p className="text-sm text-muted-foreground">per night</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{hotel.description}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {hotel.amenities.map((amenity, index) => (
                        <Badge key={index} variant="secondary">{amenity}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
          {selectedHotel && totalPrice && (
            <div className="rounded-lg bg-muted p-4 mt-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Room rate</span>
                  <span className="text-sm">
                    {formatPrice(selectedHotel.nightlyRate)} × {checkIn && checkOut ? Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))) : 1} nights
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Taxes & fees</span>
                  <span className="text-sm">
                    {formatPrice(totalPrice - (selectedHotel.nightlyRate * (checkIn && checkOut ? Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))) : 1)))}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold">{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              onClick={handleSubmit}
              disabled={!selectedHotel || !checkIn || !checkOut || hasInvalidDates}
            >
              Book Hotel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 