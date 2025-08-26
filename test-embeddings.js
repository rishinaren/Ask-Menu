// Simple test script for local embeddings
const { generateEmbeddings } = require('./src/lib/embeddings.ts')

// Test the embedding function
const testText = "Margherita Pizza with fresh tomatoes and mozzarella cheese - $12.99"
console.log('Testing embeddings for:', testText)

try {
  const embedding = generateEmbeddings(testText)
  console.log('Embedding dimensions:', embedding.length)
  console.log('First 10 values:', embedding.slice(0, 10))
  console.log('Embedding generation successful!')
} catch (error) {
  console.error('Error generating embeddings:', error)
}