import { useAppStore } from "@/stores/app"
import { Octokit } from "@octokit/rest"

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
  github: Octokit | null = null

  init(apiToken: string) {
    this.github = new Octokit({ auth: apiToken })
  }

  setData(items: Array<RatingItem>, ratings: UserRatings) {
    this.items = items
    this.ratings = ratings
  }

  setRating(itemId: number, attr: string, value: number, user?: string) {
    const app = useAppStore()
    user = user || app.currentUser
    if (!user) return

    const userRatings = this.ratings[user] || {}
    const userItemRatings = userRatings[itemId] || {}
    userItemRatings[attr] = value

    userRatings[itemId] = userItemRatings
    this.ratings[user] = userRatings

    app.addChanges("ratings")
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