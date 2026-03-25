<template>
  <v-card class="d-flex justify-center align-start" density="compact">

    <div class="mr-4 mt-1" style="min-width: 450px; font-size: small">
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
            v-for="(cat, idx) in filterCats"
            :key="'f_'+cat.id"
            style="text-align: center;"
            :offset="idx === 0 ? 2 : 0">
            <b>{{ cat.name }}</b>
          </v-col>
        </v-row>

        <v-row
          v-for="(values, user) in filters"
          :key="'f_'+user"
          density="compact"
          >

          <v-col cols="2" class="d-flex align-center">{{ user }}</v-col>
          <v-col
            v-for="cat in filterCats"
            :key="'fv_'+user+'_'+cat.id"
            >
            <div class="d-flex justify-center" style="width: 100%;">
              <!-- @vue-ignore -->
              <v-checkbox
                v-model="values[cat.id].value"
                density="compact"
                :color="cat.variant === 'include' ? 'success' : 'error'"
                :true-icon="cat.variant === 'include' ? 'mdi-checkbox-marked' : 'mdi-close-box'"
                style="font-size: small"
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
        hover
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

        <template v-slot:item.raters="{ value, item }">
          <v-chip v-for="u in value"
            density="compact"
            variant="flat"
            class="text-body-small mr-1"
            @pointerenter="onHover($event, item, u)"
            @pointermove="onHoverUpdate($event)"
            @pointerleave="onHover"
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
  import { useTooltip } from '@/stores/tooltip';
  import type { RatingCategory, RatingItem } from '@/use/data-manager';
  import DM from '@/use/data-manager';
  import { getGenderColor, getGenderIcon } from '@/use/utils';
  import { storeToRefs } from 'pinia';
  import { onMounted, onUpdated, reactive, ref, watch, type Reactive, type Ref } from 'vue';

  type AggItem = {
    item: RatingItem,
    score: number,
    raters: Array<string>
  }

  const tt = useTooltip()
  const app = useAppStore()
  const { _timeItems, _timeRatings, users } = storeToRefs(app)

  const search = ref("")
  const items: Ref<Array<AggItem>> = ref([])
  const headers = [
    { title: "Name", key: "item.name" },
    { title: "Score", key: "score" },
    { title: "Raters", key: "raters", maxWidth: 300 }
  ]

  type CategoryWeight = Record<string, number>
  type Filter = { variant: string, value: boolean }
  type FilterValue = Record<string, Filter>
  type CategoryFilter = Record<string, FilterValue>

  const weights: Reactive<CategoryWeight> = reactive({})

  const filterCats: Ref<Array<RatingCategory>> = ref([])
  const filters: Reactive<CategoryFilter> = reactive({})

  function onHover(event: any, item?: AggItem, user?: string) {
    if (item && user) {
      const mx = event.clientX + 10
      const my = event.clientY + 10
      const rating = DM.getUserRating(item.item.name, user)
      if (rating) {
        tt.showRating(rating, mx, my, `${user} ratings for <b>${item.item.name}</b>`)
      }
    } else {
      tt.hide()
    }
  }

  function onHoverUpdate(event: any) {
    const mx = event.clientX + 10
    const my = event.clientY + 10
    tt.update(mx, my)
  }

  function roundHalf(num: number) {
    return Math.round(num*2) / 2
  }

  function calcScore(name: string) {
    let score = 0, sumWeights = 0
    DM.categories.forEach(c => {
      const defaultValue = DM.getCategoryDefault(c.id)
      if (c.variant === "score") {
        let catScore = 0, numUsers = 0
        app.users.forEach(u => {
          const ur = DM.getRating(name, c.id, u)
          if (ur !== defaultValue) {
            catScore += (ur as number)
            numUsers++
          }
        })

        const catWeight = weights[c.name] || 0
        if (numUsers > 0 && catWeight > 0) {
          score += (catScore / numUsers) * catWeight
          sumWeights += catWeight
        }
      }
    })
    return roundHalf(sumWeights > 0 ? score / sumWeights : score)
  }

  function matchesFilters(name: string) {
    let matches = true
    // for all users, check if this item matches their filters
    for (let j = 0; j < users.value.length; ++j) {
      const user = users.value[j] || ""
      if (!DM.hasUserRatings(name, user)) continue
      // check if all filters match
      for (let i = 0; i < filterCats.value.length; ++i) {
        const cat = filterCats.value[i]
        if (cat) {
          if (!DM.hasUserCategoryRating(name, user, cat.id)) continue
          const value = filters[user]?.[cat.id]?.value || false
          const ratingValue = DM.getRating(name, cat.id, user)
          if (value === true && ratingValue === true) {
            if (cat.variant === "include") {
              return true
            }
            matches = false
          }
        }
      }
    }
    return matches
  }

  function loadData() {
    const withScore: Array<AggItem> = []

    DM.items.forEach(d => {
      if (DM.hasRatings(d.name, "score") && matchesFilters(d.name)) {
        withScore.push({
          item: d,
          score: calcScore(d.name),
          raters: DM.getRaters(d.name, "score")
        })
      }
    })

    withScore.sort((a, b) => b.score - a.score)
    items.value = withScore
  }

  function init() {
    const fnames: Array<RatingCategory> = []
    DM.categories.forEach(c => {
      if (c.variant === "score") {
        weights[c.name] = 1
      } else if (c.variant === "exclude" || c.variant === "include") {
        fnames.push(c)
      }
    })
    filterCats.value = fnames

    users.value.forEach((u: string) => {
      // if the user has made any ratings
      if (DM.hasAnyUserRatings(u)) {
        const tmp: FilterValue = {}
        fnames.forEach(c => tmp[c.id] = {
          variant: c.variant,
          value: false
        })
        filters[u] = tmp
      }
    })

    loadData()
  }

  onMounted(init)

  onUpdated(loadData)

  watch(_timeItems, loadData)
  watch(_timeRatings, loadData)
</script>