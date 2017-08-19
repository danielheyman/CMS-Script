const Nav = React.createClass({
    getInitialState() {
        return {
            login: undefined,
            username: "",
            password: ""
        };
    },

    logout(e) {
        e.preventDefault();
        Store.logout();
    },

    login(e) {
        e.preventDefault();
        // this.attemptLogin("daniel", "test");
        if (this.state.login) {
            if (this.state.password !== "" && this.state.username !== "") {
                Store.login(this.state.username, this.state.password);
            }
        } else {
            this.setState({login: true});
        }
    },

    signup(e) {
        e.preventDefault();
        const values = bootbox.dialog({
            title: 'Signup',
            message: "<form action=''>\
                <div class='form-group'><label for='s_username'>Username:</label><input class='form-control' type='text' id='s_username' /></div>\
                <div class='form-group'><label for='s_password'>Password:</label><input class='form-control' type='password' id='s_password' /></div>\
                <div class='form-group'><label for='s_bio'>Bio:</label><textarea class='form-control' id='s_bio' /></div>\
                <div class='container'>\
                        <div class='alert alert-danger mt-3' role='alert' id='s_error'></div>\
                </div>\
            </form>",
            onEscape(e) {
                console.log(e);
            },
            buttons: {
                ok: {
                    label: "Signup",
                    className: 'btn-info',
                    callback() {
                        const newUser = {
                            username: $("#s_username").val(),
                            password: $("#s_password").val(),
                            biography: $("#s_bio").val(),
                        }
                        if (newUser.username === "") {
                            $("#s_error").text("Please enter a username").show();
                            return false;
                        }
                        if (Store.getUsers().find(user => user.username === newUser.username)) {
                            $("#s_error").text("Username already exists").show();
                            return false;
                        }
                        if (newUser.password === "") {
                            $("#s_error").text("Please enter a password").show();
                            return false;
                        }
                        if (newUser.biography === "") {
                            $("#s_error").text("Please enter a bio").show();
                            return false;
                        }
                        Store.saveUser(newUser);
                    }
                },
                cancel: {
                    label: "Cancel",
                    className: 'btn-danger',
                }
            },
        });
    },

    cancelLogin(e) {
        e.preventDefault();
        this.setState({login: undefined});
    },

    render() {
        const flashedSuccess = Store.getFlashedSuccess();
        const flashedError = Store.getFlashedError();
        const currentUser = Store.getCurrentUser();

        return (
            <header>
                <nav className="navbar navbar-toggleable-md navbar-light bg-faded">
                    <button className="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <Link to={`/`} className="navbar-brand">
                        CMS
                    </Link>
                    <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
                        <div className="navbar-nav mr-auto">
                            <Link to={`/`}>
                                <span className={
                                    `nav-link ${this.props.location.pathname === "/" ? 'active' : ''}`
                                }>Home</span>
                            </Link>
                            <Link to={`/users`}>
                                <span className={
                                    `nav-link ${this.props.location.pathname === "/users" ? 'active' : ''}`
                                }>Users</span>
                            </Link>
                            {Store.isAdmin() && 
                                <div className="nav-item dropdown">
                                    <a href="" className={`nav-link dropdown-toggle ${this.props.location.pathname.includes("admin") ? 'active' : ''}`} id="admin-dropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Admin</a>
                                    <div className="dropdown-menu" aria-labelledby="admin-dropdown">
                                        <Link className="dropdown-item" to={`/admin`}>Home</Link>
                                        <Link className="dropdown-item" to={`/admin/structures`}>Structures</Link>
                                        <Link className="dropdown-item" to={`/admin/users`}>Users</Link>
                                    </div>
                                </div>
                            }
                        </div>
                        <div className="navbar-nav">
                            <form className="form-inline my-2 my-md-0">
                                {this.state.login !== undefined &&
                                    <span>
                                        <input onChange={e => this.setState({username: e.target.value})} className="form-control" value={this.state.username} type="text" placeholder="Username" />
                                        <input onChange={e => this.setState({password: e.target.value})} className="form-control ml-sm-2" value={this.state.password} type="password" placeholder="Password" />
                                    </span>
                                }
                                {currentUser
                                    ? (
                                        <span>
                                            <a className="nav-link">{currentUser.username}</a>
                                            <button onClick={this.logout} className="btn btn-outline-primary my-2 my-sm-0 ml-sm-2" type="submit">Logout</button>
                                        </span>
                                    )
                                    : (
                                    <span>
                                        <button onClick={this.login} className="btn btn-outline-primary my-2 my-sm-0 ml-sm-2" type="submit">Login</button>
                                        {!this.state.login &&
                                            <button onClick={this.signup} className="btn btn-outline-primary my-2 my-sm-0 ml-sm-2" type="submit">Signup</button>
                                        }
                                        {this.state.login &&
                                            <button onClick={this.cancelLogin} className="btn btn-link my-2 my-sm-0" type="submit">Cancel</button>
                                        }
                                    </span>
                                    )
                                }
                                
                            </form>
                        </div>
                    </div>
                </nav>
                {flashedSuccess &&
                    <div className="container">
                        <div className="alert alert-success mt-3" role="alert">
                            {flashedSuccess}
                        </div>
                    </div>
                }
                {flashedError &&
                    <div className="container">
                        <div className="alert alert-danger mt-3" role="alert">
                            {flashedError}
                        </div>
                    </div>
                }
            </header>
        );
    }
});