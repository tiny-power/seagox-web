const CompressionPlugin = require('compression-webpack-plugin')
const ThemeColorReplacer = require('webpack-theme-color-replacer')
const forElementUI = require('webpack-theme-color-replacer/forElementUI')
module.exports = {
    runtimeCompiler: true,
    productionSourceMap: false,
    devServer: {
        open: true,
        host: '0.0.0.0',
        port: 8080,
        https: false,
        hotOnly: true,
        proxy: {
            '/api': {
                target: 'http://127.0.0.1',
                ws: true,
                changeOrigin: true,
                pathRewrite: {
                    '^/api': ''
                }
            }
        }
    },
    transpileDependencies: ['sock-js', 'sockjs-client', 'vue-grid-layout', 'quill-image-extend-module'],
    chainWebpack: config => {
        // 移除 prefetch 插件
        config.plugins.delete('prefetch')
        // 移除 preload 插件
        config.plugins.delete('preload')
    },
    configureWebpack: config => {
        if (process.env.NODE_ENV === 'production') {
            // 为生产环境修改配置...
            config.mode = 'production'
            return {
                plugins: [
                    new CompressionPlugin({
                        test: /\.js$|\.html$|\.css/, //匹配文件名
                        threshold: 10240, //对超过10k的数据进行压缩
                        deleteOriginalAssets: false //是否删除原文件
                    }),
                    new ThemeColorReplacer({
                        matchColors: [...forElementUI.getElementUISeries('#409EFF')],
                        fileName: 'css/theme-colors-[contenthash:8].css',
                        changeSelector: forElementUI.changeSelector,
                        isJsUgly: process.env.NODE_ENV === 'production' ? true : undefined
                    })
                ]
            }
        } else {
            return {
                plugins: [
                    new ThemeColorReplacer({
                        matchColors: [...forElementUI.getElementUISeries('#409EFF')],
                        fileName: 'css/theme-colors-[contenthash:8].css',
                        changeSelector: forElementUI.changeSelector,
                        isJsUgly: process.env.NODE_ENV === 'production' ? true : undefined
                    })
                ]
            }
        }
    }
}
