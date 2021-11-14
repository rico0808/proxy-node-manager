<template>
  <Card title="订单退款">
    <a-input-search v-model:value="state.tid" placeholder="请输入订单编号" @onSearch="onRefundPayback">
      <template #enterButton>
        <a-button type="primary" danger>确认退款</a-button>
      </template>
    </a-input-search>
  </Card>
</template>

<script setup lang="ts">
  import { reactive } from "@vue/reactivity";
  import Card from "../../../component/Card.vue";

  const state = reactive({
    tid: "",
  });

  // 退款
  const onRefundPayback = () => {};
</script>
