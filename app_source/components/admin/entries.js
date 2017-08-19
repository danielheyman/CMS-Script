const AdminEntries = React.createClass({
    render() {
        const slug = this.props.match.params.slug;
        const entries = Store.getEntriesByStructure(slug);

        return (
            <div>
                <div className="alert alert-warning mt-3 clearfix" role="alert">
                    <span className="mt-2 d-inline-block">We love 'em Entries!</span>
                    <Link to={`/admin/structures/${slug}/new`}>
                        <span role="button" className="btn btn-outline-warning float-right">New Entry</span>
                    </Link>
                </div>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Slug</th>
                            <th>Blurb</th>
                            <th>Edit</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map(entry => (
                            <tr key={entry.slug}>
                                <td>{entry.slug}</td>
                                <td>{entry.blurb}</td>
                                <td>
                                    <Link aria-label="Edit Entry" className="btn btn-secondary" to={`/admin/structures/${slug}/${entry.slug}`}>
                                        <i className="fa fa-pencil" aria-hidden="true"></i>
                                    </Link>
                                </td>
                                <td>
                                    <a aria-label="Delete Entry" href="" className="btn btn-outline-danger" onClick={e => e.preventDefault() || Store.deleteEntry(entry._id)}>
                                        <i className="fa fa-times" aria-hidden="true"></i>
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }
});