"use strict";

var AppComponent = React.createClass({
  displayName: "AppComponent",
  componentDidMount: function componentDidMount() {
    var _this = this;

    Store.setHistoryObject(this.props.history);
    Store.subscribe(function () {
      _this.forceUpdate();
    });
  },
  render: function render() {
    if (Store.isLoading()) {
      return React.createElement(
        "main",
        { className: "container" },
        React.createElement(
          "div",
          { className: "alert alert-info mt-3", role: "alert" },
          React.createElement(
            "p",
            { className: "mb-0" },
            "Loading..."
          )
        )
      );
    }

    return React.createElement(
      "div",
      { className: "mb-5" },
      React.createElement(Nav, { location: this.props.location }),
      React.createElement(
        "main",
        { className: "container" },
        React.createElement(
          Switch,
          null,
          React.createElement(Route, { path: "/admin", component: Admin }),
          React.createElement(Route, { exact: true, path: "/users", component: Users }),
          React.createElement(Route, { exact: true, path: "/:structure", component: Structure }),
          React.createElement(Route, { exact: true, path: "/:structure/favorites", component: Structure }),
          React.createElement(Route, { exact: true, path: "/:structure/:entryslug", component: Entry }),
          React.createElement(Route, { exact: true, path: "/", component: Home })
        )
      )
    );
  }
});
"use strict";

var Entry = React.createClass({
    displayName: "Entry",
    getInitialState: function getInitialState() {
        return {
            comment: ""
        };
    },
    toggleFavorite: function toggleFavorite(id) {
        Store.toggleFavorite(id);
    },
    comment: function comment(e, id) {
        e.preventDefault();
        if (this.state.comment !== "") {
            Store.addComment(id, this.state.comment);
            this.setState({ comment: "" });
        }
    },
    render: function render() {
        var _this = this;

        var currentUser = Store.getCurrentUser();
        var slug = this.props.match.params.structure;
        var entrySlug = this.props.match.params.entryslug;
        var entry = Store.getEntry(slug, entrySlug);

        if (!entry) {
            return React.createElement(
                "div",
                { className: "alert alert-danger mt-3", role: "alert" },
                "Cannot find entry :("
            );
        }

        var structure = Store.getStructure(slug);
        var favorited = currentUser && currentUser.favorites.includes(entry._id) ? "favorited" : "";

        return React.createElement(
            "div",
            { className: "mt-3" },
            React.createElement(
                "h1",
                { className: "h2" },
                entry.title,
                currentUser && React.createElement("i", { onClick: function onClick() {
                        return _this.toggleFavorite(entry._id);
                    }, className: "fa fa-star ml-2 favorite " + favorited, "aria-hidden": "true" })
            ),
            React.createElement(
                "p",
                null,
                Intl.DateTimeFormat([], {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                }).format(entry.createdDate),
                " by ",
                Store.getUser(entry.author).username
            ),
            structure.fields.map(function (field) {
                var _id = field._id;
                var value = entry.fields[_id];
                if (!value) {
                    return null;
                }
                var generateReference = function generateReference() {
                    var ref = Store.getEntryWithoutSlug(value);
                    if (!ref) {
                        return null;
                    }
                    return React.createElement(
                        "span",
                        null,
                        React.createElement(
                            Link,
                            { to: "/" + ref.structureSlug + "/" + value },
                            ref.title
                        ),
                        " (",
                        ref.structureSlug,
                        ")",
                        React.createElement(
                            "p",
                            null,
                            ref.blurb
                        )
                    );
                };
                return React.createElement(
                    "div",
                    { key: _id, className: "box mb-2" },
                    React.createElement(
                        "div",
                        { className: "field" },
                        field.label
                    ),
                    ["text", "textarea", "wysiwyg"].includes(field.type) ? React.createElement("p", { className: "mb-0", dangerouslySetInnerHTML: { __html: value } }) // Safe to use this because only admin can set the content
                    : field.type === "number" ? React.createElement(
                        "span",
                        { className: "badge badge-warning" },
                        value
                    ) : field.type === "checkbox" ? React.createElement(
                        "span",
                        { className: "badge badge-warning" },
                        value ? "Yes" : "No"
                    ) : field.type === "link" ? React.createElement(
                        "a",
                        { href: value.url, target: "_blank" },
                        value.label
                    ) : field.type === "reference" ? generateReference() : field.type === "picture" ? React.createElement("img", { className: "img-fluid", alt: field.label, src: window.location.origin + "/public/files/" + entrySlug + "/" + _id + value.ext }) : field.type === "file" ? React.createElement(
                        "a",
                        { href: window.location.origin + "/public/files/" + entrySlug + "/" + _id + ".zip", target: "_blank" },
                        "Download ",
                        field.label
                    ) : field.type === "youtube" ? React.createElement("iframe", { width: "640", height: "360", src: value, frameBorder: "0", allowFullScreen: true }) : field.type === "datepicker" ? React.createElement(
                        "span",
                        { className: "badge badge-warning" },
                        Intl.DateTimeFormat([], {
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                        }).format(new Date(value))
                    ) : null
                );
            }),
            React.createElement(
                "h2",
                { className: "h3 mt-4" },
                "Comments"
            ),
            entry.comments.map(function (comment, index) {
                return React.createElement(
                    "div",
                    { key: index, className: "box mb-3" },
                    React.createElement(
                        "span",
                        { className: "author" },
                        Store.getUser(comment.author).username,
                        React.createElement(
                            "span",
                            { className: "badge badge-warning ml-2" },
                            Intl.DateTimeFormat([], {
                                year: "numeric",
                                month: "short",
                                day: "numeric"
                            }).format(entry.createdDate)
                        )
                    ),
                    React.createElement("br", null),
                    React.createElement(
                        "span",
                        { className: "comment" },
                        comment.text
                    )
                );
            }),
            currentUser ? React.createElement(
                "form",
                { onSubmit: function onSubmit(e) {
                        return _this.comment(e, entry._id);
                    }, className: "form box mb-3" },
                React.createElement(
                    "div",
                    { className: "form-group" },
                    React.createElement("textarea", { "aria-label": "Your Comment", onChange: function onChange(e) {
                            return _this.setState({ comment: e.target.value });
                        }, value: this.state.comment, type: "text", className: "form-control", id: "comment", placeholder: "Enter comment" })
                ),
                React.createElement(
                    "button",
                    { type: "submit", className: "btn btn-primary" },
                    "Comment"
                )
            ) : React.createElement(
                "div",
                { className: "alert alert-warning mt-3", role: "alert" },
                "Login to comment!"
            )
        );
    }
});
"use strict";

var Home = React.createClass({
    displayName: "Home",
    render: function render() {
        var structures = Store.getStructures();

        return React.createElement(
            "div",
            null,
            React.createElement(
                "div",
                { className: "jumbotron mt-3" },
                React.createElement(
                    "h1",
                    { className: "h1" },
                    "Welcome to this awesome CMS script!"
                ),
                React.createElement(
                    "p",
                    null,
                    "Run ",
                    React.createElement(
                        "strong",
                        null,
                        "npm run seed"
                    ),
                    " to get some sample data in. Then login as an admin or non-admin user and check out the seeded structure and entry examples."
                ),
                React.createElement(
                    "p",
                    { className: "mb-0" },
                    "Test admin account: daniel/test"
                ),
                React.createElement(
                    "p",
                    { className: "mb-0" },
                    "Test non-admin account: bob/test2"
                )
            ),
            React.createElement(
                "div",
                { className: "row" },
                structures.map(function (structure) {
                    return React.createElement(
                        "div",
                        { className: "mt-3 mb-2 col-6 col-lg-4", key: structure.slug },
                        React.createElement(
                            "h2",
                            { className: "h2" },
                            structure.name,
                            React.createElement(
                                "span",
                                { className: "badge badge-warning ml-2" },
                                Store.getEntriesByStructure(structure.slug).length
                            )
                        ),
                        React.createElement(
                            "p",
                            null,
                            structure.description
                        ),
                        React.createElement(
                            Link,
                            { to: "/" + structure.slug },
                            React.createElement(
                                "span",
                                { role: "button", className: "btn btn-secondary" },
                                "Start exploring \xBB"
                            )
                        )
                    );
                })
            )
        );
    }
});
"use strict";

