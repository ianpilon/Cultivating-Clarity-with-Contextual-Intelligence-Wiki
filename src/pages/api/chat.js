export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { apiKey, messages, wikiContext, currentPage } = req.body

  if (!apiKey) {
    return res.status(400).json({ error: 'API key is required' })
  }

  const systemPrompt = `You are a knowledgeable assistant for the book "Cultivating Clarity: The Art of Discerning What Matters Using Contextual Intelligence" by Ian Timotheos Pilon. You have access to the complete wiki knowledge base built from the book. Answer questions accurately based on the wiki content provided below. Always cite which wiki page your information comes from. If the answer is not in the wiki, say so clearly.

The user is currently viewing the page: ${currentPage || 'Home'}

=== COMPLETE WIKI CONTENT ===
${wikiContext}
=== END WIKI CONTENT ===

Rules:
- Be concise and direct
- Cite specific pages when referencing information
- If asked about something not in the wiki, say so
- Draw connections between concepts across different pages when relevant
- Reference the nine interviewees by name when discussing their contributions
- Never make up information not in the wiki`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return res.status(response.status).json({
        error: errorData.error?.message || `API error: ${response.status}`,
      })
    }

    const data = await response.json()
    return res.status(200).json({
      content: data.content[0].text,
    })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
