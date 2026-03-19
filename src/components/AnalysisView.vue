<template>
  <v-card class="d-flex justify-center align-start" density="compact">

    <div>
      <div class="mr-4">
        <v-slider
          v-for="(_value, key) in weights"
          :key="'w_'+key"
          v-model="weights[key]"
          min="0"
          max="1"
          :label="key"
          density="compact"
          hide-details
          hide-spin-buttons
          thumb-size="15"
          style="width: 200px; max-width: 200px;"
          @update:model-value="loadData"
          />
      </div>

    </div>

    <div class="mt-1">
      <v-text-field
        v-model="search"
        label="Search"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        class="mb-1"
        clearable
        hide-details
        hide-spin-buttons
        single-line
        />

      <v-data-table
        :items="items"
        :headers="headers"
        :search="search"
        density="compact"
        >

        <template v-slot:item.score="{ value }">
          <v-rating
            :model-value="value"
            :length="5"
            :color="value > 0 ? 'amber' : 'default'"
            half-increments
            density="compact"
            readonly
            />
        </template>
      </v-data-table>
    </div>

  </v-card>
</template>

<script setup lang="ts">
  import { useAppStore } from '@/stores/app';
  import type { RatingItem } from '@/use/data-manager';
  import DM from '@/use/data-manager';
  import { storeToRefs } from 'pinia';
  import { onMounted, onUpdated, reactive, ref, watch, type Reactive, type Ref } from 'vue';

  type AggItem = {
    item: RatingItem,
    score: number,
    raters: Array<string>
  }

  const app = useAppStore()
  const { _timeItems, _timeRatings } = storeToRefs(app)

  const search = ref("")
  const items: Ref<Array<AggItem>> = ref([])
  const headers = [
    { title: "Name", key: "item.name" },
    { title: "Score", key: "score" },
    { title: "Raters", key: "raters" }
  ]

  const weights: Reactive<Record<string, number>> = reactive({})

  function roundHalf(num: number) {
    return Math.round(num*2) / 2
  }

  function calcScore(name: string) {
    let score = 0, sumWeights = 0
    DM.categories.forEach(c => {
      if (c.type === "integer") {
        let catScore = 0
        app.users.forEach(u => catScore += (DM.getRating(name, c.id, u) as number))
        score += catScore * (weights[c.name] || 0)
        sumWeights += weights[c.name] || 0
      }
    })
    return roundHalf(sumWeights > 0 ? score / sumWeights : score)
  }

  function loadData() {
    const withScore: Array<AggItem> = []

    DM.items.forEach(d => {
      if (DM.hasRatings(d.name, "integer")) {
        withScore.push({
          item: d,
          score: calcScore(d.name),
          raters: [] // TODO: get raters
        })
      }
    })

    withScore.sort((a, b) => b.score - a.score)

    items.value = withScore
  }

  function init() {
    DM.categories.forEach(c => {
      if (c.type === "integer") {
        weights[c.name] = 1
      }
    })
    loadData()
  }

  onMounted(init)

  onUpdated(loadData)

  watch(_timeItems, loadData)
  watch(_timeRatings, loadData)
</script>