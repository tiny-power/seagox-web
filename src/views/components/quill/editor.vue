<template>
    <div class="quill-editor" @mousedown="closeFloatingPanels">
        <div ref="editor" :style="{ height: height }"></div>
        <div
            v-if="colorPickerVisible"
            class="text-color-panel"
            :style="colorPickerStyle"
            @mousedown.stop
        >
            <div class="text-color-recent">
                <div class="text-color-section-title">最近使用颜色</div>
                <div class="text-color-recent-list">
                    <button
                        v-for="color in currentRecentColors"
                        :key="color"
                        type="button"
                        :class="[
                            'text-color-recent-item',
                            {
                                none: color === 'none',
                                active:
                                    color === 'none'
                                        ? !selectedTextColor
                                        : selectedTextColor &&
                                          selectedTextColor.toLowerCase() === color.toLowerCase()
                            }
                        ]"
                        :style="color === 'none' ? {} : { backgroundColor: color }"
                        @click="selectTextColor(color)"
                    ></button>
                </div>
            </div>
            <div class="text-color-tabs">
                <button
                    type="button"
                    :class="{ active: colorPickerTab === 'basic' }"
                    @click="colorPickerTab = 'basic'"
                >
                    基本色
                </button>
                <span></span>
                <button
                    type="button"
                    :class="{ active: colorPickerTab === 'more' }"
                    @click="colorPickerTab = 'more'"
                >
                    更多颜色
                </button>
            </div>
            <div v-show="colorPickerTab === 'basic'" class="text-color-basic">
                <button
                    v-for="color in basicColors"
                    :key="color"
                    type="button"
                    :class="{ active: selectedTextColor.toLowerCase() === color.toLowerCase() }"
                    :style="{ backgroundColor: color }"
                    @click="selectTextColor(color)"
                ></button>
            </div>
            <div v-show="colorPickerTab === 'more'" class="text-color-more">
                <div
                    class="text-color-sv"
                    :style="{ backgroundColor: hueColor }"
                    @mousedown="pickTextColorBySv"
                >
                    <span
                        :style="{
                            left: colorSv.saturation + '%',
                            top: 100 - colorSv.value + '%'
                        }"
                    ></span>
                </div>
                <div class="text-color-hue" @mousedown="pickTextColorByHue">
                    <span :style="{ top: colorSv.hue / 3.6 + '%' }"></span>
                </div>
            </div>
            <div class="text-color-footer">
                <span
                    :class="['text-color-preview', { none: !selectedTextColor }]"
                    :style="selectedTextColor ? { backgroundColor: selectedTextColor } : {}"
                ></span>
                <input v-model="selectedTextColor" maxlength="7" @input="syncTextColorFromInput" />
                <el-button size="small" @click="confirmTextColor">确认</el-button>
            </div>
        </div>
        <div
            v-if="listPickerVisible"
            class="list-style-panel"
            :style="listPickerStyle"
            @mousedown.stop
        >
            <button
                v-for="item in listStyles"
                :key="item.value"
                type="button"
                :class="['list-style-option', item.type]"
                @click="applyListStyle(item)"
            >
                <span></span>
                <em>{{ item.label }}</em>
            </button>
        </div>
    </div>
</template>

<script>
import Quill from 'quill'
import QuillTableBetter from 'quill-table-better'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import 'quill-table-better/dist/quill-table-better.css'
import './sizeStyle'
import './letterSpacing'
import './listStyle'
import './firstLineIndent'
import './lineHeight'
import Divider from './divider'

