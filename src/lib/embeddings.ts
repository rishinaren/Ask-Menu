// Simple TF-IDF based embeddings to avoid external API dependencies
export function generateEmbeddings(text: string): number[] {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2)

  // Create a simple hash-based embedding with 384 dimensions
  const embeddingSize = 384
  const embedding = new Array(embeddingSize).fill(0)
  
  words.forEach(word => {
    // Simple hash function to map words to embedding positions
    let hash = 0
    for (let i = 0; i < word.length; i++) {
      const char = word.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    // Map hash to multiple embedding positions
    for (let i = 0; i < 3; i++) {
      const pos = Math.abs(hash + i * 1001) % embeddingSize
      embedding[pos] += 1 / Math.sqrt(words.length)
    }
  })
  
  // Normalize the embedding vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
  if (magnitude > 0) {
    return embedding.map(val => val / magnitude)
  }
  
  return embedding
}
