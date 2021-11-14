<template>
  <Card title="订单退款">
    <a-input-search v-model:value="state.tid" placeholder="请输入订单编号" @search="onFindOrderInfo">
      <template #enterButton>
        <a-button type="primary">查询订单</a-button>
      </template>
    </a-input-search>
    <div v-if="state.order" class="flex flex-col gap-2 pt-3">
      <span>淘宝账号：{{ state.order.tb }}</span>
      <span>订单编号：{{ state.order.tid }}</span>
      <span>订单价格：{{ state.order.payment }}</span>
      <span>购买时间：{{ state.order.buyTime }}</span>
      <span>
        订单状态：<a-tag v-if="state.order.status === 1" color="orange">已付款</a-tag
        ><a-tag v-if="state.order.status === 2" color="green">已发货</a-tag
        ><a-tag v-if="state.order.status === -1" color="red">已退款</a-tag>
      </span>
      <span>
        商品详情：<a-popover placement="right">
          <template #content>
            <div v-for="item in state.order.product" :key="item.Oid" class="border-b pb-1 mb-1">
              <span class="block">Oid：{{ item.Oid }}</span>
              <span class="block">SKU：{{ item.OuterIid }}</span>
              <span class="block">名称：{{ item.Title }}</span>
              <div>
                <span class="mr-5">价格：{{ item.Payment }} ¥</span>
                <span>数量：{{ item.Num }}</span>
              </div>
            </div>
          </template>
          <a-button size="small">查看详情</a-button>
        </a-popover>
      </span>
      <div class="flex gap-3">
        <a-button type="primary" class="flex-1" danger :disabled="state.order.status !== 2" @click="handleRefundPayback">
          订单退款
        </a-button>
        <a-button @click="onClearFind">清除查询</a-button>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
  import { reactive, ref } from "@vue/reactivity";
  import { message } from "ant-design-vue";
  import { omit } from "lodash";
  import { z } from "zod";
  import { OrderSchema } from "../../../apis/dto/OrderDTO";
  import { find_order, refund_order } from "../../../apis/lambda/orders";
  import Card from "../../../component/Card.vue";

  const state = reactive({
    tid: "",
    order: ref<z.infer<typeof OrderSchema>>(null),
  });

  // 查询订单
  const onFindOrderInfo = async () => {
    if (!state.tid) return message.warning("订单编号未填写");
    const order = await find_order({ tid: state.tid });
    order.product = JSON.parse(order.product);
    state.order = order;
  };

  // 清除查询
  const onClearFind = () => {
    state.order = null;
    state.tid = "";
  };

  // 确认退款
  const handleRefundPayback = async () => {
    const res = await refund_order({ tid: state.order.tid });
    message.success(res.msg || "退款完成");
    Object.assign(state.order, omit(res, ["msg"]));
  };
</script>
