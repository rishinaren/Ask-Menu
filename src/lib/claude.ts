import Anthropic from '@anthropic-ai/sdk'

const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
}) : null

export async function askClaude(
  question: string, 
  context: string, 
  mode: 'single' | 'multi'
): Promise<string> {
  // Check if API key is available
  if (!process.env.ANTHROPIC_API_KEY || !anthropic) {
    throw new Error('ANTHROPIC_API_KEY is required for this application to function. Please:\n1. Get an API key from https://console.anthropic.com\n2. Add ANTHROPIC_API_KEY=your_key_here to .env.local\n3. Restart the server')
  }

  try {
    const systemPrompt = mode === 'single' 
      ? `You are a helpful assistant that answers questions about a restaurant menu. Use the provided menu information to answer the user's question accurately and helpfully. If the answer isn't in the menu, say so politely.`
      : `You are a helpful assistant that answers questions about multiple restaurant menus. Use the provided menu information from different restaurants to answer the user's question. When mentioning items, include which restaurant they're from. If comparing options, provide helpful comparisons across restaurants.`

    const userPrompt = `Menu Information:
${context}

Question: ${question}

Please provide a helpful and accurate answer based on the menu information above.`

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    })

    return response.content[0].type === 'text' 
      ? response.content[0].text 
      : 'Sorry, I could not generate a response.'
  } catch (error) {
    console.error('Claude API error:', error)
    throw new Error('Failed to get response from Claude')
  }
}
