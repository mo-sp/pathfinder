<script setup lang="ts">
// The full Datenschutzerklärung, in plain language. It replaced the shorter
// closed-beta Hinweis when the site came off `noindex`, and it is written for
// indefinite operation: purposes and retention are phrased as criteria plus a
// backstop period, so nothing here expires with a phase or a release date.
//
// What it has to be is *accurate*, so every claim here maps to something in the
// code — the payload in features/feedback/lib/submitFeedback.ts, the stored
// record and its retention in server/feedback/server.mjs, and the log format in
// nginx.conf. Change those and this text has to move with them.

/** Single point of truth for the contact address, referenced twice below. */
const CONTACT = 'mo-spaeth@proton.me'

/** Everything a submission contains, mirroring FeedbackPayload field for field. */
const submitted = [
  'deine Selbsteinschätzung von 1 bis 5, wie gut das Ergebnis zu dir passt',
  'dein Freitext-Kommentar, falls du einen geschrieben hast',
  'deine Antworten als Fragennummer und Zahlenwert, zum Beispiel „ip-r-01: 4“',
  'die daraus berechneten Profilwerte der vier Schichten',
  'die für dich errechneten 20 bestpassenden Berufe',
  'eine bei jedem Absenden neu gewürfelte Zufallsnummer, die mit nichts verknüpft ist',
  'der Zeitpunkt, zu dem die Einsendung bei uns ankommt',
]

/** The counterpart list: what deliberately never goes into a submission. */
const notSubmitted = [
  'dein Name oder deine E-Mail-Adresse',
  'deine IP-Adresse',
  'Cookies, Geräte- oder Browser-Kennungen',
  'die Zeitpunkte, zu denen du die einzelnen Fragen beantwortet hast',
]
</script>

