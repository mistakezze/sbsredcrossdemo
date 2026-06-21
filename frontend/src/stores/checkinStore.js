import { ref, computed } from 'vue'
import { useLocationStore } from './locationStore'

const STORAGE_KEY = 'redcross_checkins'

const loadFromStorage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

const checkinsRef = ref(loadFromStorage())

const saveToStorage = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checkinsRef.value))
  } catch (e) {
    console.error('保存打卡记录失败', e)
  }
}

export const useCheckinStore = () => {
  const { locations } = useLocationStore()

  const _findLocation = (id) => {
    return locations.value.find(l => l.id === Number(id))
  }

  const addCheckin = (locationId, note) => {
    const location = _findLocation(locationId)
    if (!location) return false

    const existingIndex = checkinsRef.value.findIndex(c => c.locationId === Number(locationId))
    const now = new Date()
    const timestamp = now.getTime()
    const dateStr = now.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })

    const record = {
      id: timestamp,
      locationId: Number(locationId),
      locationName: location.name,
      location: location.location,
      note: note || '',
      checkinTime: dateStr,
      timestamp: timestamp,
      category: location.category
    }

    if (existingIndex >= 0) {
      record.id = checkinsRef.value[existingIndex].id
      checkinsRef.value.splice(existingIndex, 1, record)
    } else {
      checkinsRef.value.unshift(record)
    }

    saveToStorage()
    return true
  }

  const removeCheckin = (id) => {
    const index = checkinsRef.value.findIndex(c => c.id === Number(id))
    if (index >= 0) {
      checkinsRef.value.splice(index, 1)
      saveToStorage()
      return true
    }
    return false
  }

  const hasCheckedIn = (locationId) => {
    return checkinsRef.value.some(c => c.locationId === Number(locationId))
  }

  const getCheckinById = (id) => {
    return checkinsRef.value.find(c => c.id === Number(id) || c.locationId === Number(id))
  }

  const getCheckinNote = (locationId) => {
    const c = checkinsRef.value.find(c => c.locationId === Number(locationId))
    return c?.note || ''
  }

  const getCheckinTime = (locationId) => {
    const c = checkinsRef.value.find(c => c.locationId === Number(locationId))
    return c?.checkinTime || ''
  }

  const updateNote = (id, note) => {
    const checkin = checkinsRef.value.find(c => c.id === Number(id))
    if (checkin) {
      checkin.note = note
      saveToStorage()
      return true
    }
    return false
  }

  const checkinCount = computed(() => checkinsRef.value.length)

  return {
    checkins: checkinsRef,
    addCheckin,
    removeCheckin,
    hasCheckedIn,
    getCheckinById,
    getCheckinNote,
    getCheckinTime,
    updateNote,
    checkinCount
  }
}
