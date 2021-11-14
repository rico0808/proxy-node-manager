<template>
  <Card title="用户查询">
    <a-input-search v-model:value.trim="state.account" placeholder="请输入淘宝ID或连接账号" @search="onFindUser">
      <template #enterButton>
        <a-button type="primary">查询用户</a-button>
      </template>
    </a-input-search>
    <div v-if="state.user" class="mt-1 flex flex-col gap-2">
      <div class="flex gap-2 items-center mt-1">
        <a-popover v-model:visible="addGoods.visible" trigger="click">
          <template #content>
            <a-tag color="orange" class="block mb-2">请选择需要补单的商品</a-tag>
            <a-select v-model:value="addGoods.sku" :options="addGoods.options" class="w-56" placeholder="请选择需要补单的商品" />
            <div class="mt-2 flex justify-between">
              <a-button size="small" danger @click="handleAddUserGoods">确认补单</a-button>
              <a-button size="small" type="primary" @click="addGoods.visible = false">取消</a-button>
            </div>
          </template>
          <a-button type="primary" @click="onAddUserGoods">商品补单</a-button>
        </a-popover>
        <a-popconfirm
          title="确认重置用户试用吗？"
          okType="danger"
          ok-text="确认重置"
          cancel-text="取消"
          @confirm="onHandleConfirm(resetTest)"
        >
          <a-button type="primary" ghost>重置试用</a-button>
        </a-popconfirm>
        <a-popconfirm
          title="确认清空用户流量吗？"
          okType="danger"
          ok-text="确认清空"
          cancel-text="取消"
          @confirm="onHandleConfirm(resetUsed)"
        >
          <a-button danger>清空流量</a-button>
        </a-popconfirm>
        <a-popconfirm
          v-if="state.user.status === 1"
          title="确认封禁该账户吗？"
          okType="danger"
          ok-text="确认禁用"
          cancel-text="取消"
          @confirm="onHandleConfirm(blockUser)"
        >
          <a-button type="primary" danger>禁用账户</a-button>
        </a-popconfirm>
        <a-popconfirm
          v-else
          title="确认启用该账户吗？"
          ok-text="确认启用"
          cancel-text="取消"
          @confirm="onHandleConfirm(unlockUser)"
        >
          <a-button type="primary">启用账户</a-button>
        </a-popconfirm>
      </div>
      <div>淘宝账号：{{ state.user.tb }}</div>
      <div>连接账号：{{ state.user.account }}</div>
      <div>连接密码：{{ state.user.passwd }}</div>
      <div>已用流量：{{ state.user.used }} /GB</div>
      <div>预设流量：{{ state.user.traffic }} /GB</div>
      <div>到期时间：{{ fTime(state.user.expire, true) }}</div>
      <div>
        是否试用：<a-tag :color="state.user.useTest ? 'red' : 'green'">
          {{ state.user.useTest ? "已试用" : "未试用" }}
        </a-tag>
      </div>
      <div>
        账号状态：<a-tag :color="state.user.status ? 'green' : 'red'">
          {{ state.user.status ? "启用" : "禁用" }}
        </a-tag>
      </div>
      <a-button @click="onClearSearch">清除查询</a-button>
    </div>
  </Card>
</template>

<script setup lang="ts">
  import { reactive, ref } from "@vue/reactivity";
  import { message } from "ant-design-vue";
  import { omit } from "lodash";
  import { z } from "zod";
  import { UserSchema } from "../../../apis/dto/UserDTO";
  import { goods_list_nopage } from "../../../apis/lambda/goods";
  import {
    find_user,
    reset_user_test,
    reset_user_used,
    block_user,
    unlock_user,
    user_add_goods,
  } from "../../../apis/lambda/users";
  import Card from "../../../component/Card.vue";
  import { formatTime } from "../../../utils/tools";

  const fTime = formatTime;
  const resetTest = reset_user_test;
  const resetUsed = reset_user_used;
  const blockUser = block_user;
  const unlockUser = unlock_user;

  const state = reactive({
    account: "080562",
    user: ref<z.infer<typeof UserSchema>>(null),
  });

  const addGoods = reactive({
    visible: false,
    sku: "",
    options: [],
  });

  // 查找用户
  const onFindUser = async () => {
    if (!state.account) return message.warning("请输入淘宝ID或连接账号");
    state.user = await find_user({ account: state.account });
  };

  // 清除搜素结果
  const onClearSearch = () => {
    state.account = "";
    state.user = null;
  };

  // popconfirm 点击确认
  const onHandleConfirm = async (fn: Function) => {
    const res = await fn({ id: state.user.id });
    message.success(res.msg || "操作成功");
    Object.assign(state.user, omit(res, ["msg"]));
  };

  // 点击商品补单
  const onAddUserGoods = async () => {
    const res = await goods_list_nopage();
    addGoods.options = res.map((item) => ({ value: item.sku, label: `${item.name} | SKU：${item.sku}` }));
  };

  // 确认补单
  const handleAddUserGoods = async () => {
    const { msg } = await user_add_goods({ id: state.user.id, sku: addGoods.sku });
    message.success(msg || "补单成功");
    addGoods.visible = false;
    onFindUser();
  };
</script>
