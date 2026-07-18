<template>
    <div class="quill-editor">
        <div ref="editor" :style="{ height: height }"></div>
    </div>
</template>

<script>
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

export default {
    props: {
        value: {
            type: Object,
            default: () => ({ ops: [{ insert: '\n' }] })
        },
        placeholder: {
            type: String,
            default: '请输入内容'
        },
        enable: {
            type: Boolean,
            default: true
        },
        height: {
            type: String,
            default: '280px'
        }
    },
    data() {
        return {
            quill: null,
            updating: false
        }
    },
    mounted() {
        this.initEditor()
    },
    beforeDestroy() {
        this.quill = null
    },
    watch: {
        value: {
            deep: true,
            handler(value) {
                if (!this.quill || this.updating) return
                this.quill.setContents(value || { ops: [{ insert: '\n' }] })
            }
        },
        enable(value) {
            if (this.quill) this.quill.enable(value)
        }
    },
    methods: {
        initEditor() {
            this.quill = new Quill(this.$refs.editor, {
                theme: this.enable ? 'snow' : 'bubble',
                readOnly: !this.enable,
                placeholder: this.placeholder,
                modules: {
                    toolbar: this.enable
                        ? {
                              container: [
                                  [{ header: [1, 2, 3, false] }],
                                  ['bold', 'italic', 'underline', 'strike'],
                                  [{ color: [] }, { background: [] }],
                                  [{ align: [] }],
                                  [{ list: 'ordered' }, { list: 'bullet' }],
                                  ['blockquote', 'code-block'],
                                  ['link', 'image'],
                                  ['clean']
                              ],
                              handlers: {
                                  image: () => this.selectImage()
                              }
                          }
                        : false
                }
            })
            this.quill.setContents(this.value || { ops: [{ insert: '\n' }] })
            this.quill.on('text-change', () => {
                this.updating = true
                const delta = this.quill.getContents()
                this.$emit('input', delta)
                this.$emit('html-change', this.quill.getSemanticHTML())
                this.$nextTick(() => {
                    this.updating = false
                })
            })
            this.$emit('html-change', this.quill.getSemanticHTML())
        },
        selectImage() {
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = 'image/*'
            input.onchange = () => {
                const file = input.files && input.files[0]
                if (!file) return
                this.uploadImage(file)
            }
            input.click()
        },
        async uploadImage(file) {
            const loading = this.$loading({ text: '上传中' })
            try {
                const formData = new FormData()
                formData.append('file', file)
                const response = await this.$axios.post('upload/putObject/oss', formData)
                if (response.data.code === 200) {
                    const range = this.quill.getSelection(true)
                    this.quill.insertEmbed(range.index, 'image', response.data.data)
                    this.quill.setSelection(range.index + 1)
                } else {
                    this.$message.error(response.data.message || '上传失败')
                }
            } finally {
                loading.close()
            }
        },
        getSemanticHTML() {
            return this.quill ? this.quill.getSemanticHTML() : ''
        }
    }
}
</script>

<style scoped>
.quill-editor {
    background: #ffffff;
}
</style>