<template>
  <section class="mx-auto max-w-3xl px-4 py-16">
    <h1 class="text-4xl font-bold tracking-tight text-slate-100">Datenschutzerklärung</h1>

    <p class="mt-4 text-lg text-slate-400">
      Der Test läuft vollständig in deinem Browser. Deine Antworten bleiben auf
      deinem Gerät, es gibt keine Anmeldung, keine Tracker und keine
      Analyse-Werkzeuge. Daten verlassen dein Gerät nur, wenn du am Ende
      freiwillig auf „Anonym absenden“ klickst.
    </p>

    <h2 class="mt-12 text-2xl font-semibold text-slate-100">Wer dahintersteckt</h2>
    <p class="mt-3 text-slate-300">
      PathFinder ist ein privates Open-Source-Projekt von Moritz Späth. Es wird
      nicht kommerziell betrieben, kostet nichts und finanziert sich nicht über
      Werbung. Verantwortlich für die Datenverarbeitung im Sinne der DSGVO und
      erreichbar für alle Fragen dazu:
      <a
        :href="`mailto:${CONTACT}`"
        class="text-indigo-400 underline underline-offset-2 hover:text-indigo-300"
      >{{ CONTACT }}</a>.
    </p>

    <h2 class="mt-12 text-2xl font-semibold text-slate-100">
      Was auf deinem Gerät bleibt
    </h2>
    <p class="mt-3 text-slate-300">
      Alle Fragen werden in deinem Browser ausgewertet, die Berufsliste wird
      dort berechnet. Damit du den Test unterbrechen und später weitermachen
      kannst, speichert PathFinder deine Antworten lokal in der Datenbank deines
      Browsers (IndexedDB). Diese Daten werden nicht an uns übertragen und sind
      für uns nicht einsehbar. Du wirst sie los, indem du im Test „Schicht neu
      starten“ benutzt oder die Websitedaten in deinem Browser löschst.
    </p>

    <h2 class="mt-12 text-2xl font-semibold text-slate-100">
      Wenn du freiwillig Feedback absendest
    </h2>
    <p class="mt-3 text-slate-300">
      Am Ende der Ergebnisseite kannst du uns deine Antworten und dein Ergebnis
      schicken. Wir brauchen das, um zu prüfen, ob die berechneten Empfehlungen
      tatsächlich zu den Menschen passen, die den Test gemacht haben. Das geht
      nur mit echten Testläufen, das Ergebnis allein sagt uns dazu nichts.
      Übertragen wird dann:
    </p>
    <ul class="mt-3 space-y-1.5 text-slate-300 marker:text-indigo-400 list-disc pl-5">
      <li v-for="item in submitted" :key="item">{{ item }}</li>
    </ul>

    <p class="mt-5 text-slate-300">Ausdrücklich nicht übertragen wird:</p>
    <ul class="mt-3 space-y-1.5 text-slate-300 marker:text-indigo-400 list-disc pl-5">
      <li v-for="item in notSubmitted" :key="item">{{ item }}</li>
    </ul>

    <p class="mt-5 text-slate-300">
      Eine Einsendung lässt sich dadurch keiner Person zuordnen, auch von uns
      nicht. Eine Bitte hat das zur Folge: schreib bitte keine Namen,
      Adressen oder Kontaktdaten in das Kommentarfeld, weder deine eigenen noch
      die anderer Leute. Was dort steht, wird genau so gespeichert, wie du es
      eintippst.
    </p>
    <p class="mt-3 text-slate-300">
      Rechtsgrundlage ist deine Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO,
      die du mit dem Klick auf „Anonym absenden“ erteilst. Die Übermittlung ist
      freiwillig, der Test funktioniert vollständig ohne sie.
    </p>
    <p class="mt-3 text-slate-300">
      Zweck ist ausschließlich die Weiterentwicklung des Tests. Wir lesen jede
      Einsendung einzeln, rechnen das Ergebnis nach und löschen sie, sobald das
      erledigt ist, spätestens aber zwölf Monate nach Eingang. Eine Ausnahme
      benennen wir offen: hat ein Fall einen Rechenfehler aufgedeckt, behalten
      wir die reinen Antwortwerte ohne deinen Kommentar dauerhaft als Testfall,
      damit derselbe Fehler nicht zurückkommt. Diese Zahlenreihe steht für sich
      und lässt sich niemandem zuordnen.
    </p>

    <h2 class="mt-12 text-2xl font-semibold text-slate-100">
      Was der Server automatisch protokolliert
    </h2>
    <p class="mt-3 text-slate-300">
      Wie jeder Webserver hält auch unserer fest, dass eine Seite abgerufen
      wurde: Zeitpunkt, angeforderte Adresse, Statuscode, übertragene
      Datenmenge, verweisende Seite und die Kennung deines Browsers. Dazu kommt
      deine IP-Adresse, allerdings gekürzt: die letzte Stelle wird verworfen,
      bevor die Zeile geschrieben wird, aus 203.0.113.47 wird also 203.0.113.0.
      Die vollständige Adresse wird nirgends gespeichert.
    </p>
    <p class="mt-3 text-slate-300">
      Diese Protokolle dienen dem Betrieb, der Fehlersuche und der Frage, wie
      viele Menschen die Seite überhaupt erreichen. Für einzelne Besucher taugen
      sie nicht, weil die gekürzte Adresse auf ein ganzes Netz zeigt, und wir
      verwenden sie auch nicht so. Rechtsgrundlage ist unser berechtigtes
      Interesse an einem funktionierenden und nachvollziehbaren Betrieb nach
      Art. 6 Abs. 1 lit. f DSGVO. Gelöscht werden sie, sobald sie dafür nicht
      mehr gebraucht werden, spätestens nach 90 Tagen.
    </p>

    <h2 class="mt-12 text-2xl font-semibold text-slate-100">
      Hosting und Dritte
    </h2>
    <p class="mt-3 text-slate-300">
      Die Seite läuft auf einem Server der Hetzner Online GmbH in Nürnberg,
      also innerhalb Deutschlands. Mit Hetzner besteht ein Vertrag zur
      Auftragsverarbeitung nach Art. 28 DSGVO. Es sind keine externen Dienste
      eingebunden:
      keine Schriftarten von fremden Servern, kein CDN, keine Werbe- oder
      Analysenetzwerke, keine Cookies. Deine Daten werden nicht an Dritte
      weitergegeben und nicht in Länder außerhalb der EU übermittelt.
    </p>

    <h2 class="mt-12 text-2xl font-semibold text-slate-100">Deine Rechte</h2>
    <p class="mt-3 text-slate-300">
      Dir stehen Auskunft, Berichtigung, Löschung, Einschränkung der
      Verarbeitung und Datenübertragbarkeit zu, außerdem kannst du eine einmal
      erteilte Einwilligung jederzeit für die Zukunft widerrufen. Hier ist eine
      Einschränkung ehrlich zu benennen: weil wir bewusst nichts speichern, was
      dich identifiziert, können wir eine Einsendung nicht dir zuordnen. Wenn
      du deine gelöscht haben möchtest, schreib uns den ungefähren Zeitpunkt,
      dann löschen wir die Einsendungen aus diesem Zeitraum. Unabhängig davon
      kannst du dich bei einer Datenschutz-Aufsichtsbehörde beschweren.
    </p>

    <p class="mt-12 text-sm text-slate-500">
      Stand: 18. August 2026. PathFinder ist eine offene Beta und wird
      weiterentwickelt. Ändert sich etwas an der Datenverarbeitung, ändert sich
      diese Seite mit.
    </p>
  </section>
</template>
