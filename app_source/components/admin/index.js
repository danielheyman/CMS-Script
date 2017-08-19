const Admin = React.createClass({
    render() {
        const currentUser = Store.getCurrentUser();
        if (!currentUser || !currentUser.isAdmin) {
            Store.redirect("/");
        }
        const flashedSuccess = Store.getFlashedSuccess();

        return (
            <Switch>
                <Route exact path="/admin/structures" component={ AdminStructures } />
                <Route exact path="/admin/structures/:slug" component={ AdminStructureEdit } />
                <Route exact path="/admin/structures/:slug/list" component={ AdminEntries } />
                <Route exact path="/admin/structures/:slug/:entrySlug" component={ AdminEntryEdit } />
                <Route exact path="/admin/users" component={ AdminUsers } />
                <Route path="/admin/" render={() => (
                    <div className="alert alert-info mt-3" role="alert">
                        <h1 className="h2 alert-heading">Welcome!</h1>
                        <p className="mb-0">You have successfully logged in as an admin! Select a route in the admin menu above to get started!</p>
                    </div>
                )} />
            </Switch>
        );
    }
});