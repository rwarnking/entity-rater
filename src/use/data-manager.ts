import { useAppStore } from "@/stores/app"
import { Octokit } from "@octokit/rest"
import hash from "object-hash"
import { getFilename, getRepoFile, pushRepoFile } from "./repo-api"
import { TYPE } from "vue-toastification"

export type RatingValue = number | boolean
export type AttributeRating = Record<number, RatingValue>

export type ItemRatings = Record<string, AttributeRating>
export type UserRatings = Record<string, ItemRatings>

export type RatingCategory = {
  id: number,
  name: string,
  type: string,
  variant: string,
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

    const [items, categories] = await Promise.all([
      // @ts-ignore
      getRepoFile(getFilename(__GITHUB_DATA_ITEMS__)),
      // @ts-ignore
      getRepoFile(getFilename(__GITHUB_DATA_CATEGORIES__))
    ])

    // API rate limit exceeded
    if (!items || !categories) {
      return console.error("could not load data")
    }

    const found = new Set()
    const filtered = items.filter((d: RatingItem) => {
      if (!found.has(d.name)) {
        found.add(d.name)
        return true
      }
      return false
    })

    const app = useAppStore()
    const ratings: UserRatings = {}

    // load ratings for all users
    await Promise.all(app.users.map(async (user) => {
      // @ts-ignore
      return getRepoFile(getFilename(__GITHUB_DATA_RATINGS__, user))
        .then(result => ratings[user] = result)
    }))

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

  async updateData() {
    await this.loadData()
    const app = useAppStore()
    app.changes.clear()
    app._timeItems = Date.now()
    app._timeRatings = Date.now()
  }

  async updateItems() {
    // @ts-ignore
    this.items = await getRepoFile(getFilename(__GITHUB_DATA_ITEMS__))
  }

  async updateRatings() {
    const app = useAppStore()
    const ratings: UserRatings = {}
    await Promise.all(app.users.map(user => {
      // @ts-ignore
      return getRepoFile(getFilename(__GITHUB_DATA_RATINGS__, user))
        .then(result => ratings[user] = result)
        .catch(reason => console.error(reason))
    }))
    this.ratings = ratings
  }

  async updateCategories() {
    // @ts-ignore
    this.categories = await getRepoFile(getFilename(__GITHUB_DATA_CATEGORIES__))
  }

  async commitChanges() {
    const app = useAppStore()
    const messages: Array<{ type: TYPE, content: string}> = []

    if (!app.hasChanges || !app.currentUser || !this.github) {
      return messages
    }

    const names = Array.from(app.changes.values())

    for (let i = 0; i < names.length; ++i) {
      const key = names[i]
      if (!key) continue

      try {
        await pushRepoFile(
          getFilename(key, app.currentUser),
          `${app.currentUser} changed ${key}`,
          // @ts-ignore
          key === __GITHUB_DATA_ITEMS__ ? DM.items : DM.ratings[app.currentUser]
        )
        app.deleteChanges(key)
        messages.push({ type: TYPE.SUCCESS, content: "saved changes to " + key })
      } catch (error: any) {
        messages.push({ type: TYPE.ERROR, content: error.toString()})
      }
    }

    return messages
  }

  setRating(name: string, category: number, value: RatingValue, user?: string) {
    const app = useAppStore()
    user = user || app.currentUser
    if (!user) return

    const userRatings = this.ratings[user] || {}
    const userItemRatings = userRatings[name] || {}

    if (value === this.getCategoryDefault(category)) {
      delete userItemRatings[category]
    } else {
      userItemRatings[category] = value
    }

    userRatings[name] = userItemRatings

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

  getRaters(name: string, variant?: string) {
    const app = useAppStore()
    const raters: Array<string> = []
    for (let i = 0; i < app.users.length; ++i) {
      if (this.hasUserRatings(name, app.users[i], variant)) {
        raters.push(app.users[i] as string)
      }
    }
    return raters
  }

  hasRatings(name: string, variant?: string) {
    const app = useAppStore()
    for (let i = 0; i < app.users.length; ++i) {
      if (this.hasUserRatings(name, app.users[i], variant)) {
        return true
      }
    }
    return false
  }

  hasUserRatings(name: string, user?: string, variant?: string) {
    const app = useAppStore()
    user = user || app.currentUser
    if (!this.ratings[user]) {
      return false
    }

    const userRanks = this.ratings[user] || {}
    if (!userRanks[name]) {
      return false
    }

    const cats = variant !== undefined ?
      this.categories.filter(c => c.variant === variant) :
      this.categories

    const itemRanks = userRanks[name] || {}
    return cats.some(c => itemRanks[c.id] !== undefined && itemRanks[c.id] !== this.getCategoryDefault(c.id))
  }

  hasUserCategoryRating(name: string, user: string, category: number) {
    const userRanks = this.getUserRating(name, user)
    return userRanks && userRanks[category]
  }

  hasAnyUserRatings(user: string) {
    const userRanks = this.ratings[user] || {}
    return Reflect.ownKeys(userRanks).length > 0
  }

  getRating(name: string, category: number, user?: string) {
    const app = useAppStore()
    user = user || app.currentUser
    const userRanks = this.ratings[user] || {}
    if (!userRanks) {
      return this.getCategoryDefault(category)
    }

    const itemRank = userRanks[name]
    if (!itemRank) {
      return this.getCategoryDefault(category)
    }

    return itemRank[category] ?? this.getCategoryDefault(category)
  }

  getUserRating(name: string, user: string) {
    const userRanks = this.ratings[user] || {}
    return userRanks[name]
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