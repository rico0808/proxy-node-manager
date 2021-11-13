<template>
  <div class="w-screen h-screen flex justify-center items-center bg-gray-100">
    <a-card class="p-4" style="min-width: 400px">
      <h3 class="text-3xl mb-6 text-center">Proxy</h3>
      <a-form ref="formRef" :model="formData" :rules="rules">
        <a-form-item name="account">
          <a-input v-model:value="formData.account" placeholder="登录账号" />
        </a-form-item>
        <a-form-item name="passwd">
          <a-input type="password" v-model:value="formData.passwd" placeholder="登录密码" />
        </a-form-item>
        <a-button type="primary" block size="large" @click="handleSubmit">登 录</a-button>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref } from "@vue/reactivity";
  import { useRouter } from "vue-router";
  import { user_login } from "../../apis/lambda/auth";

  const router = useRouter();

  const formData = reactive({ account: "", passwd: "" });
  const formRef = ref();
  const rules = {
    account: { required: true, message: "请输入登录账号", trigger: "blur" },
    passwd: { required: true, message: "请输入登录密码", trigger: "blur" },
  };

  const handleSubmit = () => {
    formRef.value.validate().then(() => _handleLogin());
  };

  const _handleLogin = async () => {
    const res = await user_login(formData);
    console.log(res);

    router.push({ path: "/manager" });
  };
</script>
