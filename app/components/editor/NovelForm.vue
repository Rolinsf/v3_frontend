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
const tagsText = ref(props.novel?.tags.join('、') ?? '')
const { defineField, handleSubmit, setValues } = useForm({ initialValues: {
  title: props.novel?.title ?? '', synopsis: props.novel?.synopsis ?? '',
  primaryCategoryId: props.novel?.primaryCategoryId ?? '', secondaryCategoryId: props.novel?.secondaryCategoryId ?? '',
  status: props.novel?.status ?? 'draft'
} })
const [title] = defineField('title'); const [synopsis] = defineField('synopsis'); const [primaryCategoryId] = defineField('primaryCategoryId'); const [secondaryCategoryId] = defineField('secondaryCategoryId'); const [status] = defineField('status')

watch(() => props.novel, (novel) => { if (novel) setValues(novel) }, { immediate: true })

function uploadCover(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) { submitError.value = '封面需为 2MB 以内的图片。'; return }
  const reader = new FileReader()
  reader.onload = () => { coverDataUrl.value = String(reader.result) }
  reader.onerror = () => { submitError.value = '封面读取失败，请重新选择。' }
  reader.readAsDataURL(file)
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
        accept="image/*"
        @change="uploadCover"
      ></label><small>JPG、PNG 或 WebP，最大 2MB</small>
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
      <CategoryCategorySelector
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
  </form>
</template>

<style scoped>
.creator-form { display:grid;grid-template-columns:12rem minmax(0,1fr);gap:2rem}.creator-form__cover{display:grid;align-content:start;gap:.6rem}.creator-cover-preview{aspect-ratio:3/4;overflow:hidden;border:1px solid var(--site-line);border-radius:1rem;background:var(--site-surface)}.creator-cover-preview img{width:100%;height:100%;object-fit:cover}.creator-form__cover label{padding:.6rem;border:1px dashed var(--site-line);border-radius:.5rem;text-align:center;font-size:.75rem;cursor:pointer}.creator-form__cover input{display:none}.creator-form__cover small{color:var(--site-muted);font-size:.65rem}.creator-form__fields{display:grid;gap:1rem}.creator-form__fields>label{display:grid;gap:.4rem;font-size:.8rem}.creator-form__fields>p{margin-top:-.7rem;color:#b84b4b;font-size:.7rem}.creator-form__fields select{height:2.5rem;padding:0 .7rem;border:1px solid var(--site-line);border-radius:.5rem;background:var(--site-surface)}.creator-form__actions{display:flex;justify-content:flex-end;gap:.5rem}.creator-form__error{padding:.7rem;background:#fff3f3;border-radius:.5rem}@media(max-width:700px){.creator-form{grid-template-columns:1fr}.creator-form__cover{max-width:10rem}}
</style>
