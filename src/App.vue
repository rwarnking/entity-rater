<template>
  <v-app>
    <v-main>

      <TopBar/>
      <LoginDialog/>
      <ItemDialog/>
      <LeavePageDialog/>

      <div v-if="loaded && loggedIn">

        <v-tabs v-model="tab" align-tabs="center">
          <v-tab :value="TABS.RATING">Rating List</v-tab>
          <v-tab :value="TABS.RANDOM">Random Rating</v-tab>
          <v-tab :value="TABS.ANALYSIS">Analysis</v-tab>
        </v-tabs>

        <v-window v-model="tab">
          <v-window-item :value="TABS.RATING">
            <RatingListView/>
          </v-window-item>

          <v-window-item :value="TABS.RANDOM">
            <RatingRandomView/>
          </v-window-item>

          <v-window-item :value="TABS.ANALYSIS">
            <AnalysisView/>
          </v-window-item>
        </v-window>
      </div>
    </v-main>

    <ToolTip/>

  </v-app>
</template>

<script lang="ts" setup>
  import DM from './use/data-manager';
  import { onBeforeMount, onMounted, ref, watch } from 'vue';
  import { storeToRefs } from 'pinia';
  import { TABS, useAppStore } from '@/stores/app';
  import RatingListView from './components/RatingListView.vue';
  import TopBar from './components/TopBar.vue';
  import LoginDialog from './components/LoginDialog.vue';
  import { getFilename, getRepoFile } from './use/repo-api';
  import RatingRandomView from './components/RatingRandomView.vue';
  import AnalysisView from './components/AnalysisView.vue';
  import ItemDialog from './components/ItemDialog.vue';
  import { useToast } from 'vue-toastification';
  import LeavePageDialog from './components/LeavePageDialog.vue';
  import ToolTip from './components/ToolTip.vue';

  const toast = useToast()
  const app = useAppStore()
  const { tab, loaded, loggedIn, users } = storeToRefs(app)

  let loading = false

  async function loadData() {
    if (loading) return

    loading = true
    // @ts-ignore
    users.value = await getRepoFile(getFilename(__GITHUB_DATA_USERS__))

    await DM.loadData()

    if (DM.items.length > 0) {
      app.setLoaded(true)
    } else {
      toast.error("data error - API rate limit exceeded?")
    }

    loading = false
  }

  onBeforeMount(function() {
    // read data from local storage first
    app.readStorage()
  })

  onMounted(loadData)

  watch(loggedIn, loadData)

</script>
