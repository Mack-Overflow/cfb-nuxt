<script setup lang="ts">
const emit = defineEmits(['close'])
const { requestCode, verifyCode } = useAuth()
const email = ref('')
const code = ref('')
const sent = ref(false)
const busy = ref(false)

async function send() { busy.value=true; await requestCode(email.value); sent.value=true; busy.value=false }
async function check() { busy.value=true; await verifyCode(email.value, code.value); busy.value=false; emit('close') }
</script>

<template>
  <Modal @close="emit('close')" title="Sign in to submit">
    <div v-if="!sent">
      <Input v-model="email" type="email" placeholder="you@email.com" />
      <Button :disabled="!email || busy" @click="send">Send Code</Button>
    </div>
    <div v-else>
      <Input v-model="code" inputmode="numeric" maxlength="6" placeholder="6-digit code" />
      <Button :disabled="!code || busy" @click="check">Verify</Button>
    </div>
  </Modal>
</template>
