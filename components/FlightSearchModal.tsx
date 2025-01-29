"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Loader2, ArrowRightLeft } from "lucide-react"
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
import { cn } from "@/lib/utils"
import { searchFlights } from "@/lib/flight-service"
import { FlightOptions } from "./FlightOptions"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"

interface FlightSearchModalProps {
  onSubmit: (flight: any) => void
  trigger?: React.ReactNode
}

export function FlightSearchModal({ onSubmit, trigger }: FlightSearchModalProps) {
  const { toast } = useToast()
  const [departureLocation, setDepartureLocation] = React.useState("")
  const [arrivalLocation, setArrivalLocation] = React.useState("")
  const [departureDate, setDepartureDate] = React.useState<Date>()
  const [returnDate, setReturnDate] = React.useState<Date>()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [flights, setFlights] = React.useState<any[]>([])
  const [showFlightOptions, setShowFlightOptions] = React.useState(false)

  const handleSwapLocations = () => {
    const temp = departureLocation
    setDepartureLocation(arrivalLocation)
    setArrivalLocation(temp)
  }

  const handleSearch = async () => {
    if (departureLocation && arrivalLocation && departureDate && returnDate) {
      setLoading(true)
      try {
        const flightOptions = await searchFlights(
          departureLocation,
          arrivalLocation,
          departureDate,
          returnDate
        )
        setFlights(flightOptions)
        setShowFlightOptions(true)
        setOpen(false)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to search flights. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
  }

  const handleFlightSelect = (flight: any) => {
    onSubmit(flight)
    setShowFlightOptions(false)
    setDepartureLocation("")
    setArrivalLocation("")
    setDepartureDate(undefined)
    setReturnDate(undefined)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || <Button variant="outline">Add Travel</Button>}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Search Flights</DialogTitle>
            <DialogDescription>
              Enter your travel details to find available flights.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <div className="flex flex-col space-y-4">
                <div className="relative">
                  <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center">
                    <Input
                      placeholder="From where?"
                      value={departureLocation}
                      onChange={(e) => setDepartureLocation(e.target.value)}
                      className="w-full"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleSwapLocations}
                      className="rounded-full hover:bg-accent"
                    >
                      <ArrowRightLeft className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder="Where to?"
                      value={arrivalLocation}
                      onChange={(e) => setArrivalLocation(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "justify-start text-left font-normal",
                        !departureDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {departureDate ? format(departureDate, "PPP") : <span>Pick a departure date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={departureDate}
                      onSelect={setDepartureDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "justify-start text-left font-normal",
                        !returnDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {returnDate ? format(returnDate, "PPP") : <span>Pick a return date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={returnDate}
                      onSelect={setReturnDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={handleSearch}
              disabled={!departureLocation || !arrivalLocation || !departureDate || !returnDate || loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Search Flights
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FlightOptions
        isOpen={showFlightOptions}
        onClose={() => setShowFlightOptions(false)}
        flights={flights}
        onSelectFlight={handleFlightSelect}
      />
    </>
  )
} 