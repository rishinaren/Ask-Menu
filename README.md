# Ask-Menu

A Next.js application that allows users to upload menu images and ask questions about them using OCR and embeddings.

## Features

- 📷 Upload menu images via drag & drop, file selection, or clipboard paste (Ctrl+V)
- 🔍 OCR text extraction from menu images using Tesseract.js
- 🗃️ PostgreSQL database with pgvector for storing menu embeddings
- 💬 Ask questions about uploaded menus

## Setup

1. **Start the database:**
   ```bash
   npm run db:up
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Upload Menu Images:**
   - Drag and drop image files onto the upload area
   - Click to browse and select files
   - **Paste from clipboard:** Hover over the upload area and press Ctrl+V (or Cmd+V on Mac) to paste images directly from your clipboard

2. **Enter Restaurant Name:**
   - Type the restaurant name in the text field

3. **Upload:**
   - Click the upload button to process the images with OCR and store them in the database

## Database Commands

- `npm run db:up` - Start the PostgreSQL database
- `npm run db:down` - Stop the database
- `npm run db:reset` - Reset the database (removes all data)