import Quill from 'quill'
const BlockEmbed = Quill.import('blots/block/embed')
class Divider extends BlockEmbed {
    static create() {
        const node = super.create()
        node.setAttribute('style', 'border: 1px solid #eee; margin: 12px 0;')
        return node
    }
}
Divider.blotName = 'divider'
Divider.tagName = 'HR'
export default Divider
