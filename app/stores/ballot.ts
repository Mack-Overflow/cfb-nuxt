import { defineStore } from 'pinia'

export type Pick = { rank: number; teamId: number }

export const useBallotStore = defineStore('ballot', {
  state: () => ({
    season: new Date().getFullYear(),
    week: 1,
    picks: [] as Pick[] // 25
  }),
  actions: {
    setWeek(w: number) { this.week = w },
    setPicks(p: Pick[]) { this.picks = p },
    swap(i: number, j: number) {
      const tmp = this.picks[i]
      this.picks[i] = this.picks[j]
      this.picks[j] = tmp
      this.picks.forEach((p, idx) => (p.rank = idx + 1))
    }
  },
  persist: true
})
