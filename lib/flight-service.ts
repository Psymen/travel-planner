import { Duffel } from '@duffel/api'

interface FlightOption {
  id: string;
  airline: string;
  departureTime: string;
  arrivalTime: string;
  price: string;
  duration: string;
}

const duffel = new Duffel({
  token: process.env.DUFFEL_API_TOKEN || '',
})

export async function searchFlights(
  departureLocation: string,
  arrivalLocation: string,
  departureDate: Date,
  returnDate: Date
): Promise<FlightOption[]> {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured');
  }

  const prompt = `You are a flight search assistant. Generate 5 realistic flight options for a round trip between ${departureLocation} and ${arrivalLocation}.

Trip Details:
- Departure: ${departureLocation} to ${arrivalLocation}
- Departure Date: ${departureDate.toLocaleDateString()}
- Return Date: ${returnDate.toLocaleDateString()}

Please provide 5 realistic flight options with:
1. Major airlines that actually fly this route
2. Realistic flight times based on the route
3. Current market-appropriate prices
4. Accurate flight durations based on the distance

For each flight option, provide the following information in exactly this format:
- [Airline Name (use real airlines that fly this route)]
- [Departure Time (in 12-hour format)]
- [Arrival Time (in 12-hour format)]
- [Price in USD (realistic market rate)]
- [Duration (in hours and minutes)]

Example format:
- United Airlines
- 10:30 AM
- 2:45 PM
- $425
- 4h 15m

Separate each flight option with a blank line. Ensure all times and prices are realistic for this specific route.`;

  try {
    console.log('Making API request...');
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
          },
          {
            role: "user",
            content: `Find flights from ${departureLocation} to ${arrivalLocation} for the specified dates.`
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
    console.log('API Response:', data);

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid API response format');
    }

    const flightText = data.choices[0].message.content;
    console.log('Flight Text:', flightText);
    
    // Parse the response into structured flight options
    const flights: FlightOption[] = flightText.split('\n\n')
      .filter((text: string) => text.trim().length > 0)
      .map((flight: string, index: number) => {
        const lines = flight.split('\n').map(line => line.replace(/^- /, '').trim());
        return {
          id: `flight-${index}`,
          airline: lines[0] || 'Unknown Airline',
          departureTime: lines[1] || 'Unknown Time',
          arrivalTime: lines[2] || 'Unknown Time',
          price: lines[3] || 'Unknown Price',
          duration: lines[4] || 'Unknown Duration',
        };
      });

    console.log('Parsed Flights:', flights);
    return flights;
  } catch (error) {
    console.error('Error searching flights:', error);
    throw error;
  }
} 