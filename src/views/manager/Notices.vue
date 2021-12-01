<template>
  <div class="pb-2">
    <a-button type="primary" @click="onCreateNotice">添加公告</a-button>
  </div>

  <a-table
    :loading="loading"
    :data-source="data && data.data"
    :row-key="(item) => item.id"
    :columns="columns"
    :pagination="pagination"
    @change="onTableChange"
  >
    <template #noticeTitile="{ record }">
      <a-tooltip placement="left">
        <template #title>
          <span>{{ record.title }}</span>
        </template>
        <div class="overflow-hidden overflow-ellipsis">
          {{ record.title }}
        </div>
      </a-tooltip>
    </template>

    <template #content="{ record }">
      <a-tooltip placement="top">
        <template #title>
          <span>{{ record.content }}</span>
        </template>
        <div class="overflow-hidden overflow-ellipsis">
          {{ record.content }}
        </div>
      </a-tooltip>
    </template>

    <template #type="{ record }">
      <a-tag class="m-0" :color="noticeType(record.type).type">{{ noticeType(record.type).label }}</a-tag>
    </template>

    <template #createAt="{ record }">
      {{ fTime(record.createAt, true) }}
    </template>

    <template #status="{ record }">
      <a-tag class="m-0" :color="record.status ? 'success' : 'error'">{{ record.status ? "发布" : "隐藏" }}</a-tag>
    </template>

    <template #actions="{ record }">
      <a-button type="primary" size="small" class="mr-2" @click="onEditNotice(record)">编辑</a-button>
      <a-popconfirm title="确认删除该公告吗？" ok-text="确认" cancel-text="取消" @confirm="onDeleteNotice(record.id)">
        <a-button type="primary" danger size="small">删除</a-button>
      </a-popconfirm>
    </template>
  </a-table>

  <a-modal :title="modelTitle" :visible="state.visible" @cancel="onModelClose" :maskClosable="false" width="400px">
    <a-form ref="formRef" :model="formData" :rules="rules" hideRequiredMark>
      <a-form-item label="公告标题" name="title">
        <a-input v-model:value.trim="formData.title" placeholder="请输入公告标题" />
      </a-form-item>
      <a-form-item label="公告内容" name="content">
        <a-textarea v-model:value="formData.content" placeholder="请输入公告内容" :rows="4" />
      </a-form-item>
      <a-form-item label="公告类型" name="type">
        <a-select v-model:value="formData.type" placeholder="请选择公告类型">
          <a-select-option value="info">蓝色信息</a-select-option>
          <a-select-option value="success">绿色通知</a-select-option>
          <a-select-option value="warning">黄色通知</a-select-option>
          <a-select-option value="error">红色通知</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item v-if="state.isEdit" label="公告状态" name="status">
        <a-radio-group v-model:value="formData.status">
          <a-radio :value="0">隐藏</a-radio>
          <a-radio :value="1">显示</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
    <template #footer>
      <a-button type="primary" :loading="state.submiting" @click="handleSubmit"> {{ modelTitle }} </a-button>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
  import { usePagination } from "vue-request";
  import { computed, reactive, ref } from "@vue/reactivity";
  import { formatTime } from "../../utils/tools";
  import { nextTick } from "@vue/runtime-core";
  import { message } from "ant-design-vue";
  import { z } from "zod";
  import { EditGoodsSchema } from "../../apis/dto/GoodsDTO";
  import { create_notice, delete_notice, edit_notice, notice_list } from "../../apis/lambda/notice";

  const fTime = formatTime;
  const columns = [
    { title: "#", dataIndex: "id" },
    { title: "公告标题", slots: { customRender: "noticeTitile" }, ellipsis: true },
    { title: "内容", slots: { customRender: "content" }, ellipsis: true },
    { title: "类型", slots: { customRender: "type" }, align: "center" },
    { title: "状态", slots: { customRender: "status" }, align: "center" },
    { title: "发布日期", slots: { customRender: "createAt" }, align: "center" },
    { title: "操作项", slots: { customRender: "actions" }, width: "250px", align: "center" },
  ];

  const state = reactive({
    visible: false,
    isEdit: false,
    submiting: false,
  });
  const modelTitle = computed(() => (state.isEdit ? "编辑公告" : "添加公告"));

  // 在线状态
  const noticeType = (type: string) => {
    switch (type) {
      case "info":
        return { type: "blue", label: "蓝色通知" };
      case "warning":
        return { type: "orange", label: "黄色通知" };
      case "success":
        return { type: "green", label: "绿色通知" };
      case "error":
        return { type: "red", label: "红色通知" };
    }
  };

  const formRef = ref();
  const baseFm = { title: "", content: "", type: null, status: 1 };
  const formData = ref(Object.assign({}, baseFm));

  const rules = {
    content: [{ required: true, message: "请输入公告内容", trigger: "blur" }],
    type: [{ required: true, message: "请选择公告类型", trigger: "blur" }],
  };

  // 请求
  const { total, data, current, pageSize, loading, reload, run } = usePagination(notice_list, {
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

  // 点击新增
  const onCreateNotice = () => {
    state.isEdit = false;
    state.visible = true;
  };

  // 点击编辑
  const onEditNotice = (notice: z.infer<typeof EditGoodsSchema>) => {
    state.isEdit = state.visible = true;
    nextTick(() => Object.assign(formData.value, notice));
  };

  // 点击删除
  const onDeleteNotice = async (id: number) => {
    const { msg } = await delete_notice({ id });
    message.success(msg || "删除成功");
    reload();
  };

  // 关闭model
  const onModelClose = () => {
    state.visible = false;
    formRef.value.resetFields();
    formData.value = baseFm;
  };

  // model 提交
  const handleSubmit = async () => {
    await formRef.value.validate();
    const fn = state.isEdit ? edit_notice : create_notice;
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
