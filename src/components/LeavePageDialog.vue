<template>
  <v-dialog v-model="model" max-width="400px">
    <v-card>
      <v-card-text  class="d-flex flex-column align-center justify-center">

        <div style="text-align: center; font-size: large;">
          There are unsaved changes, are you sure you want to leave?
        </div>

        <v-btn
          class="mt-4"
          color="success"
          density="comfortable"
          variant="flat"
          block
          @click="commitChanges"
          >
          save changes
        </v-btn>

      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
  import { useAppStore } from '@/stores/app';
  import DM from '@/use/data-manager';
  import { onMounted } from 'vue';
  import { useToast } from 'vue-toastification';

  const toast = useToast()
  const app = useAppStore()
  const model = defineModel({ default: false })

  async function commitChanges() {
    const messages = await DM.commitChanges()
    model.value = false
    messages.forEach(m => toast.success(m))
  }


  onMounted(function() {
    addEventListener("beforeunload", function(event) {
      if (app.hasChanges) {
        event.preventDefault()
        // legacy support
        event.returnValue = "there are unsaved changes"
        model.value = true
        return false
      }
      return true
    })
  })
</script>