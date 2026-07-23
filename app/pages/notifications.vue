<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })
await navigateTo('/account?section=notifications', { replace: true })
</script>
