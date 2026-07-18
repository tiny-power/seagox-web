import Quill from 'quill'
import { ClassAttributor, Scope, StyleAttributor } from 'parchment'
const LineHeightClass = new ClassAttributor('lineHeight', 'ql-line-height', {
    scope: Scope.INLINE,
    whitelist: ['1', '1.5', '1.6', '1.75', '2', '3', '4', '5']
})
const LineHeightStyle = new StyleAttributor('lineHeight', 'ql-line-height', {
    scope: Scope.INLINE,
    whitelist: [1, 1.5, 1.6, 1.75, 2, 3, 4, 5]
})
Quill.register({ 'formats/lineHeight': LineHeightClass }, true)
Quill.register({ 'attributors/style/lineHeight': LineHeightStyle }, true)

let inline = Quill.import('blots/inline')
class LineHeight extends inline {
    static create(value) {
        const node = super.create(value)
        node.style.lineHeight = value
        node.style.display = 'inline-Block'
        return node
    }

    static formats(value) {
        return value.style.lineHeight
    }
}
LineHeight.blotName = 'line-height'
LineHeight.tagName = 'span'
LineHeight.className = 'line-height'
export default LineHeight
