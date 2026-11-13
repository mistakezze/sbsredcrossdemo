<template>
  <svg
    class="app-icon"
    :class="`app-icon-${name}`"
    :width="resolvedSize"
    :height="resolvedSize"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
    v-html="markup"
  />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, default: 'circle' },
  size: { type: [String, Number], default: '1em' },
  strokeWidth: { type: [String, Number], default: 1.8 }
})

const icons = {
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-5h5v5"/>',
  map: '<path d="M20 10c0 5.4-8 11-8 11S4 15.4 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.7"/>',
  route: '<circle cx="5" cy="18" r="2"/><circle cx="19" cy="6" r="2"/><path d="M7 18h3.5a3 3 0 0 0 3-3v-6a3 3 0 0 1 3-3H17"/>',
  calendar: '<rect x="3.5" y="5.5" width="17" height="15" rx="3"/><path d="M7.5 3.5v4M16.5 3.5v4M3.5 10h17M8 14h3M13 14h3M8 17.5h3"/>',
  clipboard: '<rect x="5" y="4.5" width="14" height="16.5" rx="3"/><path d="M9 4.5V3h6v1.5M9 18h6"/>',
  building: '<path d="M4 20V8.5L12 4l8 4.5V20M9 20v-5.5h6V20M8 10h2M14 10h2"/>',
  shield: '<path d="M12 3 5 6v5c0 4.8 2.8 8.2 7 10 4.2-1.8 7-5.2 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/>',
  user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',
  userHeart: '<circle cx="10" cy="8" r="3"/><path d="M4 20a7 7 0 0 1 12.4-4.5"/><path d="M18.5 13.5c1.2-1.2 3-1.2 4.2 0 1.1 1.1 1.1 2.9 0 4l-4.2 4-4.2-4c-1.1-1.1-1.1-2.9 0-4 1.2-1.2 3-1.2 4.2 0Z"/>',
  medal: '<circle cx="12" cy="9" r="5"/><path d="m8 13-2 7 6-3 6 3-2-7M12 6v3l2 1"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2.2 5.8L8 16l2.2-5.8L16 8Z"/>',
  pin: '<path d="M20 10c0 5.4-8 11-8 11S4 15.4 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
  historic: '<path d="m3 9 9-5 9 5H3ZM5 9v9M9.5 9v9M14.5 9v9M19 9v9M3 18h18M2 21h20"/>',
  city: '<path d="M4 21V8h7v13M11 21V3h9v18M2 21h20M7 11h1M7 15h1M15 7h2M15 11h2M15 15h2M15 19h2"/>',
  sparkles: '<path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14ZM19 13l.8 2.2L22 16l-2.2.8L19 19l-.8-2.2L16 16l2.2-.8L19 13Z"/>',
  robot: '<rect x="4" y="7" width="16" height="12" rx="4"/><path d="M12 3v4M8 12h.01M16 12h.01M9 16h6M2 12v3M22 12v3"/>',
  message: '<path d="M21 15a4 4 0 0 1-4 4H9l-6 3v-6a5 5 0 0 1-1-3V7a4 4 0 0 1 4-4h11a4 4 0 0 1 4 4v8Z"/><path d="M8 9h8M8 13h5"/>',
  send: '<path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M22 2 11 13"/>',
  brain: '<path d="M9.5 4.5A3 3 0 0 0 4 6.8a3.5 3.5 0 0 0-.5 6.4A3 3 0 0 0 6 18.8a3 3 0 0 0 5.5 1.2V4.5ZM14.5 4.5A3 3 0 0 1 20 6.8a3.5 3.5 0 0 1 .5 6.4 3 3 0 0 1-2.5 5.6 3 3 0 0 1-5.5 1.2V4.5Z"/><path d="M9 9H6.5M15 9h2.5M9 14H7M15 14h2"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  ticket: '<path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-3a2 2 0 0 0 0-4V8Z"/><path d="M13 6v2M13 11v2M13 16v2"/>',
  food: '<path d="M5 3v8M8 3v8M5 7h3M6.5 11v10M15 3v18M15 3c3 2 4 5 4 8h-4"/>',
  camera: '<path d="M4 7h3l2-3h6l2 3h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"/><circle cx="12" cy="13" r="4"/>',
  lightbulb: '<path d="M9 18h6M10 22h4"/><path d="M8.5 14.5A6 6 0 1 1 15.5 14.5c-.8.6-1 1.5-1 2.5h-5c0-1-.2-1.9-1-2.5Z"/>',
  note: '<path d="M5 3h10l4 4v14H5V3Z"/><path d="M15 3v5h5M8 12h8M8 16h6"/>',
  bookmark: '<path d="M6 3h12v18l-6-4-6 4V3Z"/>',
  navigation: '<path d="m3 11 18-8-8 18-2-8-8-2Z"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M16 5.5a3 3 0 0 1 0 5.8M17 14a5 5 0 0 1 4 6"/>',
  calculator: '<rect x="5" y="2.5" width="14" height="19" rx="3"/><path d="M8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>',
  flag: '<path d="M5 22V3M5 4h11l-2 4 2 4H5"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4M12 13v5M8 21h8M9 18h6v3H9v-3Z"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  alert: '<path d="m12 3 10 18H2L12 3Z"/><path d="M12 9v5M12 18h.01"/>',
  inbox: '<path d="M4 4h16v16H4V4Z"/><path d="M4 14h5l2 3h2l2-3h5"/>',
  package: '<path d="m12 3 9 5-9 5-9-5 9-5ZM3 8v9l9 5 9-5V8M12 13v9"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowLeft: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  arrowDown: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  upDown: '<path d="m8 7 4-4 4 4M8 17l4 4 4-4M12 3v18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6"/>',
  eye: '<path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/>',
  firstAid: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M9 5V3h6v2M12 9v8M8 13h8"/>',
  handshake: '<path d="m8 12 3-3a2 2 0 0 1 3 0l5 5-3 3-2-2M3 10l5-5 5 3M3 10l4 4M6 14l3 3 2-2M14 9l4 4"/>',
  book: '<path d="M4 4.5A3.5 3.5 0 0 1 7.5 1H20v18H7.5A3.5 3.5 0 0 0 4 22.5v-18ZM4 19a3 3 0 0 1 3-3h13"/>',
  blood: '<path d="M12 2S5 10 5 15a7 7 0 0 0 14 0c0-5-7-13-7-13Z"/><path d="M9 16a3 3 0 0 0 3 3"/>',
  gift: '<rect x="3" y="9" width="18" height="12" rx="2"/><path d="M12 9v12M3 13h18M7.5 9C5 9 4 7.5 4.5 6S7 4 8.5 5.5 12 9 12 9M16.5 9C19 9 20 7.5 19.5 6S17 4 15.5 5.5 12 9 12 9"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  heart: '<path d="M20.8 5.2a5.2 5.2 0 0 0-7.4 0L12 6.6l-1.4-1.4a5.2 5.2 0 1 0-7.4 7.4L12 21l8.8-8.4a5.2 5.2 0 0 0 0-7.4Z"/>',
  baby: '<circle cx="12" cy="8" r="3"/><path d="M6 21v-3a6 6 0 0 1 12 0v3M9 8h.01M15 8h.01M10 11c1.2 1 2.8 1 4 0"/>',
  school: '<path d="m3 9 9-6 9 6M5 10v11h14V10M9 21v-6h6v6M8 13h.01M16 13h.01"/>',
  elderly: '<circle cx="12" cy="6" r="3"/><path d="M8 21v-5l-2-3M16 21v-8l2-3M8 13l2-3h4l2 3M12 12v9M9 18h6"/>',
  homeHeart: '<path d="M3 11.5 12 4l9 7.5M5.5 10.5V20h13v-9.5"/><path d="M8.5 17c2-2 3.5-.8 3.5.2 0-1 1.5-2.2 3.5-.2l-3.5 3-3.5-3Z"/>',
  ambulance: '<path d="M3 17V6h11v11M14 10h4l3 4v3h-7M6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M8 9v5M5.5 11.5h5"/>',
  star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>',
  starFill: '<path fill="currentColor" stroke="none" d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"/>',
  moon: '<path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z"/>',
  chevronRight: '<path d="m9 5 7 7-7 7"/>',
  chevronDown: '<path d="m5 9 7 7 7-7"/>',
  circle: '<circle cx="12" cy="12" r="8"/>'
}

const resolvedSize = computed(() =>
  typeof props.size === 'number' ? `${props.size}px` : props.size
)

const markup = computed(() => icons[props.name] || icons.circle)
</script>

<style scoped>
.app-icon {
  display: inline-block;
  flex-shrink: 0;
  vertical-align: -0.14em;
  overflow: visible;
}
</style>
