import { useAppStore } from "@/stores/app"
import { Octokit } from "@octokit/rest"
import hash from "object-hash"

export type IntegerRating = Record<string, number>
export type BooleanRating = Record<string, boolean>
export type AttributeRating = IntegerRating | BooleanRating

export type ItemRatings = Record<number, AttributeRating>
export type UserRatings = Record<string, ItemRatings>

export type RatingCategory = {
  id: number,
  name: string,
  type: string,
  description: string,
  min?: number,
  max?: number
}

export type RatingItem = {
  id: number,
  name: string,
  gender: Array<string>
}

class DataManager {

  items: Array<RatingItem> = []
  ratings: UserRatings = {}
  categories: Array<RatingCategory> = []

  ratingsHash: string = ""

  github: Octokit | null = null

  init(apiToken: string) {
    this.github = new Octokit({ auth: apiToken })
  }

  setData(items: Array<RatingItem>, ratings: UserRatings, categories: Array<RatingCategory>) {
    this.items = items
    this.ratings = ratings
    this.ratingsHash = hash(ratings)
    this.categories = categories
  }

  setRating(itemId: number, category: number, value: number | boolean, user?: string) {
    const app = useAppStore()
    user = user || app.currentUser
    if (!user) return

    const userRatings = this.ratings[user] || {}
    const userItemRatings = userRatings[itemId] || {}
    userItemRatings[category] = value

    if (value === this.getCategoryDefault(category)) {
      delete userRatings[itemId]
    } else {
      userRatings[itemId] = userItemRatings
    }

    this.ratings[user] = userRatings

    const newHash = hash(this.ratings)

    if (newHash !== this.ratingsHash) {
      // @ts-ignore
      app.addChanges(__GITHUB_DATA_RATINGS__)
    } else {
      // @ts-ignore
      app.deleteChanges(__GITHUB_DATA_RATINGS__)
    }
  }

  getRating(itemId: number, category: number, user?: string) {
    const app = useAppStore()
    user = user || app.currentUser
    const userRanks = this.ratings[user] || {}
    return userRanks[itemId]?.[category] ?? this.getCategoryDefault(category)
  }

  getCategoryDefault(category: number) {
    const cat = this.categories.find(d => d.id === category)
    if (cat) {
      switch(cat.type) {
        default:
        case "integer": return 0
        case "boolean": return false
      }
    }
    return 0
  }

}

const DM = new DataManager()

export { DM as default }