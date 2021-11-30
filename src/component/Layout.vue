<template>
  <a-layout class="h-screen">
    <a-layout-sider class="bg-white flex flex-col">
      <div class="logo">Proxy</div>
      <a-menu v-model:selectedKeys="selectedKeys" mode="inline" class="flex-1" @click="handleSelected($event.key)">
        <a-menu-item key="/manager"> <dashboard-outlined /><span>控制台</span> </a-menu-item>
        <a-menu-item key="/manager/users"> <usergroup-delete-outlined /><span>用户列表</span> </a-menu-item>
        <a-menu-item key="/manager/nodes"> <node-collapse-outlined /><span>节点列表</span> </a-menu-item>
        <a-menu-item key="/manager/goods"> <star-outlined /><span>商品管理</span> </a-menu-item>
        <a-menu-item key="/manager/notices"> <branches-outlined /><span>公告管理</span> </a-menu-item>
        <a-menu-item key="/manager/orders"> <branches-outlined /><span>订单记录</span> </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="bg-white border-b flex items-center justify-end px-2">
        <div class="user-info">{{ user.account }}</div>
      </a-layout-header>
      <a-layout-content class="m-2 bg-white p-2 rounded-md overflow-x-auto">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
  import { ref } from "@vue/reactivity";
  import {
    DashboardOutlined,
    UsergroupDeleteOutlined,
    NodeCollapseOutlined,
    StarOutlined,
    BranchesOutlined,
  } from "@ant-design/icons-vue";
  import { useRoute, useRouter } from "vue-router";
  import { onBeforeMount } from "@vue/runtime-core";
  import { user_info } from "../apis/lambda/auth";

  const router = useRouter();
  const route = useRoute();
  const selectedKeys = ref([route.path]);
  const user = ref<any>({});

  onBeforeMount(async () => {
    user.value = await user_info();
  });

  const handleSelected = (path: string) => router.push({ path });
</script>

<style lang="scss">
  .logo {
    @apply border-b text-center text-2xl;
    min-height: 63px;
    line-height: 63px;
  }
  .user-info {
    @apply bg-gray-100 inline-block px-3 rounded-md text-center cursor-pointer transition-colors hover:bg-gray-200;
    max-height: 32px;
    line-height: 32px;
    min-width: 120px;
  }
</style>
