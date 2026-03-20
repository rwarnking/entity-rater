<template>
  <v-card class="d-flex justify-center align-start" density="compact">

    <div class="mr-4 mt-1" style="min-width: 500px">
      <v-container>
        <v-row v-for="(_value, key) in weights" :key="'w_'+key" density="compact">
          <v-col>{{ key }}</v-col>
          <v-col>
            <v-slider
              v-model="weights[key]"
              min="0"
              max="1"
              density="compact"
              hide-details
              hide-spin-buttons
              thumb-size="15"
              style="width: 200px;"
              @update:model-value="loadData"
              />
          </v-col>
        </v-row>
      </v-container>

      <v-divider class="mt-2 mb-2"></v-divider>

      <v-container max-height="65vh" style="overflow-y: auto;">
        <v-row density="compact">
          <v-col
            v-for="(name, idx) in filterNames"
            :key="'f_'+name"
            style="text-align: center;"
            :offset="idx === 0 ? 3 : 0">
            <b>{{ name }}</b>
          </v-col>
        </v-row>

        <v-row
          v-for="(values, user) in filters"
          :key="'f_'+user"
          density="compact"
          >

          <v-col>{{ user }}</v-col>
          <v-col
            v-for="name in filterNames"
            :key="'fv_'+user+'_'+name"
            >
            <div class="d-flex justify-center" style="width: 100%;">
              <v-checkbox
                v-model="values[name]"
                density="compact"
                color="error"
                true-icon="mdi-close-box"
                @update:model-value="loadData"
                hide-details
                hide-spin-buttons
                />
            </div>
          </v-col>

        </v-row>
      </v-container>

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

        <template v-slot:item.item.name="{ item }">
          <td>
            {{ item.item.name }}
            <v-icon
              v-for="g in item.item.gender"
              :icon="getGenderIcon(g)"
              :color="getGenderColor(g)"
              size="sm"
              class="mr-1"
              />
          </td>
        </template>

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

        <template v-slot:item.raters="{ value }">
          <v-chip v-for="u in value"
            density="compact"
            class="text-body-small"
            >
            {{ u }}
          </v-chip>
        </template>
      </v-data-table>
    </div>

  </v-card>
</template>

<script setup lang="ts">
  import { useAppStore } from '@/stores/app';
  import type { RatingItem } from '@/use/data-manager';
  import DM from '@/use/data-manager';
  import { getGenderColor, getGenderIcon } from '@/use/utils';
  import { storeToRefs } from 'pinia';
  import { onMounted, onUpdated, reactive, ref, watch, type Reactive, type Ref } from 'vue';

  type AggItem = {
    item: RatingItem,
    score: number,
    raters: Array<string>
  }

  const app = useAppStore()
  const { _timeItems, _timeRatings, users } = storeToRefs(app)

  const search = ref("")
  const items: Ref<Array<AggItem>> = ref([])
  const headers = [
    { title: "Name", key: "item.name" },
    { title: "Score", key: "score" },
    { title: "Raters", key: "raters" }
  ]

  type CategoryWeight = Record<string, number>
  type FilterValue = Record<string, boolean>
  type CategoryFilter = Record<string, FilterValue>

  const weights: Reactive<CategoryWeight> = reactive({})

  const filterNames: Ref<Array<string>> = ref([])
  const filters: Reactive<CategoryFilter> = reactive({})

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

  function matchesFilters(name: string) {
    // for all users, check if this item matches their filters
    for (let j = 0; j < users.value.length; ++j) {
      const user = users.value[j] || ""
      // for all boolean filters (except favorites)
      for (let i = 0; i < filterNames.value.length; ++i) {
        const cat = DM.categories.find(d => d.name === filterNames.value[i])
        if (cat) {
          const exclude = filters[user]?.[cat.name] || false
          if (exclude && DM.getRating(name, cat.id, user) === true) {
            return false
          }
        }
      }
    }
    return true
  }

  function loadData() {
    const withScore: Array<AggItem> = []

    DM.items.forEach(d => {
      if (DM.hasRatings(d.name, "integer") && matchesFilters(d.name)) {
        withScore.push({
          item: d,
          score: calcScore(d.name),
          raters: DM.getRaters(d.name, "integer")
        })
      }
    })

    withScore.sort((a, b) => b.score - a.score)
    items.value = withScore
  }

  function init() {
    const fnames: Array<string> = []
    DM.categories.forEach(c => {
      if (c.type === "integer") {
        weights[c.name] = 1
      } else if (c.type === "boolean" && c.id !== 1) {
        fnames.push(c.name)
      }
    })
    filterNames.value = fnames

    users.value.forEach((u: string) => {
      const tmp: FilterValue = {}
      fnames.forEach(c => tmp[c] = false)
      filters[u] = tmp
    })

    loadData()
  }

  onMounted(init)

  onUpdated(loadData)

  watch(_timeItems, loadData)
  watch(_timeRatings, loadData)
</script>