import { useAppStore } from "@/stores/app"
import { Octokit } from "@octokit/rest"
import hash from "object-hash"
import { getRepoFile } from "./repo-api"

export type RatingValue = number | boolean
export type AttributeRating = Record<number, RatingValue>

export type ItemRatings = Record<string, AttributeRating>
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
  name: string,
  gender: Array<string>
}

class DataManager {

  items: Array<RatingItem> = []
  ratings: UserRatings = {}
  categories: Array<RatingCategory> = []

  itemsHash: string = ""
  ratingsHash: string = ""

  github: Octokit | null = null

  init(apiToken: string) {
    this.github = new Octokit({ auth: apiToken })
  }

  async loadData() {
    const [items, ratings, categories] = await Promise.all([
      // @ts-ignore
      getRepoFile(__GITHUB_DATA_ITEMS__+".json"),
      // @ts-ignore
      getRepoFile(__GITHUB_DATA_RATINGS__+".json"),
      // @ts-ignore
      getRepoFile(__GITHUB_DATA_CATEGORIES__+".json")
    ])
    const found = new Set()
    const filtered = items.filter((d: RatingItem) => {
      if (!found.has(d.name)) {
        found.add(d.name)
        return true
      }
      return false
    })
    this.setData(filtered, ratings, categories)
  }

  setData(items: Array<RatingItem>, ratings: UserRatings, categories: Array<RatingCategory>) {
    this.items = items
    const sorted = items.map(d => d.name)
    sorted.sort()
    this.itemsHash = hash(sorted)
    this.ratings = ratings
    this.ratingsHash = hash(ratings)
    this.categories = categories
  }

  async updateItems() {
    // @ts-ignore
    this.items = await getRepoFile(__GITHUB_DATA_ITEMS__+".json")
  }

  async updateRatings() {
    // @ts-ignore
    this.ratings = await getRepoFile(__GITHUB_DATA_RATINGS__+".json")
  }

  async updateCategories() {
    // @ts-ignore
    this.categories = await getRepoFile(__GITHUB_DATA_CATEGORIES__+".json")
  }

  setRating(name: string, category: number, value: RatingValue, user?: string) {
    const app = useAppStore()
    user = user || app.currentUser
    if (!user) return

    const userRatings = this.ratings[user] || {}
    const userItemRatings = userRatings[name] || {}
    userItemRatings[category] = value

    if (value === this.getCategoryDefault(category)) {
      delete userRatings[name]
    } else {
      userRatings[name] = userItemRatings
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

    app._timeRatings = Date.now()
  }

  hasRatings(name: string, ratingType?: string) {
    const app = useAppStore()
    for (let i = 0; i < app.users.length; ++i) {
      if (this.hasUserRatings(name, app.users[i], ratingType)) {
        return true
      }
    }
    return false
  }

  hasUserRatings(name: string, user?: string, ratingType?: string) {
    const app = useAppStore()
    user = user || app.currentUser
    if (!this.ratings[user]) {
      return false
    }

    const userRanks = this.ratings[user] || {}
    if (!userRanks[name]) {
      return false
    }

    const cats = ratingType !== undefined ?
      this.categories.filter(c => c.type === ratingType) :
      this.categories

    const itemRanks = userRanks[name] || {}
    return cats.some(c => itemRanks[c.id] !== undefined && itemRanks[c.id] !== this.getCategoryDefault(c.id))
  }

  getRating(name: string, category: number, user?: string) {
    const app = useAppStore()
    user = user || app.currentUser
    const userRanks = this.ratings[user] || {}
    return userRanks[name]?.[category] ?? this.getCategoryDefault(category)
  }

  addItem(name: string, gender: Array<string>) {
    if (!this.items.find(d => d.name === name)) {
      this.items.push({ name: name, gender: gender })
      const app = useAppStore()
      app._timeItems = Date.now()
      // @ts-ignore
      app.addChanges(__GITHUB_DATA_ITEMS__)
      return true
    }
    return false
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