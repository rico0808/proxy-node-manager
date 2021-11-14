<template>
  <Card title="订单退款">
    <a-input-search placeholder="请输入订单编号">
      <template #enterButton>
        <a-button type="primary" danger>确认退款</a-button>
      </template>
    </a-input-search>
  </Card>
</template>

<script setup lang="ts">
  import Card from "../../../component/Card.vue";
</script>
