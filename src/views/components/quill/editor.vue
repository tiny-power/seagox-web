<template>
	<div class="editor">
		<div :id="id" :style="{ height: height }"></div>
	</div>
</template>

<script>
import md5 from 'md5'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import Divider from './divider'
import LineHeight from './lineHeight'
import { container, ImageExtend, QuillWatch } from 'quill-image-extend-module'
export default {
	props: {
		value: {
			type: Object,
			default: () => {}
		},
		placeholder: {
			type: String,
			default: 'Insert text here ...'
		},
		enable: {
			type: Boolean,
			default: true
		},
		id: {
			type: String,
			default: 'editor'
		},
		height: {
			type: String,
			default: '280px'
		}
	},
	data() {
		return {
			quill: null,
			options: {
				theme: this.enable ? 'snow' : 'bubble',
				readOnly: !this.enable,
				modules: {
					ImageExtend: {
						loading: true,
						size: 5,
						name: 'file',
						action: this.$axios.defaults.baseURL + '/upload/putObject/oss',
						headers: xhr => {
							xhr.setRequestHeader('Authorization', window.localStorage.getItem('Authorization'))
							let timestamp = Date.now()
							xhr.setRequestHeader('Sign',  md5('upload/putObject/oss?timestamp=' + timestamp + '&key=yVwlsbIrY3q22EnoYYM4nR5zqTmqed05').toUpperCase())
							xhr.setRequestHeader('Timestamp', timestamp)
                            return xhr
						},
						sizeError: () => {
							this.$message.error('图片大小不能超过5M')
						},
						response: res => {
							return res.data
						}
					},
					toolbar: {
						container: [
							'undo',
							'redo',
							'format-paint',
							'clean',
							'blockquote',
							'code-block',
							'divider',
							{ header: [false, 1, 2, 3, 4, 5] },
							{
								font: [
									'SimSun',
									'SimHei',
									'Microsoft-YaHei',
									'KaiTi',
									'FangSong',
									'Arial',
									'Times-New-Roman',
									'sans-serif'
								]
							},
							{
								size: [
									'10px',
									'12px',
									'14px',
									false,
									'18px',
									'20px',
									'22px',
									'24px',
									'28px',
									'36px',
									'42px',
									'48px',
									'72px'
								]
							},
							'bold',
							'italic',
							'underline',
							'strike',
							{ color: [] },
							{ background: [] },
							{ align: [false, 'center', 'right', 'justify'] },
							{ list: 'bullet' },
							{ list: 'ordered' },
							'link',
							'image',
							{ 'line-height': ['1', '1.5', '1.6', '1.75', '2', '3', '4', '5'] },
							{ indent: '+2' }
						],
						handlers: {
							image: function() {
								// 劫持原来的图片点击按钮事件
								QuillWatch.emit(this.quill.id)
							},
							redo() {
								this.quill.history.redo()
							},
							undo() {
								this.quill.history.undo()
							},
							'format-paint'() {
								//格式刷逻辑
								if (this.lastformat) {
									this.quill.formatText(
										this.quill.getSelection().index,
										this.quill.getSelection().length,
										this.lastformat
									)
									this.lastformat = null
								} else {
									this.lastformat = this.quill.getFormat()
								}
							},
							divider() {
								const range = this.quill.getSelection(true)
								// 第三个参数source设为user意为：当编辑器为disabled时忽略调用
								this.quill.insertText(range.index, '\n', Quill.sources.USER) // 插入空行
								this.quill.insertEmbed(range.index + 1, 'divider', true, Quill.sources.USER) // 插入分割线
								this.quill.setSelection(range.index + 2, Quill.sources.USER) // 设置光标位置
							}
						}
					}
				},
				placeholder: this.placeholder
			},
			tooltips: [
				{ choice: '.ql-line-height .ql-picker-label', title: '行高' },
				{ choice: '.ql-divider', title: '分割线' },
				{ choice: '.ql-undo', title: '撤销' },
				{ choice: '.ql-redo', title: '重做' },
				{ choice: '.ql-format-paint', title: '格式刷' },
				{ choice: '.ql-bold', title: '加粗' },
				{ choice: '.ql-italic', title: '斜体' },
				{ choice: '.ql-underline', title: '下划线' },
				{ choice: '.ql-header', title: '段落格式' },
				{ choice: '.ql-strike', title: '删除线' },
				{ choice: '.ql-blockquote', title: '引用' },
				{ choice: '.ql-code', title: '代码' },
				{ choice: '.ql-code-block', title: '代码段' },
				{ choice: '.ql-font .ql-picker-label', title: '字体' },
				{ choice: '.ql-size .ql-picker-label', title: '字号' },
				{ choice: '.ql-list[value="ordered"]', title: '有序列表' },
				{ choice: '.ql-list[value="bullet"]', title: '无序列表' },
				{ choice: '.ql-direction', title: '文本方向' },
				{ choice: '.ql-align .ql-picker-label', title: '对齐' },
				{ choice: '.ql-color .ql-picker-label', title: '字体颜色' },
				{ choice: '.ql-background .ql-picker-label', title: '背景颜色' },
				{ choice: '.ql-image', title: '图片' },
				{ choice: '.ql-video', title: '视频' },
				{ choice: '.ql-link', title: '链接' },
				{ choice: '.ql-formula', title: '公式' },
				{ choice: '.ql-clean', title: '清除格式' },
				{ choice: '.ql-script[value="sub"]', title: '下标' },
				{ choice: '.ql-script[value="super"]', title: '上标' },
				{ choice: '.ql-indent[value="+2"]', title: '首行缩进' },
				{ choice: '.ql-header .ql-picker-label', title: '设置标题' },
				{ choice: '.ql-align .ql-picker-item:first-child', title: '左对齐' },
				{ choice: '.ql-align .ql-picker-item[data-value="center"]', title: '居中对齐' },
				{ choice: '.ql-align .ql-picker-item[data-value="right"]', title: '右对齐' },
				{ choice: '.ql-align .ql-picker-item[data-value="justify"]', title: '两端对齐' }
			],
			codeBlockSvg:
				'<svg width="24" height="24" viewBox="0 0 24 24" fill="#5C5C5C"><path d="M8.52 5h.84c.19 0 .34.15.34.33v.55c0 .19-.15.33-.34.33h-.57c-.58 0-.86.32-.86.98v2.94c0 .93-.45 1.56-1.33 1.87.88.36 1.33.97 1.33 1.87v2.96c0 .63.28.96.86.96h.57c.19 0 .34.14.34.33v.55c0 .18-.15.33-.34.33h-.84a2 2 0 01-1.58-.64c-.34-.4-.5-.93-.5-1.6v-2.81c0-.44-.1-.75-.28-.95-.18-.2-.48-.31-.9-.36a.3.3 0 01-.26-.3v-.67c0-.16.12-.29.28-.31.4-.05.7-.18.88-.36.18-.21.27-.53.27-.95v-2.8c0-.68.17-1.22.51-1.6.37-.44.9-.65 1.58-.65zm6.12 0h.84c.68 0 1.2.21 1.58.64.34.4.5.93.5 1.6v2.81c0 .42.1.75.3.96.16.17.45.3.86.35.16.02.28.16.28.32v.63a.34.34 0 01-.3.33c-.4.06-.68.17-.86.36-.18.2-.27.51-.27.95v2.82c0 .66-.17 1.2-.51 1.59a2 2 0 01-1.58.64h-.84a.34.34 0 01-.34-.33v-.55c0-.19.15-.33.34-.33h.57c.57 0 .86-.33.86-.96v-2.96c0-.9.43-1.51 1.33-1.87a1.82 1.82 0 01-1.33-1.87V7.19c0-.66-.3-.98-.86-.98h-.57a.34.34 0 01-.34-.33v-.55c0-.18.15-.33.34-.33z" fill-rule="nonzero"></path></svg>',
			blockquoteSvg:
				'<svg width="24" height="24" viewBox="0 0 24 24" fill="#5C5C5C"><path d="M5.13 15.56A8.74 8.74 0 015 13.72c0-2.5.6-4.5 1.55-5.8a4.72 4.72 0 014.55-1.88c.14.01.21.13.19.3l-.13.9c-.03.21-.18.22-.31.21-2.44-.2-4.1 1.48-4.32 5.22a2.91 2.91 0 014.37 2.47C10.9 16.72 9.6 18 8 18a2.89 2.89 0 01-2.87-2.44zm7.71 0a8.74 8.74 0 01-.13-1.84c0-2.5.6-4.5 1.55-5.8a4.72 4.72 0 014.55-1.88c.14.01.21.13.19.3l-.13.9c-.04.21-.18.22-.31.21-2.44-.2-4.1 1.48-4.32 5.22a2.91 2.91 0 014.37 2.47c0 1.58-1.3 2.86-2.9 2.86a2.89 2.89 0 01-2.87-2.44z" fill-rule="evenodd"></path></svg>',
			undoSvg:
				'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><g><path stroke="#464D5A" stroke-width="1.25" d="M4 3.625h6c2.761 0 5 1.989 5 4.75s-2.239 5-5 5H3" transform="translate(4 4.625)"></path><path fill="#464D5A" d="M5 .747v5.528c0 .111-.09.2-.2.2-.036 0-.07-.009-.101-.027L.276 3.849c-.095-.056-.127-.178-.07-.274.014-.026.036-.048.061-.065L4.69.58c.092-.06.216-.035.277.057.021.033.033.071.033.11z" transform="translate(4 4.625)"></path></g></g></svg>',
			redoSvg:
				'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><g><path stroke="#464D5A" stroke-width="1.25" d="M4 3.625h6c2.761 0 5 1.989 5 4.75s-2.239 5-5 5H3" transform="matrix(-1 0 0 1 24 0) translate(4 4.625)"></path><path fill="#464D5A" d="M5 .747v5.528c0 .111-.09.2-.2.2-.036 0-.07-.009-.101-.027L.276 3.849c-.095-.056-.127-.178-.07-.274.014-.026.036-.048.061-.065L4.69.58c.092-.06.216-.035.277.057.021.033.033.071.033.11z" transform="matrix(-1 0 0 1 24 0) translate(4 4.625)"></path></g></g></svg>',
			formatPaintSvg:
				'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><path fill="#464D5A" d="M13.5 14v4.078L10.5 20v-6h3zm5-9c.276 0 .5.224.5.5v5c0 .276-.224.5-.5.5h-4.231l-1.519 1.488V14H11.5v-2l.007-.001L12.525 11H5.5c-.276 0-.5-.224-.5-.5v-5c0-.276.224-.5.5-.5h13zm-.75 1.25H6.25v3.5h11.5v-3.5z"></path></g></svg>',
			cleanSvg:
				'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><path fill="#464D5A" d="M5 18.25H19V19.5H5z"></path><path fill="#464D5A" fill-rule="nonzero" d="M13.353 4.974l5.4 5.4c.166.166.18.427.045.62l-.058.068L12.801 17h-1.689l2.931-2.93-4.387-4.387-4.028 4.027L8.918 17H7.166l-2.919-2.92c-.186-.186-.18-.494.013-.687l8.405-8.406c.194-.194.502-.2.688-.013z"></path><path fill="#464D5A" d="M7 15.75L13 15.75 12 17 8 17z"></path></g></svg>',
			boldSvg:
				'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><g stroke="#464D5A" stroke-width="1.3"><path d="M5.5.65H.65v5.7H5.5c.787 0 1.5-.319 2.015-.835C8.031 5 8.35 4.287 8.35 3.5c0-.787-.319-1.5-.835-2.015C7 .969 6.287.65 5.5.65zM6.25 6.4H.65v6.2h5.6c.856 0 1.631-.347 2.192-.908.561-.561.908-1.336.908-2.192 0-.856-.347-1.631-.908-2.192C7.881 6.747 7.106 6.4 6.25 6.4z" transform="translate(7 5.5)"></path></g></g></svg>',
			italicSvg:
				'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><path fill="#464D5A" d="M13 6L14.5 6 10.5 18 9 18z"></path><path fill="#464D5A" d="M10.625 5.75h5.25c.345 0 .625.28.625.625S16.22 7 15.875 7h-5.25C10.28 7 10 6.72 10 6.375s.28-.625.625-.625zM7.125 17h5.75c.345 0 .625.28.625.625s-.28.625-.625.625h-5.75c-.345 0-.625-.28-.625-.625S6.78 17 7.125 17z"></path></g></svg>',
			underlineSvg:
				'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><path fill="#464D5A" d="M18 18.3v1.3H5v-1.3h13zM8.4 5v7.5c0 1.653 1.294 3.004 2.924 3.095l.176.005c1.653 0 3.004-1.294 3.095-2.924l.005-.176V5H16v7.5c0 2.485-2.015 4.5-4.5 4.5S7 14.985 7 12.5V5h1.4z"></path></g></svg>',
			strikeSvg:
				'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><g fill="#464D5A"><path d="M9.743 7.443c.206.17.396.36.566.568.485.622.73 1.405.686 2.2.008.687-.182 1.361-.545 1.94-.38.59-.916 1.059-1.545 1.352-.734.344-1.535.513-2.342.496-.876.009-1.743-.175-2.544-.537-.763-.349-1.45-.85-2.019-1.476l.909-1.033c.472.53 1.042.962 1.675 1.27.631.307 1.321.466 2.02.465.76.04 1.512-.185 2.13-.64.806-.704 1.017-1.89.504-2.84-.18-.297-.43-.545-.726-.722-.406-.236-.824-.45-1.252-.64l-.889-.403h3.372zM6.715 0c1.447-.005 2.833.596 3.836 1.662l-.808.97c-.796-.832-1.89-1.297-3.028-1.29-.666-.02-1.319.195-1.848.61-.46.364-.723.932-.707 1.527-.006.371.107.734.323 1.032.201.278.455.51.748.682.282.186.656.35 1.14.568l.073.032H3.563c-.045-.044-.088-.089-.13-.136-.523-.579-.795-1.35-.757-2.137-.007-.644.172-1.276.515-1.817.38-.55.9-.982 1.504-1.249C5.327.151 6.017-.004 6.715 0z" transform="translate(5 5)"></path><path d="M0 7H14V8.25H0z" transform="translate(5 5)"></path></g></g></svg>',
			bulletSvg:
				'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><path fill="#464D5A" d="M6.7 16.3c.276 0 .5.224.5.5V18c0 .276-.224.5-.5.5H5.5c-.276 0-.5-.224-.5-.5v-1.2c0-.276.224-.5.5-.5h1.2zm13.3.45V18H9v-1.25h11zM6.7 10.9c.276 0 .5.224.5.5v1.2c0 .276-.224.5-.5.5H5.5c-.276 0-.5-.224-.5-.5v-1.2c0-.276.224-.5.5-.5h1.2zm13.3.48v1.25H9v-1.25h11zM6.7 5.5c.276 0 .5.224.5.5v1.2c0 .276-.224.5-.5.5H5.5c-.276 0-.5-.224-.5-.5V6c0-.276.224-.5.5-.5h1.2zM20 6v1.25H9V6h11z"></path></g></svg>',
			orderedSvg:
				'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><path fill="#464D5A" d="M20 16.75V18H9v-1.25h11zm0-5.37v1.25H9v-1.25h11zM20 6v1.25H9V6h11z"></path><g fill="#464D5A" fill-rule="nonzero" stroke="#464D5A" stroke-width=".3"><path d="M1.25 0h.37v3.213h-.491V.59C.935.774.688.909.391.995V.508C.535.472.683.41.846.32 1.008.22 1.143.117 1.25 0zM1.206 5.137c.306 0 .563.086.76.266.194.18.293.409.293.693 0 .279-.108.53-.315.76-.126.13-.347.301-.666.518-.347.229-.553.432-.621.607h1.607v.432H.05c0-.32.103-.599.319-.841.117-.14.36-.333.724-.585.217-.154.37-.275.46-.37.143-.162.22-.337.22-.526 0-.18-.05-.315-.148-.405-.1-.09-.248-.135-.437-.135-.202 0-.355.067-.459.207-.108.135-.162.329-.171.59h-.49c.004-.36.107-.649.31-.864.207-.234.486-.347.828-.347zM1.188 10.437c.324 0 .58.077.778.234.19.158.289.373.289.648 0 .351-.18.59-.531.706.189.059.333.149.431.266.109.121.163.279.163.468 0 .297-.104.54-.307.729-.216.189-.499.288-.841.288-.328 0-.594-.085-.792-.252-.225-.189-.351-.463-.378-.823h.495c.009.215.077.382.212.499.117.108.27.162.459.162.207 0 .373-.063.499-.18.108-.108.166-.239.166-.4 0-.19-.058-.329-.175-.419-.108-.09-.27-.135-.481-.135H.94v-.369h.23c.198 0 .347-.045.446-.13.098-.086.152-.212.152-.374s-.049-.284-.139-.369c-.099-.09-.248-.13-.437-.13-.193 0-.346.049-.454.148-.108.099-.175.248-.194.446H.064c.027-.32.144-.567.355-.747.199-.18.455-.266.77-.266z" transform="translate(5 5.087)"></path></g></g></svg>',
			alignSvg:
				'<svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1"><g id="toolbar/paragraph/alignleft" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(0.000000, 0.000000)" fill="#000000" opacity="0"><rect x="-1.13686838e-13" y="0" width="24" height="24"></rect></g><path d="M19,16.6 L19,18 L5,18 L5,16.6 L19,16.6 Z M13,11.3 L13,12.7 L5,12.7 L5,11.3 L13,11.3 Z M19,6 L19,7.4 L5,7.4 L5,6 L19,6 Z" fill="#464D5A"></path></g></svg>',
			alignLeftSvg:
				'<svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1"><g id="toolbar/paragraph/alignleft" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(0.000000, 0.000000)" fill="#000000" opacity="0"><rect x="-1.13686838e-13" y="0" width="24" height="24"></rect></g><path d="M19,16.6 L19,18 L5,18 L5,16.6 L19,16.6 Z M13,11.3 L13,12.7 L5,12.7 L5,11.3 L13,11.3 Z M19,6 L19,7.4 L5,7.4 L5,6 L19,6 Z" fill="#464D5A"></path></g></svg>',
			alignCenterSvg:
				'<svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1"><g id="toolbar/paragraph/aligncenter" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(0.000000, 0.000000)" fill="#000000" opacity="0"><rect x="-1.13686838e-13" y="0" width="24" height="24"></rect></g><path d="M19,16.6 L19,18 L5,18 L5,16.6 L19,16.6 Z M16,11.3 L16,12.7 L8,12.7 L8,11.3 L16,11.3 Z M19,6 L19,7.4 L5,7.4 L5,6 L19,6 Z" fill="#464D5A"></path></g></svg>',
			alignRightSvg:
				'<svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1"><g id="toolbar/paragraph/alignright" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(0.000000, 0.000000)" fill="#000000" opacity="0"><rect x="-1.13686838e-13" y="0" width="24" height="24"></rect></g><path d="M19,16.6 L19,18 L5,18 L5,16.6 L19,16.6 Z M19,11.3 L19,12.7 L11,12.7 L11,11.3 L19,11.3 Z M19,6 L19,7.4 L5,7.4 L5,6 L19,6 Z" fill="#464D5A"></path></g></svg>',
			alignJustifySvg:
				'<svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1"><g id="toolbar/paragraph/alignjustify" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(0.000000, 0.000000)" fill="#000000" opacity="0"><rect x="-1.13686838e-13" y="0" width="24" height="24"></rect></g><path d="M19,16.6 L19,18 L5,18 L5,16.6 L19,16.6 Z M19,11.3 L19,12.7 L5,12.7 L5,11.3 L19,11.3 Z M19,6 L19,7.4 L5,7.4 L5,6 L19,6 Z" fill="#464D5A"></path></g></svg>',
			linkSvg:
				'<svg width="24" height="24" viewBox="0 0 24 24" fill="#5C5C5C"><path d="M12.4 9.6a3.75 3.75 0 011.46 5.82l-2.12 2.62a3.75 3.75 0 01-5.83-4.72l2.03-2.5.06.61c.05.43.2.83.42 1.17l-1.35 1.67a2.25 2.25 0 103.5 2.83l2.13-2.62a2.25 2.25 0 00-1.32-3.63L12.4 9.6zm-1.14 4.73A3.75 3.75 0 019.8 8.51l2.12-2.62a3.75 3.75 0 115.83 4.72l-2.03 2.5-.07-.61c-.04-.43-.19-.83-.41-1.17l1.34-1.67a2.25 2.25 0 00-3.5-2.83l-2.12 2.62a2.25 2.25 0 001.32 3.63l-1.02 1.25z" fill-rule="nonzero"></path></svg>',
			imageSvg:
				'<svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path fill="#fff" fill-opacity=".01" fill-rule="evenodd" d="M0 0h48v48H0z"></path><g transform="translate(5 8)" stroke-width="4" stroke-linejoin="round" stroke="#5C5C5C" fill="none"><path d="M2 0h34a2 2 0 0 1 2 2v28a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z" stroke-linecap="round"></path><circle stroke-linecap="round" cx="9.5" cy="8.5" r="1.5"></circle><path d="m10 16 5 4 6-7 17 13v4a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-4l10-10z"></path></g></svg>',
			dividerSvg:
				'<svg width="24" height="24" viewBox="0 0 24 24" fill="#5C5C5C"><path d="M5.37 11.25h13.26c.2 0 .37.17.37.38v.74c0 .21-.17.38-.37.38H5.37a.37.37 0 01-.37-.38v-.74c0-.21.17-.38.37-.38zm0-6.25h2.25c.21 0 .38.17.38.38v.75c0 .2-.17.37-.38.37H5.37A.37.37 0 015 6.12v-.75c0-.2.17-.37.37-.37zm5.5 0h2.26c.2 0 .37.17.37.38v.75c0 .2-.17.37-.37.37h-2.25a.37.37 0 01-.38-.38v-.75c0-.2.17-.37.38-.37zm5.5 0h2.25c.21 0 .38.17.38.38v.75c0 .2-.17.37-.38.37h-2.25a.37.37 0 01-.37-.38v-.75c0-.2.17-.37.37-.37zm-11 12.5h2.25c.21 0 .38.17.38.38v.75c0 .2-.17.37-.38.37H5.37a.37.37 0 01-.37-.37v-.75c0-.21.17-.38.37-.38zm5.5 0h2.26c.2 0 .37.17.37.38v.75c0 .2-.17.37-.37.37h-2.25a.37.37 0 01-.38-.37v-.75c0-.21.17-.38.38-.38zm5.5 0h2.25c.21 0 .38.17.38.38v.75c0 .2-.17.37-.38.37h-2.25a.37.37 0 01-.37-.37v-.75c0-.21.17-.38.37-.38z" fill-rule="evenodd"></path></svg>',
			indentSvg:
				'<svg t="1656062474865" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2170" width="48" height="48"><path d="M810.666667 213.333333v42.666667H213.333333V213.333333zM810.666667 768v42.666667H213.333333v-42.666667zM810.666667 398.208v42.666667h-384v-42.666667zM810.666667 583.125333v42.666667h-384v-42.666667zM254.506667 411.52l-30.037334 30.293333 83.2 82.304-82.005333 69.802667 27.648 32.512 117.333333-99.968z" fill="#3E3E3E" p-id="2171"></path></svg>',
			lastformat: null
		}
	},
	mounted() {
		//行边距
		Quill.register(LineHeight, true)
		//图片base64转地址
		Quill.register('modules/ImageExtend', ImageExtend)
		//字号扩展
		var Size = Quill.import('attributors/style/size')
		Size.whitelist = [
			'10px',
			'12px',
			'14px',
			'16px',
			'18px',
			'20px',
			'22px',
			'24px',
			'28px',
			'36px',
			'42px',
			'48px',
			'72px'
		]
		Quill.register(Size, true)
		//字体扩展
		var fonts = [
			'SimSun',
			'SimHei',
			'Microsoft-YaHei',
			'KaiTi',
			'FangSong',
			'Arial',
			'Times-New-Roman',
			'sans-serif'
		]
		var Font = Quill.import('formats/font')
		Font.whitelist = fonts
		Quill.register(Font, true)
		//分割线
		Quill.register(Divider, true)

		//图标添加或者替换
		const Icons = Quill.import('ui/icons')
		Icons.clean = this.cleanSvg
		Icons.divider = this.dividerSvg
		Icons.undo = this.undoSvg
		Icons.redo = this.redoSvg
		Icons.blockquote = this.blockquoteSvg
		Icons['format-paint'] = this.formatPaintSvg
		Icons['code-block'] = this.codeBlockSvg
		Icons.bold = this.boldSvg
		Icons.italic = this.italicSvg
		Icons.underline = this.underlineSvg
		Icons.strike = this.strikeSvg
		Icons.list.ordered = this.orderedSvg
		Icons.list.bullet = this.bulletSvg
		Icons.align[''] = this.alignSvg
		Icons.align['left'] = this.alignLeftSvg
		Icons.align['center'] = this.alignCenterSvg
		Icons.align['justify'] = this.alignJustifySvg
		Icons.align['right'] = this.alignRightSvg
		Icons.link = this.linkSvg
		Icons.image = this.imageSvg
		Icons.indent['+2'] = this.indentSvg
		Quill.register(Icons, true)
		var container = document.getElementById(this.id)
		this.quill = new Quill(container, this.options)
		this.quill.setContents(this.value)
		this.quill.on('text-change', () => {
			this.$emit('input', this.quill.getContents())
		})
		//工具类提示扩展
		this.autotip()
		document.querySelector('.ql-indent').addEventListener('click', () => {
			this.quill.format('indent', 2, 'api')
		})
	},
	methods: {
		autotip() {
			for (let item of this.tooltips) {
				let tipList = document.querySelectorAll('.ql-toolbar .ql-formats ' + item.choice)
				if (!tipList) continue
				for (let i = 0; i < tipList.length; i++) {
					tipList[i].setAttribute('data-title', item.title)
				}
			}
		},
		setContents(content) {
			this.quill.setContents(content)
		}
	}
}
</script>
<style scoped>
::v-deep .ql-editor {
	/* height: 280px; */
	line-height: 2;
}
::v-deep .ql-toolbar {
	/* text-align: center; */
	margin: 0 auto;
	border: none;
	padding-top: 10px;
	z-index: 1000;
	background-color: #f9fafb;
	box-shadow: 0px 3px 3px rgba(0, 0, 0, 0.06);
}
::v-deep .ql-container {
	background-color: #fff;
	border-radius: 4px;
	border: none;
	font-size: 16px;
}
::v-deep .ql-snow .ql-picker.ql-size .ql-picker-label::before,
::v-deep .ql-snow .ql-picker.ql-size .ql-picker-item::before {
	content: '16';
}
::v-deep .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='10px']::before,
::v-deep .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='10px']::before {
	content: '10';
}
::v-deep .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='12px']::before,
::v-deep .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='12px']::before {
	content: '12';
}
::v-deep .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='14px']::before,
::v-deep .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='14px']::before {
	content: '14';
}
::v-deep .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='18px']::before,
::v-deep .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='18px']::before {
	content: '18';
}
::v-deep .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='20px']::before,
::v-deep .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='20px']::before {
	content: '20';
}
::v-deep .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='22px']::before,
::v-deep .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='22px']::before {
	content: '22';
}
::v-deep .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='24px']::before,
::v-deep .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='24px']::before {
	content: '24';
}
::v-deep .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='26px']::before,
::v-deep .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='26px']::before {
	content: '26';
}
::v-deep .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='28px']::before,
::v-deep .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='28px']::before {
	content: '28';
}
::v-deep .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='36px']::before,
::v-deep .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='36px']::before {
	content: '36';
}
::v-deep .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='42px']::before,
::v-deep .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='42px']::before {
	content: '42';
}
::v-deep .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='48px']::before,
::v-deep .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='48px']::before {
	content: '48';
}
::v-deep .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='72px']::before,
::v-deep .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='72px']::before {
	content: '72';
}
::v-deep .ql-snow .ql-tooltip::before {
	content: '访问链接：';
}
::v-deep .ql-snow .ql-tooltip[data-mode='link']::before {
	content: '输入链接：';
}
::v-deep .ql-snow .ql-tooltip.ql-editing a.ql-action::after {
	content: '保存';
}
::v-deep .ql-snow .ql-tooltip a.ql-action::after {
	content: '编辑';
}
::v-deep .ql-snow .ql-tooltip a.ql-remove::before {
	content: '移除';
}
::v-deep .ql-snow .ql-picker.ql-header .ql-picker-label::before,
::v-deep .ql-snow .ql-picker.ql-header .ql-picker-item::before {
	content: '正文';
}
::v-deep .ql-snow .ql-picker.ql-header .ql-picker-label[data-value='1']::before,
::v-deep .ql-snow .ql-picker.ql-header .ql-picker-item[data-value='1']::before {
	content: '标题1';
}
::v-deep .ql-snow .ql-picker.ql-header .ql-picker-label[data-value='2']::before,
::v-deep .ql-snow .ql-picker.ql-header .ql-picker-item[data-value='2']::before {
	content: '标题2';
}
::v-deep .ql-snow .ql-picker.ql-header .ql-picker-label[data-value='3']::before,
::v-deep .ql-snow .ql-picker.ql-header .ql-picker-item[data-value='3']::before {
	content: '标题3';
}
::v-deep .ql-snow .ql-picker.ql-header .ql-picker-label[data-value='4']::before,
::v-deep .ql-snow .ql-picker.ql-header .ql-picker-item[data-value='4']::before {
	content: '标题4';
}
::v-deep .ql-snow .ql-picker.ql-header .ql-picker-label[data-value='5']::before,
::v-deep .ql-snow .ql-picker.ql-header .ql-picker-item[data-value='5']::before {
	content: '标题5';
}
::v-deep .ql-snow .ql-picker.ql-font .ql-picker-label[data-value='SimSun']::before,
::v-deep .ql-snow .ql-picker.ql-font .ql-picker-item[data-value='SimSun']::before {
	content: '宋体';
	font-family: 'SimSun';
}
::v-deep .ql-snow .ql-picker.ql-font .ql-picker-label[data-value='SimHei']::before,
::v-deep .ql-snow .ql-picker.ql-font .ql-picker-item[data-value='SimHei']::before {
	content: '黑体';
	font-family: 'SimHei';
}
::v-deep .ql-snow .ql-picker.ql-font .ql-picker-label[data-value='Microsoft-YaHei']::before,
::v-deep .ql-snow .ql-picker.ql-font .ql-picker-item[data-value='Microsoft-YaHei']::before {
	content: '微软雅黑';
	font-family: 'Microsoft YaHei';
}
::v-deep .ql-snow .ql-picker.ql-font .ql-picker-label[data-value='KaiTi']::before,
::v-deep .ql-snow .ql-picker.ql-font .ql-picker-item[data-value='KaiTi']::before {
	content: '楷体';
	font-family: 'KaiTi';
}
::v-deep .ql-snow .ql-picker.ql-font .ql-picker-label[data-value='FangSong']::before,
::v-deep .ql-snow .ql-picker.ql-font .ql-picker-item[data-value='FangSong']::before {
	content: '仿宋';
	font-family: 'FangSong';
}
::v-deep .ql-snow .ql-picker.ql-font .ql-picker-label[data-value='Arial']::before,
::v-deep .ql-snow .ql-picker.ql-font .ql-picker-item[data-value='Arial']::before {
	content: 'Arial';
	font-family: 'Arial';
}
::v-deep .ql-snow .ql-picker.ql-font .ql-picker-label[data-value='Times-New-Roman']::before,
::v-deep .ql-snow .ql-picker.ql-font .ql-picker-item[data-value='Times-New-Roman']::before {
	content: 'Times New Roman';
	font-family: 'Times New Roman';
}
::v-deep .ql-snow .ql-picker.ql-font .ql-picker-label[data-value='sans-serif']::before,
::v-deep .ql-snow .ql-picker.ql-font .ql-picker-item[data-value='sans-serif']::before {
	content: 'sans-serif';
	font-family: 'sans-serif';
}
::v-deep .ql-font-SimSun {
	font-family: 'SimSun';
}
::v-deep .ql-font-SimHei {
	font-family: 'SimHei';
}
::v-deep .ql-font-Microsoft-YaHei {
	font-family: 'Microsoft YaHei';
}
::v-deep .ql-font-KaiTi {
	font-family: 'KaiTi';
}
::v-deep .ql-font-FangSong {
	font-family: 'FangSong';
}
::v-deep .ql-font-Arial {
	font-family: 'Arial';
}
::v-deep .ql-font-Times-New-Roman {
	font-family: 'Times New Roman';
}
::v-deep .ql-font-sans-serif {
	font-family: 'sans-serif';
}
::v-deep .ql-snow .ql-stroke {
	stroke: #5c5c5c;
	stroke-width: 1;
}
::v-deep .ql-snow.ql-toolbar button,
.ql-snow .ql-toolbar button {
	padding: 0px;
}
::v-deep .ql-formats > button {
	position: relative;
}
::v-deep .ql-formats button:hover:after,
::v-deep .ql-formats > .ql-icon-picker > .ql-picker-label:hover:after {
	content: attr(data-title);
	position: absolute;
	top: 125%;
	left: -50%;
	border: 1px solid #ccc;
	background: #fff;
	border-radius: 5px;
	padding: 10px 15px;
	z-index: 3000;
	white-space: nowrap;
	color: #333;
	font-weight: normal;
}

