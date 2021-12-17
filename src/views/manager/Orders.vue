<template>
  <a-table
    :loading="loading"
    :data-source="data && data.data"
    :row-key="(item) => item.id"
    :columns="columns"
    :pagination="pagination"
    @change="onTableChange"
  >
    <template #source="{ record }">
      <span v-show="record.source === 'TB'">淘宝</span>
      <span v-show="record.source === 'PDD'">拼多多</span>
    </template>
    <template #payment="{ record }"> {{ record.payment }} ¥ </template>
    <template #status="{ record }">
      <a-tag v-show="record.status === 0">未知</a-tag>
      <a-tag v-show="record.status === -1" color="red">已退款</a-tag>
      <a-tag v-show="record.status === 1" color="orange">已付款</a-tag>
      <a-tag v-show="record.status === 2" color="green">已发货</a-tag>
    </template>
    <template #buyTime="{ record }"> {{ fTime(record.buyTime, true) }} </template>
    <template #expandedRowRender="{ record }">
      <div v-for="item in record.product" :key="item.Oid" class="product-item">
        <div class="flex items-center">
          <img :src="item.PicPath" alt="商品图片" class="img" />
          <span class="title">{{ item.Title }}</span>
        </div>
        <div class="flex items-center gap-2">
          <a-tag color="#6d5826">Oid：{{ item.Oid }}</a-tag>
          <a-tag color="#108ee9">SKU：{{ item.OuterSkuId }}</a-tag>
          <a-tag color="#585eaa">数量：{{ item.Num }}</a-tag>
          <a-tag color="#007947">价格：{{ item.Payment }} ¥</a-tag>
        </div>
      </div>
    </template>
  </a-table>
</template>

<script setup lang="ts">
  import { usePagination } from "vue-request";
  import { computed } from "@vue/reactivity";
  import { orders_list } from "../../apis/lambda/orders";
  import { formatTime } from "../../utils/tools";

  const fTime = formatTime;
  const columns = [
    { title: "#", dataIndex: "id" },
    { title: "订单来源", slots: { customRender: "source" }, align: "center" },
    { title: "用户ID", dataIndex: "uid", align: "center" },
    { title: "淘宝账号", dataIndex: "tb" },
    { title: "订单编号", dataIndex: "tid" },
    { title: "订单金额", slots: { customRender: "payment" } },
    { title: "购买时间", slots: { customRender: "buyTime" } },
    { title: "状态", slots: { customRender: "status" }, align: "center" },
  ];

  // 请求
  const { total, data, current, pageSize, loading, run } = usePagination(orders_list, {
    defaultParams: [{ page: 1, size: 15 }],
    pagination: { currentKey: "page", pageSizeKey: "size" },
  });

  // 分页
  const pagination = computed(() => ({
    total: total.value,
    current: current.value,
    pageSize: pageSize.value,
  }));

  // 翻页
  const onTableChange = (pag: { current: number; pageSize: number }) => {
    run({ page: pag.current, size: pag.pageSize });
  };
</script>

<style lang="scss">
  .product-item {
    @apply flex justify-between pr-8 pb-2 border-b;
    .img {
      @apply rounded-md shadow-md;
      width: 80px;
    }
    .title {
      @apply ml-4;
      font-size: 15px;
    }
  }
</style>
