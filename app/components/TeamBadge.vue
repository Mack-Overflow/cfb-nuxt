<script setup lang="ts">
import type { Team } from '@/types/api'
defineProps<{ team: Team }>()
</script>

<template>
  <div class="flex items-center gap-2">
    <img v-if="team.logo" :src="team.logo" class="h-6 w-6 object-contain" alt="">
    <div class="flex items-center gap-2">
      <span class="font-medium">{{ team.school }}</span>
      <span v-if="team.record" class="text-xs text-gray-500">({{ team.record }})</span>
      <span v-if="team.ap_rank" class="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 border text-gray-700">AP #{{ team.ap_rank }}</span>
    </div>
  </div>
</template>