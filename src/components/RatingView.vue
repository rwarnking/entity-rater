<template>

  <v-data-table
    :items="items"
    :headers="headers"
    items-per-page="10"
  >

    <template v-slot:item.A1="{ item }">
      <!-- @vue-ignore -->
      <v-rating
        v-model="ratings[item.id]['A1']"
        @update:model-value="updateRating(item.id, 'A1')"
        length="5"
        density="compact"
        :color="ratings[item.id]['A1'] > 0 ? 'amber' : 'default'"
        :half-increments="false"
      />
    </template>

    <template v-slot:item.A2="{item}">
      <!-- @vue-ignore -->
      <v-rating
        v-model="ratings[item.id]['A2']"
        @update:model-value="updateRating(item.id, 'A2')"
        :color="ratings[item.id]['A2'] > 0 ? 'amber' : 'default'"
        length="5"
        density="compact"
      />
    </template>

    <template v-slot:item.A3="{item}">
      <!-- @vue-ignore -->
      <v-rating
        v-model="ratings[item.id]['A3']"
        @update:model-value="updateRating(item.id, 'A3')"
        :color="ratings[item.id]['A3'] > 0 ? 'amber' : 'default'"
        length="5"
        density="compact"
      />
    </template>

    <template v-slot:item.A4="{item}">
      <!-- @vue-ignore -->
      <v-rating
        v-model="ratings[item.id]['A4']"
        @update:model-value="updateRating(item.id, 'A4')"
        :color="ratings[item.id]['A4'] > 0 ? 'amber' : 'default'"
        length="5"
        density="compact"
      />
    </template>

  </v-data-table>

</template>

<script lang="ts" setup>
  import DM, { type ItemRatings, type RatingItem } from '@/use/data-manager';
  import { ref, onMounted, type Ref } from 'vue';

  const items: Ref<Array<RatingItem>> = ref([])
  const ratings: Ref<ItemRatings> = ref({})

  const headers = [
    {title:"Name", key:"name"},
    {title:"A1", key:"A1"},
    {title:"A2", key:"A2"},
    {title:"A3", key:"A3"},
    {title:"A4", key:"A4"}
  ]

  const attributes = headers.filter(d => d.key !== "name").map(d => d.key)

  function updateRating(itemId: number, attr: string) {
    if (ratings.value[itemId] && ratings.value[itemId][attr]) {
      DM.setRating(itemId, attr, ratings.value[itemId][attr])
    }
  }

  function loadData() {
    const obj: ItemRatings = {}
    DM.items.forEach(d => {
      const silly = obj[d.id] || {}
      attributes.forEach(attr => {
        silly[attr] = DM.getRating(d.id, attr)
      })
      obj[d.id] = silly
    })
    ratings.value = obj
    items.value = DM.items
  }

  onMounted(loadData)
</script>