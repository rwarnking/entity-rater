<template>
  <v-toolbar density="compact" height="48">
    <div class="d-flex justify-space-between align-center pl-2 pr-2" style="width: 100%;">

      <v-btn
        icon="mdi-theme-light-dark"
        density="compact"
        variant="text"
        @click="$vuetify.theme.cycle()"
        />

      <div>user: {{ currentUser || '?' }}</div>

      <v-btn
        :color="hasChanges ? 'success' : 'default'"
        :disabled="!hasChanges"
        density="comfortable"
        variant="plain"
        @click="commitChanges"
        >
        SAVE
      </v-btn>

    </div>
  </v-toolbar>
</template>

<script lang="ts" setup>
  import { useAppStore } from '@/stores/app'
  import DM from '@/use/data-manager'
  import { pushRepoFile } from '@/use/repo-api'
  import { storeToRefs } from 'pinia'

  const app = useAppStore()
  const { currentUser, hasChanges } = storeToRefs(app)

  async function commitChanges() {
    if (hasChanges.value || !app.token || !app.currentUser) {

      app.changes.forEach((key: string) => {
        pushRepoFile(
          key + ".json",
          app.currentUser + " added changes",
          key === "items" ? DM.items : DM.ratings
        )
      })
    }
  }
</script>