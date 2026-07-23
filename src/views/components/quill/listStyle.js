import Quill from 'quill'
import { ClassAttributor, Scope } from 'parchment'

const ListStyleClass = new ClassAttributor('listStyle', 'ql-list-style', {
    scope: Scope.BLOCK,
    whitelist: ['circle', 'disc', 'square', 'decimal', 'lower-alpha', 'lower-roman', 'upper-alpha', 'upper-roman']
})

Quill.register({ 'formats/listStyle': ListStyleClass }, true)

export default ListStyleClass
