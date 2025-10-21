export type Team = {
    id: number
    school: string
    logo?: string | null
    record?: string | null        // e.g. "6-1"
    ap_rank?: number | null       // e.g. 7
}
  
export type BallotPick = { rank: number; teamId: number }
  