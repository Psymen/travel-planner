"use client"

import * as React from "react"
import { Loader2, Clock, Check, Pin, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getItineraryAdvice } from "@/lib/openai-service"
import { useToast } from "@/components/ui/use-toast"
import { TravelCard } from "./QueueItems/TravelCard"
import { HotelCard } from "./QueueItems/HotelCard"
import { ActivityCard } from "./QueueItems/ActivityCard"

interface AIAdviceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agenda: any[]
  onSelectItinerary?: (items: any[]) => void
}

export function AIAdviceDialog({ open, onOpenChange, agenda, onSelectItinerary }: AIAdviceDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null)
  const [advice, setAdvice] = React.useState<{
    originalItinerary: any[];
    alternativeItineraries: Array<{
      items: any[];
      explanation: string;
    }>;
  } | null>(null)

  const fetchAdvice = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getItineraryAdvice(agenda)
      setAdvice(result)
    } catch (error) {
      console.error('Error getting AI advice:', error)
      setError(error instanceof Error ? error.message : 'Failed to get AI advice')
      toast({
        title: "Error",
        description: "Failed to get AI advice. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [agenda, toast])

  React.useEffect(() => {
    if (open && !advice && !error) {
      fetchAdvice()
    }
    if (!open) {
      setSelectedIndex(null)
      setAdvice(null)
      setError(null)
    }
  }, [open, agenda, fetchAdvice])

  const renderCard = (item: any) => {
    switch (item.type) {
      case "travel":
        return (
          <TravelCard
            title={item.title}
            isPinned={item.isPinned}
            details={{
              airline: item.details?.airline || "",
              departureTime: item.details?.departureTime || "",
              arrivalTime: item.details?.arrivalTime || "",
              price: item.details?.price || "",
              duration: item.details?.duration || "",
            }}
          />
        )
      case "hotel":
        return (
          <HotelCard
            title={item.title}
            isPinned={item.isPinned}
            details={{
              checkIn: item.details?.checkIn || "",
              checkOut: item.details?.checkOut || "",
              price: item.details?.price || "",
              nightlyRate: item.details?.nightlyRate || 0,
            }}
          />
        )
      case "activity":
        return (
          <ActivityCard
            title={item.title}
            isPinned={item.isPinned}
            details={{
              date: item.details?.date || "",
              description: item.description || "",
              price: item.details?.price || "",
            }}
          />
        )
      default:
        return null
    }
  }

  const handleSelect = (index: number | null) => {
    setSelectedIndex(index)
    if (index !== null && onSelectItinerary) {
      onSelectItinerary(index === -1 ? advice!.originalItinerary : advice!.alternativeItineraries[index].items)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] h-[90vh] p-6 flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg">AI Travel Advisor</DialogTitle>
          <DialogDescription className="text-sm">
            Here are some alternative itineraries based on your current plan. Hover over each row to see details and click to select.
            <div className="mt-2 flex items-center gap-2 text-xs">
              <Pin className="h-3 w-3 fill-purple-500 text-purple-500" /> = Pinned item (will appear in all alternatives)
            </div>
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Generating alternative itineraries...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-4">
                <p className="text-sm">{error}</p>
              </div>
              <Button 
                variant="outline" 
                onClick={fetchAdvice}
                className="mx-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        ) : advice ? (
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-4">
              {/* Original Itinerary */}
              <div 
                className={`relative p-4 rounded-lg transition-all cursor-pointer
                  ${selectedIndex === -1 ? 'bg-purple-100 dark:bg-purple-900/20' : 'bg-background hover:bg-muted/50'}
                  border-2 ${selectedIndex === -1 ? 'border-purple-500' : 'border-border hover:border-muted-foreground/25'}`}
                onClick={() => handleSelect(-1)}
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold text-base">Original Itinerary</h3>
                  {selectedIndex === -1 && (
                    <Check className="h-4 w-4 text-purple-500" />
                  )}
                </div>
                <div className="flex gap-3">
                  {advice.originalItinerary.map((item, idx) => (
                    <div key={idx} className="w-[260px] flex-shrink-0 relative">
                      {item.isPinned && (
                        <div className="absolute -top-1 -right-1 z-10 bg-purple-500 text-white rounded-full p-0.5">
                          <Pin className="h-3 w-3 fill-current" />
                        </div>
                      )}
                      {renderCard(item)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Alternative Itineraries */}
              {advice.alternativeItineraries.map((alternative, index) => {
                // Get pinned items from original itinerary
                const pinnedItems = advice.originalItinerary.filter(item => item.isPinned);
                // Combine pinned items with alternative items, excluding any that would conflict with pinned items
                const combinedItems = [
                  ...pinnedItems,
                  ...alternative.items.filter(item => 
                    !pinnedItems.some(pinned => 
                      pinned.time === item.time && 
                      pinned.title !== item.title
                    )
                  )
                ].sort((a, b) => {
                  // Convert time strings to numbers for comparison
                  const getTimeValue = (time: string) => {
                    if (!time) return 0;
                    // Remove any non-numeric characters except colon
                    const cleanTime = time.replace(/[^\d:]/g, '');
                    // Split into hours and minutes
                    const [hours, minutes] = cleanTime.split(':').map(Number);
                    // Convert to minutes since midnight for easy comparison
                    return (hours || 0) * 60 + (minutes || 0);
                  };

                  const timeA = getTimeValue(a.time);
                  const timeB = getTimeValue(b.time);
                  return timeA - timeB;
                });

                return (
                  <div
                    key={index}
                    className={`relative p-4 rounded-lg transition-all cursor-pointer
                      ${selectedIndex === index ? 'bg-purple-100 dark:bg-purple-900/20' : 'bg-background hover:bg-muted/50'}
                      border-2 ${selectedIndex === index ? 'border-purple-500' : 'border-border hover:border-muted-foreground/25'}`}
                    onClick={() => handleSelect(index)}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-base">Alternative {index + 1}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{alternative.explanation}</p>
                      </div>
                      {selectedIndex === index && (
                        <Check className="h-4 w-4 text-purple-500" />
                      )}
                    </div>
                    <div className="flex gap-3">
                      {combinedItems.map((item, idx) => (
                        <div key={idx} className="w-[260px] flex-shrink-0 relative">
                          {item.isPinned && (
                            <div className="absolute -top-1 -right-1 z-10 bg-purple-500 text-white rounded-full p-0.5">
                              <Pin className="h-3 w-3 fill-current" />
                            </div>
                          )}
                          {renderCard(item)}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        <DialogFooter className="mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {selectedIndex !== null && !error && (
            <Button 
              variant="default" 
              className="bg-purple-500 hover:bg-purple-600 text-white"
              onClick={() => onOpenChange(false)}
            >
              Apply Selected Itinerary
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 