// Utilities
import type { AttributeRating } from '@/use/data-manager'
import { defineStore } from 'pinia'
import { computed, ref, type Ref } from 'vue'

export const useTooltip = defineStore('tooltip', () => {

  // state
  const x = ref(0)
  const y = ref(0)
  const data: Ref<any> = ref(null)
  const rating: Ref<AttributeRating | null> = ref(null)

  // getters
  const hasData = computed(() => data.value !== null)
  const hasRating = computed(() => rating.value !== null)
  const hasAny = computed(() => hasData.value || hasRating.value)

  // actions
  function show(content: any, mx: number, my: number) {
    x.value = mx
    y.value = my
    data.value = content
  }

  function showRating(ratinObj: AttributeRating, mx: number, my: number, text?: string) {
    x.value = mx
    y.value = my
    rating.value = ratinObj
    data.value = text || null
  }

  function hide() {
    data.value = null
    rating.value = null
    x.value = 0
    y.value = 0
  }

  function update(mx: number, my: number) {
    x.value = mx
    y.value = my
  }

  return {
    x,
    y,
    data,
    rating,

    hasAny,
    hasData,
    hasRating,

    show,
    showRating,
    hide,
    update
  }
})
