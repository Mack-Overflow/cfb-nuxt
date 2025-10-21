<script setup lang="ts">
import type { Team, BallotPick } from '@/types/api'
const props = defineProps<{
  picks: BallotPick[]
  teamsById: Record<number, Team>
}>()
const emit = defineEmits<{
  (e: 'remove', index: number): void
  (e: 'moveUp', index: number): void
  (e: 'moveDown', index: number): void
}>()
</script>

<template>
  <div class="grid md:grid-cols-2 gap-3">
    <div v-for="(p, i) in props.picks" :key="i" class="flex items-center justify-between border rounded-xl p-3 bg-white">
      <div class="flex items-center gap-3">
        <div class="w-6 text-right font-bold">{{ i + 1 }}</div>
        <TeamBadge :team="teamsById[p.teamId]" />
      </div>
      <div class="flex items-center gap-1">
        <button @click="emit('moveUp', i)"   class="text-xs px-2 py-1 border rounded">↑</button>
        <button @click="emit('moveDown', i)" class="text-xs px-2 py-1 border rounded">↓</button>
        <button @click="emit('remove', i)"   class="text-xs px-2 py-1 border rounded text-red-600">Remove</button>
      </div>
    </div>
  </div>
</template>
