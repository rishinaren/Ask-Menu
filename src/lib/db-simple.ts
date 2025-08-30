// Simple in-memory database for development
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

// Global storage that persists across module reloads
declare global {
  var __db_restaurants: Restaurant[] | undefined
  var __db_menuItems: MenuItem[] | undefined
  var __db_nextRestaurantId: number | undefined
  var __db_nextMenuItemId: number | undefined
}

class SimpleDB {
  private get restaurants(): Restaurant[] {
    if (!global.__db_restaurants) {
      global.__db_restaurants = []
    }
    return global.__db_restaurants
  }

  private get menuItems(): MenuItem[] {
    if (!global.__db_menuItems) {
      global.__db_menuItems = []
    }
    return global.__db_menuItems
  }

  private get nextRestaurantId(): number {
    if (!global.__db_nextRestaurantId) {
      global.__db_nextRestaurantId = 1
    }
    return global.__db_nextRestaurantId
  }

  private set nextRestaurantId(value: number) {
    global.__db_nextRestaurantId = value
  }

  private get nextMenuItemId(): number {
    if (!global.__db_nextMenuItemId) {
      global.__db_nextMenuItemId = 1
    }
    return global.__db_nextMenuItemId
  }

  private set nextMenuItemId(value: number) {
    global.__db_nextMenuItemId = value
  }

  insertRestaurant(name: string): number {
    const restaurant: Restaurant = {
      id: this.nextRestaurantId++,
      name,
      createdAt: new Date()
    }
    this.restaurants.push(restaurant)
    console.log('Inserted restaurant:', restaurant)
    console.log('Total restaurants now:', this.restaurants.length)
    return restaurant.id
  }

  insertMenuItem(restaurantId: number, content: string, embedding: number[]): void {
    const menuItem: MenuItem = {
      id: this.nextMenuItemId++,
      restaurantId,
      content,
      embedding,
      createdAt: new Date()
    }
    this.menuItems.push(menuItem)
    console.log('Inserted menu item:', { 
      id: menuItem.id, 
      restaurantId, 
      contentLength: content.length,
      embeddingLength: embedding.length 
    })
    console.log('Total menu items now:', this.menuItems.length)
  }

  getRestaurants(): Restaurant[] {
    console.log('Getting restaurants, total count:', this.restaurants.length)
    return this.restaurants
  }

  getMenuItems(restaurantId: number): MenuItem[] {
    const items = this.menuItems.filter(item => item.restaurantId === restaurantId)
    console.log(`Getting menu items for restaurant ${restaurantId}, found ${items.length} items`)
    return items
  }

  searchMenuItems(query: string): Array<MenuItem & { restaurantName: string }> {
    return this.menuItems
      .filter(item => item.content.toLowerCase().includes(query.toLowerCase()))
      .map(item => {
        const restaurant = this.restaurants.find(r => r.id === item.restaurantId)
        return {
          ...item,
          restaurantName: restaurant?.name || 'Unknown'
        }
      })
  }

  // Debug method
  getDebugInfo() {
    return {
      restaurantCount: this.restaurants.length,
      menuItemCount: this.menuItems.length,
      restaurants: this.restaurants,
      menuItems: this.menuItems.map(item => ({
        ...item,
        embeddingLength: item.embedding.length,
        contentPreview: item.content.substring(0, 100)
      }))
    }
  }
}

// Create a single instance that will be reused
const simpleDB = new SimpleDB()

export const dbQuery = {
  insertRestaurant: (name: string): number => simpleDB.insertRestaurant(name),
  insertMenuItem: (restaurantId: number, content: string, embedding: number[]): void => 
    simpleDB.insertMenuItem(restaurantId, content, embedding),
  getRestaurants: () => simpleDB.getRestaurants(),
  getMenuItems: (restaurantId: number) => simpleDB.getMenuItems(restaurantId),
  searchMenuItems: (query: string) => simpleDB.searchMenuItems(query),
  getDebugInfo: () => simpleDB.getDebugInfo()
}
