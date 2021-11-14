<template>
  <header class="relative">
    <VerticalRightOutlined
      v-if="state.userInfo"
      class="absolute left-6 bg-gray-50 px-4 py-2 rounded-full shadow-md"
      @click="handleBack"
    />
    <div>火山云服</div>
  </header>
  <main class="mx-8">
    <div v-if="!state.userInfo">
      <div class="text-2xl mb-12 mt-24">
        <span class="text-gray-800 block">欢迎 👏🏻</span>
        <span class="text-gray-400 text-xl">火山云服流量查询。</span>
      </div>
      <div class="flex flex-col">
        <span class="text-gray-400">连接账号 / 淘宝账号</span>
        <input v-model.trim="state.account" class="in-account" placeholder="请输入连接账号或淘宝账号" type="text" />
        <button class="btn-search" @click="handleSubmit">查询</button>
      </div>
    </div>
    <div v-else :class="{ 'mt-16': !state.notice }">
      <!-- <div v-if="state.notice" class="my-6">
        <a-alert :title="state.notice.title" :type="state.notice.level"> {{ state.notice.text }} </a-alert>
      </div> -->
      <div>
        <div class="item">
          <span>连接账号</span>
          <span>{{ state.userInfo.account }}</span>
        </div>
        <div class="item">
          <span>连接密码</span>
          <span>{{ state.userInfo.passwd }}</span>
        </div>
        <div class="item">
          <span>已用流量</span>
          <span>{{ (state.userInfo.used / 1024).toFixed(2) }} GB</span>
        </div>
        <div class="item">
          <span>总流量</span>
          <span>{{ (state.userInfo.traffic / 1024).toFixed(2) }} GB</span>
        </div>
        <div class="item">
          <span>过期时间</span>
          <span>{{ isExpire(state.userInfo.expire) }}</span>
        </div>
        <div class="item">
          <span>最新使用</span>
          <span>{{ formatTime(state.userInfo.updateAt, true) }}</span>
        </div>
      </div>
      <div class="refresh" @click="handleSubmit">刷新</div>
    </div>
  </main>
</template>

<script lang="ts">
  import { message } from "ant-design-vue";
  import dayjs from "dayjs";
  import { defineComponent, reactive, ref, onMounted } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { z } from "zod";
  import { UserSchema } from "../../apis/dto/UserDTO";
  import { pb_user_info } from "../../apis/lambda/public";
  import { formatTime } from "../../utils/tools";
  import { VerticalRightOutlined } from "@ant-design/icons-vue";

  export default defineComponent({
    components: { VerticalRightOutlined },
    setup() {
      const route = useRoute();
      const router = useRouter();
      const state = reactive({
        account: "",
        notice: ref(),
        userInfo: ref<z.infer<typeof UserSchema>>(null),
      });

      onMounted(() => {
        const { ac } = route.query;
        if (ac) {
          state.account = ac as string;
          handleSubmit();
        }
      });

      // 是否过期
      const isExpire = (val: string) => {
        return dayjs().isAfter(val) ? "已过期" : formatTime(val);
      };

      // 提交查询
      const handleSubmit = async () => {
        if (!state.account) return message.warning("查询账号未填写");
        const user = await pb_user_info({ account: state.account });
        if (user.status !== 1) {
          state.userInfo = null;
          return message.error("该账号异常或已被禁用");
        }
        state.userInfo = user;
      };

      // 回退
      const handleBack = () => {
        state.userInfo = null;
        state.account = "";
        router.push("/");
      };

      return { state, isExpire, handleSubmit, formatTime, handleBack };
    },
  });
</script>

<style lang="scss" scoped>
  header {
    @apply flex items-center justify-center;
    border-end-start-radius: 30px;
    border-end-end-radius: 30px;
    background: hsl(47, 89%, 78%);
    min-height: 100px;
  }

  .in-account {
    @apply outline-none border-b pb-2 pt-4 transition-colors rounded-none text-gray-700 focus:border-gray-600;
    font-size: 18px;
    letter-spacing: 3px;
  }

  .btn-search {
    @apply w-full mt-6 p-3 text-white bg-gray-700 rounded-full transition-colors hover:bg-gray-800;
  }

  .item {
    @apply bg-gray-200 rounded-full py-3 my-3 px-4 flex justify-between text-gray-700;
  }

  .refresh {
    @apply mx-auto text-center py-2 mt-6 rounded-full shadow-md;
    max-width: 90px;
    font-size: 14px;
    background: hsl(47, 89%, 78%);
  }
</style>
