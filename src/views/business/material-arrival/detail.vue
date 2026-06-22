<template><document-detail :config="config" /></template>
<script>
import DocumentDetail from "../common/document-detail";
import { documentConfigs } from "../common/document-config";
export default {
  components: { DocumentDetail },
  data: () => ({ config: documentConfigs.materialArrival }),
};
</script>
