import Quill from 'quill'
import { Scope, StyleAttributor } from 'parchment'

const FirstLineIndentStyle = new StyleAttributor('firstLineIndent', 'text-indent', {
    scope: Scope.BLOCK,
    whitelist: ['2em']
})

Quill.register(
    {
        'formats/firstLineIndent': FirstLineIndentStyle,
        'attributors/style/firstLineIndent': FirstLineIndentStyle
    },
    true
)

export default FirstLineIndentStyle
