<script setup lang="ts">
import type { Team } from '@/types/api'
const props = defineProps<{
  teams: Team[]
  selectedIds: number[]        // prevent duplicates
}>()
const emit = defineEmits<{
  (e: 'pick', team: Team): void
}>()

const q = ref('')
const filtered = computed(() => {
  const query = q.value.trim().toLowerCase()
  let list = props.teams.filter(t => !props.selectedIds.includes(t.id))
  if (query) list = list.filter(t => t.school.toLowerCase().includes(query))
  // Sort by AP rank if present, else alphabetically
  return [...list].sort((a,b) => {
    const ar = a.ap_rank ?? 999, br = b.ap_rank ?? 999
    return ar === br ? a.school.localeCompare(b.school) : ar - br
  })
})
</script>

<template>
  <div class="border rounded-xl p-3 bg-white">
    <div class="flex items-center gap-2 mb-3">
      <input v-model="q" type="text" placeholder="Search teams…" class="w-full border rounded px-3 py-2" />
    </div>
    <div class="max-h-[400px] overflow-auto divide-y">
      <div v-for="t in filtered" :key="t.id" class="flex items-center justify-between py-2">
        <TeamBadge :team="t" />
        <button @click="emit('pick', t)" class="text-sm px-2 py-1 rounded bg-black text-white">
          Add
        </button>
      </div>
    </div>
  </div>
</template>
