const { useState, useEffect } = React;
const { HashRouter, Route } = ReactRouterDOM;

function App() {

    let history = ReactRouterDOM.useHistory();

    return (
        <div>
            <h2>App</h2>

            <div style={{ padding: '12px' }}>
                <button onClick={() => { history.push('/') }}>default route</button>
                <button onClick={() => { history.push('/a') }}>a route</button>
                <button onClick={() => { history.push('/b') }}>b route</button>
                <button onClick={() => { history.push('/c') }}>c route</button>
            </div>
            <Route path="/" exact component={DefaultComponent}></Route>
            <Route path="/a" component={AComponent}></Route>
            <Route path="/b" component={BComponent}></Route>
            <Route path="/c" component={CComponent}></Route>

        </div>
    )
}

function DefaultComponent() {
    return (<div>a component</div>)
}

function AComponent() {
    return (<div>a component</div>)
}

function BComponent() {
    return (<div>b component</div>)
}

class CComponent extends React.PureComponent {

    state = {
        message: "hello"
    }

    render() {
        return (<div>CComponent...{this.state.message}</div>)
    }
}


ReactDOM.render(
    <HashRouter>
        <App />
    </HashRouter>,
    document.querySelector('#root'),
);