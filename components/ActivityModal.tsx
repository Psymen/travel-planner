"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Loader2, Tag } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { searchActivities } from "@/lib/activity-service"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface Activity {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: string;
  location: string;
  category: string;
}

interface ActivityModalProps {
  onSubmit: (activityDetails: {
    name: string;
    date: Date;
    description: string;
  }) => void;
  trigger?: React.ReactNode;
}

export function ActivityModal({ onSubmit, trigger }: ActivityModalProps) {
  const { toast } = useToast()
  const [prompt, setPrompt] = React.useState("")
  const [date, setDate] = React.useState<Date>()
  const [loading, setLoading] = React.useState(false)
  const [activities, setActivities] = React.useState<Activity[]>([])
  const [selectedActivity, setSelectedActivity] = React.useState<Activity | null>(null)
  const [open, setOpen] = React.useState(false)
  const [showSuggestions, setShowSuggestions] = React.useState(false)

  const handleSearch = async () => {
    if (prompt) {
      setLoading(true)
      try {
        const suggestions = await searchActivities(prompt, 'Paris') // TODO: Make location dynamic
        setActivities(suggestions)
        setShowSuggestions(true)
        setOpen(false)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to get activity suggestions. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
  }

  const handleActivitySelect = (activity: Activity) => {
    if (date) {
      onSubmit({
        name: activity.name,
        date,
        description: activity.description,
      })
      setShowSuggestions(false)
      setPrompt("")
      setDate(undefined)
      setSelectedActivity(null)
      setActivities([])
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || <Button variant="outline">Add Activity</Button>}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Plan Activity</DialogTitle>
            <DialogDescription>
              Tell us what you'd like to do and when.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                placeholder="What would you like to do? (e.g., explore art and culture in Paris)"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <div className="flex flex-col space-y-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Select date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
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
              disabled={!prompt || !date || loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Get Suggestions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuggestions} onOpenChange={setShowSuggestions}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Suggested Activities</DialogTitle>
            <DialogDescription>
              Select an activity from the suggestions below
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            <div className="grid gap-4 pb-4">
              {activities.map((activity) => (
                <Card
                  key={activity.id}
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-accent",
                    selectedActivity?.id === activity.id && "border-primary"
                  )}
                  onClick={() => {
                    setSelectedActivity(activity)
                    handleActivitySelect(activity)
                  }}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{activity.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{activity.category}</Badge>
                            <span className="text-sm text-muted-foreground">{activity.duration}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{activity.price}</p>
                          <p className="text-sm text-muted-foreground">per person</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Tag className="h-4 w-4" />
                        {activity.location}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
} 