::v-deep .ql-formats > .ql-size > .ql-picker-label:hover:after,
::v-deep .ql-formats > .ql-font > .ql-picker-label:hover:after,
::v-deep .ql-formats > .ql-align > .ql-picker-label:hover:after,
::v-deep .ql-formats > .ql-color-picker > .ql-picker-label:hover:after,
::v-deep .ql-formats > .ql-background > .ql-picker-label:hover:after,
::v-deep .ql-formats > .ql-line-height > .ql-picker-label:hover:after,
::v-deep .ql-formats > .ql-header > .ql-picker-label:hover:after {
	content: attr(data-title);
	position: absolute;
	top: 125%;
	left: -50%;
	border: 1px solid #ccc;
	background: #fff;
	border-radius: 5px;
	padding: 0px 15px;
	z-index: 3000;
	white-space: nowrap;
	color: #333;
	font-weight: normal;
}
::v-deep .ql-snow .ql-picker.ql-header {
	width: 50px;
	font-weight: normal;
}
::v-deep .ql-snow .ql-picker:not(.ql-color-picker):not(.ql-icon-picker) svg {
	right: -14px;
}
::v-deep .ql-snow .ql-picker.ql-font {
	width: 64px;
	font-weight: normal;
	margin-left: 18px;
	text-align: center;
}

