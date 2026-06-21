import { ref, onMounted, onBeforeUnmount } from 'vue'

const MOBILE_BREAKPOINT = 768

const isMobile = ref(false)
const width = ref(window.innerWidth)
const height = ref(window.innerHeight)

function update () {
  width.value = window.innerWidth
  height.value = window.innerHeight
  isMobile.value = window.innerWidth < MOBILE_BREAKPOINT
}

let initialized = false

export function useViewport () {
  onMounted(() => {
    if (!initialized) {
      update()
      window.addEventListener('resize', update)
      window.addEventListener('orientationchange', update)
      initialized = true
    } else {
      update()
    }
  })

  return {
    isMobile,
    width,
    height,
    breakpoint: MOBILE_BREAKPOINT
  }
}
