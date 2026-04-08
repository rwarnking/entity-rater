<template>

  <div>
    <v-text-field
      v-model="search"
      label="Search"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      density="compact"
      class="mt-1 mb-1"
      clearable
      hide-details
      hide-spin-buttons
      single-line
      >
        <template v-slot:append>
          <v-btn
            icon="mdi-plus"
            rounded="sm"
            density="comfortable"
            class="mr-1"
            :color="numMatches === 0 ? 'success' : 'default'"
            :disabled="numMatches > 0"
            @click="app.openItemDialog(search)"
            />
        </template>
      </v-text-field>

    <v-data-table
      :items="items"
      :headers="headers"
      :search="search"
      items-per-page="10"
      density="compact"
      hover
      @update:currentItems="countMatches"
    >

      <template v-slot:headers="{ columns, toggleSort, isSorted, getSortIcon }">
        <tr>
          <th v-for="c in columns">
            <v-tooltip :text="headerDescs[''+c.key]" location="bottom" open-delay="250" max-width="450px">
              <template v-slot:default>
                <p class="text-body-small">
                  <b>Idea:</b> {{ headerDescs[''+c.key] }}
                  <p v-if="headerEx[''+c.key]"><b>Example: </b>
                    <span v-html="headerEx[''+c.key]"></span>
                  </p>
                </p>
              </template>
              <template v-slot:activator="{ props }">
                <span v-bind="props">{{ c.title ?? '?' }}</span>
              </template>
            </v-tooltip>
            <v-icon
              size="small"
              class="ml-1"
              @click="toggleSort(c)"
              :color="isSorted(c) ? 'primary' : 'default'"
              >
              {{ isSorted(c) ? getSortIcon(c) : 'mdi-swap-vertical' }}
            </v-icon>
          </th>
        </tr>
      </template>

      <template v-slot:item="{ item }">
        <tr>
          <td>
            {{ item.name }}
            <v-icon
              v-for="g in item.gender"
                :icon="getGenderIcon(g)"
                :color="getGenderColor(g)"
                size="sm"
                class="mr-1"
              />
          </td>

          <td v-for="c in categories" :key="c.id">

              <!-- @vue-ignore -->
              <v-rating
                v-if="c.type === 'integer'"
                v-model="ratings[item.name][c.id]"
                @update:model-value="updateRating(item.name, c.id)"
                :length="c?.max"
                density="compact"
                :active-color="ratings[item.name][c.id] > 0 ? 'amber' : 'default'"
                :half-increments="false"
                />

              <!-- @vue-ignore -->
              <v-checkbox
                v-if="c.type === 'boolean'"
                v-model="ratings[item.name][c.id]"
                color="primary"
                @update:model-value="updateRating(item.name, c.id)"
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
  import { useAppStore } from '@/stores/app';
  import DM, { type ItemRatings, type RatingCategory, type RatingItem } from '@/use/data-manager';
  import { getGenderColor, getGenderIcon } from '@/use/utils';
  import { storeToRefs } from 'pinia';
  import { ref, onMounted, type Ref, watch, onUpdated } from 'vue';

  const app = useAppStore()
  const { _timeItems, _timeRatings } = storeToRefs(app)

  const search = ref("")
  const numMatches = ref(0)

  const items: Ref<Array<RatingItem>> = ref([])
  const ratings: Ref<ItemRatings> = ref({})
  const categories: Ref<Array<RatingCategory>> = ref([])

  const headers: Ref<Array<{ title: string, key: string }>> = ref([])
  const headerDescs : Ref<Record<string, string>> = ref({})
  const headerEx : Ref<Record<string, string>> = ref({})

  function countMatches(visible: Array<any>) {
    if (search.value) {
      numMatches.value = visible.reduce((acc, d) => acc + (d.raw.name.toLowerCase() === search.value ? 1 : 0), 0)
    } else {
      numMatches.value = items.value.length
    }
  }

  function updateRating(name: string, category: number) {
    if (ratings.value[name] && ratings.value[name][category] !== undefined) {
      DM.setRating(name, category, ratings.value[name][category])
    }
  }

  function loadData() {
    const obj: ItemRatings = {}
    // set categories
    categories.value = DM.categories

    // add existing ratings (or 0) for all items
    DM.items.forEach(d => {
      const silly = obj[d.name] || {}
      DM.categories.forEach(c => {
        silly[c.id] = DM.getRating(d.name, c.id)
      })
      obj[d.name] = silly
    })

    const hd: Record<string, string> = { "name": "the name" }
    const he: Record<string, string> = {}

    let h = [{ title: "Name", key: "name" }]
    h = h.concat(DM.categories.map(c => {
      hd[""+c.id] = c.description
      if (c.example) {
        he[""+c.id] = c.example
      }
      return {
        title: c.name,
        key: ""+c.id,
        // @ts-ignore
        value: (d: any) => ratings.value[d.name][c.id]
      }
    }))

    headerDescs.value = hd
    headerEx.value = he
    headers.value = h
    ratings.value = obj
    items.value = DM.items
    numMatches.value = items.value.length
  }

  function onItemUpdate() {
    const obj: ItemRatings = {}
    DM.items.forEach(d => {
      const silly = obj[d.name] || {}
      DM.categories.forEach(c => {
        silly[c.id] = DM.getRating(d.name, c.id)
      })
      obj[d.name] = silly
    })
    ratings.value = obj
    items.value = DM.items
  }

  function onRatingUpdate() {
    for (const name in ratings.value) {
      DM.categories.forEach(c => {
        // this is silly
        if (ratings.value[name]) {
          ratings.value[name][c.id] = DM.getRating(name, c.id)
        }
      })
    }
  }

  onMounted(loadData)

  onUpdated(onItemUpdate)

  watch(_timeItems, onItemUpdate)
  watch(_timeRatings, onRatingUpdate)
</script>