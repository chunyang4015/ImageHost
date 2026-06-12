<template>
  <header class="fixed top-0 left-0 box-border px-4 flex justify-center w-screen h-12 backdrop-blur-lg bg-white/80 border-b border-slate-200/60 z-50">
    <div class="flex items-center w-full max-w-[800px] h-full">
      <div class="flex items-center gap-3">
        <img class="w-auto h-5 object-contain" src="@/assets/images/logo.webp" />
        <a class="text-base font-semibold tracking-tight" href="/">{{ props.title }}</a>
      </div>
    </div>
  </header>
</template>
<script setup lang="ts">
const props = defineProps(['title'])
</script>
