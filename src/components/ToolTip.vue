<template>
  <Teleport v-if="hasAny" to="body">
    <v-sheet
      rounded
      elevation="2"
      class="pa-2 tooltip text-body-small"
      :style="{
        left: x+'px',
        top: y+'px'
      }"
      >
      <div v-if="data" v-html="data"></div>
      <div v-if="rating">
        <div v-for="cat in DM.categories"
          :key="'ttr_'+cat.id"
          class="d-flex align-center justify-space-between"
          >
          <div class="mr-1">{{ cat.name }}</div>
          <!-- @vue-ignore -->
          <v-rating
            v-if="cat.type === 'integer'"
            :model-value="rating[cat.id]"
            :length="cat.max"
            :color="rating[cat.id] > 0 ? 'amber' : 'default'"
            size="small"
            density="compact"
            readonly
            />

          <div v-if="cat.type === 'boolean'" class="d-flex justify-center align-center">
            <!-- @vue-ignore -->
            <v-checkbox-btn
              :model-value="rating[cat.id]"
              color="primary"
              density="compact"
              style="font-size: small;"
              readonly
              />
          </div>

        </div>
      </div>
    </v-sheet>
  </Teleport>
</template>

<script lang="ts" setup>
  import { useTooltip } from '@/stores/tooltip';
  import DM from '@/use/data-manager';
  import { storeToRefs } from 'pinia';

  const tt = useTooltip()
  const { x, y, data, rating, hasAny } = storeToRefs(tt)

</script>

<style scoped>
.tooltip {
  position: absolute;
  z-index: 4999;
}
</style>