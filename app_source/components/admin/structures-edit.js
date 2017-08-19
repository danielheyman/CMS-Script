const AdminStructureEdit = React.createClass({
    getInitialState() {
        return {};
    },

    componentDidMount() {
        const structure = Store.getStructure(this.props.match.params.slug);
        this.setState(
            Object.assign({}, structure) // To prevent a referenced object
        );
    },

    addField(e) {
        e.preventDefault();

        const fields = this.state.fields
        this.setState({
            fields: fields.concat([{
                label: "",
                type: "text"
            }])
        });
    },

    removeField(e, index) {
        e.preventDefault();

        const fields = this.state.fields;
        fields.splice(index, 1);

        this.setState({fields});
    },

    updateField(e, type, index) {
        let fields = this.state.fields;
        fields[index] = Object.assign({}, fields[index], {[type]: e.target.value});

        this.setState({fields});
    },

    submit(e) {
        e.preventDefault();
        const { _id, name, slug, description, pageSize, fields } = this.state;
        if (!name) {
            return this.setState({error: "Please enter a name"});
        }
        if (!slug) {
            return this.setState({error: "Please enter a slug"});
        }
        if (Store.getStructure(slug) && Store.getStructure(slug)._id != _id) {
            return this.setState({error: "Slug already exists on a structure"});
        }
        if (!description) {
            return this.setState({error: "Please enter a description"});
        }
        if (isNaN(pageSize)) {
            return this.setState({error: "Please enter a valid page size"});
        }
        for (const field of fields) {
            if (!field.label) {
                return this.setState({error: "Make sure all fields have a label"});
            }
        }
        this.setState({error: null});
        Store.saveStructure({
            _id,
            name,
            slug,
            description,
            pageSize,
            fields
        });
    },

    render() {
        const fieldTypes = Store.getFieldTypes();
        const fieldOptions = Object.keys(fieldTypes).map(type =>
            <option key={type} value={type}>{fieldTypes[type]}</option>
        );

        if (!this.state._id) {
            return (
                <div className="alert alert-danger mt-3" role="alert">
                    This structure does not exist :(
                </div>
            );
        }

        let error = "";
        if (this.state.error) {
            error = (
                <div className="alert alert-danger mt-3" role="alert">
                    Error: {this.state.error}
                </div>
            );
        }

        return (
            <div className="card mt-3">
                <div className="card-header">{this.state.name || "New structure"}</div>
                <div className="card-body">
                    <form onSubmit={e => e.preventDefault()}>
                        <div className="form-group">
                            <label htmlFor="name">Structure Name</label>
                            <input onChange={e => this.setState({name: e.target.value})} value={this.state.name || ""} type="text" className="form-control" id="name" placeholder="Enter name" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="slug">Slug</label>
                            <input onChange={e => this.setState({slug: e.target.value})} value={this.state.slug || ""} disabled={this.state._id !== "new" && "disabled"} type="text" className="form-control" id="slug" placeholder="Enter Slug" />
                            <small className="form-text text-muted">This is unique, url friendly way of referencing your data type. This cannot be changed once created.</small>
                        </div>
                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <input onChange={e => this.setState({description: e.target.value})} value={this.state.description || ""} type="text" className="form-control" id="description" placeholder="Enter description" />
                            <small className="form-text text-muted">Will be used to describe the structure on the home listing.</small>
                        </div>
                        <div className="form-group">
                            <label htmlFor="pageSize">Page Size</label>
                            <input onChange={e => this.setState({pageSize: parseInt(e.target.value)})} value={this.state.pageSize || ""} type="number" className="form-control" id="pageSize" placeholder="Enter page size" />
                            <small className="form-text text-muted">Allows you to set how many entries appear on the page for the Structure Listing</small>
                        </div>
                        {this.state.fields && this.state.fields.map((field, index) =>
                            <div className="row form-group" key={index}>
                                <div className="col">
                                    <input onChange={e => this.updateField(e, "label", index)} type="text" className="form-control" placeholder="Label" value={field.label} />
                                </div>
                                <div className="col">
                                    <select onChange={e => this.updateField(e, "type", index)} className="form-control" value={field.type}>
                                        {fieldOptions}
                                    </select>
                                </div>
                                <div className="col no-grow">
                                    <button onClick={e => this.removeField(e, index)} type="submit" className="btn btn-danger"><i className="fa fa-times" aria-hidden="true"></i></button>
                                </div>
                            </div>
                        )}
                        { error }
                        <button onClick={this.addField} type="submit" className="btn btn-secondary mr-3">Add Field</button>
                        <button onClick={this.submit} type="submit" className="btn btn-primary">Save</button>
                        <button onClick={() => this.props.history.goBack()} type="submit" className="btn btn-danger float-right">Cancel</button>
                    </form>
                </div>
            </div>
        );
    }
});