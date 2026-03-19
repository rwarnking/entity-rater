<template>
  <v-app>
    <v-main>

      <TopBar/>
      <LoginDialog/>
      <ItemDialog/>

      <div v-if="loaded && loggedIn">

        <v-tabs v-model="tab" align-tabs="center">
          <v-tab value="rating_list">Rating List</v-tab>
          <v-tab value="rating_random">Random Rating</v-tab>
          <v-tab value="analysis">Analysis</v-tab>
        </v-tabs>

        <v-window v-model="tab">
          <v-window-item value="rating_list">
            <RatingListView/>
          </v-window-item>

          <v-window-item value="rating_random">
            <RatingRandomView/>
          </v-window-item>

          <v-window-item value="analysis">
            <AnalysisView/>
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
  import RatingListView from './components/RatingListView.vue';
  import TopBar from './components/TopBar.vue';
  import LoginDialog from './components/LoginDialog.vue';
  import { getRepoFile } from './use/repo-api';
  import RatingRandomView from './components/RatingRandomView.vue';
  import AnalysisView from './components/AnalysisView.vue';
  import ItemDialog from './components/ItemDialog.vue';

  const tab = ref("rating")

  const app = useAppStore()
  const {
    loaded,
    loggedIn,
    users,
  } = storeToRefs(app)

  async function loadData() {
    // @ts-ignore
    users.value = await getRepoFile(__GITHUB_DATA_USERS__+".json")

    await DM.loadData()

    app.setLoaded(true)
  }

  onBeforeMount(function() {
    // read data from local storage first
    app.readStorage()
  })

  onMounted(loadData)

</script>
