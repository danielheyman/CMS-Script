const Home = React.createClass({
    render() {
        const structures = Store.getStructures();

        return (
            <div>
                <div className="jumbotron mt-3">
                    <h1 className="h1">Welcome to this awesome CMS script!</h1>
                    <p>Run <strong>npm run seed</strong> to get some sample data in. Then login as an admin or non-admin user and check out the seeded structure and entry examples.</p>
                    <p className="mb-0">Test admin account: daniel/test</p>
                    <p className="mb-0">Test non-admin account: bob/test2</p>
                </div>
                <div className="row">
                    {structures.map(structure => (
                        <div className="mt-3 mb-2 col-6 col-lg-4" key={structure.slug}>
                            <h2 className="h2">
                                {structure.name}
                                <span className="badge badge-warning ml-2">{Store.getEntriesByStructure(structure.slug).length}</span>
                            </h2>
                            <p>{structure.description}</p>
                            <Link to={`/${structure.slug}`}>
                                <span role="button" className="btn btn-secondary">Start exploring »</span>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
});