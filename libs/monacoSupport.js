define(['gitee'], (gitee) => {

    function suggestion() {

        return new Promise((resolve, reject) => {
            gitee.getFileContent("config/code.suggestion.json", false, true).then(data => {
                console.log("开始加载提示json", data);
                for (let oneLanguage in data) {
                    monaco.languages.registerCompletionItemProvider(oneLanguage, {
                        provideCompletionItems: function (model, position) {
                            var word = model.getWordUntilPosition(position);
                            var range = {
                                startLineNumber: position.lineNumber,
                                endLineNumber: position.lineNumber,
                                startColumn: word.startColumn,
                                endColumn: word.endColumn
                            };
                            return {
                                suggestions: createDependencyProposals(range, data[oneLanguage])
                            };
                        }
                    });
                }
                resolve();
            });
        })

    }

    function createDependencyProposals(range, data) {
        let response = [];
        for (let suggestion of data) {
            response.push({
                label: suggestion[0],
                kind: monaco.languages.CompletionItemKind.Function,
                insertText: suggestion[1],
                range: range
            })
        }
        return response;
    }

    return {
        suggestion
    }

})