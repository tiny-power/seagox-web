import Quill from 'quill'
import { Scope, StyleAttributor } from 'parchment'

const LineHeightStyle = new StyleAttributor('lineHeight', 'line-height', {
    scope: Scope.BLOCK,
    whitelist: ['1', '1.5', '1.6', '1.75', '2', '3', '4', '5']
})

Quill.register(
    {
        'formats/lineHeight': LineHeightStyle,
        'attributors/style/lineHeight': LineHeightStyle
    },
    true
)

export default LineHeightStyle
