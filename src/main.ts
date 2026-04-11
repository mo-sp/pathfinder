import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from '@app/App.vue'
import { router } from '@app/router'
import { i18n } from '@shared/lib/i18n'
import '@app/styles/main.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(i18n)

// Rehydrate a previous session from IndexedDB when the user reloads the
// assessment or results route, so their answers and progress survive a
// refresh. Landing on "/" always starts with a clean slate – otherwise
// clicking "Test starten" after a previous completed run would drop the
// user into the old final question instead of a new test.
//
// The store import is dynamic so the 923-occupation JSON stays out of the
// landing-page bundle: a visitor who bounces off "/" never downloads it.
const needsHydration = /^\/(test|ergebnis)(\/|$)/.test(
  window.location.pathname,
)
const boot = needsHydration
  ? import('@features/questionnaire/model/store').then(
      ({ useQuestionnaireStore }) => useQuestionnaireStore().hydrate(),
    )
  : Promise.resolve()
void boot.then(() => app.mount('#app'))
