<template>
  <v-dialog v-model="itemDialog" min-width="50%" max-width="700">
    <v-card title="Add a New Entity">

      <v-card-text>
        <v-text-field
          v-model="newItemName"
          label="name"
          density="compact"
          hide-details
          hide-spin-buttons
          @update:model-value="validateName"
          />

        <div class="mt-4 mb-1 text-body-small">pick matching genders</div>
        <v-btn-toggle
          v-model="newItemGender"
          color="primary"
          multiple
          class="mt-2"
          density="compact"
          >
          <v-btn value="m" prepend-icon="mdi-gender-male">male</v-btn>
          <v-btn value="f" prepend-icon="mdi-gender-female">female</v-btn>
        </v-btn-toggle>
      </v-card-text>

      <v-card-actions>
          <v-btn color="warning" @click="cancel">cancel</v-btn>
          <v-btn
            :color="valid ? 'success' : 'default'"
            :disabled="!valid"
            @click="submit"
            >
            submit
          </v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
  import { useAppStore } from '@/stores/app';
  import DM from '@/use/data-manager';
  import { storeToRefs } from 'pinia';
  import { computed, onMounted, toRaw, watch } from 'vue';
  import { useToast } from 'vue-toastification';

  const toast = useToast()
  const app = useAppStore()
  const { itemDialog, newItemName, newItemGender } = storeToRefs(app)

  const valid = computed(() => newItemName.value.length && newItemGender.value.length)

  function validateName() {
    if (newItemName.value.length > 0) {
      // @ts-ignore
      newItemName.value = newItemName.value[0].toUpperCase() + newItemName.value.slice(1)
    }
  }

  function cancel() {
    app.closeItemDialog()
  }

  function submit() {
    if (DM.addItem(toRaw(newItemName.value), toRaw(newItemGender.value))) {
      toast.success("added " + newItemName.value)
      app.closeItemDialog()
    }
  }

  onMounted(validateName)

  watch(itemDialog, validateName)
</script>