const icons = Quill.import('ui/icons')
const fontSizes = ['12px', '14px', '15px', '16px', '17px', '18px', '20px', '24px']
const lineHeightValues = ['1', '1.5', '1.6', '1.75', '2', '3', '4', '5']
const letterSpacingValues = ['0px', '0.5px', '1px', '2px']
const listStyleValues = ['circle', 'disc', 'square', 'decimal', 'lower-alpha', 'lower-roman', 'upper-alpha', 'upper-roman']
Quill.register({ 'formats/divider': Divider }, true)
Quill.register({ 'modules/table-better': QuillTableBetter }, true)
const strokeIcon = (paths, scale = 1) => {
    const offset = ((24 - 24 * scale) / 2).toFixed(2)
    const content = scale === 1 ? paths : `<g transform="translate(${offset} ${offset}) scale(${scale})">${paths}</g>`
    return `
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        ${content}
    </svg>
`
}
const path = d => `<path d="${d}"></path>`
const line = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"></line>`
const polyline = points => `<polyline points="${points}"></polyline>`
const circle = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}"></circle>`
const rect = (x, y, width, height, rx = 2) => `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}"></rect>`
const toolbarTips = {
    formatBrush: '格式刷',
    bold: '加粗',
    italic: '斜体',
    underline: '下划线',
    strike: '删除线',
    color: '文字颜色',
    background: '背景颜色',
    align: '对齐方式',
    size: '字号',
    firstLineIndent: '首行缩进',
    lineHeight: '行间距',
    letterSpacing: '字间距',
    'table-better': '插入表格',
    'list-style': '列表样式',
    blockquote: '引用',
    divider: '分隔线',
    'code-block': '代码块',
    link: '插入链接',
    image: '插入图片',
    clean: '清除格式'
}
const basicColors = [
    '#ffffff',
    '#fde2e2',
    '#f9d7a8',
    '#fbfbd0',
    '#c8ff00',
    '#64e6c6',
    '#9ec0f5',
    '#f49aca',
    '#ff6f9a',
    '#d9d9d9',
    '#ff9d9d',
    '#ffb487',
    '#ffff00',
    '#62e978',
    '#18d7dd',
    '#6fa0ec',
    '#d34ba5',
    '#ff4870',
    '#b7b7b7',
    '#d2a0a0',
    '#ff6824',
    '#ffd84f',
    '#00d415',
    '#1fbadd',
    '#147df3',
    '#b13ef0',
    '#ff3044',
    '#8f8f8f',
    '#884747',
    '#ff5a00',
    '#ffa500',
    '#3da548',
    '#42a9cb',
    '#0057ff',
    '#7650cf',
    '#df1f44',
    '#000000',
    '#990d00',
    '#ff4d45',
    '#d6ad3f',
    '#3c7b08',
    '#0e82a8',
    '#0b239c',
    '#8084b0',
    '#b21c4b'
]
const listStyles = [
    { value: 'circle', label: '大圆圈', list: 'bullet', type: 'circle' },
    { value: 'disc', label: '小黑点', list: 'bullet', type: 'disc' },
    { value: 'square', label: '小方块', list: 'bullet', type: 'square' },
    { value: 'decimal', label: '1,2,3...', list: 'ordered', type: 'decimal' },
    { value: 'lower-alpha', label: 'a,b,c...', list: 'ordered', type: 'lower-alpha' },
    { value: 'lower-roman', label: 'i,ii,iii...', list: 'ordered', type: 'lower-roman' },
    { value: 'upper-alpha', label: 'A,B,C...', list: 'ordered', type: 'upper-alpha' },
    { value: 'upper-roman', label: 'I,II,III...', list: 'ordered', type: 'upper-roman' }
]

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
const normalizeHex = value => {
    const color = String(value || '').trim()
    const match = color.match(/^#?([0-9a-f]{6})$/i)
    return match ? `#${match[1].toLowerCase()}` : ''
}
const hsvToHex = (hue, saturation, value) => {
    const s = saturation / 100
    const v = value / 100
    const c = v * s
    const x = c * (1 - Math.abs(((hue / 60) % 2) - 1))
    const m = v - c
    const ranges = [
        [c, x, 0],
        [x, c, 0],
        [0, c, x],
        [0, x, c],
        [x, 0, c],
        [c, 0, x]
    ]
    const [r, g, b] = ranges[Math.floor(hue / 60) % 6].map(channel => Math.round((channel + m) * 255))
    return `#${[r, g, b].map(channel => channel.toString(16).padStart(2, '0')).join('')}`
}
const hexToHsv = value => {
    const color = normalizeHex(value) || '#ff0000'
    const r = parseInt(color.slice(1, 3), 16) / 255
    const g = parseInt(color.slice(3, 5), 16) / 255
    const b = parseInt(color.slice(5, 7), 16) / 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const delta = max - min
    let hue = 0
    if (delta) {
        if (max === r) hue = ((g - b) / delta) % 6
        if (max === g) hue = (b - r) / delta + 2
        if (max === b) hue = (r - g) / delta + 4
        hue = Math.round(hue * 60)
        if (hue < 0) hue += 360
    }
    return {
        hue,
        saturation: max ? Math.round((delta / max) * 100) : 0,
        value: Math.round(max * 100)
    }
}

Object.assign(icons, {
    formatBrush: strokeIcon(`${path('M7 5.5h9.5v5H7z')}${path('M9 10.5v3.2a2 2 0 0 0 2 2h1')}${path('M13.5 15.7h3v3.8h-3z')}${line(8.5, 7.8, 15, 7.8)}`),
    bold: strokeIcon(`${path('M8 6h5.7a3.2 3.2 0 0 1 0 6.4H8z')}${path('M8 12.4h6.4a3.2 3.2 0 0 1 0 6.4H8z')}${line(8, 6, 8, 18.8)}`),
    italic: strokeIcon(`${line(10.5, 6, 17, 6)}${line(7, 18, 13.5, 18)}${line(14, 6, 10, 18)}`),
    underline: strokeIcon(`${path('M7.5 6v5.5a4.5 4.5 0 0 0 9 0V6')}${line(7, 19, 17, 19)}`),
    strike: strokeIcon(`${line(5.5, 12, 18.5, 12)}${path('M15.8 7A4.6 4.6 0 0 0 12.4 6H11a2.7 2.7 0 0 0-2 4.6')}${path('M8.2 17A5 5 0 0 0 12 18.4h1.1a2.7 2.7 0 0 0 2-4.6')}`),
    color: strokeIcon(`${path('M12 5.5l5 13')}${path('M7 18.5l5-13')}${line(8.8, 14.5, 15.2, 14.5)}`),
    background: strokeIcon(`${path('M5.5 14l6.5-6.5 5 5-6.5 6.5h-5z')}${line(13.8, 8.8, 17.3, 5.3)}${line(16, 18.5, 19, 18.5)}`),
    firstLineIndent: strokeIcon(`${line(6, 7, 18.5, 7)}${line(10, 11, 18.5, 11)}${line(6, 15, 18.5, 15)}${polyline('6 10 8.5 12.5 6 15')}`),
    'table-better': strokeIcon(`${rect(5, 5.5, 14, 13, 1.5)}${line(5, 10, 19, 10)}${line(5, 14, 19, 14)}${line(9.7, 5.5, 9.7, 18.5)}${line(14.3, 5.5, 14.3, 18.5)}`),
    blockquote: strokeIcon(`${path('M8.2 9.2H6a3.5 3.5 0 0 0 3.5 3.5v4H6v-4a6 6 0 0 1 2.2-4.8z')}${path('M17.2 9.2H15a3.5 3.5 0 0 0 3.5 3.5v4H15v-4a6 6 0 0 1 2.2-4.8z')}`),
    divider: strokeIcon(`${line(5, 12, 19, 12)}${line(8, 8, 16, 8)}${line(8, 16, 16, 16)}`),
    'code-block': strokeIcon(`${polyline('9 8 5 12 9 16')}${polyline('15 8 19 12 15 16')}${line(13, 6, 11, 18)}`),
    link: strokeIcon(`${path('M10 13a4.4 4.4 0 0 0 6.2.2l1.8-1.8a4.4 4.4 0 0 0-6.2-6.2l-1 1')}${path('M14 11a4.4 4.4 0 0 0-6.2-.2L6 12.6a4.4 4.4 0 0 0 6.2 6.2l1-1')}`),
    image: strokeIcon(`${rect(5, 6, 14, 12, 2)}${circle(9, 10, 1.3)}${polyline('19 15 15.5 11.5 7 18')}`),
    clean: strokeIcon(`${path('M7.5 19h9')}${path('M8.5 14.5L6 12l6-6 4.5 4.5-6 6z')}${path('M13 7.5l4.5 4.5')}`),
    'list-style': strokeIcon(`${circle(6, 7, 0.9)}${circle(6, 12, 0.9)}${circle(6, 17, 0.9)}${line(10, 7, 18.5, 7)}${line(10, 12, 18.5, 12)}${line(10, 17, 18.5, 17)}`)
})
icons.align = {
    '': strokeIcon(`${line(5.5, 6.5, 18.5, 6.5)}${line(5.5, 10.2, 15, 10.2)}${line(5.5, 13.8, 18.5, 13.8)}${line(5.5, 17.5, 15, 17.5)}`),
    center: strokeIcon(`${line(5.5, 6.5, 18.5, 6.5)}${line(8, 10.2, 16, 10.2)}${line(5.5, 13.8, 18.5, 13.8)}${line(8, 17.5, 16, 17.5)}`),
    right: strokeIcon(`${line(5.5, 6.5, 18.5, 6.5)}${line(9, 10.2, 18.5, 10.2)}${line(5.5, 13.8, 18.5, 13.8)}${line(9, 17.5, 18.5, 17.5)}`),
    justify: strokeIcon(`${line(5.5, 6.5, 18.5, 6.5)}${line(5.5, 10.2, 18.5, 10.2)}${line(5.5, 13.8, 18.5, 13.8)}${line(5.5, 17.5, 18.5, 17.5)}`)
}

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
            updating: false,
            basicColors,
            listStyles,
            recentTextColors: ['none', '#000000'],
            recentBackgroundColors: ['none', '#ffff00'],
            colorPickerVisible: false,
            listPickerVisible: false,
            colorPickerTab: 'basic',
            activeColorFormat: 'color',
            selectedTextColor: '#ff0000',
            selectedLineHeight: '1.6',
            selectedLetterSpacing: '0px',
            formatBrushActive: false,
            formatBrushFormats: null,
            applyingFormatBrush: false,
            appliedTextColor: '#000000',
            appliedBackgroundColor: '#ffff00',
            savedTextColorRange: null,
            dragColorType: '',
            colorPickerStyle: {
                left: '0px',
                top: '0px'
            },
            listPickerStyle: {
                left: '0px',
                top: '0px'
            },
            colorSv: {
                hue: 0,
                saturation: 100,
                value: 100
            }
        }
    },
    computed: {
        currentRecentColors() {
            return this.activeColorFormat === 'background' ? this.recentBackgroundColors : this.recentTextColors
        },
        hueColor() {
            return hsvToHex(this.colorSv.hue, 100, 100)
        }
    },
    mounted() {
        this.initEditor()
        document.addEventListener('mousedown', this.closeFloatingPanels)
    },
    beforeDestroy() {
        document.removeEventListener('mousedown', this.closeFloatingPanels)
        document.removeEventListener('mousemove', this.dragTextColorPicker)
        document.removeEventListener('mouseup', this.stopDragTextColorPicker)
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
                                  ['clean', 'formatBrush', { size: fontSizes }, 'bold', 'italic', 'underline', 'strike'],
                                  [{ color: [] }, { background: [] }],
                                  [{ align: [] }, 'firstLineIndent', { lineHeight: lineHeightValues }, { letterSpacing: letterSpacingValues }, 'list-style'],
                                  ['table-better', 'blockquote', 'divider', 'code-block'],
                                  ['link', 'image']
                              ],
                              handlers: {
                                  image: () => this.selectImage(),
                                  formatBrush: () => this.toggleFormatBrush(),
                                  firstLineIndent: () => this.toggleFirstLineIndent(),
                                  lineHeight: value => {
                                      this.applyLineHeight(value)
                                  },
                                  letterSpacing: value => {
                                      this.applyLetterSpacing(value)
                                  },
                                  divider: () => {
                                      this.insertDivider()
                                  }
                              }
                          }
                        : false,
                    table: false,
                    'table-better': this.enable
                        ? {
                              language: 'zh_CN',
                              menus: ['column', 'row', 'merge', 'table', 'cell', 'wrap', 'copy', 'delete'],
                              toolbarTable: true
                          }
                        : false,
                    keyboard: this.enable
                        ? {
                              bindings: QuillTableBetter.keyboardBindings
                          }
                        : undefined
                }
            })
            this.setToolbarTips()
            this.setDefaultSize()
            this.setDefaultLineHeight()
            this.setLineHeightPicker()
            this.setDefaultLetterSpacing()
            this.setLetterSpacingPicker()
            this.setColorPickers()
            this.setListStylePicker()
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
            this.quill.on('selection-change', range => {
                if (!range) return
                this.updateColorLabel('color', this.getCurrentColor('color'))
                this.updateColorLabel('background', this.getCurrentColor('background'))
                const formats = this.quill.getFormat(range)
                this.updateLineHeightPicker(formats.lineHeight || this.selectedLineHeight || '1.6')
                this.updateLetterSpacingPicker(formats.letterSpacing || this.selectedLetterSpacing || '0px')
                this.applyPendingFormatBrush(range)
            })
            this.$emit('html-change', this.quill.getSemanticHTML())
        },
        setToolbarTips() {
            const toolbar = this.$el.querySelector('.ql-toolbar')
            if (!toolbar) return
            Object.keys(toolbarTips).forEach(format => {
                const tip = toolbarTips[format]
                toolbar.querySelectorAll(`.ql-${format}`).forEach(item => {
                    const value = item.value || item.getAttribute('data-value') || ''
                    const title = typeof tip === 'object' ? tip[value] : tip
                    if (!title) return
                    item.setAttribute('title', title)
                    item.setAttribute('data-tooltip', title)
                    const pickerLabel = item.querySelector('.ql-picker-label')
                    if (pickerLabel) {
                        pickerLabel.setAttribute('title', title)
                        pickerLabel.setAttribute('data-tooltip', title)
                    }
                })
            })
        },
        setDefaultSize() {
            const toolbar = this.$el.querySelector('.ql-toolbar')
            const sizeSelect = toolbar && toolbar.querySelector('select.ql-size')
            const sizePicker = toolbar && toolbar.querySelector('.ql-picker.ql-size')
            if (!sizeSelect || !sizePicker) return
            const options = Array.from(sizeSelect.options)
            const defaultIndex = options.findIndex(option => option.value === '17px')
            if (defaultIndex === -1) return
            options.forEach(option => option.removeAttribute('selected'))
            options[defaultIndex].setAttribute('selected', 'selected')
            sizeSelect.selectedIndex = defaultIndex
            const label = sizePicker.querySelector('.ql-picker-label')
            const items = Array.from(sizePicker.querySelectorAll('.ql-picker-item'))
            items.forEach(item => item.classList.remove('ql-selected'))
            const defaultItem = items.find(item => item.getAttribute('data-value') === '17px')
            if (defaultItem) defaultItem.classList.add('ql-selected')
            if (label) label.setAttribute('data-value', '17px')
        },
        setDefaultLineHeight() {
            this.updateLineHeightPicker('1.6')
        },
        setLineHeightPicker() {
            const toolbar = this.$el.querySelector('.ql-toolbar')
            const lineHeightPicker = toolbar && toolbar.querySelector('.ql-picker.ql-lineHeight')
            if (!lineHeightPicker) return
            const syncSelected = () => {
                setTimeout(() => {
                    this.updateLineHeightPicker(this.selectedLineHeight || '1.6')
                }, 0)
            }
            const label = lineHeightPicker.querySelector('.ql-picker-label')
            if (label) {
                label.addEventListener('mousedown', syncSelected)
                label.addEventListener('click', syncSelected)
            }
            lineHeightPicker.querySelectorAll('.ql-picker-item').forEach(item => {
                item.addEventListener('mousedown', event => {
                    event.preventDefault()
                    event.stopPropagation()
                    const value = item.getAttribute('data-value') || '1.6'
                    this.applyLineHeight(value)
                })
                item.addEventListener('click', event => {
                    event.preventDefault()
                    event.stopPropagation()
                    setTimeout(() => {
                        syncSelected()
                        this.closeLineHeightPicker()
                    }, 0)
                })
            })
        },
        closeLineHeightPicker() {
            const toolbar = this.$el.querySelector('.ql-toolbar')
            const lineHeightPicker = toolbar && toolbar.querySelector('.ql-picker.ql-lineHeight')
            if (!lineHeightPicker) return
            lineHeightPicker.classList.remove('ql-expanded')
            const label = lineHeightPicker.querySelector('.ql-picker-label')
            if (label) label.setAttribute('aria-expanded', 'false')
        },
        updateLineHeightPicker(value) {
            const lineHeight = lineHeightValues.includes(value) ? value : '1.6'
            const toolbar = this.$el.querySelector('.ql-toolbar')
            const lineHeightSelect = toolbar && toolbar.querySelector('select.ql-lineHeight')
            const lineHeightPicker = toolbar && toolbar.querySelector('.ql-picker.ql-lineHeight')
            if (lineHeightSelect) {
                lineHeightSelect.value = lineHeight
                Array.from(lineHeightSelect.options).forEach(option => {
                    option.selected = option.value === lineHeight
                })
            }
            if (!lineHeightPicker) return
            const label = lineHeightPicker.querySelector('.ql-picker-label')
            const items = Array.from(lineHeightPicker.querySelectorAll('.ql-picker-item'))
            if (label) label.setAttribute('data-value', lineHeight)
            items.forEach(item => {
                item.classList.toggle('ql-selected', item.getAttribute('data-value') === lineHeight)
            })
        },
        applyLineHeight(value) {
            const lineHeight = lineHeightValues.includes(value) ? value : '1.6'
            const range = this.quill.getSelection(true)
            this.selectedLineHeight = lineHeight
            if (range) {
                this.quill.formatLine(range.index, range.length || 1, 'lineHeight', lineHeight, 'user')
                this.quill.setSelection(range.index, range.length, 'silent')
            }
            this.$nextTick(() => {
                this.updateLineHeightPicker(lineHeight)
                this.closeLineHeightPicker()
            })
            setTimeout(() => {
                this.updateLineHeightPicker(lineHeight)
                this.closeLineHeightPicker()
            }, 0)
        },
        setDefaultLetterSpacing() {
            const toolbar = this.$el.querySelector('.ql-toolbar')
            const spacingSelect = toolbar && toolbar.querySelector('select.ql-letterSpacing')
            const spacingPicker = toolbar && toolbar.querySelector('.ql-picker.ql-letterSpacing')
            if (!spacingSelect || !spacingPicker) return
            const options = Array.from(spacingSelect.options)
            const defaultIndex = options.findIndex(option => option.value === '0px')
            if (defaultIndex === -1) return
            options.forEach(option => option.removeAttribute('selected'))
            options[defaultIndex].setAttribute('selected', 'selected')
            spacingSelect.selectedIndex = defaultIndex
            const label = spacingPicker.querySelector('.ql-picker-label')
            const items = Array.from(spacingPicker.querySelectorAll('.ql-picker-item'))
            items.forEach(item => item.classList.remove('ql-selected'))
            const defaultItem = items.find(item => item.getAttribute('data-value') === '0px')
            if (defaultItem) defaultItem.classList.add('ql-selected')
            if (label) label.setAttribute('data-value', '0px')
        },
        setLetterSpacingPicker() {
            const toolbar = this.$el.querySelector('.ql-toolbar')
            const spacingPicker = toolbar && toolbar.querySelector('.ql-picker.ql-letterSpacing')
            if (!spacingPicker) return
            const syncSelected = () => {
                setTimeout(() => {
                    this.updateLetterSpacingPicker(this.selectedLetterSpacing || '0px')
                }, 0)
            }
            const label = spacingPicker.querySelector('.ql-picker-label')
            if (label) {
                label.addEventListener('mousedown', syncSelected)
                label.addEventListener('click', syncSelected)
            }
            spacingPicker.querySelectorAll('.ql-picker-item').forEach(item => {
                item.addEventListener('mousedown', event => {
                    event.preventDefault()
                    event.stopPropagation()
                    const value = item.getAttribute('data-value') || '0px'
                    this.applyLetterSpacing(value)
                })
                item.addEventListener('click', event => {
                    event.preventDefault()
                    event.stopPropagation()
                    setTimeout(() => {
                        syncSelected()
                        this.closeLetterSpacingPicker()
                    }, 0)
                })
            })
        },
        closeLetterSpacingPicker() {
            const toolbar = this.$el.querySelector('.ql-toolbar')
            const spacingPicker = toolbar && toolbar.querySelector('.ql-picker.ql-letterSpacing')
            if (!spacingPicker) return
            spacingPicker.classList.remove('ql-expanded')
            const label = spacingPicker.querySelector('.ql-picker-label')
            if (label) label.setAttribute('aria-expanded', 'false')
        },
        updateLetterSpacingPicker(value) {
            const spacing = letterSpacingValues.includes(value) ? value : '0px'
            const toolbar = this.$el.querySelector('.ql-toolbar')
            const spacingSelect = toolbar && toolbar.querySelector('select.ql-letterSpacing')
            const spacingPicker = toolbar && toolbar.querySelector('.ql-picker.ql-letterSpacing')
            if (spacingSelect) {
                spacingSelect.value = spacing
                Array.from(spacingSelect.options).forEach(option => {
                    option.selected = option.value === spacing
                })
            }
            if (!spacingPicker) return
            const label = spacingPicker.querySelector('.ql-picker-label')
            const items = Array.from(spacingPicker.querySelectorAll('.ql-picker-item'))
            if (label) label.setAttribute('data-value', spacing)
            items.forEach(item => {
                item.classList.toggle('ql-selected', item.getAttribute('data-value') === spacing)
            })
        },
        applyLetterSpacing(value) {
            const spacing = letterSpacingValues.includes(value) ? value : '0px'
            const formatValue = spacing === '0px' ? false : spacing
            this.selectedLetterSpacing = spacing
            const range = this.quill.getSelection(true)
            if (range && range.length > 0) {
                this.quill.formatText(range.index, range.length, 'letterSpacing', formatValue, 'user')
                this.quill.setSelection(range.index, range.length, 'silent')
            } else {
                this.quill.format('letterSpacing', formatValue, 'user')
            }
            this.$nextTick(() => {
                this.updateLetterSpacingPicker(spacing)
                this.closeLetterSpacingPicker()
            })
            setTimeout(() => {
                this.updateLetterSpacingPicker(spacing)
                this.closeLetterSpacingPicker()
            }, 0)
        },
        toggleFormatBrush() {
            const range = this.quill.getSelection(true)
            if (!range) return
            this.formatBrushFormats = this.quill.getFormat(range)
            this.formatBrushActive = !!this.formatBrushFormats
            this.updateFormatBrushButton()
        },
        updateFormatBrushButton() {
            const toolbar = this.$el.querySelector('.ql-toolbar')
            const button = toolbar && toolbar.querySelector('button.ql-formatBrush')
            if (button) button.classList.toggle('ql-active', this.formatBrushActive)
        },
        applyPendingFormatBrush(range) {
            if (!this.formatBrushActive || this.applyingFormatBrush || !range || range.length === 0) return
            this.applyingFormatBrush = true
            const formats = this.formatBrushFormats || {}
            const lineFormats = ['align', 'lineHeight', 'firstLineIndent', 'list', 'listStyle']
            Object.keys(formats).forEach(format => {
                if (lineFormats.includes(format)) {
                    this.quill.formatLine(range.index, range.length, format, formats[format], 'user')
                } else {
                    this.quill.formatText(range.index, range.length, format, formats[format], 'user')
                }
            })
            this.quill.setSelection(range.index, range.length, 'silent')
            this.formatBrushActive = false
            this.formatBrushFormats = null
            this.updateFormatBrushButton()
            this.$nextTick(() => {
                this.applyingFormatBrush = false
            })
        },
        toggleFirstLineIndent() {
            const range = this.quill.getSelection(true)
            const formats = range ? this.quill.getFormat(range) : {}
            if (!range) return
            this.quill.formatLine(range.index, range.length || 1, 'firstLineIndent', formats.firstLineIndent ? false : '2em', 'user')
            this.quill.setSelection(range.index, range.length, 'silent')
        },
        insertDivider() {
            const range = this.quill.getSelection(true)
            const index = range ? range.index : this.quill.getLength()
            this.quill.insertEmbed(index, 'divider', true, 'user')
            this.quill.insertText(index + 1, '\n', 'user')
            this.quill.setSelection(index + 2, 0, 'silent')
        },
        setColorPickers() {
            this.setColorPicker('color')
            this.setColorPicker('background')
        },
        setColorPicker(format) {
            const toolbar = this.$el.querySelector('.ql-toolbar')
            const colorPicker = toolbar && toolbar.querySelector(`.ql-picker.ql-${format}`)
            if (!colorPicker) return
            const label = colorPicker.querySelector('.ql-picker-label')
            const options = colorPicker.querySelector('.ql-picker-options')
            if (options) options.style.display = 'none'
            if (label) {
                if (!label.querySelector('.text-color-label-bar')) {
                    const bar = document.createElement('span')
                    bar.className = 'text-color-label-bar'
                    label.appendChild(bar)
                }
                this.updateColorLabel(format, this.getAppliedColor(format))
                const openPanel = event => {
                    event.preventDefault()
                    event.stopPropagation()
                    this.openTextColorPicker(label, format)
                }
                const preventDefaultPicker = event => {
                    event.preventDefault()
                    event.stopPropagation()
                }
                label.addEventListener('mousedown', openPanel)
                label.addEventListener('click', preventDefaultPicker)
            }
        },
        setListStylePicker() {
            const toolbar = this.$el.querySelector('.ql-toolbar')
            const button = toolbar && toolbar.querySelector('button.ql-list-style')
            if (!button) return
            button.addEventListener('mousedown', event => {
                event.preventDefault()
                event.stopPropagation()
                this.openListStylePicker(button)
            })
            button.addEventListener('click', event => {
                event.preventDefault()
                event.stopPropagation()
            })
        },
        openListStylePicker(button) {
            const rootRect = this.$el.getBoundingClientRect()
            const buttonRect = button.getBoundingClientRect()
            this.savedTextColorRange = this.quill.getSelection(true)
            this.colorPickerVisible = false
            this.listPickerStyle = {
                left: `${buttonRect.left - rootRect.left}px`,
                top: `${buttonRect.bottom - rootRect.top + 8}px`
            }
            this.listPickerVisible = true
        },
        openTextColorPicker(label, format) {
            const rootRect = this.$el.getBoundingClientRect()
            const labelRect = label.getBoundingClientRect()
            this.activeColorFormat = format
            const currentColor = this.getCurrentColor(format)
            this.selectedTextColor = currentColor
            this.colorSv = hexToHsv(currentColor)
            this.savedTextColorRange = this.quill.getSelection(true)
            this.colorPickerStyle = {
                left: `${labelRect.left - rootRect.left}px`,
                top: `${labelRect.bottom - rootRect.top + 8}px`
            }
            this.colorPickerVisible = true
        },
        closeFloatingPanels() {
            this.colorPickerVisible = false
            this.listPickerVisible = false
        },
        getAppliedColor(format) {
            return format === 'background' ? this.appliedBackgroundColor : this.appliedTextColor
        },
        getCurrentColor(colorFormat) {
            if (!this.quill) return this.getAppliedColor(colorFormat)
            const range = this.quill.getSelection()
            const formats = range ? this.quill.getFormat(range) : {}
            return normalizeHex(formats[colorFormat]) || this.getAppliedColor(colorFormat)
        },
        selectTextColor(color) {
            if (color === 'none') {
                this.selectedTextColor = ''
                return
            }
            const normalized = normalizeHex(color)
            if (!normalized) return
            this.selectedTextColor = normalized
            this.colorSv = hexToHsv(normalized)
        },
        syncTextColorFromInput() {
            const normalized = normalizeHex(this.selectedTextColor)
            if (!normalized) return
            this.selectedTextColor = normalized
            this.colorSv = hexToHsv(normalized)
        },
        pickTextColorBySv(event) {
            this.dragColorType = 'sv'
            this.updateTextColorByPointer(event.currentTarget, event.clientX, event.clientY)
            document.addEventListener('mousemove', this.dragTextColorPicker)
            document.addEventListener('mouseup', this.stopDragTextColorPicker)
        },
        pickTextColorByHue(event) {
            this.dragColorType = 'hue'
            this.updateTextColorByPointer(event.currentTarget, event.clientX, event.clientY)
            document.addEventListener('mousemove', this.dragTextColorPicker)
            document.addEventListener('mouseup', this.stopDragTextColorPicker)
        },
        dragTextColorPicker(event) {
            const selector = this.dragColorType === 'hue' ? '.text-color-hue' : '.text-color-sv'
            const target = this.$el.querySelector(selector)
            if (!target) return
            this.updateTextColorByPointer(target, event.clientX, event.clientY)
        },
        stopDragTextColorPicker() {
            this.dragColorType = ''
            document.removeEventListener('mousemove', this.dragTextColorPicker)
            document.removeEventListener('mouseup', this.stopDragTextColorPicker)
        },
        updateTextColorByPointer(target, clientX, clientY) {
            const rect = target.getBoundingClientRect()
            if (this.dragColorType === 'hue') {
                const ratio = clamp((clientY - rect.top) / rect.height, 0, 1)
                this.colorSv.hue = Math.round(ratio * 360)
            } else {
                this.colorSv.saturation = Math.round(clamp((clientX - rect.left) / rect.width, 0, 1) * 100)
                this.colorSv.value = Math.round((1 - clamp((clientY - rect.top) / rect.height, 0, 1)) * 100)
            }
            this.selectedTextColor = hsvToHex(this.colorSv.hue, this.colorSv.saturation, this.colorSv.value)
        },
        confirmTextColor() {
            const normalized = normalizeHex(this.selectedTextColor)
            if (this.selectedTextColor && !normalized) return
            if (!this.quill) return
            const range = this.savedTextColorRange || this.quill.getSelection(true)
            const format = this.activeColorFormat || 'color'
            this.quill.setSelection(range)
            this.quill.format(format, normalized || false, 'user')
            if (format === 'background') {
                this.appliedBackgroundColor = normalized || '#ffff00'
            } else {
                this.appliedTextColor = normalized || '#000000'
            }
            this.updateColorLabel(format, this.getAppliedColor(format))
            if (normalized) this.updateRecentColors(format, normalized)
            this.colorPickerVisible = false
        },
        updateColorLabel(format, color) {
            const normalized = normalizeHex(color) || '#000000'
            const toolbar = this.$el.querySelector('.ql-toolbar')
            const bar = toolbar && toolbar.querySelector(`.ql-picker.ql-${format} .text-color-label-bar`)
            if (bar) bar.style.backgroundColor = normalized
        },
        updateRecentColors(format, color) {
            const normalized = normalizeHex(color)
            if (!normalized) return
            const key = format === 'background' ? 'recentBackgroundColors' : 'recentTextColors'
            this[key] = [
                'none',
                normalized,
                ...this[key].filter(item => item !== 'none' && item.toLowerCase() !== normalized)
            ].slice(0, 9)
        },
        applyListStyle(item) {
            if (!this.quill) return
            const range = this.savedTextColorRange || this.quill.getSelection(true)
            this.quill.setSelection(range)
            this.quill.format('list', item.list, 'user')
            this.quill.format('listStyle', item.value, 'user')
            this.listPickerVisible = false
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
    position: relative;
    background: #ffffff;
}

