import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Adding this for internal demo purposes only
});

interface ItineraryItem {
  title: string;
  type: string;
  time: string;
  description: string;
  isPinned?: boolean;
  details?: {
    airline?: string;
    departureTime?: string;
    arrivalTime?: string;
    duration?: string;
    checkIn?: string;
    checkOut?: string;
    date?: string;
    price?: string;
    nightlyRate?: number;
  };
}

interface AIAdvice {
  originalItinerary: ItineraryItem[];
  alternativeItineraries: Array<{
    items: ItineraryItem[];
    explanation: string;
  }>;
}

function preprocessItinerary(items: ItineraryItem[]): ItineraryItem[] {
  // Separate flights from other items
  const flights = items.filter(item => item.type === 'travel');
  const nonFlights = items.filter(item => item.type !== 'travel');

  // Find arrival and departure flights
  const arrivalFlight = flights.find(f => 
    f.title.toLowerCase().includes('sf > paris') || 
    f.title.toLowerCase().includes('arrival')
  );
  const departureFlight = flights.find(f => 
    f.title.toLowerCase().includes('paris > sf') || 
    f.title.toLowerCase().includes('departure')
  );

  if (!arrivalFlight || !departureFlight) {
    console.warn('Missing arrival or departure flight');
    return items; // Return original items if we can't find both flights
  }

  // Remove the flights from non-flights array if they exist there
  const middleItems = nonFlights.filter(item => 
    item.title !== arrivalFlight.title && 
    item.title !== departureFlight.title
  );

  // Return items with flights at start and end
  return [arrivalFlight, ...middleItems, departureFlight];
}