::v-deep .ql-snow .ql-picker-label {
	padding: 0px;
}
::v-deep .ql-snow .ql-picker-label::before {
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	width: 64px;
}
::v-deep .ql-toolbar.ql-snow .ql-picker.ql-expanded .ql-picker-label {
	border: none;
}
::v-deep .ql-snow .ql-picker.ql-size {
	width: 44px;
	font-weight: normal;
	margin-left: 18px;
	margin-right: 18px;
}
::v-deep .ql-color,
::v-deep .ql-background {
	margin: 0 6px;
}

::v-deep .ql-align > .ql-picker-options {
	position: absolute;
	top: 125%;
	border: 1px solid #ccc;
	background: #fff;
	border-radius: 5px;
	padding: 5px 10px 5px 5px !important;
	z-index: 3000;
	white-space: nowrap;
	color: #333;
}
::v-deep .ql-size > .ql-picker-options > .ql-picker-item,
::v-deep .ql-align > .ql-picker-options > .ql-picker-item {
	margin: 10px 5px;
}
::v-deep .ql-align > .ql-picker-options > .ql-picker-item:hover:after {
	content: attr(data-title);
	position: relative;
	top: 0;
	left: 120%;
	border: 1px solid #ccc;
	background: #fff;
	border-radius: 5px;
	padding: 10px 15px;
	z-index: 3000;
	white-space: nowrap;
	color: #333;
	font-weight: normal;
}

