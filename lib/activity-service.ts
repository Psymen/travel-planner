interface Activity {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: string;
  location: string;
  category: string;
}

export async function searchActivities(prompt: string, location: string): Promise<Activity[]> {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured');
  }

  const aiPrompt = `You are a local tour guide in ${location}. Generate 6 realistic activity suggestions based on this request: "${prompt}"

Please provide activities with:
1. Real, specific activities that exist in ${location}
2. Realistic prices and durations
3. Specific locations or meeting points
4. Activity categories (e.g., Cultural, Adventure, Food & Drink, etc.)

For each activity option, provide the following information in exactly this format:
- [Activity Name]
- [Detailed Description (2-3 sentences)]
- [Estimated Price per Person in USD]
- [Typical Duration]
- [Specific Location/Meeting Point]
- [Category]

Example format:
- Private Louvre Guided Tour
- Skip-the-line access to the Louvre with an expert art historian. Discover masterpieces including the Mona Lisa and Venus de Milo, while learning about the museum's fascinating history and hidden gems.
- $89
- 3 hours
- Meet at the Pyramid entrance, Louvre Museum
- Cultural

Separate each activity option with a blank line. Ensure all details are realistic for this location.`;

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
            content: aiPrompt
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

    const activityText = data.choices[0].message.content;
    
    // Parse the response into structured activity options
    const activities: Activity[] = activityText.split('\n\n')
      .filter((text: string) => text.trim().length > 0)
      .map((activity: string, index: number) => {
        const lines = activity.split('\n').map(line => line.replace(/^- /, '').trim());
        return {
          id: `activity-${index}`,
          name: lines[0] || 'Unknown Activity',
          description: lines[1] || 'No description available',
          price: lines[2] || 'Price not available',
          duration: lines[3] || 'Duration not specified',
          location: lines[4] || 'Location not specified',
          category: lines[5] || 'Uncategorized',
        };
      });

    return activities;
  } catch (error) {
    console.error('Error searching activities:', error);
    throw error;
  }
} 