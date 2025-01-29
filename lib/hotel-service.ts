interface Hotel {
  id: string;
  name: string;
  description: string;
  nightlyRate: number;
  rating: number;
  amenities: string[];
  location: string;
}

export async function searchHotels(location: string): Promise<Hotel[]> {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured');
  }

  const prompt = `You are a hotel search assistant. Generate 8 realistic hotel options in ${location}.

Please provide hotels with:
1. Real, well-known hotels that exist in ${location}
2. Realistic nightly rates for the location and hotel quality
3. Actual amenities offered by these types of hotels
4. Accurate locations within ${location}

For each hotel option, provide the following information in exactly this format:
- [Hotel Name]
- [Brief Description (one sentence)]
- [Nightly Rate in USD]
- [Rating out of 5]
- [Location within ${location}]
- [Amenities (comma-separated list)]

Example format:
- The Ritz-Carlton
- Luxury hotel featuring elegant rooms with city views and world-class service
- $550
- 4.8
- Downtown Financial District
- Pool, Spa, Restaurant, Room Service, Fitness Center, Business Center

Separate each hotel option with a blank line. Ensure all details are realistic for this location.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: prompt
          }
        ],
        model: "gpt-3.5-turbo-1106",
        temperature: 0.7,
        max_tokens: 500,
        presence_penalty: 0.3,
        frequency_penalty: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      throw new Error('API request failed: ' + (errorData.error?.message || 'Unknown error'));
    }

    const data = await response.json();
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid API response format');
    }

    const hotelText = data.choices[0].message.content;
    
    // Parse the response into structured hotel options
    const hotels: Hotel[] = hotelText.split('\n\n')
      .filter((text: string) => text.trim().length > 0)
      .map((hotel: string, index: number) => {
        const lines = hotel.split('\n').map(line => line.replace(/^- /, '').trim());
        return {
          id: `hotel-${index}`,
          name: lines[0] || 'Unknown Hotel',
          description: lines[1] || 'No description available',
          nightlyRate: parseInt(lines[2]?.replace(/[^0-9]/g, '') || '0'),
          rating: parseFloat(lines[3] || '0'),
          location: lines[4] || 'Unknown Location',
          amenities: lines[5]?.split(',').map(a => a.trim()) || [],
        };
      });

    return hotels;
  } catch (error) {
    console.error('Error searching hotels:', error);
    throw error;
  }
}

export function calculateTotalPrice(nightlyRate: number | null | undefined, checkIn: Date | null | undefined, checkOut: Date | null | undefined): number {
  // Use fallback rate of $200 if no rate provided or invalid
  const rate = (nightlyRate && nightlyRate > 0) ? nightlyRate : 200;
  
  // Calculate number of nights, default to 1 if dates are invalid
  const nights = (checkIn && checkOut && checkIn < checkOut) 
    ? Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)))
    : 1;
  
  const subtotal = rate * nights;
  
  // Add some realistic fees
  const taxRate = 0.15; // 15% tax
  const tax = subtotal * taxRate;
  const resortFee = 25 * nights; // $25 per night resort fee
  const serviceFee = 50; // One-time service fee
  
  return subtotal + tax + resortFee + serviceFee;
} 