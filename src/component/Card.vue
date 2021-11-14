<template>
  <div class="bg-gray-100 rounded-lg">
    <div class="border-b px-4 py-3 pb-2">
      {{ props.title }}
    </div>
    <div class="p-4">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
  const props = defineProps<{ title: string }>();
</script>
