const { useState, useEffect } = React;
const { HashRouter, Route } = ReactRouterDOM;

const { Tooltip, Button } = antd;

function App() {

    return (
        <div>
            <h2>App</h2>
            <Tooltip title="search">
                <Button type="primary" shape="circle" icon="search" />
            </Tooltip>
        </div>
    )
}

ReactDOM.render(
    <HashRouter>
        <App />
    </HashRouter>,
    document.querySelector('#root'),
);