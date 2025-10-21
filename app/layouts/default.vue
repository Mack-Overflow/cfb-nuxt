<template>
    <div style="min-height:100vh; color:#111; background:#fff;">
      <nav style="padding:12px; border-bottom:1px solid #eee;">
        <NuxtLink to="/">Home</NuxtLink>
        <span style="margin:0 8px;">·</span>
        <NuxtLink to="/vote">Vote</NuxtLink>
        <span style="margin:0 8px;">·</span>
        <NuxtLink to="/vote">My Ballots</NuxtLink>
      </nav>
      <main style="padding:16px;">
        <slot />
      </main>
    </div>
</template>
  