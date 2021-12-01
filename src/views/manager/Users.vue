<template>
  <div class="pb-2">
    <a-button type="primary" @click="onCreateUser">添加用户</a-button>
  </div>

  <a-table
    :loading="loading"
    :data-source="data && data.data"
    :row-key="(item) => item.id"
    :columns="columns"
    :pagination="pagination"
    @change="onTableChange"
  >
    <template #used="{ record }">{{ record.used }} GB</template>

    <template #traffic="{ record }">{{ record.traffic }} GB</template>

    <template #expire="{ record }">{{ fTime(record.expire) }}</template>

    <template #updateAt="{ record }">{{ fTime(record.updateAt, true) }}</template>

    <template #status="{ record }">
      <a-tag class="m-0" :color="record.status ? 'success' : 'error'">{{ record.status ? "启用" : "禁用" }}</a-tag>
    </template>

    <template #actions="{ record }">
      <a-button type="primary" size="small" class="mr-2" @click="onEditUser(record)">编辑</a-button>
      <a-popconfirm title="确认删除该用户吗？" ok-text="确认" cancel-text="取消" @confirm="onDeleteUser(record.id)">
        <a-button type="primary" danger size="small">删除</a-button>
      </a-popconfirm>
    </template>
  </a-table>

  <a-modal :title="modelTitle" :visible="state.visible" @cancel="onModelClose" :maskClosable="false" width="400px">
    <a-form ref="formRef" :model="formData" :rules="rules" hideRequiredMark>
      <a-form-item label="淘宝账号" name="tb">
        <a-input v-model:value.trim="formData.tb" placeholder="请输入淘宝账号" :disabled="state.isEdit" />
      </a-form-item>
      <a-form-item label="连接账号" name="account">
        <a-input v-model:value.trim="formData.account" placeholder="请输入连接账号" />
      </a-form-item>
      <a-form-item label="连接密码" name="passwd">
        <a-input v-model:value.trim="formData.passwd" placeholder="请输入连接密码" />
      </a-form-item>
      <a-form-item v-if="state.isEdit" label="已用流量" name="used">
        <div class="flex items-center">
          <a-input-number v-model:value.trim="formData.used" class="w-full" placeholder="请输入已用流量" :min="0" :max="10240" />
          <span class="ml-2">GB</span>
        </div>
      </a-form-item>
      <a-form-item label="预设流量" name="traffic">
        <div class="flex items-center">
          <a-input-number
            v-model:value.trim="formData.traffic"
            class="w-full"
            placeholder="请输入预设流量"
            :min="0"
            :max="10240"
          />
          <span class="ml-2">GB</span>
        </div>
      </a-form-item>
      <a-form-item label="到期时间" name="expire">
        <a-input v-model:value="formData.expire" placeholder="请输入到期时间" />
      </a-form-item>
      <a-form-item v-if="state.isEdit" label="是否试用" name="status">
        <a-radio-group v-model:value="formData.useTest">
          <a-radio :value="0">未试用</a-radio>
          <a-radio :value="1">已试用</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item v-if="state.isEdit" label="账号状态" name="status">
        <a-radio-group v-model:value="formData.status">
          <a-radio :value="0">禁用</a-radio>
          <a-radio :value="1">启用</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
    <template #footer>
      <a-button type="primary" :loading="state.submiting" @click="handleSubmit"> {{ modelTitle }} </a-button>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
  import { create_user, delete_user, edit_user, user_list } from "../../apis/lambda/users";
  import { usePagination } from "vue-request";
  import { computed, reactive, Ref, ref } from "@vue/reactivity";
  import { formatTime } from "../../utils/tools";
  import { nextTick } from "@vue/runtime-core";
  import dayjs from "dayjs";
  import { message } from "ant-design-vue";
  import { z } from "zod";
  import { EditUserSchema } from "../../apis/dto/UserDTO";

  const fTime = formatTime;
  const columns = [
    { title: "#", dataIndex: "id" },
    { title: "淘宝ID", dataIndex: "tb" },
    { title: "账号", dataIndex: "account" },
    { title: "密码", dataIndex: "passwd" },
    { title: "已用流量", slots: { customRender: "used" }, align: "center" },
    { title: "预设流量", slots: { customRender: "traffic" }, align: "center" },
    { title: "到期时间", slots: { customRender: "expire" }, align: "center" },
    { title: "最近使用", slots: { customRender: "updateAt" }, align: "center" },
    { title: "状态", slots: { customRender: "status" }, align: "center" },
    { title: "操作项", slots: { customRender: "actions" }, width: "140px", align: "center" },
  ];

  const state = reactive({
    visible: false,
    isEdit: false,
    submiting: false,
  });
  const modelTitle = computed(() => (state.isEdit ? "编辑用户" : "添加用户"));

  const formRef = ref();
  const baseFm = {
    tb: "",
    account: "",
    passwd: "",
    used: 0,
    traffic: 0,
    expire: dayjs().format("YYYY-MM-DD"),
    useTest: 0,
    status: 1,
  };
  const formData = ref(Object.assign({}, baseFm));

  const rules = {
    tb: [{ required: true, message: "请输入淘宝账号", trigger: "blur" }],
    account: [{ required: true, message: "请输入连接账号", trigger: "blur" }],
    passwd: [{ required: true, message: "请输入连接密码", trigger: "blur" }],
    expire: [{ required: true, message: "请输入到期时间", trigger: "blur" }],
  };

  // 请求
  const { total, data, current, pageSize, loading, reload, run } = usePagination(user_list, {
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

  // 点击新增用户
  const onCreateUser = () => {
    state.isEdit = false;
    state.visible = true;
  };

  // 点击编辑用户
  const onEditUser = (user: z.infer<typeof EditUserSchema>) => {
    state.isEdit = state.visible = true;
    nextTick(() => Object.assign(formData.value, user, { expire: dayjs(user.expire).format("YYYY-MM-DD") }));
  };

  // 点击删除用户
  const onDeleteUser = async (id: number) => {
    const { msg } = await delete_user({ id });
    message.success(msg || "删除成功");
    reload();
  };

  // 关闭model
  const onModelClose = () => {
    state.visible = false;
    formRef.value.resetFields();
    formData.value = baseFm;
  };

  const handleSubmit = async () => {
    await formRef.value.validate();
    const fn = state.isEdit ? edit_user : create_user;
    state.submiting = true;
    try {
      const { msg } = await fn(formData.value);
      message.success(msg || "请求成功");
      state.submiting = false;
      reload();
      onModelClose();
    } catch {
      state.submiting = false;
    }
  };
</script>

<style lang="scss"></style>
