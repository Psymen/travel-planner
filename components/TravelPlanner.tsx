"use client"

import { useState } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlannerSidebar } from "./Sidebar"
import { Briefcase, Hotel, Compass, Pin } from "lucide-react"
import { TravelCard } from "./QueueItems/TravelCard"
import { HotelCard } from "./QueueItems/HotelCard"
import { ActivityCard } from "./QueueItems/ActivityCard"
import { AIAdviceDialog } from "./AIAdviceDialog"

type CardType = "travel" | "hotel" | "activity"

interface ItemDetails {
  airline?: string
  departureTime?: string
  arrivalTime?: string
  price?: string
  duration?: string
  checkIn?: string
  checkOut?: string
  date?: string
  time?: string
  description?: string
  nightlyRate?: number
}

interface AgendaItem {
  id: string
  title: string
  description: string
  time: string
  type: CardType
  isPinned: boolean
  details?: ItemDetails
}

interface QueueItem {
  id: string
  type: CardType
  title: string
  isPinned?: boolean
  details?: ItemDetails
}

const initialAgenda: AgendaItem[] = [
  {
    id: "1",
    title: "Flight SF > Paris",
    description: "Air France Flight AF1234",
    time: "10:00",
    type: "travel",
    isPinned: true,
    details: {
      airline: "Air France",
      departureTime: "10:00 AM",
      arrivalTime: "11:30 PM",
      price: "$1,249",
      duration: "8h 30m"
    }
  },
  {
    id: "2",
    title: "Le Grand Hotel Paris",
    description: "Check-in at the hotel",
    time: "12:30",
    type: "hotel",
    isPinned: true,
    details: {
      checkIn: "March 1, 2024",
      checkOut: "March 7, 2024",
      price: "$4,800"
    }
  },
  {
    id: "3",
    title: "Louvre Museum Tour",
    description: "Guided tour of the world's largest art museum",
    time: "14:00",
    type: "activity",
    isPinned: false,
    details: {
      date: "March 2, 2024",
      time: "14:00",
      description: "Guided tour of the world's largest art museum",
      price: "$79"
    }
  },
  {
    id: "4",
    title: "Seine River Cruise",
    description: "Romantic dinner cruise along the Seine",
    time: "19:00",
    type: "activity",
    isPinned: false,
    details: {
      date: "March 2, 2024",
      time: "19:00",
      description: "Romantic dinner cruise along the Seine",
      price: "$189"
    }
  },
  {
    id: "5",
    title: "Flight Paris > SF",
    description: "Air France Flight AF1235",
    time: "15:00",
    type: "travel",
    isPinned: true,
    details: {
      airline: "Air France",
      departureTime: "3:00 PM",
      arrivalTime: "4:30 AM",
      price: "$1,149",
      duration: "8h 30m"
    }
  }
]

