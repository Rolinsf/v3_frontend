<script setup lang="ts">
const { fontSize, lineHeight, pageWidth, theme, font } = useReader()
const themes = [{ id: 'paper', label: '纸白' }, { id: 'warm', label: '暖杏' }, { id: 'green', label: '护眼' }, { id: 'night', label: '夜间' }] as const
</script>

<template>
  <div class="reader-settings">
    <div class="reader-setting-row">
      <span>字号</span><div>
        <UButton
          icon="i-lucide-minus"
          color="neutral"
          variant="outline"
          aria-label="减小字号"
          :disabled="fontSize <= 16"
          @click="fontSize--"
        /><strong>{{ fontSize }}</strong><UButton
          icon="i-lucide-plus"
          color="neutral"
          variant="outline"
          aria-label="增大字号"
          :disabled="fontSize >= 22"
          @click="fontSize++"
        />
      </div>
    </div>
    <div class="reader-setting-row">
      <span>字体</span><div>
        <UButton
          label="新晰黑"
          :variant="font === 'sans' ? 'soft' : 'outline'"
          color="neutral"
          @click="font = 'sans'"
        /><UButton
          label="文楷"
          :variant="font === 'serif' ? 'soft' : 'outline'"
          color="neutral"
          @click="font = 'serif'"
        />
      </div>
    </div>
    <div class="reader-setting-row">
      <span>行距</span><div>
        <UButton
          label="紧凑"
          :variant="lineHeight === 1.65 ? 'soft' : 'outline'"
          color="neutral"
          @click="lineHeight = 1.65"
        /><UButton
          label="舒适"
          :variant="lineHeight === 1.9 ? 'soft' : 'outline'"
          color="neutral"
          @click="lineHeight = 1.9"
        /><UButton
          label="宽松"
          :variant="lineHeight === 2.15 ? 'soft' : 'outline'"
          color="neutral"
          @click="lineHeight = 2.15"
        />
      </div>
    </div>
    <div class="reader-setting-row">
      <span>宽度</span><div>
        <UButton
          label="窄"
          :variant="pageWidth === 640 ? 'soft' : 'outline'"
          color="neutral"
          @click="pageWidth = 640"
        /><UButton
          label="标准"
          :variant="pageWidth === 760 ? 'soft' : 'outline'"
          color="neutral"
          @click="pageWidth = 760"
        /><UButton
          label="宽"
          :variant="pageWidth === 880 ? 'soft' : 'outline'"
          color="neutral"
          @click="pageWidth = 880"
        />
      </div>
    </div>
    <div class="reader-setting-row">
      <span>主题</span><div class="reader-theme-options">
        <button
          v-for="item in themes"
          :key="item.id"
          type="button"
          :class="[`reader-theme-${item.id}`, { 'is-active': theme === item.id }]"
          @click="theme = item.id"
        >
          <i />{{ item.label }}
        </button>
      </div>
    </div>
  </div>
</template>
