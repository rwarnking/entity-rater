<template>
  <v-toolbar density="compact" height="48">
    <div class="d-flex justify-space-between align-center pl-2 pr-2" style="width: 100%;">

      <v-btn
        icon="mdi-theme-light-dark"
        density="compact"
        variant="text"
        @click="toggleTheme"
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
import { onMounted } from 'vue'
  import { useToast } from 'vue-toastification'
  import { useTheme } from 'vuetify'

  const theme = useTheme()
  const toast = useToast()
  const app = useAppStore()
  const { currentUser, hasChanges } = storeToRefs(app)

  function toggleTheme() {
    theme.toggle()
    app.setTheme(theme.name.value)
  }

  async function commitChanges() {
    if (hasChanges.value || !app.token || !app.currentUser) {

      app.changes.forEach(async (key: string) => {
        await pushRepoFile(
          key + ".json",
          `${app.currentUser } added ${key} changes`,
          // @ts-ignore
          key === __GITHUB_DATA_ITEMS__ ? DM.items : DM.ratings
        )
        toast.success("saved changes to " + key)
      })

      app.changes.clear()
    }
  }

  onMounted(function() {
    theme.change(app.theme)
  })
</script>