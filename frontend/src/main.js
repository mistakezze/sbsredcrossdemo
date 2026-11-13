import { createApp } from 'vue'
import App from './App.vue'
import AppIcon from './components/AppIcon.vue'
import router from './router'
import { useThemeStore } from './stores/themeStore'
import './styles/global.css'

useThemeStore()

const app = createApp(App)
app.component('AppIcon', AppIcon)
app.use(router)
app.mount('#app')
