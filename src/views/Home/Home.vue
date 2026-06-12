<template>
  <section class="Home pt-4 sm:pt-6">
    <!-- 上传 -->
    <Upload v-model="fileList" :UploadConfig="UploadConfig" :uploadAPI="uploadAPI" />
    <!-- 展示 -->
    <div v-if="fileList.length" class="clear-bar">
      <Button variant="outline" size="sm" @click="clearHistory">清空历史</Button>
    </div>
    <ResList v-model="fileList" :nodeHost="nodeHost" />
  </section>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue';
import { formatURL } from '@/utils/index';
import { Button } from '@/components/ui/button';
import Upload from '@/components/Upload/Upload.vue';
import ResList from '@/components/ResList/ResList.vue';
// IPFS节点
const nodeHost = ref<string>(import.meta.env.VITE_IMG_API_URL || location.origin);
// 上传接口
const uploadAPI = ref<string>(`${import.meta.env.VITE_IMG_API_URL || location.origin}/upload`);
// 上传配置
const UploadConfig = ref<any>({
  AcceptTypes: 'image/*',
  Max: 0,
  MaxSize: 15,
});
// 上传列表
const fileList = ref<Array<any>>(JSON.parse(localStorage.getItem('zychUpImageList') || '[]'));

function clearHistory() {
  fileList.value = []
  localStorage.removeItem('zychUpImageList')
}

watch(fileList, (newVal) => {
  localStorage.setItem(
    'zychUpImageList',
    JSON.stringify(
      newVal
        .filter((i: any) => i.upload_status == 'success')
        .map((i: any) => {
          i.upload_blob = formatURL({ nodeHost: nodeHost.value }, i.upload_result);
          return i;
        }),
    ),
  );
});
</script>

<style scoped lang="less">
@import 'Home.less';
.clear-bar {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
}
</style>
