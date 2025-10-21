<script setup lang="ts">
const { csrf } = useApi()
import TeamPickerModal from '~/components/TeamPickerModal.vue'
type Team = { id:number; school:string; logo?:string|null; record?:string|null; ap_rank?:number|null }
type SlotTeam = Team | null
type RankRow = { rank:number; team_id:number }


const { get, post } = useApi()
const showAuth = ref(false)

const teams = ref<Team[]>([])
const slots = ref<SlotTeam[]>(Array.from({ length: 25 }, () => null))
const selectedSlot = ref<number | null>(null)
const modalOpen = ref(false)

const chosenIds = computed(() => slots.value.filter(Boolean).map(s => (s as Team).id))
const apTop25 = computed(() =>
  [...teams.value].filter(t => typeof t.ap_rank === 'number')
                  .sort((a,b) => (a.ap_rank! - b.ap_rank!))
                  .slice(0,25)
)

function applyBallot(ranks: RankRow[]) {
  const byId = new Map<number, Team>(teams.value.map(t => [t.id, t]))
  slots.value = Array.from({ length: 25 }, () => null)
  for (const row of ranks) {
    const i = row.rank - 1
    if (i >= 0 && i < 25) {
      const t = byId.get(row.team_id) || null
      slots.value[i] = t
    }
  }
}

onMounted(async () => {
    const res = await get<any>('/api/teams', {}, 'omit')
    teams.value = Array.isArray(res) ? res :
                Array.isArray(res?.data) ? res.data :
                Array.isArray(res?.teams) ? res.teams : []
    try {
        const ballot = await get<{ season:number; week:number; ranks:RankRow[] }>('/api/ballot', {}, 'include')
        if (Array.isArray(ballot?.ranks) && ballot.ranks.length) {
            applyBallot(ballot.ranks)
        }
    } catch (e:any) {
        console.error('load ballot failed', e)
    }
})

function openPicker(slotIdx: number) {
  selectedSlot.value = slotIdx
  modalOpen.value = true
}
function closePicker() {
    modalOpen.value = false
}

function pickTeam(t: Team) {
  // dedupe: remove team from any other slot
  const existing = slots.value.findIndex(s => s?.id === t.id)
  if (existing !== -1) slots.value[existing] = null
  // set into selected slot (or first empty if none selected)
  const idx = selectedSlot.value ?? slots.value.findIndex(s => s === null) ?? 24
  slots.value[idx] = t
  selectedSlot.value = null
  modalOpen.value = false
}
function clearSlot(i: number) { slots.value[i] = null; if (selectedSlot.value === i) selectedSlot.value = null }

const submitting = ref(false)
const message = ref('')

// helper: is full ballot?
const isFull = computed(() => slots.value.filter(Boolean).length === 25)

// indices of empty spots, in order (0..24)
const emptyIndices = computed(() =>
  slots.value.map((s, i) => (s ? null : i)).filter((i) => i !== null) as number[]
)

