define([], () => {

    function suggestion() {
        monaco.languages.registerCompletionItemProvider('javascript', {
            provideCompletionItems: function (model, position) {
                var word = model.getWordUntilPosition(position);
                var range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word.startColumn,
                    endColumn: word.endColumn
                };
                return {
                    suggestions: createDependencyProposals(range)
                };
            }
        });
    }

    function createDependencyProposals(range) {
        return [
            {
                label: 'gitee-getFileContent',
                kind: monaco.languages.CompletionItemKind.Function,
                insertText: 'gitee.getFileContent(filePath, refresh = false, parseJson = false, repo = pubRepo)',
                range: range
            },
            {
                label: 'gitee-updateFile',
                kind: monaco.languages.CompletionItemKind.Function,
                insertText: 'gitee.updateFile(filePath, content, repo = pubRepo)',
                range: range
            },
            {
                label: 'gitee-getFileTree',
                kind: monaco.languages.CompletionItemKind.Function,
                insertText: 'gitee.getFileTree(refresh = false, repo = pubRepo)',
                range: range
            },
            {
                label: 'gitee-newFile',
                kind: monaco.languages.CompletionItemKind.Function,
                insertText: 'gitee.newFile(filePath, content, repo = pubRepo)',
                range: range
            }
        ];
    }

    return {
        suggestion
    }

})