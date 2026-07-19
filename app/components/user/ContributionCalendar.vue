<script setup lang="ts">
import type { ContributionDay } from '~/types/user'
import { buildContributionGrid, contributionLevel, contributionYears } from '~/utils/contributions'

const props = withDefaults(defineProps<{
  contributions: ContributionDay[]
  title?: string
}>(), { title: '创作贡献' })

const currentYear = new Date().getFullYear()
const years = computed(() => contributionYears(props.contributions, currentYear))
const selectedYear = ref(years.value[0] ?? currentYear)
const cells = computed(() => buildContributionGrid(selectedYear.value, props.contributions))
const total = computed(() => props.contributions
  .filter(item => item.date.startsWith(`${selectedYear.value}-`))
  .reduce((sum, item) => sum + item.count, 0))
const weekCount = computed(() => cells.value.length / 7)
const monthLabels = computed(() => {
  const labels: Array<{ label: string, column: number }> = []
  let previousMonth = -1
  for (let column = 0; column < weekCount.value; column++) {
    const cell = cells.value[column * 7]
    if (!cell) continue
    const month = Number(cell.date.slice(5, 7)) - 1
    if (cell.inYear && month !== previousMonth) {
      labels.push({ label: `${month + 1}月`, column: column + 1 })
      previousMonth = month
    }
  }
  return labels
})
const dateFormatter = new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', timeZone: 'UTC' })

function cellLabel(cell: { date: string, count: number }) {
  const date = dateFormatter.format(new Date(`${cell.date}T00:00:00Z`))
  return cell.count ? `${date}，${cell.count} 次创作贡献` : `${date}，没有创作贡献`
}
</script>

<template>
  <section class="contribution-card" :aria-label="`${selectedYear} 年${title}`">
    <header class="contribution-header">
      <div>
        <p>{{ selectedYear }} 年 {{ total }} 次</p>
        <h2>{{ title }}</h2>
      </div>
      <div v-if="years.length > 1" class="year-switcher" aria-label="选择年份">
        <button
          v-for="year in years"
          :key="year"
          type="button"
          :class="{ active: selectedYear === year }"
          :aria-pressed="selectedYear === year"
          @click="selectedYear = year"
        >
          {{ year }}
        </button>
      </div>
    </header>

    <div class="contribution-scroll" tabindex="0" aria-label="贡献日历，可横向滚动">
      <div class="calendar" :style="{ '--weeks': weekCount }">
        <div class="month-labels" aria-hidden="true">
          <span v-for="month in monthLabels" :key="`${month.column}-${month.label}`" :style="{ gridColumn: month.column }">{{ month.label }}</span>
        </div>
        <div class="weekday-labels" aria-hidden="true"><span>一</span><span>三</span><span>五</span></div>
        <div class="cells">
          <span
            v-for="cell in cells"
            :key="cell.date"
            class="cell"
            :class="[`level-${contributionLevel(cell.count)}`, { outside: !cell.inYear }]"
            :aria-label="cell.inYear ? cellLabel(cell) : undefined"
            :role="cell.inYear ? 'img' : undefined"
            :title="cell.inYear ? cellLabel(cell) : undefined"
          />
        </div>
      </div>
    </div>

    <footer>
      <span>每个方格代表一天，颜色越深表示当天创作越活跃。</span>
      <div class="legend" aria-label="贡献数量图例"><span>少</span><i v-for="level in 5" :key="level" :class="`level-${level - 1}`"/><span>多</span></div>
    </footer>
  </section>
</template>

<style scoped>
.contribution-card{margin-top:1.25rem;padding:1.1rem 1.2rem;border:1px solid var(--site-line);border-radius:.75rem;background:var(--site-surface)}
.contribution-header{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;margin-bottom:1rem}.contribution-header p{color:var(--site-muted);font-size:.7rem}.contribution-header h2{margin-top:.15rem;font-family:var(--font-reading);font-size:1rem;font-weight:600}.year-switcher{display:flex;gap:.25rem}.year-switcher button{padding:.32rem .6rem;border-radius:.4rem;color:var(--site-muted);font-size:.7rem}.year-switcher button:hover,.year-switcher button.active{background:var(--color-brand-100);color:var(--color-brand-800)}
.contribution-scroll{overflow-x:auto;padding-bottom:.35rem;outline:none}.contribution-scroll:focus-visible{border-radius:.35rem;box-shadow:0 0 0 2px var(--color-brand-300)}.calendar{--cell:11px;--gap:3px;display:grid;grid-template-columns:1.5rem calc(var(--weeks) * (var(--cell) + var(--gap)));grid-template-rows:1rem auto;gap:.35rem .45rem;min-width:max-content}.month-labels{display:grid;grid-column:2;grid-template-columns:repeat(var(--weeks),calc(var(--cell) + var(--gap)));font-size:.62rem;color:var(--site-muted)}.month-labels span{white-space:nowrap}.weekday-labels{display:grid;grid-row:2;grid-template-rows:repeat(7,var(--cell));gap:var(--gap);font-size:.58rem;color:var(--site-muted)}.weekday-labels span:nth-child(1){grid-row:2}.weekday-labels span:nth-child(2){grid-row:4}.weekday-labels span:nth-child(3){grid-row:6}.cells{display:grid;grid-row:2;grid-column:2;grid-template-rows:repeat(7,var(--cell));grid-auto-flow:column;grid-auto-columns:var(--cell);gap:var(--gap)}.cell,.legend i{border:1px solid color-mix(in srgb,var(--site-line) 85%,transparent);border-radius:2px;background:var(--color-brand-50)}.cell.outside{visibility:hidden}.level-1{background:#dfeedd}.level-2{background:#afd3aa}.level-3{background:#76aa70}.level-4{background:#4a7547}
.contribution-card footer{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-top:.65rem;color:var(--site-muted);font-size:.62rem}.legend{display:flex;align-items:center;gap:.25rem;white-space:nowrap}.legend i{display:block;width:10px;height:10px}
@media(max-width:640px){.contribution-card{padding:1rem}.contribution-card footer>span{display:none}.calendar{--cell:10px;--gap:3px}}
</style>
