<template>
  <v-dialog v-model="tokenDialog" persistent max-width="50%">
    <v-card>
      <v-card-title>Please enter your GitHub Token</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="token"
          density="compact"
          label="GitHub Token"
          hide-details
          hide-spin-buttons
          />
      </v-card-text>

      <v-card-actions>
        <v-btn
          color="success"
          @click="submit"
          :disabled="!token"
          >
          done
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
  import { useAppStore } from '@/stores/app';
  import { storeToRefs } from 'pinia';
  import { onMounted, watch } from 'vue';

  const app = useAppStore()
  const { token, tokenDialog } = storeToRefs(app)

  function submit() {
    if (token.value) {
      app.setGithubToken(token.value)
      tokenDialog.value = false
    }
  }

  function checkDialog () {
    if (!token.value) {
      tokenDialog.value = true
    }
  }

  onMounted(checkDialog)

  watch(token, checkDialog)
</script>
