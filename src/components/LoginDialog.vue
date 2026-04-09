<template>
  <v-dialog v-model="loginDialog" :persistent="!loggedIn" min-width="50%" max-width="700">
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
        <v-btn v-if="loggedIn"
          color="warning"
          @click="cancel"
          >
          cancel
        </v-btn>
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
  import { onMounted, ref, watch } from 'vue';

  const app = useAppStore()
  const {
    token,
    loginDialog,
    currentUser,
    users,
    loggedIn
  } = storeToRefs(app)

  const prevUser = ref("")
  const prevToken = ref("")

  function cancel() {
    const hasLogin = prevToken.value && prevUser.value
    if (hasLogin) {
      if (prevToken.value) {
        app.setGithubToken(prevToken.value)
      }
      if (prevUser.value) {
        app.setUser(prevUser.value)
        DM.init(token.value)
      }
    }
    prevUser.value = ""
    prevToken.value = ""
    loginDialog.value = false
    loggedIn.value = token.value.length > 0 && currentUser.value.length > 0
  }

  function submit() {
    if (token.value) {
      app.setGithubToken(token.value)
      if (currentUser.value) {
        app.setUser(currentUser.value)
        DM.init(token.value)
        app.setLoggedIn()
        loginDialog.value = false
      } else {
        // TODO: toast - missing user
      }
    } else {
      // TODO: toast - missing token
    }
  }

  watch(loginDialog, function(show) {
    if (show) {
      prevUser.value = currentUser.value
      prevToken.value = token.value
    }
  })

  onMounted(function() {
    const hasLogin = token.value.length > 0 && currentUser.value.length > 0
    if (hasLogin) {
      DM.init(token.value)
    }
    loggedIn.value = hasLogin
    loginDialog.value = !hasLogin
  })

</script>
