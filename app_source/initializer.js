const { BrowserRouter, Switch, Route, Link } = ReactRouterDOM;

const getParams = location => {
    let params = {};
    if (!location || !location.search || location.search[0] != "?") {
        return params;
    }
    location.search.slice(1).split("&").forEach(param => {
        const parts = param.split("=");
        if (parts.length === 2) {
            params[parts[0]] = parts[1];
        }
    })
    return params;
}

ReactDOM.render(
    <BrowserRouter>
        <Route path="/" component={ AppComponent } />
    </BrowserRouter>,
    document.getElementById('content')
);
