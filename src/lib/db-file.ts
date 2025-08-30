import fs from 'fs'
import path from 'path'

// Simple file-based database for development
interface Restaurant {
  id: number
  name: string
  createdAt: Date
}

interface MenuItem {
  id: number
  restaurantId: number
  content: string
  embedding: number[]
  createdAt: Date
}

interface DBData {
  restaurants: Restaurant[]
  menuItems: MenuItem[]
  nextRestaurantId: number
  nextMenuItemId: number
}

const DB_FILE = path.join(process.cwd(), 'data', 'db.json')

class FileDB {
  private ensureDataDir() {
    const dataDir = path.dirname(DB_FILE)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
  }

  private loadData(): DBData {
    this.ensureDataDir()
    
    if (!fs.existsSync(DB_FILE)) {
      const emptyData: DBData = {
        restaurants: [],
        menuItems: [],
        nextRestaurantId: 1,
        nextMenuItemId: 1
      }
      this.saveData(emptyData)
      return emptyData
    }

    try {
      const jsonData = fs.readFileSync(DB_FILE, 'utf8')
      const data = JSON.parse(jsonData)
      console.log('Loaded data from file:', {
        restaurants: data.restaurants?.length || 0,
        menuItems: data.menuItems?.length || 0
      })
      return data
    } catch (error) {
      console.error('Error loading data:', error)
      return {
        restaurants: [],
        menuItems: [],
        nextRestaurantId: 1,
        nextMenuItemId: 1
      }
    }
  }

  private saveData(data: DBData) {
    this.ensureDataDir()
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2))
      console.log('Saved data to file:', {
        restaurants: data.restaurants.length,
        menuItems: data.menuItems.length
      })
    } catch (error) {
      console.error('Error saving data:', error)
    }
  }

  insertRestaurant(name: string): number {
    const data = this.loadData()
    const restaurant: Restaurant = {
      id: data.nextRestaurantId++,
      name,
      createdAt: new Date()
    }
    data.restaurants.push(restaurant)
    this.saveData(data)
    
    console.log('Inserted restaurant:', restaurant)
    console.log('Total restaurants now:', data.restaurants.length)
    return restaurant.id
  }

  insertMenuItem(restaurantId: number, content: string, embedding: number[]): void {
    const data = this.loadData()
    const menuItem: MenuItem = {
      id: data.nextMenuItemId++,
      restaurantId,
      content,
      embedding,
      createdAt: new Date()
    }
    data.menuItems.push(menuItem)
    this.saveData(data)
    
    console.log('Inserted menu item:', { 
      id: menuItem.id, 
      restaurantId, 
      contentLength: content.length,
      embeddingLength: embedding.length 
    })
    console.log('Total menu items now:', data.menuItems.length)
  }

  getRestaurants(): Restaurant[] {
    const data = this.loadData()
    console.log('Getting restaurants, total count:', data.restaurants.length)
    return data.restaurants
  }

  getMenuItems(restaurantId: number): MenuItem[] {
    const data = this.loadData()
    const items = data.menuItems.filter(item => item.restaurantId === restaurantId)
    console.log(`Getting menu items for restaurant ${restaurantId}, found ${items.length} items`)
    return items
  }

  searchMenuItems(query: string): Array<MenuItem & { restaurantName: string }> {
    const data = this.loadData()
    return data.menuItems
      .filter(item => item.content.toLowerCase().includes(query.toLowerCase()))
      .map(item => {
        const restaurant = data.restaurants.find(r => r.id === item.restaurantId)
        return {
          ...item,
          restaurantName: restaurant?.name || 'Unknown'
        }
      })
  }

  getDebugInfo() {
    const data = this.loadData()
    return {
      restaurantCount: data.restaurants.length,
      menuItemCount: data.menuItems.length,
      restaurants: data.restaurants,
      menuItems: data.menuItems.map(item => ({
        ...item,
        embeddingLength: item.embedding?.length || 0,
        contentPreview: item.content?.substring(0, 100) || ''
      }))
    }
  }
}

// Create a single instance
const fileDB = new FileDB()

export const dbQuery = {
  insertRestaurant: (name: string): number => fileDB.insertRestaurant(name),
  insertMenuItem: (restaurantId: number, content: string, embedding: number[]): void => 
    fileDB.insertMenuItem(restaurantId, content, embedding),
  getRestaurants: () => fileDB.getRestaurants(),
  getMenuItems: (restaurantId: number) => fileDB.getMenuItems(restaurantId),
  searchMenuItems: (query: string) => fileDB.searchMenuItems(query),
  getDebugInfo: () => fileDB.getDebugInfo()
}
