<template>
  <v-app>
    <v-main>

      <TopBar/>
      <LoginDialog/>

      <div v-if="loaded && loggedIn">

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
  import { onBeforeMount, onMounted, ref } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useAppStore } from '@/stores/app';
  import RatingView from './components/RatingView.vue';
  import TopBar from './components/TopBar.vue';
  import LoginDialog from './components/LoginDialog.vue';
  import { getRepoFile } from './use/repo-api';

  const tab = ref("rating")

  const app = useAppStore()
  const {
    loaded,
    loggedIn,
    users,
  } = storeToRefs(app)

  async function loadData() {
    // @ts-ignore
    users.value = await getRepoFile(__GITHUB_USER_PATH__)

    const [items, ratings] = await Promise.all([
      // @ts-ignore
      getRepoFile(__GITHUB_ITEM_PATH__),
      // @ts-ignore
      getRepoFile(__GITHUB_RATING_PATH__)
    ])
    DM.setData(items, ratings)

    app.setLoaded(true)
  }

  onBeforeMount(function() {
    // read data from local storage first
    app.readStorage()
  })

  onMounted(loadData)

</script>