// candidates: AP 1..25, not already selected, sorted by rank asc
function getRank(t: any): number | null {
  const raw =
    t.ap_rank ??
    t.latest_ranking ??   // your API addition
    t.rank ??
    t.apRank ??
    null

  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

const apFillCandidates = computed(() =>
  (teams.value || [])
    .map(t => ({ t, r: getRank(t) }))
    .filter(x => x.r !== null && x.r! >= 1 && x.r! <= 25 && !chosenIds.value.includes(x.t.id))
    .sort((a, b) => (a.r! - b.r!))
    .map(x => x.t)
)

console.log(apFillCandidates.value)

// fill empty slots with best remaining AP teams
function autocompleteTop25() {
  if (!emptyIndices.value.length || !apFillCandidates.value.length) return
  const empties = [...emptyIndices.value]
  const picks = [...apFillCandidates.value]

  let k = 0
  while (k < empties.length && k < picks.length) {
    const idx = empties[k]
    const team = picks[k]
    slots.value[idx] = team
    k++
  }
}

async function submitBallot() {
    if (!isFull.value) return
    
    submitting.value = true
    message.value = ''
    console.log('submitting')
    try {
        const payload = slots.value.map((t, i) => ({
            rank: i + 1,
            team_id: t?.id ?? null,
        }))

        // POST to Laravel backend
        const res = await post('/api/ballot', { ballot: payload })
        console.log('Submit response:', res)
        message.value = 'Your ballot was submitted successfully!'
    } catch (e: any) {
        console.error(e)
        if (e?.status === 401) {
            showAuth.value = true;
        } else {
        message.value = 'Something went wrong while submitting.'
        }
    } finally {
        submitting.value = false
    }
}

function slotCard(isActive:boolean) {
  return [
    'rounded-xl border p-3 bg-white/90 backdrop-blur shadow-sm cursor-pointer',
    isActive ? 'ring-2 ring-black' : 'hover:border-gray-400'
  ].join(' ')
}
</script>

<template>
  <div class="max-w-6xl mx-auto p-4 sm:p-6">
    <h1 class="text-2xl font-bold mb-4">Your CFB Top 25</h1>

    <!-- lg: 5x5 -->
    <section class="hidden lg:grid grid-cols-5 gap-3 mb-6">
      <div v-for="i in 25" :key="`lg-${i}`"
           :class="slotCard(selectedSlot === (i-1))"
           @click="openPicker(i-1)">
        <div class="flex items-center justify-between">
          <span class="font-bold text-gray-700 w-6 text-right">{{ i }}</span>
          <button v-if="slots[i-1]" class="text-xs text-red-600 underline" @click.stop="clearSlot(i-1)">Clear</button>
        </div>
        <div class="mt-2 min-h-[56px] flex items-center gap-3">
          <template v-if="slots[i-1]">
            <img v-if="slots[i-1]?.logo" :src="slots[i-1]?.logo!" class="h-7 w-7 object-contain" alt="">
            <div class="leading-tight">
              <div class="font-medium">{{ slots[i-1]?.school }}</div>
              <div class="text-xs text-gray-500" v-if="slots[i-1]?.record">({{ slots[i-1]?.record }})</div>
            </div>
          </template>
          <template v-else>
            <div class="text-sm text-gray-400">Tap to pick</div>
          </template>
        </div>
      </div>
    </section>

    <!-- sm/md: 1 + 3x8 -->
    <section class="lg:hidden space-y-3 mb-6">
      <div :class="slotCard(selectedSlot === 0)" @click="openPicker(0)">
        <div class="flex items-center justify-between">
          <span class="font-bold text-gray-700 w-6 text-right">1</span>
          <button v-if="slots[0]" class="text-xs text-red-600 underline" @click.stop="clearSlot(0)">Clear</button>
        </div>
        <div class="mt-2 min-h-[56px] flex items-center gap-3">
          <template v-if="slots[0]">
            <img v-if="slots[0]?.logo" :src="slots[0]?.logo!" class="h-8 w-8 object-contain" alt="">
            <div><div class="font-medium">{{ slots[0]?.school }}</div><div class="text-xs text-gray-500" v-if="slots[0]?.record">({{ slots[0]?.record }})</div></div>
          </template>
          <template v-else>
            <div class="text-sm text-gray-400">Tap to pick</div>
          </template>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div v-for="i in 24" :key="`sm-${i}`"
             :class="slotCard(selectedSlot === i)"
             @click="openPicker(i)">
          <div class="flex items-center justify-between">
            <span class="font-bold text-gray-700 w-6 text-right">{{ i + 1 }}</span>
            <button v-if="slots[i]" class="text-xs text-red-600 underline" @click.stop="clearSlot(i)">Clear</button>
          </div>
          <div class="mt-2 min-h-[52px] flex items-center gap-3">
            <template v-if="slots[i]">
              <img v-if="slots[i]?.logo" :src="slots[i]?.logo!" class="h-6 w-6 object-contain" alt="">
              <div><div class="text-sm font-medium">{{ slots[i]?.school }}</div><div class="text-xs text-gray-500" v-if="slots[i]?.record">({{ slots[i]?.record }})</div></div>
            </template>
            <template v-else>
              <div class="text-xs text-gray-400">Tap to pick</div>
            </template>
          </div>
        </div>
      </div>
    </section>

    <div class="mt-6 flex items-center justify-between">
        <div class="text-sm text-gray-600">
            Selected: {{ slots.filter(Boolean).length }}/25
        </div>

        <div class="mt-4 flex flex-wrap items-center gap-3">
            <button
                class="px-3 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="!emptyIndices.length || !apFillCandidates.length"
                @click="autocompleteTop25"
                title="Fill empty slots with the next highest AP-ranked teams"
            >
                Autocomplete Top 25
            </button>

            <!-- (optional) tiny helper -->
            <span class="text-sm text-gray-600">
                {{ emptyIndices.length }} empty · {{ apFillCandidates.length }} candidates available
            </span>
        </div>
        <button
            class="px-5 py-2.5 rounded-lg font-medium bg-black text-white
                disabled:opacity-50 disabled:cursor-not-allowed
                hover:bg-gray-800 transition"
            :disabled="!isFull || submitting"
            @click="submitBallot"
        >
            {{ submitting ? 'Submitting…' : 'Submit Ballot' }}
        </button>
    </div>
    <p v-if="message" class="mt-3 text-sm" :class="message.includes('successfully') ? 'text-green-600' : 'text-red-600'">
    {{ message }}
    </p>

    <!-- Modals -->
    <TeamPickerModal
      :open="modalOpen"
      :allTeams="teams"
      :chosenIds="chosenIds"
      @close="closePicker"
      @pick="pickTeam"
    />

    <AuthModal v-model:open="showAuth" @authed="submitBallot" />
  </div>
</template>
