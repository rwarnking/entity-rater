<template>
  <v-app>
    <v-main>

      <TopBar/>
      <TokenDialog/>
      <UserDialog v-if="token && users.length"/>

      <div v-if="loaded && currentUser">

        <v-tabs v-model="tab">
          <v-tab value="rating">Rating</v-tab>
          <v-tab value="results">Results</v-tab>
        </v-tabs>

        <v-window v-model="tab">
          <v-window-item value="rating">
            <RatingView/>
          </v-window-item>

          <v-window-item value="results">

          </v-window-item>
        </v-window>
      </div>
    </v-main>

  </v-app>
</template>

<script lang="ts" setup>
  import DM from './use/data-manager';
  import { onMounted, ref, watch } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useAppStore } from '@/stores/app';
  import RatingView from './components/RatingView.vue';
  import UserDialog from './components/UserDialog.vue';
  import TopBar from './components/TopBar.vue';
  import TokenDialog from './components/TokenDialog.vue';

  const tab = ref("rating")

  const app = useAppStore()
  const {
    loaded,
    currentUser,
    userDialog,
    users,
    token,
    tokenDialog
  } = storeToRefs(app)

  function makeUrl(file: string) {
    // @ts-ignore
    return `https://api.github.com/repos/${__GITHUB_USER__}/${__GITHUB_REPO__}/contents/${file}/${token.value}`
  }

  async function getFromRepo(file: string) {
    const res = await fetch(makeUrl(file))
    const json = await res.json()
    return JSON.parse(atob(json.content))
  }

  async function loadData() {
    if (!token.value) {
      tokenDialog.value = true
      return
    }

    // @ts-ignore
    users.value = await getFromRepo(__GITHUB_USER_PATH__)

    if (!currentUser.value) {
      userDialog.value = true
      return
    }

    const [items, ratings] = await Promise.all([
      // @ts-ignore
      getFromRepo(__GITHUB_ITEM_PATH__),
      // @ts-ignore
      getFromRepo(__GITHUB_RATING_PATH__)
    ])
    DM.setData(items, ratings)

    app.setLoaded(true)
  }

  onMounted(function() {
    // read data from local storage first
    app.readStorage()
    // then fetch data from repo
    loadData()
  })

  // fetch data from repo if token changes and
  // data was not previously loaded
  watch(token, function() {
    if (token.value && !loaded.value) {
      loadData()
    }
  })
</script>