::v-deep .ql-toolbar.ql-snow .ql-formats button {
	margin: 0 6px;
}
::v-deep .ql-size .ql-picker-options {
	padding: 4px 14px;
}

.editor {
	border: 1px solid #dcdfe6;
	border-radius: 4px;
}

::v-deep .ql-snow .ql-picker.ql-line-height .ql-picker-label::before {
	content: '1.6';
	line-height: 1.6;
}
::v-deep .ql-snow .ql-picker.ql-line-height .ql-picker-item[data-value='1']::before {
	content: '1';
}
::v-deep .ql-snow .ql-picker.ql-line-height .ql-picker-item[data-value='1.5']::before {
	content: '1.5';
}
::v-deep .ql-snow .ql-picker.ql-line-height .ql-picker-item[data-value='1.6']::before {
	content: '1.6（默认）';
}
::v-deep .ql-snow .ql-picker.ql-line-height .ql-picker-label[data-value='2']::before,
::v-deep .ql-snow .ql-picker.ql-line-height .ql-picker-item[data-value='2']::before {
	content: '2';
}
::v-deep .ql-snow .ql-picker.ql-line-height .ql-picker-label[data-value='3']::before,
::v-deep .ql-snow .ql-picker.ql-line-height .ql-picker-item[data-value='3']::before {
	content: '3';
}
::v-deep .ql-snow .ql-picker.ql-line-height .ql-picker-label[data-value='4']::before,
::v-deep .ql-snow .ql-picker.ql-line-height .ql-picker-item[data-value='4']::before {
	content: '4';
}
::v-deep .ql-snow .ql-picker.ql-line-height .ql-picker-label[data-value='5']::before,
::v-deep .ql-snow .ql-picker.ql-line-height .ql-picker-item[data-value='5']::before {
	content: '5';
}

::v-deep .ql-snow .ql-picker.ql-line-height {
	width: 30px;
	font-weight: normal;
	margin-left: 8px;
	margin-right: 8px;
}
::v-deep .ql-snow .ql-picker-options .ql-picker-item {
	margin: 0px;
	padding: 0px;
}

::v-deep .ql-snow .ql-indent {
	width: 44px;
	font-weight: normal;
}
::v-deep .ql-indent-2 {
	text-indent: 2em !important;
	padding-left: unset !important;
}
</style>
