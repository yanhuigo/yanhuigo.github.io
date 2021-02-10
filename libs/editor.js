define(['vue', 'require'], function (Vue, require) {

    return {
        mounted() {
            require(['vs/editor/editor.main'], () => {
                monaco.editor.create(document.getElementById('editor-container'), {
                    value: '点击左侧列表文件开始编辑...',
                    language: "markdown",
                    theme: "vs-dark",
                    automaticLayout: true
                });
            });
        },
        template: `
            <div id="editor-container" class="h-100"></div>
        `,
    }

});