var Nav = React.createClass({
    displayName: "Nav",
    getInitialState: function getInitialState() {
        return {
            login: undefined,
            username: "",
            password: ""
        };
    },
    logout: function logout(e) {
        e.preventDefault();
        Store.logout();
    },
    login: function login(e) {
        e.preventDefault();
        // this.attemptLogin("daniel", "test");
        if (this.state.login) {
            if (this.state.password !== "" && this.state.username !== "") {
                Store.login(this.state.username, this.state.password);
            }
        } else {
            this.setState({ login: true });
        }
    },
    signup: function signup(e) {
        e.preventDefault();
        var values = bootbox.dialog({
            title: 'Signup',
            message: "<form action=''>\
                <div class='form-group'><label for='s_username'>Username:</label><input class='form-control' type='text' id='s_username' /></div>\
                <div class='form-group'><label for='s_password'>Password:</label><input class='form-control' type='password' id='s_password' /></div>\
                <div class='form-group'><label for='s_bio'>Bio:</label><textarea class='form-control' id='s_bio' /></div>\
                <div class='container'>\
                        <div class='alert alert-danger mt-3' role='alert' id='s_error'></div>\
                </div>\
            </form>",
            onEscape: function onEscape(e) {
                console.log(e);
            },

            buttons: {
                ok: {
                    label: "Signup",
                    className: 'btn-info',
                    callback: function callback() {
                        var newUser = {
                            username: $("#s_username").val(),
                            password: $("#s_password").val(),
                            biography: $("#s_bio").val()
                        };
                        if (newUser.username === "") {
                            $("#s_error").text("Please enter a username").show();
                            return false;
                        }
                        if (Store.getUsers().find(function (user) {
                            return user.username === newUser.username;
                        })) {
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
                    className: 'btn-danger'
                }
            }
        });
    },
    cancelLogin: function cancelLogin(e) {
        e.preventDefault();
        this.setState({ login: undefined });
    },
    render: function render() {
        var _this = this;

        var flashedSuccess = Store.getFlashedSuccess();
        var flashedError = Store.getFlashedError();
        var currentUser = Store.getCurrentUser();

        return React.createElement(
            "header",
            null,
            React.createElement(
                "nav",
                { className: "navbar navbar-toggleable-md navbar-light bg-faded" },
                React.createElement(
                    "button",
                    { className: "navbar-toggler navbar-toggler-right", type: "button", "data-toggle": "collapse", "data-target": "#navbarNavAltMarkup", "aria-controls": "navbarNavAltMarkup", "aria-expanded": "false", "aria-label": "Toggle navigation" },
                    React.createElement("span", { className: "navbar-toggler-icon" })
                ),
                React.createElement(
                    Link,
                    { to: "/", className: "navbar-brand" },
                    "CMS"
                ),
                React.createElement(
                    "div",
                    { className: "collapse navbar-collapse", id: "navbarNavAltMarkup" },
                    React.createElement(
                        "div",
                        { className: "navbar-nav mr-auto" },
                        React.createElement(
                            Link,
                            { to: "/" },
                            React.createElement(
                                "span",
                                { className: "nav-link " + (this.props.location.pathname === "/" ? 'active' : '') },
                                "Home"
                            )
                        ),
                        React.createElement(
                            Link,
                            { to: "/users" },
                            React.createElement(
                                "span",
                                { className: "nav-link " + (this.props.location.pathname === "/users" ? 'active' : '') },
                                "Users"
                            )
                        ),
                        Store.isAdmin() && React.createElement(
                            "div",
                            { className: "nav-item dropdown" },
                            React.createElement(
                                "a",
                                { href: "", className: "nav-link dropdown-toggle " + (this.props.location.pathname.includes("admin") ? 'active' : ''), id: "admin-dropdown", "data-toggle": "dropdown", "aria-haspopup": "true", "aria-expanded": "false" },
                                "Admin"
                            ),
                            React.createElement(
                                "div",
                                { className: "dropdown-menu", "aria-labelledby": "admin-dropdown" },
                                React.createElement(
                                    Link,
                                    { className: "dropdown-item", to: "/admin" },
                                    "Home"
                                ),
                                React.createElement(
                                    Link,
                                    { className: "dropdown-item", to: "/admin/structures" },
                                    "Structures"
                                ),
                                React.createElement(
                                    Link,
                                    { className: "dropdown-item", to: "/admin/users" },
                                    "Users"
                                )
                            )
                        )
                    ),
                    React.createElement(
                        "div",
                        { className: "navbar-nav" },
                        React.createElement(
                            "form",
                            { className: "form-inline my-2 my-md-0" },
                            this.state.login !== undefined && React.createElement(
                                "span",
                                null,
                                React.createElement("input", { onChange: function onChange(e) {
                                        return _this.setState({ username: e.target.value });
                                    }, className: "form-control", value: this.state.username, type: "text", placeholder: "Username" }),
                                React.createElement("input", { onChange: function onChange(e) {
                                        return _this.setState({ password: e.target.value });
                                    }, className: "form-control ml-sm-2", value: this.state.password, type: "password", placeholder: "Password" })
                            ),
                            currentUser ? React.createElement(
                                "span",
                                null,
                                React.createElement(
                                    "a",
                                    { className: "nav-link" },
                                    currentUser.username
                                ),
                                React.createElement(
                                    "button",
                                    { onClick: this.logout, className: "btn btn-outline-primary my-2 my-sm-0 ml-sm-2", type: "submit" },
                                    "Logout"
                                )
                            ) : React.createElement(
                                "span",
                                null,
                                React.createElement(
                                    "button",
                                    { onClick: this.login, className: "btn btn-outline-primary my-2 my-sm-0 ml-sm-2", type: "submit" },
                                    "Login"
                                ),
                                !this.state.login && React.createElement(
                                    "button",
                                    { onClick: this.signup, className: "btn btn-outline-primary my-2 my-sm-0 ml-sm-2", type: "submit" },
                                    "Signup"
                                ),
                                this.state.login && React.createElement(
                                    "button",
                                    { onClick: this.cancelLogin, className: "btn btn-link my-2 my-sm-0", type: "submit" },
                                    "Cancel"
                                )
                            )
                        )
                    )
                )
            ),
            flashedSuccess && React.createElement(
                "div",
                { className: "container" },
                React.createElement(
                    "div",
                    { className: "alert alert-success mt-3", role: "alert" },
                    flashedSuccess
                )
            ),
            flashedError && React.createElement(
                "div",
                { className: "container" },
                React.createElement(
                    "div",
                    { className: "alert alert-danger mt-3", role: "alert" },
                    flashedError
                )
            )
        );
    }
});
"use strict";

var Structure = React.createClass({
    displayName: "Structure",
    getInitialState: function getInitialState() {
        return {
            search: "",
            lastLoadedSearch: "",
            searchIds: []
        };
    },
    loadSearch: function loadSearch() {
        var _this = this;

        var _getParams = getParams(this.props.location),
            search = _getParams.search;

        if (search !== undefined && search !== this.state.lastLoadedSearch) {
            if (!search) {
                return this.setState({ search: "", lastLoadedSearch: "" });
            }
            var slug = this.props.match.params.structure;
            Store.search(slug, search).then(function (searchIds) {
                _this.setState({
                    searchIds: searchIds,
                    search: search,
                    lastLoadedSearch: search
                });
            });
        }
    },
    search: function search(e) {
        e.preventDefault();

        var _getParams2 = getParams(this.props.location),
            search = _getParams2.search;

        var slug = this.props.match.params.structure;
        if (search !== this.state.search) {
            Store.redirect("/" + slug + "?search=" + this.state.search);
        }
    },
    render: function render() {
        var _this2 = this;

        this.loadSearch();

        var currentUser = Store.getCurrentUser();
        var onlyFavorites = this.props.location.pathname.includes("/favorites");

        if (!currentUser && onlyFavorites) {
            return React.createElement(
                "div",
                { className: "alert alert-danger mt-3", role: "alert" },
                "Must be logged in to see favorites!"
            );
        }
        var slug = this.props.match.params.structure;
        var structure = Store.getStructure(slug);

        if (!structure) {
            return React.createElement(
                "div",
                { className: "alert alert-danger mt-3", role: "alert" },
                "Cannot find structure :("
            );
        }

        var _getParams3 = getParams(this.props.location),
            pageParam = _getParams3.page,
            search = _getParams3.search;

        var page = parseInt(pageParam) || 0;
        var changePage = function changePage(page) {
            return "page=" + page + (search ? "&search=" + search : '');
        };

        var entries = Store.getEntriesByStructure(slug).filter(function (x) {
            return !onlyFavorites || currentUser.favorites.includes(x._id);
        }).filter(function (x) {
            return !_this2.state.lastLoadedSearch || !_this2.state.searchIds || _this2.state.searchIds.includes(x._id);
        });

        return React.createElement(
            "div",
            null,
            React.createElement(
                "div",
                { className: "jumbotron mt-3" },
                !onlyFavorites && currentUser && React.createElement(
                    Link,
                    { className: "float-right", to: "/" + slug + "/favorites" },
                    React.createElement("i", { className: "fa fa-star", "aria-hidden": "true" }),
                    " Favorites"
                ),
                onlyFavorites && React.createElement(
                    Link,
                    { className: "float-right", to: "/" + slug },
                    "All"
                ),
                React.createElement(
                    "h1",
                    { className: "h1" },
                    "All ",
                    onlyFavorites ? 'your favorite' : 'about',
                    " ",
                    structure.name,
                    "!"
                ),
                React.createElement(
                    "p",
                    { className: "mb-0" },
                    structure.description
                ),
                React.createElement(
                    "form",
                    { onSubmit: this.search, className: "form-inline mt-3" },
                    React.createElement(
                        "div",
                        { className: "form-group mr-1" },
                        React.createElement(
                            "label",
                            { htmlFor: "phrase", className: "sr-only" },
                            "Phrase"
                        ),
                        React.createElement("input", { disabled: search && search !== this.state.lastLoadedSearch, onChange: function onChange(e) {
                                return _this2.setState({ search: e.target.value });
                            }, className: "form-control", id: "phrase", placeholder: "Phrase", value: this.state.search })
                    ),
                    React.createElement(
                        "button",
                        { type: "submit", className: "btn btn-primary" },
                        "Search"
                    )
                )
            ),
            entries.length === 0 && React.createElement(
                "div",
                { className: "alert alert-warning mt-3", role: "alert" },
                onlyFavorites ? "You have not favorited any entries yet :(" : "No entries have been found :("
            ),
            React.createElement(
                "div",
                { className: "row" },
                entries.slice(page * structure.pageSize, (page + 1) * structure.pageSize).map(function (entry) {
                    return React.createElement(
                        "div",
                        { className: "mt-3 mb-2 col-6 col-lg-4", key: entry.slug },
                        React.createElement(
                            "h2",
                            { className: "h2" },
                            entry.title,
                            React.createElement(
                                "span",
                                { className: "badge badge-warning ml-2" },
                                entry.comments.length
                            )
                        ),
                        React.createElement(
                            "p",
                            null,
                            Intl.DateTimeFormat([], {
                                year: "numeric",
                                month: "short",
                                day: "numeric"
                            }).format(entry.createdDate),
                            " by ",
                            Store.getUser(entry.author).username
                        ),
                        React.createElement(
                            "p",
                            null,
                            entry.blurb
                        ),
                        React.createElement(
                            Link,
                            { to: "/" + slug + "/" + entry.slug },
                            React.createElement(
                                "span",
                                { role: "button", className: "btn btn-secondary" },
                                "Start reading \xBB"
                            )
                        )
                    );
                })
            ),
            React.createElement(
                "nav",
                { "aria-label": "Pagination" },
                React.createElement(
                    "ul",
                    { className: "pagination mt-5" },
                    Array.apply(null, Array(Math.ceil(entries.length / structure.pageSize))).map(function (_, index) {
                        return React.createElement(
                            "li",
                            { key: index, className: "page-item " + (index === page ? 'active' : '') },
                            React.createElement(
                                Link,
                                { "aria-label": "Navigate to page " + index, className: "page-link", to: "/" + slug + "?" + changePage(index) },
                                index
                            )
                        );
                    })
                )
            )
        );
    }
});
"use strict";

var Users = React.createClass({
    displayName: "Users",
    render: function render() {
        var users = Store.getUsers();

        var _getParams = getParams(this.props.location),
            pageParam = _getParams.page;

        var page = parseInt(pageParam) || 0;
        var perPage = 15;

        return React.createElement(
            "div",
            null,
            React.createElement(
                "div",
                { className: "row" },
                users.slice(page * perPage, (page + 1) * perPage).map(function (user) {
                    var favorites = user.favorites.map(Store.getEntryById.bind(Store)).filter(function (x) {
                        return x;
                    });
                    var slugs = favorites.map(function (x) {
                        return x.structureSlug;
                    }).sort().reduce(function (a, b) {
                        return a[0] === b ? a : a.concat([b]);
                    }, []);

                    return React.createElement(
                        "div",
                        { className: "mt-3 mb-2 col-6 col-lg-4", key: user.username },
                        React.createElement(
                            "h1",
                            { className: "h2" },
                            user.username,
                            React.createElement(
                                "span",
                                { className: "badge badge-warning ml-2" },
                                Intl.DateTimeFormat([], {
                                    month: "short",
                                    day: "numeric"
                                }).format(user.signupDate)
                            )
                        ),
                        React.createElement(
                            "p",
                            null,
                            user.biography
                        ),
                        slugs.map(function (slug) {
                            return React.createElement(
                                "div",
                                { key: slug, className: "box mb-3" },
                                React.createElement(
                                    "h2",
                                    { className: "h3" },
                                    "Favorites in",
                                    React.createElement(
                                        Link,
                                        { className: "ml-2", to: "/" + slug },
                                        slug
                                    )
                                ),
                                favorites.filter(function (x) {
                                    return x.structureSlug === slug;
                                }).map(function (entry) {
                                    return React.createElement(
                                        Link,
                                        { key: entry.slug, className: "mr-3", to: "/" + slug + "/" + entry.slug },
                                        entry.title
                                    );
                                })
                            );
                        })
                    );
                })
            ),
            React.createElement(
                "nav",
                { "aria-label": "Pagination" },
                React.createElement(
                    "ul",
                    { className: "pagination mt-5" },
                    Array.apply(null, Array(Math.ceil(users.length / perPage))).map(function (_, index) {
                        return React.createElement(
                            "li",
                            { key: index, className: "page-item " + (index === page ? 'active' : '') },
                            React.createElement(
                                Link,
                                { "aria-label": "Navigate to page " + index, className: "page-link", to: "/users?page=" + index },
                                index
                            )
                        );
                    })
                )
            )
        );
    }
});
"use strict";

var AdminEntries = React.createClass({
    displayName: "AdminEntries",
    render: function render() {
        var slug = this.props.match.params.slug;
        var entries = Store.getEntriesByStructure(slug);

        return React.createElement(
            "div",
            null,
            React.createElement(
                "div",
                { className: "alert alert-warning mt-3 clearfix", role: "alert" },
                React.createElement(
                    "span",
                    { className: "mt-2 d-inline-block" },
                    "We love 'em Entries!"
                ),
                React.createElement(
                    Link,
                    { to: "/admin/structures/" + slug + "/new" },
                    React.createElement(
                        "span",
                        { role: "button", className: "btn btn-outline-warning float-right" },
                        "New Entry"
                    )
                )
            ),
            React.createElement(
                "table",
                { className: "table table-striped" },
                React.createElement(
                    "thead",
                    null,
                    React.createElement(
                        "tr",
                        null,
                        React.createElement(
                            "th",
                            null,
                            "Slug"
                        ),
                        React.createElement(
                            "th",
                            null,
                            "Blurb"
                        ),
                        React.createElement(
                            "th",
                            null,
                            "Edit"
                        ),
                        React.createElement(
                            "th",
                            null,
                            "Delete"
                        )
                    )
                ),
                React.createElement(
                    "tbody",
                    null,
                    entries.map(function (entry) {
                        return React.createElement(
                            "tr",
                            { key: entry.slug },
                            React.createElement(
                                "td",
                                null,
                                entry.slug
                            ),
                            React.createElement(
                                "td",
                                null,
                                entry.blurb
                            ),
                            React.createElement(
                                "td",
                                null,
                                React.createElement(
                                    Link,
                                    { "aria-label": "Edit Entry", className: "btn btn-secondary", to: "/admin/structures/" + slug + "/" + entry.slug },
                                    React.createElement("i", { className: "fa fa-pencil", "aria-hidden": "true" })
                                )
                            ),
                            React.createElement(
                                "td",
                                null,
                                React.createElement(
                                    "a",
                                    { "aria-label": "Delete Entry", href: "", className: "btn btn-outline-danger", onClick: function onClick(e) {
                                            return e.preventDefault() || Store.deleteEntry(entry._id);
                                        } },
                                    React.createElement("i", { className: "fa fa-times", "aria-hidden": "true" })
                                )
                            )
                        );
                    })
                )
            )
        );
    }
});
"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var AdminEntryEdit = React.createClass({
    displayName: "AdminEntryEdit",
    getInitialState: function getInitialState() {
        return {};
    },
    componentDidMount: function componentDidMount() {
        var structure = Store.getStructure(this.props.match.params.slug);
        var entry = Store.getEntry(this.props.match.params.slug, this.props.match.params.entrySlug);
        this.setState(Object.assign({
            structure: structure
        }, entry) // To prevent a referenced object
        );
    },
    submit: function submit(e) {
        e.preventDefault();
        var _state = this.state,
            _id = _state._id,
            title = _state.title,
            slug = _state.slug,
            blurb = _state.blurb,
            _state$fields = _state.fields,
            fields = _state$fields === undefined ? {} : _state$fields;

        if (!title) {
            return this.setState({ error: "Please enter a title" });
        }
        if (!slug) {
            return this.setState({ error: "Please enter a slug" });
        }
        if (Store.getEntryWithoutSlug(slug) && Store.getEntryWithoutSlug(slug)._id !== _id) {
            return this.setState({ error: "Slug already exists on an entry" });
        }
        if (!blurb) {
            return this.setState({ error: "Please enter a blurb" });
        }

        var isValidUrl = function isValidUrl(url) {
            try {
                new URL(url);return true;
            } catch (e) {
                return false;
            }
        };
        var isValidString = function isValidString(str) {
            return typeof str === "string" && str !== "";
        };
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = this.state.structure.fields[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var field = _step.value;

                var value = fields[field._id];
                if (["text", "textarea", "wysiwyg"].includes(field.type) && !isValidString(value) || field.type === "number" && isNaN(value) || field.type === "checkbox" && ![true, false].includes(value) || field.type === "link" && (!isValidUrl((value || {}).url) || !isValidString((value || {}).label)) || field.type === "youtube" && !isValidUrl(value) || field.type === "reference" && !Store.getEntryWithoutSlug(value) || field.type === "datepicker" && !Date.parse(value)) {
                    return this.setState({ error: "Please set a valid " + field.label });
                }
                if (field.type === "youtube" && !value.match(/^https:\/\/www.youtube.com\/embed\/[\w-]+$/)) {
                    return this.setState({ error: field.label + " must be in the format https://www.youtube.com/embed/video_id" });
                }
                if (["picture", "file"].includes(field.type) && (!value || !value.ext && value.length !== 1)) {
                    return this.setState({ error: field.label + " must include one file" });
                }
                if (field.type === "picture" && !value.ext && !value[0].type.includes("image/")) {
                    return this.setState({ error: field.label + " must be an image" });
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        this.setState({ error: null });
        Store.saveEntry({
            _id: _id,
            title: title,
            slug: slug,
            structureSlug: this.props.match.params.slug,
            blurb: blurb,
            fields: fields
        });
    },
    getField: function getField(_id) {
        var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";

        return this.state.fields && this.state.fields[_id] || defaultValue;
    },
    getInnerField: function getInnerField(_id, type) {
        return this.getField(_id) && this.state.fields[_id][type] || "";
    },
    setField: function setField(_id, value) {
        var fields = Object.assign(this.state.fields || {}, _defineProperty({}, _id, value));
        this.setState({ fields: fields });
    },
    setInnerField: function setInnerField(_id, type, value) {
        var fields = this.state.fields || {};
        fields = Object.assign(fields, _defineProperty({}, _id, Object.assign({}, fields[_id], _defineProperty({}, type, value))));
        this.setState({ fields: fields });
    },
    render: function render() {
        var _this = this;

        if (!this.state._id) {
            return React.createElement(
                "div",
                { className: "alert alert-danger mt-3", role: "alert" },
                "This entry does not exist :("
            );
        }

        if (!this.state.structure) {
            return React.createElement(
                "div",
                { className: "alert alert-danger mt-3", role: "alert" },
                "Referenced structure does not exist :("
            );
        }

        var error = "";
        if (this.state.error) {
            error = React.createElement(
                "div",
                { className: "alert alert-danger mt-3", role: "alert" },
                "Error: ",
                this.state.error
            );
        }

        return React.createElement(
            "div",
            { className: "card mt-3" },
            React.createElement(
                "div",
                { className: "card-header" },
                this.state.title || "New Entry"
            ),
            React.createElement(
                "div",
                { className: "card-body" },
                React.createElement(
                    "form",
                    { onSubmit: function onSubmit(e) {
                            return e.preventDefault();
                        } },
                    React.createElement(
                        "div",
                        { className: "form-group" },
                        React.createElement(
                            "label",
                            { htmlFor: "title" },
                            "Entry title"
                        ),
                        React.createElement("input", { onChange: function onChange(e) {
                                return _this.setState({ title: e.target.value });
                            }, value: this.state.title || "", type: "text", className: "form-control", id: "title", placeholder: "Enter title" })
                    ),
                    React.createElement(
                        "div",
                        { className: "form-group" },
                        React.createElement(
                            "label",
                            { htmlFor: "slug" },
                            "Slug"
                        ),
                        React.createElement("input", { onChange: function onChange(e) {
                                return _this.setState({ slug: e.target.value });
                            }, value: this.state.slug || "", disabled: this.state._id !== "new" && "disabled", type: "text", className: "form-control", id: "slug", placeholder: "Enter Slug" }),
                        React.createElement(
                            "small",
                            { className: "form-text text-muted" },
                            "This is unique, url friendly way of referencing your data type. This cannot be changed once created."
                        )
                    ),
                    React.createElement(
                        "div",
                        { className: "form-group" },
                        React.createElement(
                            "label",
                            { htmlFor: "blurb" },
                            "Blurb"
                        ),
                        React.createElement("input", { onChange: function onChange(e) {
                                return _this.setState({ blurb: e.target.value });
                            }, value: this.state.blurb || "", type: "text", className: "form-control", id: "blurb", placeholder: "Enter blurb" }),
                        React.createElement(
                            "small",
                            { className: "form-text text-muted" },
                            "This will be shown on the structure listing page."
                        )
                    ),
                    this.state.structure.fields.map(function (field) {
                        return React.createElement(
                            "div",
                            { key: field.label, className: "form-group" },
                            React.createElement(
                                "label",
                                { htmlFor: field.label },
                                field.label
                            ),
                            field.type === "text" ? React.createElement("input", { onChange: function onChange(e) {
                                    return _this.setField(field._id, e.target.value);
                                }, value: _this.getField(field._id, ""), className: "form-control", id: field.label, placeholder: "Enter text" }) : field.type === "number" ? React.createElement("input", { onChange: function onChange(e) {
                                    return _this.setField(field._id, parseFloat(e.target.value));
                                }, type: "number", value: _this.getField(field._id, false), className: "form-control", id: field.label, placeholder: "Enter number" }) : field.type === "checkbox" ? React.createElement("input", { onChange: function onChange(e) {
                                    return _this.setField(field._id, e.target.checked === true);
                                }, type: "checkbox", checked: _this.getField(field._id, false), className: "form-control", id: field.label }) : field.type === "picture" ? React.createElement(
                                "span",
                                null,
                                _this.getField(field._id) && _this.getField(field._id).ext && React.createElement(
                                    "div",
                                    { className: "mt-1 mb-1" },
                                    React.createElement("img", { className: "img-fluid", alt: field.label, src: window.location.origin + "/public/files/" + _this.state.slug + "/" + field._id + _this.getField(field._id).ext })
                                ),
                                React.createElement("input", { onChange: function onChange(e) {
                                        return _this.setField(field._id, e.target.files);
                                    }, type: "file", className: "form-control", id: field.label })
                            ) : field.type === "file" ? React.createElement(
                                "span",
                                null,
                                _this.getField(field._id) && _this.getField(field._id).ext && React.createElement(
                                    "div",
                                    { className: "mt-1 mb-1" },
                                    React.createElement(
                                        "a",
                                        { target: "_blank", alt: field.label, href: window.location.origin + "/public/files/" + _this.state.slug + "/" + field._id + ".zip" },
                                        "Download ",
                                        field.label
                                    )
                                ),
                                React.createElement("input", { onChange: function onChange(e) {
                                        return _this.setField(field._id, e.target.files);
                                    }, type: "file", className: "form-control", id: field.label })
                            ) : field.type === "textarea" ? React.createElement("textarea", { onChange: function onChange(e) {
                                    return _this.setField(field._id, e.target.value);
                                }, value: _this.getField(field._id, ""), className: "form-control", id: field.label, placeholder: "Enter text" }) : field.type === "link" ? React.createElement(
                                "div",
                                { className: "row" },
                                React.createElement(
                                    "div",
                                    { className: "col" },
                                    React.createElement("input", { onChange: function onChange(e) {
                                            return _this.setInnerField(field._id, "label", e.target.value);
                                        }, type: "text", value: _this.getInnerField(field._id, "label"), className: "form-control", id: field.label, placeholder: "Enter label" })
                                ),
                                React.createElement(
                                    "div",
                                    { className: "col" },
                                    React.createElement("input", { onChange: function onChange(e) {
                                            return _this.setInnerField(field._id, "url", e.target.value);
                                        }, type: "url", value: _this.getInnerField(field._id, "url"), className: "form-control", id: field.label, placeholder: "Enter url" })
                                )
                            ) : field.type === "youtube" ? React.createElement("input", { onChange: function onChange(e) {
                                    return _this.setField(field._id, e.target.value);
                                }, type: "url", value: _this.getField(field._id, ""), className: "form-control", id: field.label, placeholder: "Enter YouTube embed url" }) : field.type === "reference" ? React.createElement("input", { onChange: function onChange(e) {
                                    return _this.setField(field._id, e.target.value);
                                }, value: _this.getField(field._id, ""), className: "form-control", id: field.label, placeholder: "Enter entry slug" }) : field.type === "datepicker" ? React.createElement(DatePicker.default, {
                                selected: _this.getField(field._id) ? moment(_this.getField(field._id)) : "",
                                onChange: function onChange(value) {
                                    return _this.setField(field._id, value.toDate());
                                } }) : field.type === "wysiwyg" ? React.createElement(ReactQuill, { onChange: function onChange(value) {
                                    return _this.setField(field._id, value);
                                }, value: _this.getField(field._id, "") }) : null
                        );
                    }),
                    error,
                    React.createElement(
                        "button",
                        { onClick: this.submit, type: "submit", className: "btn btn-primary" },
                        "Save"
                    ),
                    React.createElement(
                        "button",
                        { onClick: function onClick() {
                                return _this.props.history.goBack();
                            }, type: "submit", className: "btn btn-danger float-right" },
                        "Cancel"
                    )
                )
            )
        );
    }
});
"use strict";

var Admin = React.createClass({
    displayName: "Admin",
    render: function render() {
        var currentUser = Store.getCurrentUser();
        if (!currentUser || !currentUser.isAdmin) {
            Store.redirect("/");
        }
        var flashedSuccess = Store.getFlashedSuccess();

        return React.createElement(
            Switch,
            null,
            React.createElement(Route, { exact: true, path: "/admin/structures", component: AdminStructures }),
            React.createElement(Route, { exact: true, path: "/admin/structures/:slug", component: AdminStructureEdit }),
            React.createElement(Route, { exact: true, path: "/admin/structures/:slug/list", component: AdminEntries }),
            React.createElement(Route, { exact: true, path: "/admin/structures/:slug/:entrySlug", component: AdminEntryEdit }),
            React.createElement(Route, { exact: true, path: "/admin/users", component: AdminUsers }),
            React.createElement(Route, { path: "/admin/", render: function render() {
                    return React.createElement(
                        "div",
                        { className: "alert alert-info mt-3", role: "alert" },
                        React.createElement(
                            "h1",
                            { className: "h2 alert-heading" },
                            "Welcome!"
                        ),
                        React.createElement(
                            "p",
                            { className: "mb-0" },
                            "You have successfully logged in as an admin! Select a route in the admin menu above to get started!"
                        )
                    );
                } })
        );
    }
});
"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var AdminStructureEdit = React.createClass({
    displayName: "AdminStructureEdit",
    getInitialState: function getInitialState() {
        return {};
    },
    componentDidMount: function componentDidMount() {
        var structure = Store.getStructure(this.props.match.params.slug);
        this.setState(Object.assign({}, structure) // To prevent a referenced object
        );
    },
    addField: function addField(e) {
        e.preventDefault();

        var fields = this.state.fields;
        this.setState({
            fields: fields.concat([{
                label: "",
                type: "text"
            }])
        });
    },
    removeField: function removeField(e, index) {
        e.preventDefault();

        var fields = this.state.fields;
        fields.splice(index, 1);

        this.setState({ fields: fields });
    },
    updateField: function updateField(e, type, index) {
        var fields = this.state.fields;
        fields[index] = Object.assign({}, fields[index], _defineProperty({}, type, e.target.value));

        this.setState({ fields: fields });
    },
    submit: function submit(e) {
        e.preventDefault();
        var _state = this.state,
            _id = _state._id,
            name = _state.name,
            slug = _state.slug,
            description = _state.description,
            pageSize = _state.pageSize,
            fields = _state.fields;

        if (!name) {
            return this.setState({ error: "Please enter a name" });
        }
        if (!slug) {
            return this.setState({ error: "Please enter a slug" });
        }
        if (Store.getStructure(slug) && Store.getStructure(slug)._id != _id) {
            return this.setState({ error: "Slug already exists on a structure" });
        }
        if (!description) {
            return this.setState({ error: "Please enter a description" });
        }
        if (isNaN(pageSize)) {
            return this.setState({ error: "Please enter a valid page size" });
        }
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = fields[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var field = _step.value;

                if (!field.label) {
                    return this.setState({ error: "Make sure all fields have a label" });
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        this.setState({ error: null });
        Store.saveStructure({
            _id: _id,
            name: name,
            slug: slug,
            description: description,
            pageSize: pageSize,
            fields: fields
        });
    },
    render: function render() {
        var _this = this;

        var fieldTypes = Store.getFieldTypes();
        var fieldOptions = Object.keys(fieldTypes).map(function (type) {
            return React.createElement(
                "option",
                { key: type, value: type },
                fieldTypes[type]
            );
        });

        if (!this.state._id) {
            return React.createElement(
                "div",
                { className: "alert alert-danger mt-3", role: "alert" },
                "This structure does not exist :("
            );
        }

        var error = "";
        if (this.state.error) {
            error = React.createElement(
                "div",
                { className: "alert alert-danger mt-3", role: "alert" },
                "Error: ",
                this.state.error
            );
        }

        return React.createElement(
            "div",
            { className: "card mt-3" },
            React.createElement(
                "div",
                { className: "card-header" },
                this.state.name || "New structure"
            ),
            React.createElement(
                "div",
                { className: "card-body" },
                React.createElement(
                    "form",
                    { onSubmit: function onSubmit(e) {
                            return e.preventDefault();
                        } },
                    React.createElement(
                        "div",
                        { className: "form-group" },
                        React.createElement(
                            "label",
                            { htmlFor: "name" },
                            "Structure Name"
                        ),
                        React.createElement("input", { onChange: function onChange(e) {
                                return _this.setState({ name: e.target.value });
                            }, value: this.state.name || "", type: "text", className: "form-control", id: "name", placeholder: "Enter name" })
                    ),
                    React.createElement(
                        "div",
                        { className: "form-group" },
                        React.createElement(
                            "label",
                            { htmlFor: "slug" },
                            "Slug"
                        ),
                        React.createElement("input", { onChange: function onChange(e) {
                                return _this.setState({ slug: e.target.value });
                            }, value: this.state.slug || "", disabled: this.state._id !== "new" && "disabled", type: "text", className: "form-control", id: "slug", placeholder: "Enter Slug" }),
                        React.createElement(
                            "small",
                            { className: "form-text text-muted" },
                            "This is unique, url friendly way of referencing your data type. This cannot be changed once created."
                        )
                    ),
                    React.createElement(
                        "div",
                        { className: "form-group" },
                        React.createElement(
                            "label",
                            { htmlFor: "description" },
                            "Description"
                        ),
                        React.createElement("input", { onChange: function onChange(e) {
                                return _this.setState({ description: e.target.value });
                            }, value: this.state.description || "", type: "text", className: "form-control", id: "description", placeholder: "Enter description" }),
                        React.createElement(
                            "small",
                            { className: "form-text text-muted" },
                            "Will be used to describe the structure on the home listing."
                        )
                    ),
                    React.createElement(
                        "div",
                        { className: "form-group" },
                        React.createElement(
                            "label",
                            { htmlFor: "pageSize" },
                            "Page Size"
                        ),
                        React.createElement("input", { onChange: function onChange(e) {
                                return _this.setState({ pageSize: parseInt(e.target.value) });
                            }, value: this.state.pageSize || "", type: "number", className: "form-control", id: "pageSize", placeholder: "Enter page size" }),
                        React.createElement(
                            "small",
                            { className: "form-text text-muted" },
                            "Allows you to set how many entries appear on the page for the Structure Listing"
                        )
                    ),
                    this.state.fields && this.state.fields.map(function (field, index) {
                        return React.createElement(
                            "div",
                            { className: "row form-group", key: index },
                            React.createElement(
                                "div",
                                { className: "col" },
                                React.createElement("input", { onChange: function onChange(e) {
                                        return _this.updateField(e, "label", index);
                                    }, type: "text", className: "form-control", placeholder: "Label", value: field.label })
                            ),
                            React.createElement(
                                "div",
                                { className: "col" },
                                React.createElement(
                                    "select",
                                    { onChange: function onChange(e) {
                                            return _this.updateField(e, "type", index);
                                        }, className: "form-control", value: field.type },
                                    fieldOptions
                                )
                            ),
                            React.createElement(
                                "div",
                                { className: "col no-grow" },
                                React.createElement(
                                    "button",
                                    { onClick: function onClick(e) {
                                            return _this.removeField(e, index);
                                        }, type: "submit", className: "btn btn-danger" },
                                    React.createElement("i", { className: "fa fa-times", "aria-hidden": "true" })
                                )
                            )
                        );
                    }),
                    error,
                    React.createElement(
                        "button",
                        { onClick: this.addField, type: "submit", className: "btn btn-secondary mr-3" },
                        "Add Field"
                    ),
                    React.createElement(
                        "button",
                        { onClick: this.submit, type: "submit", className: "btn btn-primary" },
                        "Save"
                    ),
                    React.createElement(
                        "button",
                        { onClick: function onClick() {
                                return _this.props.history.goBack();
                            }, type: "submit", className: "btn btn-danger float-right" },
                        "Cancel"
                    )
                )
            )
        );
    }
});
"use strict";

var AdminStructures = React.createClass({
    displayName: "AdminStructures",
    render: function render() {
        var structures = Store.getStructures();

        return React.createElement(
            "div",
            null,
            React.createElement(
                "div",
                { className: "alert alert-warning mt-3 clearfix", role: "alert" },
                React.createElement(
                    "span",
                    { className: "mt-2 d-inline-block" },
                    "We love 'em Structures!"
                ),
                React.createElement(
                    Link,
                    { to: "/admin/structures/new" },
                    React.createElement(
                        "span",
                        { role: "button", className: "btn btn-outline-warning float-right" },
                        "New"
                    )
                )
            ),
            React.createElement(
                "table",
                { className: "table table-striped" },
                React.createElement(
                    "thead",
                    null,
                    React.createElement(
                        "tr",
                        null,
                        React.createElement(
                            "th",
                            null,
                            "Slug"
                        ),
                        React.createElement(
                            "th",
                            null,
                            "Description"
                        ),
                        React.createElement(
                            "th",
                            null,
                            "Entries"
                        ),
                        React.createElement(
                            "th",
                            null,
                            "Edit"
                        ),
                        React.createElement(
                            "th",
                            null,
                            "Delete"
                        )
                    )
                ),
                React.createElement(
                    "tbody",
                    null,
                    structures.map(function (structure) {
                        return React.createElement(
                            "tr",
                            { key: structure.slug },
                            React.createElement(
                                "td",
                                null,
                                structure.slug
                            ),
                            React.createElement(
                                "td",
                                null,
                                structure.description
                            ),
                            React.createElement(
                                "td",
                                null,
                                React.createElement(
                                    Link,
                                    { to: "/admin/structures/" + structure.slug + "/list" },
                                    React.createElement(
                                        "span",
                                        { role: "button", className: "btn btn-secondary" },
                                        "View Entries"
                                    )
                                )
                            ),
                            React.createElement(
                                "td",
                                null,
                                React.createElement(
                                    Link,
                                    { "aria-label": "Edit Structure", className: "btn btn-secondary", to: "/admin/structures/" + structure.slug },
                                    React.createElement("i", { className: "fa fa-pencil", "aria-hidden": "true" })
                                )
                            ),
                            React.createElement(
                                "td",
                                null,
                                React.createElement(
                                    "a",
                                    { "aria-label": "Delete Structure", href: "", className: "btn btn-outline-danger", onClick: function onClick(e) {
                                            return e.preventDefault() || Store.deleteStructure(structure._id);
                                        } },
                                    React.createElement("i", { className: "fa fa-times", "aria-hidden": "true" })
                                )
                            )
                        );
                    })
                )
            )
        );
    }
});
"use strict";

var AdminUsers = React.createClass({
    displayName: "AdminUsers",
    render: function render() {
        var users = Store.getUsers();

        return React.createElement(
            "div",
            null,
            React.createElement(
                "table",
                { className: "table table-striped" },
                React.createElement(
                    "thead",
                    null,
                    React.createElement(
                        "tr",
                        null,
                        React.createElement(
                            "th",
                            null,
                            "User"
                        ),
                        React.createElement(
                            "th",
                            null,
                            "Admin"
                        )
                    )
                ),
                React.createElement(
                    "tbody",
                    null,
                    users.map(function (user) {
                        return React.createElement(
                            "tr",
                            { key: user.username },
                            React.createElement(
                                "td",
                                null,
                                user.username
                            ),
                            React.createElement(
                                "td",
                                null,
                                user.isAdmin ? React.createElement("i", { className: "fa fa-check", "aria-hidden": "true" }) : React.createElement(
                                    "a",
                                    { onClick: function onClick(e) {
                                            return e.preventDefault() || Store.promote(user._id);
                                        }, role: "button", className: "btn btn-primary", href: "" },
                                    "Promote"
                                )
                            )
                        );
                    })
                )
            )
        );
    }
});
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var server = "http://localhost:3001";
var fieldTypes = {
    "text": "Small text input",
    "number": "Number",
    "checkbox": "Checkbox",
    "textarea": "Textarea",
    "picture": "Picture file upload",
    "link": "Link to another page",
    "wysiwyg": "WYSIWYG Editor",
    "datepicker": "Datepicker",
    "youtube": "YouTube Video",
    "reference": "Reference to another entry",
    "file": "Downloadable file"
};

$.ajaxSetup({
    type: "POST",
    data: {},
    dataType: 'json',
    xhrFields: {
        withCredentials: true
    },
    crossDomain: true
});

var StoreClass = function () {
    function StoreClass() {
        var _this = this;

        _classCallCheck(this, StoreClass);

        this.setLoading(true);
        this.loadData(function () {
            _this.setLoading(false);
        });
    }

    _createClass(StoreClass, [{
        key: "isAdmin",
        value: function isAdmin() {
            return this.getCurrentUser() && this.getCurrentUser().isAdmin;
        }
    }, {
        key: "getCurrentUser",
        value: function getCurrentUser() {
            var _this2 = this;

            return this.getUsers().find(function (x) {
                return x._id === _this2.currentUserId;
            });
        }
    }, {
        key: "getUsers",
        value: function getUsers() {
            return this.users;
        }
    }, {
        key: "getUser",
        value: function getUser(_id) {
            return this.getUsers().find(function (user) {
                return user._id === _id;
            });
        }
    }, {
        key: "getStructures",
        value: function getStructures() {
            return this.structures;
        }
    }, {
        key: "getStructure",
        value: function getStructure(slug) {
            if (slug === "new") {
                return {
                    _id: "new",
                    fields: []
                };
            }
            return this.getStructures().find(function (x) {
                return x.slug === slug;
            });
        }
    }, {
        key: "getEntries",
        value: function getEntries() {
            return this.entries;
        }
    }, {
        key: "getEntriesByStructure",
        value: function getEntriesByStructure(slug) {
            return this.getEntries().filter(function (x) {
                return x.structureSlug === slug;
            });
        }
    }, {
        key: "getEntry",
        value: function getEntry(slug, entrySlug) {
            if (entrySlug === "new") {
                return {
                    _id: "new"
                };
            }
            return this.getEntriesByStructure(slug).find(function (x) {
                return x.slug === entrySlug;
            });
        }
    }, {
        key: "getEntryById",
        value: function getEntryById(_id) {
            return this.getEntries().find(function (x) {
                return x._id === _id;
            });
        }
    }, {
        key: "getEntryWithoutSlug",
        value: function getEntryWithoutSlug(entrySlug) {
            return this.getEntries().find(function (x) {
                return x.slug === entrySlug;
            });
        }
    }, {
        key: "getFieldTypes",
        value: function getFieldTypes() {
            return fieldTypes;
        }
    }, {
        key: "setHistoryObject",
        value: function setHistoryObject(history) {
            this.history = history;
        }
    }, {
        key: "setFlashedSuccess",
        value: function setFlashedSuccess(flashedSuccess) {
            this.flashedSuccess = flashedSuccess;
        }
    }, {
        key: "setFlashedError",
        value: function setFlashedError(flashedError) {
            this.flashedError = flashedError;
        }
    }, {
        key: "redirect",
        value: function redirect(location, flashedSuccess, flashedError) {
            this.setFlashedSuccess(flashedSuccess);
            this.setFlashedError(flashedError);
            this.history.push(location);
            this.setLoading(false);
        }
    }, {
        key: "getFlashedSuccess",
        value: function getFlashedSuccess() {
            // Remove the message after one show
            var flashedSuccess = this.flashedSuccess;
            this.flashedSuccess = null;
            return flashedSuccess;
        }
    }, {
        key: "getFlashedError",
        value: function getFlashedError() {
            // Remove the message after one show
            var flashedError = this.flashedError;
            this.flashedError = null;
            return flashedError;
        }
    }, {
        key: "setLoading",
        value: function setLoading(loading) {
            if (loading !== this.loading) {
                this.loading = loading;
                this.trigger();
            }
        }
    }, {
        key: "isLoading",
        value: function isLoading() {
            return this.loading;
        }
    }, {
        key: "subscribe",
        value: function subscribe(cb) {
            this._subscribe = cb;
        }
    }, {
        key: "trigger",
        value: function trigger() {
            if (this._subscribe) {
                this._subscribe();
            }
        }

        // API calls

    }, {
        key: "loadData",
        value: function loadData(cb) {
            var _this3 = this;

            async.parallel([function (cb) {
                $.get(server + "/users").then(function (data) {
                    _this3.users = data.all || [];
                    _this3.currentUserId = data.currentUser;
                    cb();
                });
            }, function (cb) {
                $.get(server + "/structures").then(function (data) {
                    _this3.structures = data || [];
                    cb();
                });
            }, function (cb) {
                $.get(server + "/entries").then(function (data) {
                    _this3.entries = data || [];
                    cb();
                });
            }], cb);
        }
    }, {
        key: "search",
        value: function search(structureSlug, _search) {
            var _this4 = this;

            return $.ajax({
                method: "POST",
                url: server + "/entries/search",
                data: { structureSlug: structureSlug, search: _search }
            }).catch(function (e) {
                _this4.setFlashedError("Something strange happened :(");
            });
        }
    }, {
        key: "saveUser",
        value: function saveUser(newUser) {
            var _this5 = this;

            this.setLoading(true);
            $.ajax({
                method: "POST",
                url: server + "/users",
                data: newUser
            }).then(function (data) {
                _this5.users.push(data);
                _this5.setFlashedSuccess("Successfully create user. You may now login.");
                _this5.setLoading(false);
            }).catch(function (e) {
                _this5.setFlashedError("Unable to create user");
                _this5.setLoading(false);
            });
        }
    }, {
        key: "saveStructure",
        value: function saveStructure(structure) {
            var _this6 = this;

            this.setLoading(true);
            $.ajax({
                method: structure._id === "new" ? "POST" : "PUT",
                url: server + "/structures",
                data: JSON.stringify(structure),
                contentType: 'application/json'
            }).then(function (data) {
                if (structure._id === "new") {
                    _this6.structures.push(data);
                } else {
                    var index = _this6.structures.findIndex(function (x) {
                        return x._id === structure._id;
                    });
                    if (index !== -1) {
                        _this6.structures[index] = data;
                    }
                }
                _this6.redirect("/admin/structures", "Successfully saved");
            }).catch(function (e) {
                _this6.redirect("/admin/structures", null, "Unable to save structure");
            });
        }
    }, {
        key: "saveEntry",
        value: function saveEntry(entry) {
            var _this7 = this;

            this.setLoading(true);
            var structure = this.getStructure(entry.structureSlug);
            var data = new FormData();
            var fileNumber = 0;
            Object.keys(entry.fields).forEach(function (key) {
                if (entry.fields[key].constructor === FileList) {
                    var field = structure.fields.find(function (f) {
                        return f._id === key;
                    });
                    data.append("file-" + fileNumber, entry.fields[key][0]);
                    var toZip = field && field.type === "file";
                    var ext = entry.fields[key][0].name.match(/\.\w+$/);
                    ext = ext ? ext[0] : undefined;
                    entry.fields[key] = { file: fileNumber, ext: ext, toZip: toZip };
                    fileNumber++;
                }
            });
            data.append('data', JSON.stringify(entry));
            $.ajax({
                method: entry._id === "new" ? "POST" : "PUT",
                url: server + "/entries",
                data: data,
                processData: false,
                contentType: false
            }).then(function (data) {
                if (entry._id === "new") {
                    _this7.entries.push(data);
                } else {
                    var index = _this7.entries.findIndex(function (x) {
                        return x._id === entry._id;
                    });
                    if (index !== -1) {
                        _this7.entries[index] = data;
                    }
                }
                _this7.redirect("/admin/structures/" + entry.structureSlug + "/list", "Successfully saved");
            }).catch(function (e) {
                _this7.redirect("/admin/structures/" + entry.structureSlug + "/list", null, "Unable to save entry");
            });
        }
    }, {
        key: "addComment",
        value: function addComment(entryId, comment) {
            var _this8 = this;

            this.setLoading(true);
            var currentUser = this.getCurrentUser();
            if (!currentUser) {
                return this.redirect("/" + entry.structureSlug + "/" + entry.slug, null, "Must be logged in");
            }
            var entry = this.getEntryById(entryId);
            $.ajax({
                method: "POST",
                url: server + "/entries/comment",
                data: { _id: entryId, comment: comment }
            }).then(function (data) {
                entry.comments.push(data);
                _this8.redirect("/" + entry.structureSlug + "/" + entry.slug, "Successfully commented");
            }).catch(function (e) {
                _this8.redirect("/" + entry.structureSlug + "/" + entry.slug, null, "Unable to save entry");
            });
        }
    }, {
        key: "deleteStructure",
        value: function deleteStructure(_id) {
            var _this9 = this;

            this.setLoading(true);
            $.ajax({
                method: "DELETE",
                url: server + "/structures",
                data: { _id: _id }
            }).then(function (data) {
                var index = _this9.structures.findIndex(function (x) {
                    return x._id === _id;
                });
                if (index !== -1) {
                    _this9.structures.splice(index, 1);
                }
                _this9.redirect("/admin/structures", "Successfully deleted structure");
            }).catch(function (e) {
                _this9.redirect("/admin/structures", null, "Unable to delete structure");
            });
        }
    }, {
        key: "deleteEntry",
        value: function deleteEntry(_id) {
            var _this10 = this;

            var index = this.entries.findIndex(function (x) {
                return x._id === _id;
            });
            if (index === -1) {
                return;
            }
            var structureSlug = this.entries[index].structureSlug;
            this.setLoading(true);
            $.ajax({
                method: "DELETE",
                url: server + "/entries",
                data: { _id: _id }
            }).then(function (data) {
                _this10.entries.splice(index, 1);
                _this10.redirect("/admin/structures/" + structureSlug + "/list", "Successfully deleted entry");
            }).catch(function (e) {
                _this10.redirect("/admin/structures/" + structureSlug + "/list", "Unable to delete entry");
            });
        }
    }, {
        key: "promote",
        value: function promote(_id) {
            var _this11 = this;

            this.setLoading(true);
            $.ajax({
                method: "PUT",
                url: server + "/users/promote",
                data: { _id: _id }
            }).then(function (data) {
                var user = _this11.users.find(function (x) {
                    return x._id === _id;
                });
                if (user) {
                    user.isAdmin = true;
                }
                _this11.redirect("/admin/users", "Successfully promoted user");
            }).catch(function (e) {
                _this11.redirect("/admin/users", null, "Unable to promote user");
            });
        }
    }, {
        key: "toggleFavorite",
        value: function toggleFavorite(_id) {
            var _this12 = this;

            var currentUser = this.getCurrentUser();
            if (!currentUser) {
                this.setFlashedError("You must be logged in");
                return this.trigger();
            }
            $.ajax({
                method: "PUT",
                url: server + "/users/toggle-favorite",
                data: { _id: _id }
            }).then(function (data) {
                var index = currentUser.favorites.indexOf(_id);
                if (index === -1) {
                    currentUser.favorites.push(_id);
                } else {
                    currentUser.favorites.splice(index, 1);
                }
                _this12.trigger();
            }).catch(function (e) {
                _this12.setFlashedError("An unkown error occured");
                _this12.trigger();
            });
        }
    }, {
        key: "login",
        value: function login(username, password) {
            var _this13 = this;

            this.setLoading(true);
            $.post(server + "/login", { username: username, password: password }).then(function (_id) {
                _this13.currentUserId = _id;
                _this13.setFlashedSuccess("Successfully logged in");
                _this13.setLoading(false);
            }).catch(function (e) {
                _this13.setFlashedError("Invalid username/password");
                _this13.setLoading(false);
            });
        }
    }, {
        key: "logout",
        value: function logout() {
            var _this14 = this;

            this.setLoading(true);
            $.post(server + "/logout").then(function () {
                _this14.currentUserId = null;
                _this14.setFlashedSuccess("Successfully logged out");
                _this14.setLoading(false);
            });
        }
    }]);

    return StoreClass;
}();

var Store = new StoreClass();
"use strict";

var _ReactRouterDOM = ReactRouterDOM,
    BrowserRouter = _ReactRouterDOM.BrowserRouter,
    Switch = _ReactRouterDOM.Switch,
    Route = _ReactRouterDOM.Route,
    Link = _ReactRouterDOM.Link;


var getParams = function getParams(location) {
    var params = {};
    if (!location || !location.search || location.search[0] != "?") {
        return params;
    }
    location.search.slice(1).split("&").forEach(function (param) {
        var parts = param.split("=");
        if (parts.length === 2) {
            params[parts[0]] = parts[1];
        }
    });
    return params;
};

ReactDOM.render(React.createElement(
    BrowserRouter,
    null,
    React.createElement(Route, { path: "/", component: AppComponent })
), document.getElementById('content'));
//# sourceMappingURL=components.js.map
