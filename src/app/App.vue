<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-full flex flex-col">
    <header class="border-b border-slate-800 bg-slate-900">
      <div class="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
        <RouterLink
          to="/"
          class="text-xl font-bold text-slate-100 hover:text-indigo-400 transition-colors"
        >
          PathFinder
        </RouterLink>
        <nav class="flex gap-4 text-sm text-slate-400">
          <RouterLink to="/" class="hover:text-indigo-400">Startseite</RouterLink>
          <RouterLink to="/test" class="hover:text-indigo-400">Zum Test</RouterLink>
        </nav>
      </div>
    </header>

    <main class="flex-1">
      <RouterView />
    </main>

    <footer class="border-t border-slate-800 bg-slate-900 text-xs text-slate-400">
      <div class="mx-auto max-w-4xl px-4 py-6 space-y-2">
        <p>
          Diese Seite verwendet Material aus den O*NET® Career Exploration Tools
          und der O*NET-Datenbank des U.S. Department of Labor, Employment and
          Training Administration (USDOL/ETA). Verwendung unter der O*NET Tools
          Developer License und CC BY 4.0. O*NET® ist eine Marke der USDOL/ETA.
        </p>
        <p>PathFinder ist Open Source. Keine Logins, keine Tracker.</p>
      </div>
    </footer>
  </div>
</template>
