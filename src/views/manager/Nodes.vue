<template>
  <div class="pb-2">
    <a-button type="primary" @click="onCreateNode">添加节点</a-button>
  </div>

  <a-table
    :loading="loading"
    :data-source="data && data.data"
    :row-key="(item) => item.id"
    :columns="columns"
    :pagination="pagination"
    @change="onTableChange"
  >
    <template #traffic="{ record }">{{ record.traffic }} GB</template>
    <template #report="{ record }">
      <a-tag class="m-0" :color="reportStatus(record.report).type">{{ reportStatus(record.report).text }}</a-tag>
    </template>
    <template #status="{ record }">
      <a-tag class="m-0" :color="record.status ? 'success' : 'error'">{{ record.status ? "启用" : "禁用" }}</a-tag>
    </template>
    <template #actions="{ record }">
      <a-button type="primary" size="small" class="mr-2" @click="onEditNode(record)">编辑</a-button>
      <a-popconfirm title="确认删除该节点吗？" ok-text="确认" cancel-text="取消" @confirm="onDeleteNode(record.id)">
        <a-button type="primary" danger size="small">删除</a-button>
      </a-popconfirm>
      <a-popconfirm title="确认要清空已跑流量吗？" ok-text="确认" cancel-text="取消" @confirm="onClearTraffic(record.id)">
        <a-button danger size="small" class="ml-2">流量清空</a-button>
      </a-popconfirm>
    </template>
  </a-table>

  <a-modal :title="modelTitle" :visible="state.visible" @cancel="onModelClose" :maskClosable="false" width="400px">
    <a-form ref="formRef" :model="formData" :rules="rules" hideRequiredMark>
      <a-form-item label="节点名字" name="name">
        <a-input v-model:value.trim="formData.name" placeholder="请输入节点名称" />
      </a-form-item>
      <a-form-item label="节点地址" name="ddns">
        <a-input v-model:value.trim="formData.ddns" placeholder="请输入节点地址" />
      </a-form-item>
      <a-form-item label="连接端口" name="port">
        <a-input v-model:value.trim="formData.port" placeholder="请输入连接端口" />
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
  import { usePagination } from "vue-request";
  import { computed, reactive, ref } from "@vue/reactivity";
  import { formatTime } from "../../utils/tools";
  import { nextTick } from "@vue/runtime-core";
  import { message } from "ant-design-vue";
  import { z } from "zod";
  import { clear_node_traffic, create_node, delete_node, edit_node, node_list } from "../../apis/lambda/nodes";
  import { EditGoodsSchema } from "../../apis/dto/GoodsDTO";
  import dayjs from "dayjs";

  const fTime = formatTime;
  const columns = [
    { title: "#", dataIndex: "id" },
    { title: "节点名字", dataIndex: "name" },
    { title: "节点地址", dataIndex: "ddns" },
    { title: "端口", dataIndex: "port", align: "center" },
    { title: "已跑流量", slots: { customRender: "traffic" } },
    { title: "在线人数", dataIndex: "online", align: "center" },
    { title: "最后在线", slots: { customRender: "report" }, align: "center" },
    { title: "状态", slots: { customRender: "status" }, align: "center" },
    { title: "操作项", slots: { customRender: "actions" }, width: "250px", align: "center" },
  ];

  const state = reactive({
    visible: false,
    isEdit: false,
    submiting: false,
  });
  const modelTitle = computed(() => (state.isEdit ? "编辑节点" : "添加节点"));

  // 在线状态
  const reportStatus = (time: string) => {
    if (dayjs(time).isAfter(dayjs().subtract(1, "minute").toISOString())) {
      return { type: "success", text: fTime(time, true) };
    } else {
      return { type: "error", text: fTime(time, true) };
    }
  };

  const formRef = ref();
  const baseFm = { name: "", ddns: "", port: "", status: 1 };
  const formData = ref(Object.assign({}, baseFm));

  const rules = {
    name: [{ required: true, message: "请输入节点名字", trigger: "blur" }],
    ddns: [{ required: true, message: "请输入节点地址", trigger: "blur" }],
    port: [{ required: true, message: "请输入连接端口", trigger: "blur" }],
  };

  // 请求
  const { total, data, current, pageSize, loading, reload, run } = usePagination(node_list, {
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
  const onCreateNode = () => {
    state.isEdit = false;
    state.visible = true;
  };

  // 点击编辑
  const onEditNode = (node: z.infer<typeof EditGoodsSchema>) => {
    state.isEdit = state.visible = true;
    nextTick(() => Object.assign(formData.value, node));
  };

  // 点击删除
  const onDeleteNode = async (id: number) => {
    const { msg } = await delete_node({ id });
    message.success(msg || "删除成功");
    reload();
  };

  // 流量清空
  const onClearTraffic = async (id: number) => {
    const { msg } = await clear_node_traffic({ id });
    message.success(msg || "清空成功");
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
    const fn = state.isEdit ? edit_node : create_node;
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
