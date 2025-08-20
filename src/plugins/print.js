function removeIEHeaderAndFooter() {
    const hkey_path = 'HKEY_CURRENT_USER\\Software\\Microsoft\\Internet Explorer\\PageSetup\\'
    try {
        const RegWsh = new ActiveXObject('WScript.Shell')
        RegWsh.RegWrite(`${hkey_path}header`, '')
        RegWsh.RegWrite(`${hkey_path}footer`, '')
    } catch (e) {
        alert(
            '“Internet选项”—>“安全”—>“本地Intranet”—>“自定义级别”—>“ActiveX控件和插件”—>“对未标记为可安全执行脚本的ActiveX控件初始化并执行脚本”—>“提示”—“确定”即可。'
        )
    }
}

function printPage(id, size, margin) {
    if (!size) {
        size = 'auto'
    }
    if (!margin) {
        margin = '0mm'
    }
    var ieFlag = false
    if (!!window.ActiveXObject || 'ActiveXObject' in window) {
        removeIEHeaderAndFooter()
        ieFlag = true
    }

    setTimeout(() => {
        // 判断iframe是否存在，不存在则创建iframe
        let iframe = document.getElementById('print-iframe')
        if (!iframe) {
            const printContent = document.getElementById(id)
            iframe = document.createElement('IFRAME')
            let doc = null
            iframe.setAttribute('id', 'print-iframe')
            iframe.setAttribute('style', 'position:absolute;width:0px;height:0px;left:-500px;top:-500px;')
            document.body.appendChild(iframe)
            doc = iframe.contentWindow.document
            doc.write(
                '<style media="print">@page {size:' +
                    size +
                    ';margin:' +
                    margin +
                    ';}@media print {body {margin: 0;padding: 0;}}</style>'
            )
            doc.write(`<div">${printContent.innerHTML}</div>`)
            doc.close()
            iframe.contentWindow.focus()
        }

        var contentWindow = iframe.contentWindow

        if (ieFlag) {
            contentWindow.document.body.className += ' ext-ie'
            contentWindow.document.execCommand('print', false, null)
        } else {
            contentWindow.print()
        }

        document.body.removeChild(iframe)
    })
}

module.exports = {
    printPage
}
