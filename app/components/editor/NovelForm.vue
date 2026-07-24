<script setup lang="ts">
/* eslint-disable @stylistic/max-statements-per-line */
import { useForm } from 'vee-validate'
import type { CreatorNovel } from '~/types/creator'
import { creatorNovelSchema, schemaErrors } from '~/schemas/creator'

const props = defineProps<{ novel?: CreatorNovel }>()
const emit = defineEmits<{ saved: [id: string] }>()
const auth = useAuthStore()
const creator = useCreator()
const errors = ref<Record<string, string>>({})
const submitError = ref('')
const coverDataUrl = ref(props.novel?.coverDataUrl ?? '')
const cropSource = ref('')
const cropOpen = ref(false)
const cropZoom = ref(1)
const cropX = ref(50)
const cropY = ref(50)
const tagsText = ref(props.novel?.tags.join('、') ?? '')
const { defineField, handleSubmit, setValues } = useForm({ initialValues: {
  title: props.novel?.title ?? '', synopsis: props.novel?.synopsis ?? '',
  primaryCategoryId: props.novel?.primaryCategoryId ?? '', secondaryCategoryId: props.novel?.secondaryCategoryId ?? '',
  status: props.novel?.status ?? 'draft'
} })
const [title] = defineField('title'); const [synopsis] = defineField('synopsis'); const [primaryCategoryId] = defineField('primaryCategoryId'); const [secondaryCategoryId] = defineField('secondaryCategoryId'); const [status] = defineField('status')

watch(() => props.novel, (novel) => { if (novel) setValues(novel) }, { immediate: true })

async function uploadCover(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  submitError.value = ''
  try {
    await validateCoverImage(file)
  } catch (cause) {
    submitError.value = cause instanceof Error ? cause.message : '封面校验失败。'
    return
  }
  const reader = new FileReader()
  reader.onload = () => { cropSource.value = String(reader.result); cropZoom.value = 1; cropX.value = 50; cropY.value = 50; cropOpen.value = true }
  reader.onerror = () => { submitError.value = '封面读取失败，请重新选择。' }
  reader.readAsDataURL(file)
}

async function applyCrop() {
  const image = new Image()
  image.src = cropSource.value
  await image.decode()
  const canvas = document.createElement('canvas')
  canvas.width = 900
  canvas.height = 1200
  const context = canvas.getContext('2d')
  if (!context) return
  const baseScale = Math.max(canvas.width / image.width, canvas.height / image.height)
  const scale = baseScale * cropZoom.value
  const width = image.width * scale
  const height = image.height * scale
  const overflowX = Math.max(0, width - canvas.width)
  const overflowY = Math.max(0, height - canvas.height)
  context.drawImage(image, -overflowX * cropX.value / 100, -overflowY * cropY.value / 100, width, height)
  coverDataUrl.value = canvas.toDataURL('image/webp', 0.88)
  cropOpen.value = false
}

const submit = handleSubmit((values) => {
  submitError.value = ''; errors.value = {}
  const parsed = creatorNovelSchema.safeParse(values)
  if (!parsed.success) { errors.value = schemaErrors(parsed.error); return }
  if (!auth.user) return
  try {
    const novel = creator.saveNovel(auth.user.id, { id: props.novel?.id, ...parsed.data, coverDataUrl: coverDataUrl.value || undefined, tags: tagsText.value.split(/[、,，]/).map(item => item.trim()).filter(Boolean).slice(0, 8) })
    emit('saved', novel.id)
  } catch { submitError.value = '保存失败，表单内容仍保留，可以再次尝试。' }
})
</script>

