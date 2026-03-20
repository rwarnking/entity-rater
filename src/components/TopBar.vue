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
        :color="hasChanges ? 'error' : 'default'"
        :disabled="!hasChanges"
        density="comfortable"
        variant="flat"
        :class="{ 'blink': hasChanges }"
        @click="commitChanges"
        >
        {{ hasChanges ? "save changes" : "no changes" }}
      </v-btn>

    </div>
  </v-toolbar>
</template>

<script lang="ts" setup>
  import { useAppStore } from '@/stores/app'
  import DM from '@/use/data-manager'
  import { getFilename, pushRepoFile } from '@/use/repo-api'
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
    const messages = await DM.commitChanges()
    messages.forEach(m => toast.success(m))
  }

  onMounted(function() {
    theme.change(app.theme)
  })
</script>

<style scoped>
.blink {
  animation: warn 1.5s infinite linear;
}

@keyframes warn {
  0% { transform: scale(1, 1); }
  50% { transform: scale(0.85, 1); }
  100% { transform: scale(1, 1); }
}
</style>