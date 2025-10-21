<script setup lang="ts">
const { csrf } = useApi()
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ 
    (e:'update:open',v:boolean):void,
    (e:'authed'):void,
}>()
const apiBase = useRuntimeConfig().public.apiBase

const name = ref('')
const email = ref('')
const code = ref('')
const step = ref<'choose'|'email_code'|'verifying'>('choose')
const msg = ref('')

function close() { emit('update:open', false) }

async function requestEmailCode() {
  msg.value = ''
  if (!name.value || !email.value) { msg.value = 'Enter name and email'; return }
  try {
    csrf();
    await $fetch('/api/auth/email/request', {
      baseURL: apiBase, method: 'POST', credentials: 'include',
      headers: { 'X-XSRF-TOKEN': decodeURIComponent(useCookie('XSRF-TOKEN').value || '') },
      body: { name: name.value, email: email.value }
    })
    step.value = 'email_code'
  } catch (e:any) { msg.value = e?.data?.message || 'Failed to send code' }
}

async function verifyEmailCode() {
  msg.value = ''
  try {
    await $fetch('/api/auth/email/verify', {
      baseURL: apiBase, method: 'POST', credentials: 'include',
      headers: { 'X-XSRF-TOKEN': decodeURIComponent(useCookie('XSRF-TOKEN').value || '') },
      body: { email: email.value, code: code.value, name: name.value }
    })
    // ensure name set (if backend didn’t store it)
    await $fetch('/api/auth/profile', {
      baseURL: apiBase, method: 'POST', credentials: 'include',
      headers: { 'X-XSRF-TOKEN': decodeURIComponent(useCookie('XSRF-TOKEN').value || '') },
      body: { name: name.value }
    })
    emit('authed'); close()
  } catch (e:any) { msg.value = e?.data?.message || 'Invalid or expired code' }
}

function loginWithGoogle() {
  if (!name.value) { msg.value = 'Please enter your name first'; return }
  const w = 560, h = 640
  const y = window.top!.outerHeight/2 + window.top!.screenY - (h/2)
  const x = window.top!.outerWidth/2 + window.top!.screenX - (w/2)

  // include the name so backend can persist if Google profile has none
  const url = `${apiBase}/auth/google/redirect?name=${encodeURIComponent(name.value)}`
  const popup = window.open(url, 'google_oauth', `width=${w},height=${h},left=${x},top=${y}`)

  const handler = (ev: MessageEvent) => {
    if (ev.data && ev.data.type === 'oauth:success') {
      window.removeEventListener('message', handler)
      emit('authed'); close()
    }
  }
  window.addEventListener('message', handler)
}
</script>

<template>
  <transition name="fade">
    <div v-if="open" class="fixed inset-0 z-50 overflow-hidden">
      <div class="absolute inset-0 bg-black/40"></div>

      <div class="absolute inset-0 grid place-items-center p-4" @click.self="close">
        <div class="w-full max-w-md bg-white rounded-xl shadow-lg border p-5 space-y-4" @click.stop>
          <h2 class="text-lg font-semibold">Create account or sign-in to submit</h2>

          <div class="space-y-3">
            <input v-model="name" type="text" placeholder="Your name"
                   class="w-full border rounded px-3 py-2" />
            <div class="text-xs text-gray-500">Your name is required.</div>
          </div>

          <div class="border-t pt-4 space-y-3">
            <div class="text-sm text-gray-600">Sign in with email</div>
            <div class="flex gap-2">
              <input v-model="email" type="email" placeholder="you@example.com"
                     class="flex-1 border rounded px-3 py-2" />
              <button class="px-3 py-2 rounded bg-black text-white"
                      @click="requestEmailCode">Send code</button>
            </div>

            <div v-if="step==='email_code'" class="flex gap-2">
              <input v-model="code" inputmode="numeric" maxlength="6"
                     placeholder="6-digit code" class="flex-1 border rounded px-3 py-2" />
              <button class="px-3 py-2 rounded border" @click="verifyEmailCode">Verify</button>
            </div>
          </div>

          <div class="border-t pt-4">
            <div class="text-sm text-gray-600 mb-2">Or</div>
            <button class="w-full px-3 py-2 rounded border hover:bg-gray-50 flex py-auto text-center items-center justify-center"
                    @click="loginWithGoogle">
                    <img src="https://developers.google.com/static/identity/images/branding_guideline_sample_lt_rd_sl.svg" alt="">
                    <p class="pl-3">Continue with Google</p>
            </button>
          </div>

          <p v-if="msg" class="text-sm text-red-600">{{ msg }}</p>

          <div class="text-right">
            <button class="text-sm underline" @click="close">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active,.fade-leave-active{transition:opacity .15s}
.fade-enter-from,.fade-leave-to{opacity:0}
</style>
