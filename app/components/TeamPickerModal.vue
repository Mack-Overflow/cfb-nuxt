<!-- /components/TeamPickerModal.vue -->
<script setup lang="ts">
type Team = {
  id: number; school: string
  logo?: string|null; record?: string|null; ap_rank?: number|null
}

const props = defineProps<{
  open: boolean
  allTeams: Team[]
  chosenIds: number[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'pick', t: Team): void
}>()

const q = ref('')

const filteredAll = computed(() => {
  const query = (q.value ?? '').trim().toLowerCase()

  const base = (props.allTeams ?? []).filter(t => !(props.chosenIds ?? []).includes(t.id))

  if (!query) return base.slice(0, 60)

  return base
    .filter(t => (t.school ?? '').toLowerCase().includes(query))
})


function onPick(t: Team) { emit('pick', t); q.value = '' }
function onClose() { emit('close'); q.value = '' }

function keyHandler(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }

watch(() => props.open, (v) => {
  if (v) window.addEventListener('keydown', keyHandler)
  else window.removeEventListener('keydown', keyHandler)
})
onBeforeUnmount(() => window.removeEventListener('keydown', keyHandler))

const showingSearch = computed(() => q.value.trim().length > 0)
</script>

<template>
  <transition name="fade">
    <div v-if="open" class="fixed inset-0 z-50 overflow-y-scroll">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/40" @click="onClose" />

      <!-- Centered panel -->
      <div class="absolute inset-0 grid place-items-center sm:p-4">
        <div class="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b bg-gray-50">
            <h2 class="text-lg font-semibold">Pick a team</h2>
            <button class="text-sm underline" @click="onClose">Close</button>
          </div>

          <!-- Body -->
          <div class="p-5 space-y-4">
            <!-- Search -->
            <div class="flex items-center gap-2">
              <input
                v-model="q"
                type="text"
                placeholder="Search all FBS teams…"
                class="w-full border rounded-lg px-3 py-2"
              />
              <button v-if="q" class="text-sm underline" @click="q = ''">Clear</button>
            </div>

            <!-- Grid: search results OR AP Top 25 -->
            <div class="min-h-[320px]">
              <!-- When searching: show filtered all-teams grid -->
              <div v-if="showingSearch">
                <div v-if="filteredAll.length" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <button
                    v-for="t in filteredAll"
                    :key="t.id"
                    class="group text-left border rounded-xl p-3 bg-white hover:bg-gray-50 flex items-center gap-3"
                    @click="onPick(t)"
                  >
                    <img v-if="t.logo" :src="t.logo" class="h-8 w-8 object-contain" alt="">
                    <div class="flex-1 min-w-0">
                      <div class="font-medium truncate">{{ t.school }}</div>
                      <div v-if="t.record" class="text-xs text-gray-500">({{ t.record }})</div>
                    </div>
                    <div v-if="typeof t.ap_rank === 'number'" class="text-[11px] px-2 py-0.5 rounded bg-gray-100 border">
                      AP #{{ t.ap_rank }}
                    </div>
                  </button>
                </div>
                <div v-else class="py-16 text-center text-gray-500 text-sm">No matches</div>
              </div>

              <!-- Otherwise: AP Top 25 grid -->
              <div v-else>
                <div class="text-sm text-gray-600 mb-2">AP Top 25</div>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <button
                    v-for="t in filteredAll.filter((t: Team) => t.ap_rank && t.ap_rank >= 1 && t.ap_rank <= 25)"
                    :key="t.id"
                    class="group text-left border rounded-xl p-3 bg-white hover:bg-gray-50 flex items-center gap-3"
                    :class="{'opacity-50 cursor-not-allowed': chosenIds.includes(t.id)}"
                    :disabled="chosenIds.includes(t.id)"
                    @click="onPick(t)"
                  >
                    <img v-if="t.logo" :src="t.logo" class="h-8 w-8 object-contain" alt="">
                    <div class="flex-1 min-w-0">
                      <div class="font-medium truncate">{{ t.school }}</div>
                      <div v-if="t.record" class="text-xs text-gray-500">({{ t.record }})</div>
                    </div>
                    <div class="text-[11px] px-2 py-0.5 rounded bg-gray-100 border" v-if="t.ap_rank">
                      AP #{{ t.ap_rank }}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-5 py-3 border-t bg-gray-50 text-right">
            <button class="text-sm underline" @click="onClose">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .15s }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>
