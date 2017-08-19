const Users = React.createClass({
    render() {
        const users = Store.getUsers();

        const {page:pageParam} = getParams(this.props.location);
        const page = parseInt(pageParam) || 0;
        const perPage = 15;

        return (
            <div>
                <div className="row">
                    {users.slice(page * perPage, (page + 1) * perPage).map(user => {
                        const favorites = user.favorites.map(Store.getEntryById.bind(Store)).filter(x => x);
                        const slugs = favorites.map(x => x.structureSlug).sort().reduce((a, b) => a[0] === b ? a : a.concat([b]), []);
                        
                        return (
                            <div className="mt-3 mb-2 col-6 col-lg-4" key={user.username}>
                                <h1 className="h2">
                                    {user.username}
                                    <span className="badge badge-warning ml-2">{Intl.DateTimeFormat([], {
                                        month:  "short",
                                        day:    "numeric",
                                    }).format(user.signupDate)}</span>
                                </h1>
                                <p>{user.biography}</p>
                                {slugs.map(slug =>
                                    <div key={slug} className="box mb-3">
                                        <h2 className="h3">
                                            Favorites in
                                            <Link className={"ml-2"} to={`/${slug}`}>
                                            {slug}
                                            </Link>
                                        </h2>
                                        {favorites.filter(x => x.structureSlug === slug).map(entry => 
                                            <Link key={entry.slug} className="mr-3" to={`/${slug}/${entry.slug}`}>
                                            {entry.title}
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                <nav aria-label="Pagination">
                    <ul className="pagination mt-5">
                        {Array.apply(null, Array(Math.ceil(users.length/perPage))).map((_, index) => 
                            <li key={index} className={`page-item ${index === page ? 'active' : ''}`}>
                                <Link aria-label={`Navigate to page ${index}`} className="page-link" to={`/users?page=${index}`}>
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