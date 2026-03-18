<template>

  <div>
    <v-text-field
      v-model="search"
      label="Search"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      density="compact"
      class="ma-1"
      clearable
      hide-details
      hide-spin-buttons
      single-line
      />

    <v-data-table
      :items="items"
      :headers="headers"
      :search="search"
      items-per-page="10"
    >

      <template v-slot:item="{ item }">
        <tr>
          <td>{{ item.name }}</td>

          <td v-for="c in categories" :key="c.id">

              <!-- @vue-ignore -->
              <v-rating
                v-if="c.type === 'integer'"
                v-model="ratings[item.id][c.id]"
                @update:model-value="updateRating(item.id, c.id)"
                :length="c?.max"
                density="compact"
                :color="ratings[item.id][c.id] > 0 ? 'amber' : 'default'"
                :half-increments="false"
                />

              <!-- @vue-ignore -->
              <v-checkbox
                v-if="c.type === 'boolean'"
                v-model="ratings[item.id][c.id]"
                color="primary"
                @update:model-value="updateRating(item.id, c.id)"
                density="compact"
                hide-details
                hide-spin-buttons
                />
          </td>
        </tr>
      </template>

    </v-data-table>
  </div>

</template>

<script lang="ts" setup>
  import DM, { type ItemRatings, type RatingCategory, type RatingItem } from '@/use/data-manager';
  import { ref, onMounted, type Ref } from 'vue';

  const search = ref("")

  const items: Ref<Array<RatingItem>> = ref([])
  const ratings: Ref<ItemRatings> = ref({})
  const categories: Ref<Array<RatingCategory>> = ref([])

  const headers: Ref<Array<{ title: string, key: string }>> = ref([])

  function updateRating(itemId: number, category: number) {
    if (ratings.value[itemId] && ratings.value[itemId][category] !== undefined) {
      DM.setRating(itemId, category, ratings.value[itemId][category])
    }
  }

  function loadData() {
    const obj: ItemRatings = {}
    // set categories
    categories.value = DM.categories

    // add existing ratings (or 0) for all items
    DM.items.forEach(d => {
      const silly = obj[d.id] || {}
      DM.categories.forEach(c => {
        silly[c.id] = DM.getRating(d.id, c.id)
      })
      obj[d.id] = silly
    })

    let h = [{ title: "Name", key: "name" }]
    h = h.concat(DM.categories.map(c => ({
      title: c.name,
      key: ""+c.id,
      // @ts-ignore
      value: (d: any) => ratings.value[d.id][c.id]
    })))

    headers.value = h
    ratings.value = obj
    items.value = DM.items
  }

  onMounted(loadData)
</script>