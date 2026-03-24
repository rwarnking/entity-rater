<template>
  <v-toolbar density="compact" height="48">
    <div class="d-flex justify-space-between align-center pl-2 pr-2" style="width: 100%; font-size: small;">

      <v-btn
        icon="mdi-theme-light-dark"
        density="compact"
        variant="text"
        @click="toggleTheme"
        />

      <v-chip density="compact" variant="flat">{{ currentUser || '?' }}</v-chip>

      <div v-if="hasChanges">
        <v-btn
          color="warning"
          density="compact"
          variant="flat"
          class="mr-2"
          @click="discardChanges"
          >
          discard changes
        </v-btn>
        <v-btn
          color="success"
          density="compact"
          variant="flat"
          class="blink"
          @click="commitChanges"
          >
          save changes
        </v-btn>
      </div>
      <div v-else>no changes</div>

    </div>
  </v-toolbar>
</template>

<script lang="ts" setup>
  import { useAppStore } from '@/stores/app'
  import DM from '@/use/data-manager'
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

  async function discardChanges() {
    await DM.updateData()
    toast.warning("discarded all changes")
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