.text-color-panel {
    position: absolute;
    z-index: 30;
    box-sizing: border-box;
    width: 240px;
    padding: 10px;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    background: #ffffff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.text-color-panel * {
    box-sizing: border-box;
}

.list-style-panel {
    position: absolute;
    z-index: 30;
    box-sizing: border-box;
    width: 90px;
    padding: 6px 0;
    border: 1px solid #ebeef5;
    border-radius: 6px;
    background: #ffffff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.list-style-option {
    display: flex;
    align-items: center;
    width: 100%;
    height: 30px;
    padding: 0 8px;
    border: none;
    background: transparent;
    color: #303133;
    cursor: pointer;
}

.list-style-option:hover {
    background: #ecf5ff;
    color: #409eff;
}

.list-style-option span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 18px;
    width: 18px;
    height: 18px;
    margin-right: 6px;
    color: currentColor;
    font-size: 14px;
    line-height: 1;
}

.list-style-option em {
    color: currentColor;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 1;
    white-space: nowrap;
}

.list-style-option.circle span::before {
    content: '';
    width: 12px;
    height: 12px;
    border: 1.5px solid currentColor;
    border-radius: 50%;
}

.list-style-option.disc span::before {
    content: '';
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: currentColor;
}

.list-style-option.square span::before {
    content: '';
    width: 12px;
    height: 12px;
    background: currentColor;
}

