export default defineNuxtRouteMiddleware((to) => {
    const user = useUserStore()
    if (!user.isAuthed) {
      return navigateTo('/?login=1') // or show modal via query flag
    }
  })
  