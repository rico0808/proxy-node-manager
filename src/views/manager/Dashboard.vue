<template>
  <div class="flex">
    <div class="flex-1 mr-3">
      <div class="flex gap-4 p-4 bg-gray-100 rounded-lg">
        <div class="flex-1 bg-white p-4 rounded-lg shadow-md">
          <a-statistic title="有效订单" :value="state.about.order" />
        </div>
        <div class="flex-1 bg-white p-4 rounded-lg shadow-md">
          <a-statistic title="订单总额" :value="state.about.orderPayment + ' ¥'" />
        </div>
        <div class="flex-1 bg-white p-4 rounded-lg shadow-md">
          <a-statistic title="退款订单" :value="state.about.refund" />
        </div>
        <div class="flex-1 bg-white p-4 rounded-lg shadow-md">
          <a-statistic title="退款金额" :value="state.about.refundPayment + ' ¥'" />
        </div>
        <div class="flex-1 bg-white p-4 rounded-lg shadow-md">
          <a-statistic title="新用户" :value="state.about.user" />
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
  import { onMounted, ref, reactive } from "@vue/runtime-core";
  import { income_about } from "../../apis/lambda/dashboard";
  import { IF_IncomeAbout } from "../../apis/interface";

  const state = reactive({
    about: ref<IF_IncomeAbout>({
      order: 0,
      orderPayment: 0,
      refund: 0,
      refundPayment: 0,
      user: 0,
    }),
  });

  onMounted(async () => {
    state.about = await income_about();
  });
</script>

<style lang="scss">
  .right-layout {
    @apply flex flex-col gap-3;
    min-width: 408px;
  }
</style>
