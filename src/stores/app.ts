// Utilities
import { defineStore } from 'pinia'
import { computed, ref, type Ref } from 'vue'

export const useAppStore = defineStore('app', () => {

  // state
  const theme = ref("system")
  const loaded = ref(false)

  const token = ref("")
  const loginDialog = ref(true)

  const currentUser = ref("")
  const loggedIn = ref(false)
  const users: Ref<Array<string>> = ref([])

  const changes: Ref<Set<string>> = ref(new Set())

  const itemDialog = ref(false)
  const newItemName = ref("")
  const newItemGender = ref([])

  const _timeItems = ref(0)
  const _timeRatings = ref(0)

  // getters
  const hasChanges = computed(() => changes.value.size > 0)

  // actions
  function setLoaded(value: boolean) {
    loaded.value = value
  }

  function readStorage() {
    setTheme(localStorage.getItem("THEME") || "system")
    token.value = localStorage.getItem("GITHUB_TOKEN") || ""
    currentUser.value = localStorage.getItem("USERNAME") || ""
  }

  function setGithubToken(newToken: string) {
    localStorage.setItem("GITHUB_TOKEN", newToken)
    token.value = newToken
  }

  function setTheme(mode: string) {
    localStorage.setItem("THEME", mode)
    theme.value = mode
  }

  function setUser(username: string) {
    currentUser.value = username
    localStorage.setItem("USERNAME", username)
  }

  function addChanges(key: string) {
    changes.value.add(key)
  }

  function deleteChanges(key: string) {
    return changes.value.delete(key)
  }

  function toggleChanges(key: string) {
    if (changes.value.has(key)) {
      addChanges(key)
    } else {
      deleteChanges(key)
    }
  }

  function openItemDialog(name: string = "") {
    newItemName.value = name
    newItemGender.value = []
    itemDialog.value = true
  }

  function closeItemDialog() {
    itemDialog.value = false
    newItemName.value = ""
    newItemGender.value = []
  }

  return {
    theme,
    loaded,
    token,
    loginDialog,
    currentUser,
    loggedIn,
    users,
    hasChanges,
    changes,

    itemDialog,
    newItemName,
    newItemGender,

    _timeItems,
    _timeRatings,

    setTheme,
    setLoaded,
    readStorage,
    setGithubToken,
    setUser,

    addChanges,
    deleteChanges,
    toggleChanges,

    openItemDialog,
    closeItemDialog
  }
})
