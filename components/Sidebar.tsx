"use client"

import { useState } from "react"
import { PlusCircle, Plane, Hotel, Compass, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ThemeToggle } from "./theme-toggle"
import { FlightSearchModal } from "./FlightSearchModal"
import { HotelSearchModal } from "./HotelSearchModal"
import { ActivityModal } from "./ActivityModal"
import { AIAdviceDialog } from "./AIAdviceDialog"
import { TravelCard } from "./QueueItems/TravelCard"
import { HotelCard } from "./QueueItems/HotelCard"
import { ActivityCard } from "./QueueItems/ActivityCard"
import { Draggable, Droppable } from "@hello-pangea/dnd"

type CardType = "travel" | "hotel" | "activity"

interface QueueItem {
  id: string
  type: CardType
  title: string
  details?: {
    airline?: string
    departureTime?: string
    arrivalTime?: string
    price?: string
    duration?: string
    checkIn?: string
    checkOut?: string
    nightlyRate?: number
    date?: string
    description?: string
  }
}

interface SidebarProps {
  onAddCard: (type: CardType) => void
  onAddToQueue: (item: QueueItem) => void
  onRemoveFromQueue: (id: string) => void
  queue: QueueItem[]
  agenda: any[]
  showAdvice: boolean
  setShowAdvice: (show: boolean) => void
}

export function PlannerSidebar({ onAddCard, onAddToQueue, onRemoveFromQueue, queue, agenda, showAdvice, setShowAdvice }: SidebarProps) {
  const handleFlightSelect = (flight: any) => {
    onAddToQueue({
      id: `queue-${Date.now()}`,
      type: "travel",
      title: flight.airline ? `${flight.airline} Flight` : "Flight to Paris",
      details: {
        airline: flight.airline,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        price: flight.price,
        duration: flight.duration,
      },
    })
  }

  const handleHotelSelect = (hotel: { 
    name: string; 
    checkIn: Date; 
    checkOut: Date;
    nightlyRate?: number;
    price?: string;
  }) => {
    const defaultNightlyRate = 200;
    const nightlyRate = hotel.nightlyRate || defaultNightlyRate;
    const defaultTotalPrice = formatPrice(nightlyRate * 6); // 6 nights by default

    onAddToQueue({
      id: `queue-${Date.now()}`,
      type: "hotel",
      title: hotel.name,
      details: {
        checkIn: hotel.checkIn.toLocaleDateString(),
        checkOut: hotel.checkOut.toLocaleDateString(),
        nightlyRate: nightlyRate,
        price: hotel.price || defaultTotalPrice,
      },
    })
  }

  const handleActivitySelect = (activity: { 
    name: string; 
    date: Date; 
    description: string;
    price?: number | string;
  }) => {
    const formattedPrice = typeof activity.price === 'number' ? 
      formatPrice(activity.price) : 
      (activity.price || "$150");

    onAddToQueue({
      id: `queue-${Date.now()}`,
      type: "activity",
      title: activity.name,
      details: {
        date: activity.date.toLocaleDateString(),
        description: activity.description,
        price: formattedPrice,
      },
    })
  }

  const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <>
      <div className="w-80 flex flex-col h-full border-r bg-zinc-50 dark:bg-zinc-900">
        <div className="p-4 pt-12">
          <div className="grid grid-cols-1 gap-2">
            <FlightSearchModal
              onSubmit={handleFlightSelect}
              trigger={
                <Button variant="outline" className="w-full justify-start bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  <Plane className="mr-2 h-4 w-4" /> Travel
                </Button>
              }
            />
            <HotelSearchModal
              onSubmit={handleHotelSelect}
              trigger={
                <Button variant="outline" className="w-full justify-start bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  <Hotel className="mr-2 h-4 w-4" /> Hotel
                </Button>
              }
            />
            <ActivityModal
              onSubmit={handleActivitySelect}
              trigger={
                <Button variant="outline" className="w-full justify-start bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  <Compass className="mr-2 h-4 w-4" /> Activity
                </Button>
              }
            />
            <Button 
              variant="secondary" 
              className="w-full justify-start bg-purple-500 hover:bg-purple-600 text-white"
              onClick={() => setShowAdvice(true)}
            >
              <Sparkles className="mr-2 h-4 w-4" /> Get AI Advice
            </Button>
          </div>
        </div>
        <Separator />
        <div className="flex-1 overflow-hidden">
          <div className="p-4">
            <h2 className="text-sm font-semibold">Queue</h2>
          </div>
          <ScrollArea className="h-[calc(100vh-280px)]">
            <Droppable droppableId="queue">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="p-4 pt-0 space-y-4"
                >
                  {queue.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          {item.type === "travel" && (
                            <TravelCard
                              title={item.title}
                              details={{
                                airline: item.details?.airline || "",
                                departureTime: item.details?.departureTime || "",
                                arrivalTime: item.details?.arrivalTime || "",
                                price: item.details?.price || "$1,249",
                                duration: item.details?.duration || "",
                              }}
                              isPinned={false}
                              onPinClick={undefined}
                              onDelete={() => onRemoveFromQueue(item.id)}
                            />
                          )}
                          {item.type === "hotel" && (
                            <HotelCard
                              title={item.title}
                              details={{
                                checkIn: item.details?.checkIn || "",
                                checkOut: item.details?.checkOut || "",
                                price: item.details?.price || "$1,200",
                                nightlyRate: item.details?.nightlyRate || 200,
                              }}
                              isPinned={false}
                              onPinClick={undefined}
                              onDelete={() => onRemoveFromQueue(item.id)}
                            />
                          )}
                          {item.type === "activity" && (
                            <ActivityCard
                              title={item.title}
                              details={{
                                date: item.details?.date || "",
                                description: item.details?.description || "",
                                price: item.details?.price || "$150",
                              }}
                              isPinned={false}
                              onPinClick={undefined}
                              onDelete={() => onRemoveFromQueue(item.id)}
                            />
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </ScrollArea>
        </div>
        <div className="p-4 border-t">
          <ThemeToggle />
        </div>
      </div>
      <AIAdviceDialog
        open={showAdvice}
        onOpenChange={setShowAdvice}
        agenda={agenda}
      />
    </>
  )
}

