"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plane } from "lucide-react"

interface FlightOption {
  id: string
  airline: string
  departureTime: string
  arrivalTime: string
  price: string
  duration: string
}

interface FlightOptionsProps {
  isOpen: boolean
  onClose: () => void
  flights: FlightOption[]
  onSelectFlight: (flight: FlightOption) => void
}

export function FlightOptions({ isOpen, onClose, flights, onSelectFlight }: FlightOptionsProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Available Flights</DialogTitle>
          <DialogDescription>
            Select a flight from the options below
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {flights.map((flight) => (
            <Card
              key={flight.id}
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => onSelectFlight(flight)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Plane className="h-6 w-6" />
                    <div>
                      <h3 className="font-semibold">{flight.airline}</h3>
                      <div className="text-sm text-muted-foreground">
                        {flight.departureTime} - {flight.arrivalTime}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Duration: {flight.duration}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{flight.price}</div>
                    <Button variant="outline" size="sm" className="mt-2">
                      Select
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
} 