<script setup lang="ts">
import draggable from 'vuedraggable'
const { get, post } = useApi()

const season = new Date().getFullYear()
const teams = ref<{id:number;school:string;logo?:string}[]>([])
const picks = ref<any[]>([]) // will become top-25 ordered
const loading = ref(true)

const showLogin = ref(false)
const email = ref('')
const codeSent = ref(false)
const code = ref('')
const pendingSubmission = ref<any|null>(null)

onMounted(async () => {
  const res = await get<any>('/api/teams', {}, 'omit') // omit credentials for public GET
  // Normalize: supports raw array, {data: [...]}, or {teams: [...]}
  const list: Team[] = Array.isArray(res)
    ? res
    : Array.isArray(res?.data)
      ? res.data
      : Array.isArray(res?.teams)
        ? res.teams
        : []

  teams.value = list

  // Guard against non-array just in case
  if (!Array.isArray(teams.value)) {
    console.error('Unexpected /api/teams response shape:', res)
    teams.value = []
  }

  // Build default Top 25 (by AP rank if present, else alphabetic)
  const ordered = [...teams.value].sort((a, b) => {
    const ar = a.ap_rank ?? 999, br = b.ap_rank ?? 999
    return ar === br ? a.school.localeCompare(b.school) : ar - br
  })
  // a simple default: start with AP-like ordering or alphabetic; here just alphabetic
  picks.value = teams.value.slice(0,25).map((t,i)=> ({ rank:i+1, team:t }))
  loading.value = false
})

async function submitBallot(){
  const payload = {
    season, week: await currentWeek(), // you can compute or pick manually
    ranks: picks.value.map((p,i)=>({ rank: i+1, team_id: p.team.id })),
  }
  try {
    await post('/api/ballots', payload)
    alert('Ballot saved!')
  } catch (e:any) {
    if (e?.status === 401) {
      pendingSubmission.value = payload
      showLogin.value = true
    } else {
      alert('Error: ' + (e?.data?.message || 'unknown'))
    }
  }
}

async function requestCode(){
  await post('/auth/request-code', { email: email.value })
  codeSent.value = true
}

async function verifyCode(){
    await post('/auth/verify-code', { email: email.value, code: code.value })
    showLogin.value = false
    if (pendingSubmission.value) {
        await post('/api/ballots', pendingSubmission.value)
        alert('Ballot saved!')
        pendingSubmission.value = null
    }
}

async function currentWeek(){ // naive; you can improve based on /api/results
    return 1 + Math.floor((Date.now() - new Date(`${season}-08-20`).getTime())/(7*24*3600*1000))
}
</script>

<template>
  <div class="max-w-3xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-4">CFB Top 25 Ballot</h1>

    <div v-if="loading">Loading teams…</div>

    <div v-else>
      <p class="mb-2">Drag to reorder (1 at top). Click a team to swap in another from the full list.</p>

      <draggable v-model="picks" item-key="team.id" class="space-y-2">
        <template #item="{element, index}">
          <div class="flex items-center gap-3 p-2 border rounded bg-white">
            <span class="w-6 text-right font-semibold">{{ index+1 }}</span>
            <img v-if="element.team.logo" :src="element.team.logo" class="h-6 w-6 object-contain" alt="">
            <span>{{ element.team.school }}</span>
            <span>{{  element.team.record }}</span>
          </div>
        </template>
      </draggable>

      <div class="mt-6">
        <button @click="submitBallot" class="px-4 py-2 rounded bg-black text-white">Submit Ballot</button>
      </div>
    </div>

    <!-- Email login modal -->
    <div v-if="showLogin" class="fixed inset-0 bg-black/50 grid place-items-center">
      <div class="bg-white rounded p-4 w-full max-w-sm">
        <h2 class="font-semibold mb-2">Sign in to submit</h2>
        <div v-if="!codeSent">
          <input v-model="email" type="email" placeholder="you@email.com" class="border p-2 w-full mb-2">
          <button @click="requestCode" class="px-3 py-2 bg-black text-white rounded w-full">Send Code</button>
        </div>
        <div v-else>
          <input v-model="code" inputmode="numeric" maxlength="6" placeholder="6-digit code" class="border p-2 w-full mb-2">
          <button @click="verifyCode" class="px-3 py-2 bg-black text-white rounded w-full">Verify & Submit</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* quick styles; you can swap for Tailwind fully */
</style>
