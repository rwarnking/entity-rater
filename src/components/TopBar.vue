<template>
  <v-app-bar density="compact">
    <div class="d-flex justify-space-between pl-2 pr-2" style="width: 100%;">

      <v-btn
        icon="mdi-theme-light-dark"
        density="compact"
        variant="text"
        @click="$vuetify.theme.cycle()"
        />

      <div>User: {{ currentUser || '?' }}</div>

      <v-btn
        color="primary"
        density="comfortable"
        variant="tonal"
        @click="commitChanges"
        >
        SAVE
      </v-btn>

    </div>
  </v-app-bar>
</template>

<script lang="ts" setup>
  import { useAppStore } from '@/stores/app'
  import { storeToRefs } from 'pinia'

  const app = useAppStore()
  const { currentUser } = storeToRefs(app)

  async function commitChanges() {
    alert("saved")
  }
</script>