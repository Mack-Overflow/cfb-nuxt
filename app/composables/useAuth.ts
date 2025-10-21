export function useAuth() {
    const { post } = useApi()
    const user = useUserStore()
  
    async function requestCode(email: string) {
      await post('/auth/request-code', { email })
    }
  
    async function verifyCode(email: string, code: string) {
      const res: any = await post('/auth/verify-code', { email, code })
      user.setUser(res.user)
    }
  
    async function logout() {
      await post('/auth/logout', {})
      user.clear()
    }
  
    return { requestCode, verifyCode, logout }
  }
  