.list-style-option.decimal span::before {
    content: none;
}

.list-style-option.lower-alpha span::before {
    content: none;
}

.list-style-option.lower-roman span::before {
    content: none;
}

.list-style-option.upper-alpha span::before {
    content: none;
}

.list-style-option.upper-roman span::before {
    content: none;
}

.list-style-option.decimal span,
.list-style-option.lower-alpha span,
.list-style-option.lower-roman span,
.list-style-option.upper-alpha span,
.list-style-option.upper-roman span {
    display: none;
}

.list-style-option.decimal em,
.list-style-option.lower-alpha em,
.list-style-option.lower-roman em,
.list-style-option.upper-alpha em,
.list-style-option.upper-roman em {
    margin-left: 0;
}

.text-color-recent {
    margin-bottom: 12px;
}

.text-color-section-title {
    margin-bottom: 8px;
    color: #909399;
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
}

.text-color-recent-list {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 22px;
}

.text-color-recent-item {
    position: relative;
    width: 22px;
    height: 22px;
    padding: 0;
    border: 2px solid #dcdfe6;
    border-radius: 0;
    background: #ffffff;
    cursor: pointer;
}

.text-color-recent-item.none::after,
.text-color-preview.none::after {
    content: '';
    position: absolute;
    left: 50%;
    top: -3px;
    width: 2px;
    height: calc(100% + 6px);
    background: #ff8f8f;
    transform: rotate(45deg);
    transform-origin: center;
}