export async function getItineraryAdvice(itinerary: ItineraryItem[]): Promise<AIAdvice> {
  try {
    const pinnedItems = itinerary.filter(item => item.isPinned);
    const unpinnedItems = itinerary.filter(item => !item.isPinned);

    // First, ensure all times are in 24-hour format
    const formatTime = (time: string) => {
      if (!time) return '';
      // Remove any non-alphanumeric characters except colon
      const cleanTime = time.replace(/[^\w:]/g, '').toLowerCase();
      // Convert to 24-hour format if in 12-hour format
      if (cleanTime.includes('am') || cleanTime.includes('pm')) {
        const [timeStr, period] = cleanTime.split(/am|pm/);
        const [hours, minutes] = timeStr.split(':').map(Number);
        if (period === 'pm' && hours !== 12) {
          return `${hours + 12}:${minutes?.toString().padStart(2, '0') || '00'}`;
        } else if (period === 'am' && hours === 12) {
          return `00:${minutes?.toString().padStart(2, '0') || '00'}`;
        }
        return `${hours.toString().padStart(2, '0')}:${minutes?.toString().padStart(2, '0') || '00'}`;
      }
      return cleanTime;
    };

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a travel expert advisor. You will be shown an itinerary with some items marked as "pinned" (fixed) and others as flexible.
          
Your task is to generate two DISTINCTLY DIFFERENT alternative itineraries that work around the fixed points. Your alternatives should aim to maximize the travel experience by suggesting additional activities that complement the existing ones.

Important rules for flight handling:
1. Each itinerary MUST start with the arrival flight and end with the departure flight
2. NO activities or hotels can be scheduled before the arrival flight or after the departure flight
3. The last activity of each day must end at least 2 hours before any departure flight
4. For the departure day, only suggest morning activities if there are at least 4 hours before the flight

General rules:
1. Keep all pinned items exactly as they are (same time, description, etc)
2. You may modify, remove, or add to the flexible items
3. Each alternative must be significantly different from both the original and each other
4. Ensure realistic travel times between activities (typically 30-45 mins for travel between locations)
5. Every activity must include a realistic price in USD
6. Activities should be available at the suggested times
7. Fill empty time slots with interesting activities
8. Aim to suggest 2-3 activities between major fixed points when time allows
9. Include a mix of cultural, dining, and experiential activities
10. DO NOT suggest any activities that are identical or very similar to the unpinned activities in the original itinerary
11. Each alternative should explore different aspects of the destination

Format your response exactly as follows:

ALTERNATIVE 1:
[One sentence explaining how this itinerary differs from original and why it might be appealing]
[Full itinerary with each item on new line in format: Title | Type | Time | Description | Price]

ALTERNATIVE 2:
[One sentence explaining how this itinerary differs from original and why it might be appealing]
[Full itinerary with each item on new line in format: Title | Type | Time | Description | Price]

Example format for items:
Arrival Flight | travel | 10:00 | Flight details | $1,249
Morning Museum Tour | activity | 14:00 | Guided tour description | $79
Evening Activity | activity | 17:30 | Activity description | $65
Departure Flight | travel | 15:00 | Flight details | $1,149

Remember to maintain a good balance - the schedule should be full but not rushed, allowing time to enjoy each activity.`
        },
        {
          role: "user",
          content: `Here's my current itinerary:

PINNED (FIXED) ITEMS:
${pinnedItems.map(item => 
  `${item.title} (${item.type}) at ${item.time}\n${item.description}\nPrice: ${item.details?.price || 'TBD'}`
).join('\n\n')}

FLEXIBLE ITEMS (DO NOT REUSE THESE - SUGGEST DIFFERENT ACTIVITIES):
${unpinnedItems.map(item => 
  `${item.title} (${item.type}) at ${item.time}\n${item.description}\nPrice: ${item.details?.price || 'TBD'}`
).join('\n\n')}

Please provide two alternative itineraries that work around the pinned items. Make them distinctly different from each other and from the original flexible items. Ensure all activities occur between the arrival and departure flights, and respect the time constraints.`
        }
      ],
      model: "gpt-3.5-turbo-1106",
      temperature: 0.8,
      max_tokens: 1000,
      presence_penalty: 0.4,
      frequency_penalty: 0.4,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No advice received from OpenAI');
    }

    // Parse and preprocess the response
    const alternatives = content.split(/ALTERNATIVE \d+:/i)
      .filter(Boolean)
      .map(alt => {
        try {
          const [explanation, ...itemLines] = alt.trim().split('\n').filter(Boolean);
          const items = itemLines.map(line => {
            try {
              const parts = line.split('|').map(s => s.trim());
              if (parts.length < 4) {
                throw new Error(`Invalid line format: ${line}`);
              }

              const [title, type, time, description, price] = parts;
              const normalizedType = type.toLowerCase();
              
              // Find matching original item to preserve details
              const originalItem = [...pinnedItems, ...unpinnedItems].find(
                item => item.title === title || 
                        (item.type === normalizedType && formatTime(item.time) === formatTime(time))
              );

              // Merge details from original item if exists
              const details = {
                ...(originalItem?.details || {}),
                price: price || originalItem?.details?.price || 'TBD'
              };

              // For travel items, ensure we have all necessary flight details
              if (normalizedType === 'travel' && originalItem?.details) {
                details.airline = originalItem.details.airline;
                details.departureTime = originalItem.details.departureTime;
                details.arrivalTime = originalItem.details.arrivalTime;
                details.duration = originalItem.details.duration;
              }

              // For hotel items, preserve check-in/out dates
              if (normalizedType === 'hotel' && originalItem?.details) {
                details.checkIn = originalItem.details.checkIn;
                details.checkOut = originalItem.details.checkOut;
                details.nightlyRate = originalItem.details.nightlyRate;
              }

              return {
                title,
                type: normalizedType,
                time: formatTime(time),
                description,
                isPinned: pinnedItems.some(p => p.title === title && formatTime(p.time) === formatTime(time)),
                details
              };
            } catch (error) {
              console.error('Error parsing item line:', error);
              return null;
            }
          }).filter(item => item !== null) as ItineraryItem[];

          // Process and order the items
          const processedItems = preprocessItinerary(items);

          return {
            explanation,
            items: processedItems
          };
        } catch (error) {
          console.error('Error parsing alternative:', error);
          throw new Error('Failed to parse AI response format');
        }
      });

    if (alternatives.length === 0) {
      throw new Error('No valid alternatives generated');
    }

    // Also preprocess the original itinerary
    const processedOriginalItinerary = preprocessItinerary(itinerary);

    return {
      originalItinerary: processedOriginalItinerary,
      alternativeItineraries: alternatives
    };
  } catch (error) {
    console.error('Error getting itinerary advice:', error);
    throw error;
  }
}

export async function suggestActivities(prompt: string): Promise<Array<{ name: string; description: string }>> {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful travel assistant. Suggest 3 activities based on the user's request. Format each suggestion with a name and description."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-3.5-turbo-1106",
      temperature: 0.7,
      max_tokens: 500,
      presence_penalty: 0.3,
      frequency_penalty: 0.3,
    });

    const suggestions = completion.choices[0].message.content;
    if (!suggestions) {
      throw new Error('No suggestions received from OpenAI');
    }

    // Parse the suggestions into structured format
    const activities = suggestions.split('\n\n').map(suggestion => {
      const [name, ...descriptionParts] = suggestion.split('\n');
      return {
        name: name.replace(/^\d+\.\s*/, ''),
        description: descriptionParts.join('\n').trim()
      };
    });

    return activities.slice(0, 3); // Ensure we only return 3 suggestions
  } catch (error) {
    console.error('Error suggesting activities:', error);
    throw error;
  }
} 