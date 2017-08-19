const AdminUsers = React.createClass({
    render() {
        const users = Store.getUsers();

        return (
            <div>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Admin</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.username}>
                                <td>{user.username}</td>
                                <td>
                                    {user.isAdmin
                                        ? <i className="fa fa-check" aria-hidden="true"></i>
                                        : <a onClick={e => e.preventDefault() || Store.promote(user._id)} role="button" className="btn btn-primary" href="">Promote</a>
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }
});