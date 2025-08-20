module.exports = {
    presets: [
        '@vue/cli-plugin-babel/preset',
        ['@babel/preset-env', {
            useBuiltIns: 'entry',
            "corejs": "3"
        }]
    ],
    plugins: [
        [
            'babel-plugin-component',
            {
                libraryName: 'element-ui',
                styleLibraryName: '~node_modules/element-theme-chalk/src',
                ext: '.scss'
            }
        ]
    ]
}
