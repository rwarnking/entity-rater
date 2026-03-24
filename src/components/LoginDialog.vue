<template>
  <v-dialog v-model="loginDialog" persistent min-width="50%" max-width="700">
    <v-card title="Enter Database Token and Select User">
      <v-card-text>

        <v-text-field
          v-model="token"
          density="compact"
          label="GitHub Token"
          hide-details
          hide-spin-buttons
          />

        <v-divider class="mt-1 mb-1"></v-divider>

        <div class="d-flex justify-center flex-wrap">
          <v-btn
            v-for="u in users"
            :color="currentUser === u ? 'primary' : 'default'"
            :key="u"
            @click="app.setUser(u)"
            class="ma-2">
            {{ u }}
          </v-btn>
        </div>

      </v-card-text>

      <v-card-actions>
        <v-btn
          color="success"
          @click="submit"
          :disabled="!token || !currentUser"
          >
          continue
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
  import { useAppStore } from '@/stores/app';
import DM from '@/use/data-manager';
  import { storeToRefs } from 'pinia';
  import { onMounted } from 'vue';

  const app = useAppStore()
  const {
    token,
    loginDialog,
    currentUser,
    users,
    loggedIn
  } = storeToRefs(app)


  function submit() {
    if (token.value) {
      app.setGithubToken(token.value)
      if (currentUser.value) {
        DM.init(token.value)
        loggedIn.value = true
        loginDialog.value = false
      } else {
        // TODO: toast - missing user
      }
    } else {
      // TODO: toast - missing token
    }
  }

  onMounted(function() {
    const hasLogin = token.value.length > 0 && currentUser.value.length > 0
    if (hasLogin) {
      DM.init(token.value)
    }
    loggedIn.value = hasLogin
    loginDialog.value = !hasLogin
  })

</script>
