const AdminStructures = React.createClass({
    render() {
        const structures = Store.getStructures();

        return (
            <div>
                <div className="alert alert-warning mt-3 clearfix" role="alert">
                    <span className="mt-2 d-inline-block">We love 'em Structures!</span>
                    <Link to={`/admin/structures/new`}>
                        <span role="button" className="btn btn-outline-warning float-right">New</span>
                    </Link>
                </div>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Slug</th>
                            <th>Description</th>
                            <th>Entries</th>
                            <th>Edit</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {structures.map(structure => (
                            <tr key={structure.slug}>
                                <td>{structure.slug}</td>
                                <td>{structure.description}</td>
                                <td>
                                    <Link to={`/admin/structures/${structure.slug}/list`}>
                                        <span role="button" className="btn btn-secondary">View Entries</span>
                                    </Link>
                                </td>
                                <td>
                                    <Link aria-label="Edit Structure" className="btn btn-secondary" to={`/admin/structures/${structure.slug}`}>
                                        <i className="fa fa-pencil" aria-hidden="true"></i>
                                    </Link>
                                </td>
                                <td>
                                    <a aria-label="Delete Structure" href="" className="btn btn-outline-danger" onClick={e => e.preventDefault() || Store.deleteStructure(structure._id)}>
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