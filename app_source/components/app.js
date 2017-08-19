const AppComponent = React.createClass({
  componentDidMount() {
    Store.setHistoryObject(this.props.history);
    Store.subscribe(() => {
      this.forceUpdate();
    })
  },

  render() {
    if (Store.isLoading()) {
      return (
        <main className="container">
          <div className="alert alert-info mt-3" role="alert">
              <p className="mb-0">Loading...</p>
          </div>
        </main>
      )
    }

    return (
      <div className="mb-5">
        <Nav location={this.props.location} />
        <main className="container">
          <Switch>
            <Route path="/admin" component={ Admin } />
            <Route exact path="/users" component={ Users } />
            <Route exact path="/:structure" component={ Structure } />
            <Route exact path="/:structure/favorites" component={ Structure } />
            <Route exact path="/:structure/:entryslug" component={ Entry } />
            <Route exact path="/" component={ Home } />
          </Switch>
        </main>
      </div>
    );
  }
});