.text-color-recent-item.active,
.text-color-recent-item:hover {
    border-color: #409eff;
}

.text-color-tabs {
    display: flex;
    align-items: center;
    height: 28px;
    margin-bottom: 8px;
}

.text-color-tabs button {
    padding: 0;
    border: none;
    background: transparent;
    color: #c0c4cc;
    font-size: 14px;
    font-weight: 400;
    line-height: 28px;
    cursor: pointer;
}

.text-color-tabs button.active {
    color: #909399;
}

.text-color-tabs span {
    width: 1px;
    height: 20px;
    margin: 0 12px;
    background: #dcdfe6;
}

.text-color-basic {
    display: grid;
    grid-template-columns: repeat(9, 20px);
    gap: 4px;
    padding-bottom: 18px;
    border-bottom: 1px dotted #dcdfe6;
}

.text-color-basic button {
    width: 20px;
    height: 20px;
    padding: 0;
    border: 2px solid #dcdfe6;
    border-radius: 0;
    cursor: pointer;
}

.text-color-basic button.active,
.text-color-basic button:hover {
    border-color: #409eff;
}

.text-color-more {
    display: flex;
    gap: 8px;
    padding-bottom: 18px;
    border-bottom: 1px dotted #dcdfe6;
}

.text-color-sv {
    position: relative;
    width: 184px;
    height: 150px;
    cursor: crosshair;
}

