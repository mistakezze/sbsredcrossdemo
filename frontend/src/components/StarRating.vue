<template>
  <div class="star-rating" :class="[size, { readonly }]">
    <button
      v-for="i in 5"
      :key="i"
      type="button"
      class="star"
      :class="{ filled: i <= displayValue }"
      :disabled="readonly"
      :aria-label="i + ' 星'"
      @click="pick(i)"
      @mouseenter="onEnter(i)"
      @mouseleave="onLeave"
    >
      <AppIcon :name="i <= displayValue ? 'starFill' : 'star'" />
    </button>
    <span v-if="showValue && modelValue > 0" class="star-value">{{ Number(modelValue).toFixed(1) }}</span>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  readonly: { type: Boolean, default: false },
  size: { type: String, default: 'normal' }, // small | normal | large
  showValue: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const hoverValue = ref(0)

// 只读时展示四舍五入后的整数星，可编辑时展示悬停或当前选择
const displayValue = computed(() => {
  if (props.readonly) return Math.round(props.modelValue || 0)
  return hoverValue.value || props.modelValue || 0
})

const pick = (i) => {
  if (props.readonly) return
  emit('update:modelValue', i)
}

const onEnter = (i) => {
  if (props.readonly) return
  hoverValue.value = i
}

const onLeave = () => {
  if (props.readonly) return
  hoverValue.value = 0
}
</script>

<style scoped>
.star-rating {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  line-height: 1;
}

.star {
  background: none;
  border: none;
  padding: 0 1px;
  color: #dcdfe6;
  cursor: pointer;
  transition: color 0.15s ease, transform 0.15s ease;
  font-family: inherit;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.star.filled {
  color: #ffb400;
}

.star:not(:disabled):hover {
  transform: scale(1.15);
}

.star:disabled {
  cursor: default;
}

.star-rating.small .star { font-size: 13px; }
.star-rating.normal .star { font-size: 20px; }
.star-rating.large .star { font-size: 28px; }

.star-value {
  margin-left: 6px;
  font-size: 13px;
  font-weight: 700;
  color: #ff9800;
}

.star-rating.small .star-value { font-size: 11px; }
.star-rating.large .star-value { font-size: 16px; }
</style>
