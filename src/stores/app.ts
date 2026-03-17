// Utilities
import { defineStore } from 'pinia'
import { computed, ref, type Ref } from 'vue'

export const useAppStore = defineStore('app', () => {

  const loaded = ref(false)

  const token = ref("")
  const loginDialog = ref(true)

  const currentUser = ref("")
  const loggedIn = ref(false)
  const users: Ref<Array<string>> = ref([])

  const changes: Ref<Set<string>> = ref(new Set())

  const hasChanges = computed(() => changes.value.size > 0)

  function setLoaded(value: boolean) {
    loaded.value = value
  }

  function readStorage() {
    token.value = localStorage.getItem("GITHUB_TOKEN") || ""
    currentUser.value = localStorage.getItem("USERNAME") || ""
  }

  function setGithubToken(newToken: string) {
    localStorage.setItem("GITHUB_TOKEN", newToken)
    token.value = newToken
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

  return {
    loaded,
    token,
    loginDialog,
    currentUser,
    loggedIn,
    users,
    hasChanges,
    changes,

    setLoaded,
    readStorage,
    setGithubToken,
    setUser,

    addChanges,
    deleteChanges,
    toggleChanges
  }
})