.text-color-sv::before,
.text-color-sv::after {
    content: '';
    position: absolute;
    inset: 0;
}

.text-color-sv::before {
    background: linear-gradient(to right, #ffffff, rgba(255, 255, 255, 0));
}

.text-color-sv::after {
    background: linear-gradient(to top, #000000, rgba(0, 0, 0, 0));
}

.text-color-sv span {
    position: absolute;
    z-index: 1;
    width: 10px;
    height: 10px;
    border: 2px solid #ffffff;
    border-radius: 50%;
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.6);
    transform: translate(-50%, -50%);
}

.text-color-hue {
    position: relative;
    width: 24px;
    height: 150px;
    border-radius: 2px;
    background: linear-gradient(to bottom, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000);
    cursor: pointer;
}

.text-color-hue span {
    position: absolute;
    left: -3px;
    width: 30px;
    height: 4px;
    border: 1px solid #ffffff;
    border-radius: 2px;
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.4);
    transform: translateY(-50%);
}

.text-color-footer {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-top: 18px;
}

.text-color-preview {
    position: relative;
    width: 30px;
    height: 30px;
    border: 1px solid #dcdfe6;
    background: #ffffff;
    overflow: hidden;
}

.text-color-footer input {
    width: 100px;
    height: 32px;
    padding: 0 8px;
    border: 1px solid #dcdfe6;
    color: #303133;
    font-size: 14px;
    line-height: 32px;
    outline: none;
}

.text-color-footer input:focus {
    border-color: #409eff;
}

