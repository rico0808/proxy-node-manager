<template>
  <div class="flex">
    <div class="flex-1 mr-3">
      <div class="flex gap-4 p-4 bg-gray-100 rounded-lg">
        <div class="flex-1 bg-white p-4 rounded-lg shadow-md">
          <a-statistic title="Feedback" :value="1128" />
        </div>
        <div class="flex-1 bg-white p-4 rounded-lg shadow-md">
          <a-statistic title="Feedback" :value="1128" />
        </div>
        <div class="flex-1 bg-white p-4 rounded-lg shadow-md">
          <a-statistic title="Feedback" :value="1128" />
        </div>
        <div class="flex-1 bg-white p-4 rounded-lg shadow-md">
          <a-statistic title="Feedback" :value="1128" />
        </div>
      </div>
    </div>
    <div class="right-layout">
      <Payback />
      <FindUser />
    </div>
  </div>
</template>

<script setup lang="ts">
  import Payback from "./component/Payback.vue";
  import FindUser from "./component/FindUser.vue";
</script>

<style lang="scss">
  .right-layout {
    @apply flex flex-col gap-3;
    min-width: 408px;
  }
</style>
