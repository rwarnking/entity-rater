import { useAppStore } from "@/stores/app"

export type AttributeRatings = Record<string, number>
export type ItemRatings = Record<number, AttributeRatings>
export type UserRatings = Record<string, ItemRatings>

export type RatingItem = {
  id: number
  text: string
}

class DataManager {

  items: Array<RatingItem> = []
  ratings: UserRatings = {}

  setData(items: Array<RatingItem>, ratings: UserRatings) {
    this.items = items
    this.ratings = ratings
  }

  setRating(itemId: number, attr: string, value: number, user?: string) {
    const app = useAppStore()
    user = user || app.currentUser

    const userRatings = this.ratings[user] || {}
    const userItemRatings = userRatings[itemId] || {}

    userItemRatings[attr] = value
  }

  getRating(itemId: number, attr: string, user?: string) {
    const app = useAppStore()
    user = user || app.currentUser
    const userRanks = this.ratings[user] || {}
    return userRanks[itemId]?.[attr] ?? 0
  }

}

const DM = new DataManager()

export { DM as default }