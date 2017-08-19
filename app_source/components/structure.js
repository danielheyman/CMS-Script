const Structure = React.createClass({
    getInitialState() {
        return {
            search: "",
            lastLoadedSearch: "",
            searchIds: [],
        };
    },

    loadSearch() {
        const {search} = getParams(this.props.location);
        if(search !== undefined && search !== this.state.lastLoadedSearch) {
            if (!search) {
                return this.setState({search: "", lastLoadedSearch: ""});
            }
            const slug = this.props.match.params.structure;
            Store.search(slug, search)
            .then(searchIds => {
                this.setState({
                    searchIds,
                    search,
                    lastLoadedSearch: search,
                });
            });
        }
    },

    search(e) {
        e.preventDefault();
        const {search} = getParams(this.props.location);
        const slug = this.props.match.params.structure;
        if (search !== this.state.search) {
            Store.redirect(`/${slug}?search=${this.state.search}`);
        }
    },

    render() {
        this.loadSearch();
    
        const currentUser = Store.getCurrentUser();
        const onlyFavorites = this.props.location.pathname.includes("/favorites");

        if (!currentUser && onlyFavorites) {
            return (
                <div className="alert alert-danger mt-3" role="alert">
                    Must be logged in to see favorites!
                </div>
            );
        }
        const slug = this.props.match.params.structure;
        const structure = Store.getStructure(slug);

        if (!structure) {
            return (
                <div className="alert alert-danger mt-3" role="alert">
                    Cannot find structure :(
                </div>
            );
        }

        const {page:pageParam, search} = getParams(this.props.location);
        const page = parseInt(pageParam) || 0;
        const changePage = page => {
            return `page=${page}${search ? `&search=${search}` : ''}`;
        }

        const entries = Store.getEntriesByStructure(slug)
            .filter(x => !onlyFavorites || currentUser.favorites.includes(x._id))
            .filter(x => !this.state.lastLoadedSearch || !this.state.searchIds || this.state.searchIds.includes(x._id))

        return (
            <div>
                <div className="jumbotron mt-3">
                    {!onlyFavorites && currentUser &&
                        <Link className="float-right" to={`/${slug}/favorites`}>
                            <i className="fa fa-star" aria-hidden="true"></i> Favorites
                        </Link>
                    }
                    {onlyFavorites &&
                        <Link className="float-right" to={`/${slug}`}>All</Link>
                    }
                    <h1 className="h1">All {onlyFavorites ? 'your favorite' : 'about'} {structure.name}!</h1>
                    <p className="mb-0">{structure.description}</p>
                    <form onSubmit={this.search} className="form-inline mt-3">
                        <div className="form-group mr-1">
                            <label htmlFor="phrase" className="sr-only">Phrase</label>
                            <input disabled={search && search !== this.state.lastLoadedSearch} onChange={e => this.setState({search: e.target.value})} className="form-control" id="phrase" placeholder="Phrase" value={this.state.search} />
                        </div>
                        <button type="submit" className="btn btn-primary">Search</button>
                    </form>
                </div>
                {entries.length === 0 &&
                    <div className="alert alert-warning mt-3" role="alert">
                        {onlyFavorites ? "You have not favorited any entries yet :(" : "No entries have been found :("}
                    </div>
                }
                <div className="row">
                    {entries.slice(page * structure.pageSize, (page + 1) * structure.pageSize).map(entry => (
                        <div className="mt-3 mb-2 col-6 col-lg-4" key={entry.slug}>
                            <h2 className="h2">
                                {entry.title}
                                <span className="badge badge-warning ml-2">{entry.comments.length}</span>
                            </h2>
                            <p>
                            {Intl.DateTimeFormat([], {
                                    year:    "numeric",
                                    month:  "short",
                                    day:    "numeric",
                                }).format(entry.createdDate)
                            } by {Store.getUser(entry.author).username}
                            </p>
                            <p>{entry.blurb}</p>
                            <Link to={`/${slug}/${entry.slug}`}>
                                <span role="button" className="btn btn-secondary">Start reading »</span>
                            </Link>
                        </div>
                    ))}
                </div>
                <nav aria-label="Pagination">
                    <ul className="pagination mt-5">
                        {Array.apply(null, Array(Math.ceil(entries.length/structure.pageSize))).map((_, index) => 
                            <li key={index} className={`page-item ${index === page ? 'active' : ''}`}>
                                <Link aria-label={`Navigate to page ${index}`} className="page-link" to={`/${slug}?${changePage(index)}`}>
                                    {index}
                                </Link>
                            </li>
                        )}
                    </ul>
                </nav>
            </div>
        );
    }
});