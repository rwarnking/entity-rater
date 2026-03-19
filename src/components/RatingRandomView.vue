<template>

  <v-card>

    <v-container v-if="activeItem.name" max-width="500">

      <v-row density="compact">
        <v-col cols="3"><b>Name</b></v-col>
        <v-col>{{ activeItem.name }}</v-col>

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
            :color="rating[c.id] > 0 ? 'amber' : 'default'"
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

  </v-card>

</template>

<script lang="ts" setup>
  import DM, { type AttributeRating, type RatingCategory, type RatingItem } from '@/use/data-manager';
  import { shuffle } from '@/use/random';
  import { ref, onMounted, type Ref, computed  } from 'vue';

  const index = ref(0)

  const items: Ref<Array<RatingItem>> = ref([])
  const rating: Ref<AttributeRating> = ref({})
  const categories: Ref<Array<RatingCategory>> = ref([])

  const activeItem = computed(() => {
    return items.value.length > index.value ?
      items.value[index.value] as RatingItem :
      { name: "", gender: [] }
  })

  const hasNext = computed(() => index.value < items.value.length-1)

  function updateRating(category: number) {
    if (activeItem.value.name && rating.value[category] !== undefined) {
      DM.setRating(
        activeItem.value.name,
        category,
        rating.value[category]
      )
    }
  }

  function loadData() {
    const remaining: Array<RatingItem> = []
    // set categories
    categories.value = DM.categories

    // get items without a rating
    DM.items.forEach(d => {

      if (!DM.hasRatings(d.name)) {
        remaining.push(d)
      }

    })

    const obj: AttributeRating = {}
    DM.categories.forEach(c => obj[c.id] = DM.getCategoryDefault(c.id))

    index.value = 0
    rating.value = obj
    items.value = shuffle(remaining)
  }

  function nextItem() {
    if (hasNext.value) {
      index.value++
      const obj: AttributeRating = {}
      DM.categories.forEach(c => obj[c.id] = DM.getCategoryDefault(c.id))
      rating.value = obj
    }
  }

  onMounted(loadData)

  // TODO: handle upadtes somehow
  // watch(_timeItems, onItemUpdate)
</script>