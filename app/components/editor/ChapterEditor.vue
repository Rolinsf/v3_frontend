<script setup lang="ts">
/* eslint-disable @stylistic/max-statements-per-line */
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import type { JSONContent } from '@tiptap/vue-3'

const props = defineProps<{ modelValue: JSONContent }>(); const emit = defineEmits<{ update: [content: JSONContent, text: string] }>(); const uploadError = ref('')
const editor = useEditor({ content: props.modelValue, extensions: [StarterKit, Placeholder.configure({ placeholder: '从这里开始写这一章…' }), Image.configure({ inline: false })], editorProps: { attributes: { class: 'tiptap-writing-area' } }, onUpdate: ({ editor }) => emit('update', editor.getJSON(), editor.getText()) })
watch(() => props.modelValue, (value) => { if (editor.value && !editor.value.isFocused)editor.value.commands.setContent(value) })
function addImage(event: Event) { const file = (event.target as HTMLInputElement).files?.[0]; if (!file || !editor.value) return; if (!file.type.startsWith('image/') || file.size > 3 * 1024 * 1024) { uploadError.value = '插图需为 3MB 以内的图片。'; return } const reader = new FileReader(); reader.onload = () => { editor.value?.chain().focus().setImage({ src: String(reader.result), alt: file.name }).run(); uploadError.value = '' }; reader.onerror = () => uploadError.value = '插图读取失败，请重新选择。'; reader.readAsDataURL(file) }
onBeforeUnmount(() => editor.value?.destroy())
</script>

<template>
  <div class="chapter-editor">
    <div
      v-if="editor"
      class="editor-toolbar"
      role="toolbar"
      aria-label="章节编辑工具栏"
    >
      <button
        type="button"
        :class="{ active: editor.isActive('bold') }"
        @click="editor.chain().focus().toggleBold().run()"
      >
        <strong>B</strong>
      </button><button
        type="button"
        :class="{ active: editor.isActive('italic') }"
        @click="editor.chain().focus().toggleItalic().run()"
      >
        <em>I</em>
      </button><button
        type="button"
        :class="{ active: editor.isActive('strike') }"
        @click="editor.chain().focus().toggleStrike().run()"
      >
        <s>S</s>
      </button><button
        type="button"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        标题
      </button><button
        type="button"
        @click="editor.chain().focus().setHorizontalRule().run()"
      >
        分隔线
      </button><button
        type="button"
        :disabled="!editor.can().undo()"
        @click="editor.chain().focus().undo().run()"
      >
        <UIcon name="i-lucide-undo-2" />
      </button><button
        type="button"
        :disabled="!editor.can().redo()"
        @click="editor.chain().focus().redo().run()"
      >
        <UIcon name="i-lucide-redo-2" />
      </button><label>插图<input
        type="file"
        accept="image/*"
        @change="addImage"
      ></label>
    </div><p
      v-if="uploadError"
      class="editor-upload-error"
    >
      {{ uploadError }}
    </p><EditorContent :editor="editor" />
  </div>
</template>

<style scoped>
.chapter-editor{border:1px solid var(--site-line);border-radius:.65rem;background:var(--site-surface)}.editor-toolbar{position:sticky;top:0;z-index:2;display:flex;flex-wrap:wrap;gap:.2rem;padding:.45rem;border-bottom:1px solid var(--site-line);background:var(--site-surface)}.editor-toolbar button,.editor-toolbar label{display:grid;place-items:center;min-width:2rem;height:2rem;padding:0 .5rem;border-radius:.35rem;color:var(--site-muted);font-size:.72rem;cursor:pointer}.editor-toolbar button:hover,.editor-toolbar button.active{background:var(--color-brand-100);color:var(--color-brand-800)}.editor-toolbar input{display:none}.editor-upload-error{padding:.5rem;color:#b84b4b;font-size:.7rem}:deep(.tiptap-writing-area){min-height:32rem;padding:2rem;outline:none;font-family:var(--font-reading);font-size:1rem;line-height:1.9}:deep(.tiptap-writing-area p){margin:.7em 0}:deep(.tiptap-writing-area h2){margin:1.2em 0 .5em;font-size:1.4rem;font-weight:600}:deep(.tiptap-writing-area img){max-width:100%;margin:1rem auto;border-radius:.5rem}:deep(.tiptap-writing-area p.is-editor-empty:first-child::before){content:attr(data-placeholder);float:left;height:0;color:var(--site-muted);pointer-events:none}@media(max-width:600px){:deep(.tiptap-writing-area){min-height:24rem;padding:1rem}}
</style>
