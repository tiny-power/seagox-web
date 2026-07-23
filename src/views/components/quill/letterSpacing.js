import Quill from 'quill'
import { Scope, StyleAttributor } from 'parchment'

const LetterSpacingStyle = new StyleAttributor('letterSpacing', 'letter-spacing', {
    scope: Scope.INLINE,
    whitelist: ['0px', '0.5px', '1px', '2px']
})

Quill.register({ 'attributors/style/letterSpacing': LetterSpacingStyle }, true)

export default LetterSpacingStyle
