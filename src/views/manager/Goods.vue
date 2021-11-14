<template>
  <div class="pb-2">
    <a-button type="primary" @click="onCreateGoods">添加商品</a-button>
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
    <template #days="{ record }">{{ record.days }} 天</template>
    <template #updateAt="{ record }">{{ fTime(record.updateAt, true) }}</template>
    <template #status="{ record }">
      <a-tag class="m-0" :color="record.status ? 'success' : 'error'">{{ record.status ? "售卖中" : "已下架" }}</a-tag>
    </template>
    <template #actions="{ record }">
      <a-button type="primary" size="small" class="mr-2" @click="onEditNode(record)">编辑</a-button>
      <a-popconfirm title="确认删除该商品吗？" ok-text="确认" cancel-text="取消" @confirm="onDeleteNode(record.id)">
        <a-button type="primary" danger size="small">删除</a-button>
      </a-popconfirm>
    </template>
  </a-table>

  <a-modal :title="modelTitle" :visible="state.visible" @cancel="onModelClose" :maskClosable="false" width="400px">
    <a-form ref="formRef" :model="formData" :rules="rules" hideRequiredMark>
      <a-form-item label="商品名称" name="name">
        <a-input v-model:value.trim="formData.name" placeholder="请输入节点名称" />
      </a-form-item>
      <a-form-item label="商品SKU" name="sku">
        <a-input v-model:value.trim="formData.sku" placeholder="请输入商品SKU" />
      </a-form-item>
      <a-form-item label="预设流量" name="traffic">
        <a-input v-model:value.trim="formData.traffic" placeholder="请输入预设流量" />
      </a-form-item>
      <a-form-item label="有效天数" name="days">
        <a-input v-model:value.trim="formData.days" placeholder="请输入有效天数" />
      </a-form-item>
      <a-form-item v-if="state.isEdit" label="商品状态" name="status">
        <a-radio-group v-model:value="formData.status">
          <a-radio :value="0">下架</a-radio>
          <a-radio :value="1">售卖</a-radio>
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
  import { create_goods, delete_goods, edit_goods, goods_list } from "../../apis/lambda/goods";
  import { EditGoodsSchema } from "../../apis/dto/GoodsDTO";

  const fTime = formatTime;
  const columns = [
    { title: "#", dataIndex: "id" },
    { title: "商品名称", dataIndex: "name" },
    { title: "SKU编号", dataIndex: "sku" },
    { title: "预设流量", slots: { customRender: "traffic" }, align: "center" },
    { title: "有效天数", slots: { customRender: "days" }, align: "center" },
    { title: "销量", dataIndex: "sales", align: "center" },
    { title: "状态", slots: { customRender: "status" }, align: "center" },
    { title: "操作项", slots: { customRender: "actions" }, width: "140px", align: "center" },
  ];

  const state = reactive({
    visible: false,
    isEdit: false,
    submiting: false,
  });
  const modelTitle = computed(() => (state.isEdit ? "编辑节点" : "添加节点"));

  const formRef = ref();
  const baseFm = { name: "", sku: "", traffic: "", days: "", status: 1 };
  const formData = ref(Object.assign({}, baseFm));

  const rules = {
    name: [{ required: true, message: "请输入商品名字", trigger: "blur" }],
    sku: [{ required: true, message: "请输入商品SKU", trigger: "blur" }],
    traffic: [{ required: true, message: "请输入预设流量", trigger: "blur" }],
    days: [{ required: true, message: "请输入有效天数", trigger: "blur" }],
  };

  // 请求
  const { total, data, current, pageSize, loading, reload, run } = usePagination(goods_list, {
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
  const onCreateGoods = () => {
    state.isEdit = false;
    state.visible = true;
  };

  // 点击编辑
  const onEditNode = (goods: z.infer<typeof EditGoodsSchema>) => {
    state.isEdit = state.visible = true;
    nextTick(() => Object.assign(formData.value, goods));
  };

  // 点击删除
  const onDeleteNode = async (id: number) => {
    const { msg } = await delete_goods({ id });
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
    const fn = state.isEdit ? edit_goods : create_goods;
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
