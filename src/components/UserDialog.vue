<template>
  <v-dialog v-model="userDialog" persistent max-width="50%">
    <v-card>
      <v-card-title>Select User</v-card-title>
      <v-card-text class="d-flex justify-center flex-wrap">
        <v-btn
          v-for="u in users"
          :key="u"
          @click="app.setUser(u)"
          class="ma-2"
        >
          {{ u }}
        </v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
  import { useAppStore } from '@/stores/app';
  import { storeToRefs } from 'pinia';
  import { onMounted, watch } from 'vue';

  const app = useAppStore()
  const { currentUser, userDialog, users } = storeToRefs(app)

  function checkDialog () {
    userDialog.value = currentUser.value.length > 0
  }

  onMounted(checkDialog)

  watch(currentUser, checkDialog)
</script>
