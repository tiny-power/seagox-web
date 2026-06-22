<template><document-list :config="config" /></template>
<script>
import DocumentList from "../common/document-list";
import { documentConfigs } from "../common/document-config";
export default {
  components: { DocumentList },
  data: () => ({ config: documentConfigs.constructionLog }),
};
</script>
