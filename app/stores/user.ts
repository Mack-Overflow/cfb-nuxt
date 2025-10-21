import { defineStore } from 'pinia'

type User = { id: number; email: string; name?: string } | null

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as User
  }),
  getters: {
    isAuthed: (s) => !!s.user
  },
  actions: {
    setUser(u: User) { this.user = u },
    clear() { this.user = null }
  },
  persist: true // if using pinia-plugin-persistedstate
})