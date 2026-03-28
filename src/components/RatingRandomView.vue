<template>
  <v-card density="compact">
    <v-container v-if="activeItem.name" max-width="500">

      <v-row density="compact">
        <v-col cols="3"><b>Name</b></v-col>
        <v-col>
          {{ activeItem.name }}
          <v-icon
              v-for="g in activeItem.gender"
              :icon="getGenderIcon(g)"
              :color="getGenderColor(g)"
              size="sm"
              class="mr-1"
              />
        </v-col>

      </v-row>

      <v-row v-for="c in categories" :key="'rating_'+c.id" density="compact">
        <v-col cols="3"><b>{{ c.name }}</b></v-col>

        <v-col>
          <!-- @vue-ignore -->
          <v-rating
            v-if="c.type === 'integer'"
            v-model="rating[c.id]"
            @update:model-value="updateRating(c.id)"
            :length="c?.max"
            density="compact"
            :active-color="rating[c.id] > 0 ? 'amber' : 'default'"
            :half-increments="false"
            />

          <!-- @vue-ignore -->
          <v-checkbox
            v-if="c.type === 'boolean'"
            v-model="rating[c.id]"
            color="primary"
            @update:model-value="updateRating(c.id)"
            density="compact"
            hide-details
            hide-spin-buttons
            />
        </v-col>

      </v-row>

      <v-row density="compact">
        <v-col cols="12">
          <v-btn
            block
            @click="nextItem"
            density="comfortable"
            :color="hasNext ? 'primary' : 'default'"
            :disabled="!hasNext"
            >
            next
          </v-btn>
        </v-col>
      </v-row>

    </v-container>
    <div v-else style="text-align: center; font-size: large;" class="mt-4 mb-4">
      no unrated items left
    </div>
  </v-card>
</template>

<script lang="ts" setup>
  import { TABS, useAppStore } from '@/stores/app';
  import DM, { type AttributeRating, type RatingCategory, type RatingItem } from '@/use/data-manager';
  import { shuffle } from '@/use/random';
  import { getGenderColor, getGenderIcon } from '@/use/utils';
  import { storeToRefs } from 'pinia';
  import { ref, onMounted, type Ref, computed, watch } from 'vue';

  const app = useAppStore()
  const { _timeRatings, _timeItems } = storeToRefs(app)

  const activeId = ref("")

  const items: Ref<Map<string, RatingItem>> = ref(new Map())
  const rating: Ref<AttributeRating> = ref({})
  const categories: Ref<Array<RatingCategory>> = ref([])

  const activeItem = computed(() => {
    return items.value.has(activeId.value) ?
      items.value.get(activeId.value) as RatingItem :
      { name: "", gender: [] }
  })

  const hasNext = computed(() => items.value.size > 0)

  function updateRating(category: number) {
    if (activeId.value && rating.value[category] !== undefined) {
      DM.setRating(
        activeId.value,
        category,
        rating.value[category]
      )
    }
  }

  function nextItem() {
    if (hasNext.value) {
      if (activeId.value) {
        items.value.delete(activeId.value)
      }
      // reset rating values
      const obj: AttributeRating = {}
      DM.categories.forEach(c => obj[c.id] = DM.getCategoryDefault(c.id))
      rating.value = obj
      // get the next active id
      activeId.value = Array.from(items.value.keys())[0] || ""
    }
  }

  function onUpdate() {
    const existing = Array.from(items.value.keys())
    let needsNext = false

    // remove existing entities with a rating
    existing.forEach(id => {
      if (DM.hasUserRatings(id)) {
        items.value.delete(id)
        if (activeId.value === id) {
          needsNext = true
        }
      }
    })

    // add new entities without a rating
    DM.items.forEach(d => {
      if (!DM.hasUserRatings(d.name) && !items.value.has(d.name)) {
        items.value.set(d.name, d)
      }
    })

    if (needsNext) {
      nextItem()
    }
  }

  function loadData() {
    const remaining: Array<RatingItem> = []
    // set categories
    categories.value = DM.categories

    // get items without a rating
    DM.items.forEach(d => {
      if (!DM.hasUserRatings(d.name)) {
        remaining.push(d)
      }
    })

    items.value = new Map(shuffle(remaining).map(d => ([d.name, d])))

    nextItem()
  }

  onMounted(loadData)

  // handle updates
  watch(_timeItems, onUpdate)
  watch(_timeRatings, function() {
    if (app.tab !== TABS.RANDOM) {
      onUpdate()
    }
  })
</script>