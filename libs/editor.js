define(['vue', 'require'], function (Vue, require) {

    return {
        mounted() {
            require(['vs/editor/editor.main'], () => {
                monaco.editor.create(document.getElementById('editor-container'), {
                    value: '点击左侧列表文件开始编辑...',
                    language: "markdown",
                    theme: "vs",
                    automaticLayout: true
                });
            });
        },
        template: `
            <div class="d-flex flex-row h-100">
                <div class="wyd-sidebar wyd-border">123</div>
                <div id="editor-container" class="flex-grow-1"></div>
            </div>
        `,
    }

});