.text-color-footer .el-button {
    width: 70px;
    height: 34px;
    padding: 0;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 700;
}

.quill-editor /deep/ .ql-toolbar.ql-snow {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    padding: 10px 12px;
    border-color: #dcdfe6;
    border-radius: 4px 4px 0 0;
    background: #fafbfc;
    overflow: visible;
}

.quill-editor /deep/ .ql-toolbar.ql-snow .ql-formats {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 34px;
    margin: 0;
}

.quill-editor /deep/ .ql-toolbar.ql-snow .ql-formats:first-child {
    gap: 4px;
}

.quill-editor /deep/ .ql-snow.ql-toolbar button,
.quill-editor /deep/ .ql-snow .ql-toolbar button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    padding: 6px;
    float: none;
    border-radius: 4px;
    color: #606266;
    line-height: 1;
    overflow: visible;
    position: relative;
}

.quill-editor /deep/ .ql-snow.ql-toolbar button:hover,
.quill-editor /deep/ .ql-snow .ql-toolbar button:hover,
.quill-editor /deep/ .ql-snow.ql-toolbar button.ql-active,
.quill-editor /deep/ .ql-snow .ql-toolbar button.ql-active,
.quill-editor /deep/ .ql-snow .ql-picker-label:hover,
.quill-editor /deep/ .ql-snow .ql-picker-label.ql-active {
    background: #ecf5ff;
    color: #409eff;
}

.quill-editor /deep/ .ql-snow .ql-stroke {
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
}

.quill-editor /deep/ .ql-snow .ql-fill {
    fill: currentColor;
}

.quill-editor /deep/ .ql-snow.ql-toolbar button svg,
.quill-editor /deep/ .ql-snow .ql-toolbar button svg,
.quill-editor /deep/ .ql-snow .ql-picker-label svg {
    position: static;
    display: block;
    width: 22px;
    height: 22px;
    margin: 0;
}

.quill-editor /deep/ .ql-snow .ql-picker {
    display: inline-flex;
    align-items: center;
    height: 34px;
    float: none;
    color: #606266;
    line-height: 1;
    overflow: visible;
    vertical-align: middle;
}

.quill-editor /deep/ .ql-snow .ql-picker-label {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 34px;
    padding: 0 8px;
    border-radius: 4px;
    line-height: 34px;
    overflow: visible;
    position: relative;
}

.quill-editor /deep/ .ql-toolbar button[data-tooltip]:hover::after,
.quill-editor /deep/ .ql-toolbar .ql-picker-label[data-tooltip]:hover::after {
    content: attr(data-tooltip);
    position: absolute;
    left: 50%;
    bottom: calc(100% + 8px);
    z-index: 20;
    min-width: max-content;
    padding: 5px 8px;
    border-radius: 4px;
    background: #303133;
    color: #ffffff;
    font-size: 12px;
    line-height: 1;
    pointer-events: none;
    transform: translateX(-50%);
    white-space: nowrap;
}