export default function TravelPlanner() {
  const [title, setTitle] = useState("10-Year Anniversary Trip: Paris")
  const [agenda, setAgenda] = useState<AgendaItem[]>(initialAgenda)
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [showAdvice, setShowAdvice] = useState(false)

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    }
  }

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result

    if (!destination) return

    // Don't allow dragging of pinned items
    const sourceList = source.droppableId === "queue" ? queue : agenda
    const sourceItem = sourceList[source.index]
    if (source.droppableId === "agenda" && sourceItem.isPinned) {
      return
    }

    // Reordering within the same list
    if (source.droppableId === destination.droppableId) {
      const items = source.droppableId === "queue" ? 
        Array.from(queue) : 
        Array.from(agenda)
      const [reorderedItem] = items.splice(source.index, 1)
      items.splice(destination.index, 0, reorderedItem)

      if (source.droppableId === "queue") {
        setQueue(items as QueueItem[])
      } else {
        setAgenda(items as AgendaItem[])
      }
    } 
    // Moving from queue to agenda
    else if (source.droppableId === "queue" && destination.droppableId === "agenda") {
      const queueItems = Array.from(queue)
      const [movedItem] = queueItems.splice(source.index, 1)
      setQueue(queueItems)

      const newAgendaItem: AgendaItem = {
        id: movedItem.id,
        title: movedItem.title,
        description: movedItem.details?.description || "Add description here",
        time: movedItem.details?.time || "00:00",
        type: movedItem.type,
        isPinned: false,
        details: movedItem.details,
      }

      const agendaItems = Array.from(agenda)
      agendaItems.splice(destination.index, 0, newAgendaItem)
      setAgenda(agendaItems)
    }
  }

  const addCard = (type: CardType) => {
    const newItem: AgendaItem = {
      id: String(agenda.length + 1),
      title: `New ${type} item`,
      description: "Add description here",
      time: "00:00",
      type: type,
      isPinned: false,
    }
    setAgenda([...agenda, newItem])
  }

  const addToQueue = (item: QueueItem) => {
    setQueue([...queue, item])
  }

  const removeFromQueue = (id: string) => {
    setQueue(queue.filter(item => item.id !== id))
  }

  const removeFromAgenda = (id: string) => {
    setAgenda(agenda.filter(item => item.id !== id))
  }

  const togglePin = (id: string) => {
    setAgenda(agenda.map((item) => (item.id === id ? { ...item, isPinned: !item.isPinned } : item)))
  }

  const handleSelectItinerary = (items: AgendaItem[]) => {
    // Generate new IDs for the items to ensure uniqueness
    const newItems = items.map((item, index) => ({
      ...item,
      id: `item-${Date.now()}-${index}`,
    }));

    // Completely replace the agenda with the new items
    setAgenda(newItems);
  }

  const renderAgendaItem = (item: AgendaItem, index: number) => {
    const cardContent = () => {
      switch (item.type) {
        case "travel":
          return (
            <TravelCard
              title={item.title}
              isPinned={item.isPinned}
              onPinClick={() => togglePin(item.id)}
              onDelete={() => !item.isPinned && removeFromAgenda(item.id)}
              details={{
                airline: item.details?.airline || "",
                departureTime: item.details?.departureTime || "",
                arrivalTime: item.details?.arrivalTime || "",
                price: item.details?.price || "$1,249",
                duration: item.details?.duration || "",
              }}
            />
          )
        case "hotel":
          return (
            <HotelCard
              title={item.title}
              isPinned={item.isPinned}
              onPinClick={() => togglePin(item.id)}
              onDelete={() => !item.isPinned && removeFromAgenda(item.id)}
              details={{
                checkIn: item.details?.checkIn || "",
                checkOut: item.details?.checkOut || "",
                price: item.details?.price || "$1,200",
                nightlyRate: item.details?.nightlyRate || 200,
              }}
            />
          )
        case "activity":
          return (
            <ActivityCard
              title={item.title}
              isPinned={item.isPinned}
              onPinClick={() => togglePin(item.id)}
              onDelete={() => !item.isPinned && removeFromAgenda(item.id)}
              details={{
                date: item.details?.date || "",
                description: item.description || "",
                price: item.details?.price || "$150",
              }}
            />
          )
      }
    }

    return (
      <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={item.isPinned}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="h-full"
          >
            {cardContent()}
          </div>
        )}
      </Draggable>
    )
  }

  return (
    <div className="h-screen grid grid-rows-[auto_1fr]">
      <div className="bg-black text-white py-2 px-4 flex items-center z-50">
        <h2 className="text-sm font-medium">Travel Planner</h2>
      </div>
      <div className="min-h-0 overflow-hidden">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="h-full flex">
            <PlannerSidebar 
              onAddCard={addCard} 
              onAddToQueue={addToQueue}
              onRemoveFromQueue={removeFromQueue}
              queue={queue}
              agenda={agenda}
              showAdvice={showAdvice}
              setShowAdvice={setShowAdvice}
            />
            <main className="flex-1 flex flex-col min-w-0 bg-background dotted-grid">
              <div className="p-8 pb-0 w-full">
                <div className="group relative w-full">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={handleTitleKeyDown}
                    className="text-4xl font-medium mb-6 dark:text-white bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-full font-accent tracking-tight hover:opacity-80 transition-opacity"
                    placeholder="10-Year Anniversary Trip: Paris"
                  />
                  <div className="absolute bottom-[2.25rem] left-0 w-full h-[2px] bg-foreground/0 group-hover:bg-foreground/5 transition-colors" />
                </div>
              </div>
              <div className="flex-1 p-8 pt-0 min-h-0">
                <Droppable droppableId="agenda" direction="horizontal">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="flex h-full gap-4 overflow-x-auto pb-4"
                    >
                      {agenda.map((item, index) => (
                        <div key={item.id} className="w-[280px] flex-shrink-0 h-full">
                          {renderAgendaItem(item, index)}
                        </div>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </main>
          </div>
        </DragDropContext>
      </div>
      <AIAdviceDialog
        open={showAdvice}
        onOpenChange={setShowAdvice}
        agenda={agenda}
        onSelectItinerary={handleSelectItinerary}
      />
    </div>
  )
}

