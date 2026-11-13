import { computed, ref } from 'vue'

const STORAGE_KEY = 'redcross_theme'
const VALID_THEMES = new Set(['light', 'dark'])

const getSystemTheme = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const getSavedTheme = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return VALID_THEMES.has(saved) ? saved : null
  } catch {
    return null
  }
}

const initialTheme = getSavedTheme() || getSystemTheme()
const theme = ref(initialTheme)
const isDark = computed(() => theme.value === 'dark')
const themeLabel = computed(() => (isDark.value ? '深色模式' : '浅色模式'))

const applyTheme = (value) => {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = value
  document.documentElement.style.colorScheme = value
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', value === 'dark' ? '#0b0b0d' : '#feeee1')
  }
}

const setTheme = (value) => {
  if (!VALID_THEMES.has(value)) return false
  theme.value = value
  applyTheme(value)
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // Theme still applies for the current session when storage is unavailable.
  }
  return true
}

const toggleTheme = () => setTheme(isDark.value ? 'light' : 'dark')

applyTheme(theme.value)

export const useThemeStore = () => ({
  theme,
  isDark,
  themeLabel,
  setTheme,
  toggleTheme
})
