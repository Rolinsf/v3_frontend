<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })
await navigateTo('/account?section=works', { replace: true })
</script>