<template>
  <form
    class="creator-form"
    @submit.prevent="submit"
  >
    <div class="creator-form__cover">
      <div
        v-if="coverDataUrl"
        class="creator-cover-preview"
      >
        <img
          :src="coverDataUrl"
          :alt="`${title || '作品'}封面`"
        >
      </div><label>上传封面<input
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        @change="uploadCover"
      ></label><small>JPG、PNG 或 WebP，300×400 至 2400×3200，最大 2MB</small>
    </div>
    <div class="creator-form__fields">
      <label>书名<UInput
        v-model="title"
        placeholder="给故事一个名字"
      /></label><p v-if="errors.title">
        {{ errors.title }}
      </p>
      <label>简介<UTextarea
        v-model="synopsis"
        :rows="6"
        placeholder="用一段话告诉读者这是什么故事"
      /></label><p v-if="errors.synopsis">
        {{ errors.synopsis }}
      </p>
      <CategorySelector
        v-model:primary="primaryCategoryId"
        v-model:secondary="secondaryCategoryId"
      /><p v-if="errors.primaryCategoryId || errors.secondaryCategoryId">
        {{ errors.primaryCategoryId || errors.secondaryCategoryId }}
      </p>
      <label>标签<UInput
        v-model="tagsText"
        placeholder="治愈、校园、慢热（最多 8 个）"
      /></label>
      <label>作品状态<select v-model="status"><option value="draft">草稿</option><option value="serializing">连载中</option><option value="completed">已完结</option></select></label>
      <p
        v-if="submitError"
        class="creator-form__error"
      >
        {{ submitError }}
      </p>
      <div class="creator-form__actions">
        <UButton
          to="/creator"
          label="取消"
          color="neutral"
          variant="ghost"
        /><UButton
          type="submit"
          label="保存作品"
          icon="i-lucide-save"
        />
      </div>
    </div>
    <UModal
      v-model:open="cropOpen"
      title="裁切作品封面"
      description="调整缩放和画面中心，封面将保存为 3:4。"
    >
      <template #body>
        <div class="cover-cropper">
          <div class="cover-cropper__viewport">
            <img
              :src="cropSource"
              alt="待裁切封面"
              :style="{ transform: `scale(${cropZoom})`, transformOrigin: `${cropX}% ${cropY}%`, objectPosition: `${cropX}% ${cropY}%` }"
            >
          </div>
          <label>缩放<input
            v-model.number="cropZoom"
            type="range"
            min="1"
            max="2.5"
            step="0.05"
          ></label>
          <label>水平位置<input
            v-model.number="cropX"
            type="range"
            min="0"
            max="100"
          ></label>
          <label>垂直位置<input
            v-model.number="cropY"
            type="range"
            min="0"
            max="100"
          ></label>
          <UButton
            block
            label="应用裁切"
            @click="applyCrop"
          />
        </div>
      </template>
    </UModal>
  </form>
</template>

<style scoped>
.creator-form { display:grid;grid-template-columns:12rem minmax(0,1fr);gap:2rem}.creator-form__cover{display:grid;align-content:start;gap:.6rem}.creator-cover-preview{aspect-ratio:3/4;overflow:hidden;border:1px solid var(--site-line);border-radius:1rem;background:var(--site-surface)}.creator-cover-preview img{width:100%;height:100%;object-fit:cover}.creator-form__cover label{padding:.6rem;border:1px dashed var(--site-line);border-radius:.5rem;text-align:center;font-size:.75rem;cursor:pointer}.creator-form__cover input{display:none}.creator-form__cover small{color:var(--site-muted);font-size:.65rem}.creator-form__fields{display:grid;gap:1rem}.creator-form__fields>label{display:grid;gap:.4rem;font-size:.8rem}.creator-form__fields>p{margin-top:-.7rem;color:#b84b4b;font-size:.7rem}.creator-form__fields select{height:2.5rem;padding:0 .7rem;border:1px solid var(--site-line);border-radius:.5rem;background:var(--site-surface)}.creator-form__actions{display:flex;justify-content:flex-end;gap:.5rem}.creator-form__error{padding:.7rem;background:#fff3f3;border-radius:.5rem}@media(max-width:700px){.creator-form{grid-template-columns:1fr}.creator-form__cover{max-width:10rem}}
.cover-cropper{display:grid;gap:.8rem}.cover-cropper__viewport{width:min(18rem,100%);aspect-ratio:3/4;margin:auto;overflow:hidden;border:1px solid var(--site-line);border-radius:.75rem;background:var(--site-paper)}.cover-cropper__viewport img{width:100%;height:100%;object-fit:cover}.cover-cropper label{display:grid;grid-template-columns:6rem 1fr;align-items:center;gap:.7rem;font-size:.75rem}
</style>
