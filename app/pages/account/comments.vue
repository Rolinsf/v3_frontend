<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })
await navigateTo('/account?section=comments', { replace: true })
</script>
