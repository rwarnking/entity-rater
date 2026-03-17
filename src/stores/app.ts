// Utilities
import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'

export const useAppStore = defineStore('app', () => {

  const loaded = ref(false)

  const token = ref("")
  const tokenDialog = ref(false)

  const currentUser = ref("")
  const userDialog = ref(false)
  const users: Ref<Array<string>> = ref([])

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

  return {
    loaded,
    token,
    tokenDialog,
    currentUser,
    userDialog,
    users,

    setLoaded,
    readStorage,
    setGithubToken,
    setUser
  }
})
