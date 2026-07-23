import Quill from 'quill'

const SizeStyle = Quill.import('attributors/style/size')
SizeStyle.whitelist = ['12px', '14px', '15px', '16px', '17px', '18px', '20px', '24px']

Quill.register({ 'attributors/style/size': SizeStyle }, true)

export default SizeStyle