.quill-editor /deep/ .ql-toolbar button[data-tooltip]:hover::before {
    content: '';
    position: absolute;
    left: 50%;
    bottom: calc(100% + 3px);
    z-index: 20;
    width: 0;
    height: 0;
    border: 5px solid transparent;
    border-top-color: #303133;
    pointer-events: none;
    transform: translateX(-50%);
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-icon-picker,
.quill-editor /deep/ .ql-snow .ql-picker.ql-color-picker {
    width: 34px;
    height: 34px;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-icon-picker .ql-picker-label,
.quill-editor /deep/ .ql-snow .ql-picker.ql-color-picker .ql-picker-label {
    width: 34px;
    padding: 0;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-color .ql-picker-label .text-color-label-bar,
.quill-editor /deep/ .ql-snow .ql-picker.ql-background .ql-picker-label .text-color-label-bar {
    position: absolute;
    left: 7px;
    bottom: 5px;
    width: 20px;
    height: 4px;
    border-radius: 1px;
    background: #000000;
    pointer-events: none;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-color .ql-picker-label svg,
.quill-editor /deep/ .ql-snow .ql-picker.ql-background .ql-picker-label svg {
    margin-bottom: 5px;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-size .ql-picker-label,
.quill-editor /deep/ .ql-snow .ql-picker.ql-lineHeight .ql-picker-label,
.quill-editor /deep/ .ql-snow .ql-picker.ql-letterSpacing .ql-picker-label,
.quill-editor /deep/ .ql-snow .ql-picker.ql-align .ql-picker-label,
.quill-editor /deep/ .ql-snow .ql-picker.ql-color .ql-picker-label,
.quill-editor /deep/ .ql-snow .ql-picker.ql-background .ql-picker-label {
    border-radius: 8px;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-size .ql-picker-options,
.quill-editor /deep/ .ql-snow .ql-picker.ql-lineHeight .ql-picker-options,
.quill-editor /deep/ .ql-snow .ql-picker.ql-letterSpacing .ql-picker-options,
.quill-editor /deep/ .ql-snow .ql-picker.ql-align .ql-picker-options,
.quill-editor /deep/ .ql-snow .ql-picker.ql-color .ql-picker-options,
.quill-editor /deep/ .ql-snow .ql-picker.ql-background .ql-picker-options {
    border-radius: 8px;
    overflow: hidden;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-align {
    width: 34px;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-align .ql-picker-label {
    justify-content: center;
    width: 34px;
    padding: 0;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-align .ql-picker-options {
    min-width: 104px;
    padding: 4px 0;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-align .ql-picker-item {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 104px;
    height: 32px;
    padding: 0 8px;
    color: #606266;
    line-height: 1;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-align .ql-picker-item svg {
    width: 18px;
    height: 18px;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-align .ql-picker-item::after {
    color: currentColor;
    font-size: 12px;
    font-weight: 400;
    line-height: 1;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-align .ql-picker-item::after {
    content: '左对齐';
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-align .ql-picker-item[data-value='center']::after {
    content: '居中';
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-align .ql-picker-item[data-value='right']::after {
    content: '右对齐';
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-align .ql-picker-item[data-value='justify']::after {
    content: '两端对齐';
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-align .ql-picker-label:hover,
.quill-editor /deep/ .ql-snow .ql-picker.ql-align .ql-picker-label.ql-active,
.quill-editor /deep/ .ql-snow .ql-picker.ql-align .ql-picker-item:hover,
.quill-editor /deep/ .ql-snow .ql-picker.ql-align .ql-picker-item.ql-selected {
    color: #409eff;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-size {
    display: inline-flex;
    align-items: center;
    height: 34px;
    width: 64px;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-size .ql-picker-label {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    width: 64px;
    height: 34px;
    padding: 0 6px;
    color: #606266;
    font-size: 12px;
    font-weight: 400;
    line-height: 1;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-size .ql-picker-label::before {
    content: attr(data-value);
    display: inline-flex;
    align-items: center;
    height: 34px;
    color: currentColor;
    line-height: 1;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-size .ql-picker-label:not([data-value])::before {
    content: '17px';
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-size .ql-picker-item::before {
    content: attr(data-value);
    display: inline-flex;
    align-items: center;
    color: currentColor;
    line-height: 1;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-size .ql-picker-options {
    padding: 4px 0;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-size .ql-picker-item {
    display: flex;
    align-items: center;
    min-height: 32px;
    padding: 0 10px;
    color: #606266;
    font-weight: 400;
    line-height: 1;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-size .ql-picker-label:hover,
.quill-editor /deep/ .ql-snow .ql-picker.ql-size .ql-picker-label.ql-active,
.quill-editor /deep/ .ql-snow .ql-picker.ql-size .ql-picker-item:hover,
.quill-editor /deep/ .ql-snow .ql-picker.ql-size .ql-picker-item.ql-selected {
    color: #409eff;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='12px']::before {
    font-size: 12px;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='14px']::before {
    font-size: 14px;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='15px']::before {
    font-size: 15px;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='16px']::before {
    font-size: 16px;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='17px']::before {
    font-size: 17px;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='18px']::before {
    font-size: 18px;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='20px']::before {
    font-size: 20px;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='24px']::before {
    font-size: 24px;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-lineHeight {
    display: inline-flex;
    align-items: center;
    width: 34px;
    height: 34px;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-lineHeight .ql-picker-label {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    padding: 0;
    color: #606266;
    font-size: 12px;
    font-weight: 400;
    line-height: 1;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-lineHeight .ql-picker-label::before {
    content: 'LH';
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    color: currentColor;
    font-size: 13px;
    font-weight: 500;
    line-height: 1;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-lineHeight .ql-picker-label svg {
    display: none;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-lineHeight .ql-picker-options {
    min-width: 88px;
    padding: 4px 0;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-lineHeight .ql-picker-item {
    display: flex;
    align-items: center;
    height: 36px;
    padding: 0 16px;
    color: #606266;
    font-weight: 400;
    line-height: 1;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-lineHeight .ql-picker-item::before {
    content: attr(data-value);
    display: inline-flex;
    align-items: center;
    color: currentColor;
    font-size: 14px;
    font-weight: 400;
    line-height: 1;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-lineHeight .ql-picker-label:hover,
.quill-editor /deep/ .ql-snow .ql-picker.ql-lineHeight .ql-picker-label.ql-active,
.quill-editor /deep/ .ql-snow .ql-picker.ql-lineHeight .ql-picker-item:hover {
    color: #409eff;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-lineHeight .ql-picker-item.ql-selected {
    background: #ecf5ff !important;
    color: #409eff !important;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-letterSpacing {
    display: inline-flex;
    align-items: center;
    width: 34px;
    height: 34px;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-letterSpacing .ql-picker-label {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    padding: 0;
    color: #606266;
    font-size: 12px;
    font-weight: 400;
    line-height: 1;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-letterSpacing .ql-picker-item::before {
    content: attr(data-value);
    display: inline-flex;
    align-items: center;
    color: currentColor;
    font-size: 14px;
    font-weight: 400;
    line-height: 1;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-letterSpacing .ql-picker-label::before {
    content: 'AV';
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    color: currentColor;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 1px;
    line-height: 1;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-letterSpacing .ql-picker-label[data-value='0px']::before,
.quill-editor /deep/ .ql-snow .ql-picker.ql-letterSpacing .ql-picker-label:not([data-value])::before {
    content: 'AV';
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-letterSpacing .ql-picker-item[data-value='0px']::before {
    content: '0（默认）';
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-letterSpacing .ql-picker-item[data-value='0.5px']::before {
    content: '0.5';
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-letterSpacing .ql-picker-item[data-value='1px']::before {
    content: '1';
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-letterSpacing .ql-picker-item[data-value='2px']::before {
    content: '2';
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-letterSpacing .ql-picker-label svg {
    display: none;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-letterSpacing .ql-picker-options {
    min-width: 120px;
    padding: 4px 0;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-letterSpacing .ql-picker-item {
    display: flex;
    align-items: center;
    height: 40px;
    padding: 0 16px;
    color: #606266;
    font-weight: 400;
    line-height: 1;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-letterSpacing .ql-picker-label:hover,
.quill-editor /deep/ .ql-snow .ql-picker.ql-letterSpacing .ql-picker-label.ql-active,
.quill-editor /deep/ .ql-snow .ql-picker.ql-letterSpacing .ql-picker-item:hover {
    color: #409eff;
}

.quill-editor /deep/ .ql-snow .ql-picker.ql-letterSpacing .ql-picker-item.ql-selected {
    background: #ecf5ff !important;
    color: #409eff !important;
}

.quill-editor /deep/ .ql-container.ql-snow {
    border-color: #dcdfe6;
    border-radius: 0 0 4px 4px;
}

.quill-editor /deep/ .ql-editor {
    font-size: 17px;
    line-height: 1.6;
}

.quill-editor /deep/ .ql-editor hr {
    border: none;
    border-top: 1px solid #eeeeee;
    margin: 12px 0;
}

.quill-editor /deep/ .ql-editor ol,
.quill-editor /deep/ .ql-editor ul {
    padding-left: 0 !important;
}

.quill-editor /deep/ .ql-editor li[data-list],
.quill-editor /deep/ .ql-editor li[class*='ql-list-style-'] {
    padding-left: 1rem !important;
}

.quill-editor /deep/ .ql-editor li[data-list] > .ql-ui::before,
.quill-editor /deep/ .ql-editor li[class*='ql-list-style-'] > .ql-ui::before {
    width: 0.8em;
    margin-left: -1em !important;
    margin-right: 0 !important;
    text-align: center;
}

.quill-editor /deep/ .ql-editor li.ql-list-style-circle[data-list='bullet'] > .ql-ui::before {
    content: '○';
}

.quill-editor /deep/ .ql-editor li.ql-list-style-disc[data-list='bullet'] > .ql-ui::before {
    content: '●';
}

.quill-editor /deep/ .ql-editor li.ql-list-style-square[data-list='bullet'] > .ql-ui::before {
    content: '■';
}

.quill-editor /deep/ .ql-editor li.ql-list-style-decimal[data-list='ordered'] > .ql-ui::before {
    content: counter(list-0, decimal) '.';
}

.quill-editor /deep/ .ql-editor li.ql-list-style-lower-alpha[data-list='ordered'] > .ql-ui::before {
    content: counter(list-0, lower-alpha) '.';
}

.quill-editor /deep/ .ql-editor li.ql-list-style-lower-roman[data-list='ordered'] > .ql-ui::before {
    content: counter(list-0, lower-roman) '.';
}

.quill-editor /deep/ .ql-editor li.ql-list-style-upper-alpha[data-list='ordered'] > .ql-ui::before {
    content: counter(list-0, upper-alpha) '.';
}

.quill-editor /deep/ .ql-editor li.ql-list-style-upper-roman[data-list='ordered'] > .ql-ui::before {
    content: counter(list-0, upper-roman) '.';
}
</style>
