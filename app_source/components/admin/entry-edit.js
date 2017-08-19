const AdminEntryEdit = React.createClass({
    getInitialState() {
        return {};
    },

    componentDidMount() {
        const structure = Store.getStructure(this.props.match.params.slug);
        const entry = Store.getEntry(this.props.match.params.slug, this.props.match.params.entrySlug);
        this.setState(
            Object.assign({
                structure
            }, entry) // To prevent a referenced object
        );
    },

    submit(e) {
        e.preventDefault();
        const { _id, title, slug, blurb, fields = {} } = this.state;
        if (!title) {
            return this.setState({error: "Please enter a title"});
        }
        if (!slug) {
            return this.setState({error: "Please enter a slug"});
        }
        if (Store.getEntryWithoutSlug(slug) && Store.getEntryWithoutSlug(slug)._id !== _id) {
            return this.setState({error: "Slug already exists on an entry"});
        }
        if (!blurb) {
            return this.setState({error: "Please enter a blurb"});
        }

        const isValidUrl = url => {
            try { new URL(url); return true; } catch(e) { return false; }
        }
        const isValidString = str => typeof str === "string" && str !== "";
        for (const field of this.state.structure.fields) {
            const value = fields[field._id];
            if ((["text", "textarea", "wysiwyg"].includes(field.type) && !isValidString(value))
                || (field.type === "number" && isNaN(value))
                || (field.type === "checkbox" && ![true, false].includes(value))
                || (field.type === "link" && (!isValidUrl((value || {}).url) || !isValidString((value || {}).label)))
                || (field.type === "youtube" && !isValidUrl(value))
                || (field.type === "reference" && !Store.getEntryWithoutSlug(value))
                || (field.type === "datepicker" && !Date.parse(value))
            ) {
                return this.setState({error: `Please set a valid ${field.label}`});
            }
            if (field.type === "youtube" && !value.match(/^https:\/\/www.youtube.com\/embed\/[\w-]+$/)) {
                return this.setState({error: `${field.label} must be in the format https://www.youtube.com/embed/video_id`});
            }
            if (["picture", "file"].includes(field.type) && (!value || (!value.ext && value.length !== 1))) {
                return this.setState({error: `${field.label} must include one file`});
            }
            if (field.type === "picture" && !value.ext && !value[0].type.includes("image/")) {
                return this.setState({error: `${field.label} must be an image`});
            }
        }
        this.setState({error: null});
        Store.saveEntry({
            _id,
            title,
            slug,
            structureSlug: this.props.match.params.slug,
            blurb,
            fields
        });
    },

    getField(_id, defaultValue = "") {
        return (this.state.fields && this.state.fields[_id]) || defaultValue;
    },

    getInnerField(_id, type) {
        return (this.getField(_id) && this.state.fields[_id][type]) || "";
    },

    setField(_id, value) {
        const fields = Object.assign(this.state.fields || {}, {
            [_id]: value
        });
        this.setState({ fields })
    },

    setInnerField(_id, type, value) {
        let fields = this.state.fields || {};
        fields = Object.assign(fields, {
            [_id]: Object.assign({}, fields[_id], {[type]: value})
        });
        this.setState({ fields })
    },

    render() {
        if (!this.state._id) {
            return (
                <div className="alert alert-danger mt-3" role="alert">
                    This entry does not exist :(
                </div>
            );
        }

        if (!this.state.structure) {
            return (
                <div className="alert alert-danger mt-3" role="alert">
                    Referenced structure does not exist :(
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
                <div className="card-header">{this.state.title || "New Entry"}</div>
                <div className="card-body">
                    <form onSubmit={e => e.preventDefault()}>
                        <div className="form-group">
                            <label htmlFor="title">Entry title</label>
                            <input onChange={e => this.setState({title: e.target.value})} value={this.state.title || ""} type="text" className="form-control" id="title" placeholder="Enter title" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="slug">Slug</label>
                            <input onChange={e => this.setState({slug: e.target.value})} value={this.state.slug || ""} disabled={this.state._id !== "new" && "disabled"} type="text" className="form-control" id="slug" placeholder="Enter Slug" />
                            <small className="form-text text-muted">This is unique, url friendly way of referencing your data type. This cannot be changed once created.</small>
                        </div>
                        <div className="form-group">
                            <label htmlFor="blurb">Blurb</label>
                            <input onChange={e => this.setState({blurb: e.target.value})} value={this.state.blurb || ""} type="text" className="form-control" id="blurb" placeholder="Enter blurb" />
                            <small className="form-text text-muted">This will be shown on the structure listing page.</small>
                        </div>
                        {this.state.structure.fields.map(field =>
                            <div key={field.label} className="form-group">
                                <label htmlFor={field.label}>{field.label}</label>
                                { (field.type === "text") ? (
                                    <input onChange={e => this.setField(field._id, e.target.value)} value={this.getField(field._id, "")} className="form-control" id={field.label} placeholder="Enter text" />
                                  ) : (field.type === "number") ? (
                                    <input onChange={e => this.setField(field._id, parseFloat(e.target.value))} type="number" value={this.getField(field._id, false)} className="form-control" id={field.label} placeholder="Enter number" />
                                  ) : (field.type === "checkbox") ? (
                                    <input onChange={e => this.setField(field._id, e.target.checked === true)} type="checkbox" checked={this.getField(field._id, false)} className="form-control" id={field.label} />
                                  ) : (field.type === "picture") ? (
                                    <span> 
                                        {this.getField(field._id) && this.getField(field._id).ext &&
                                            <div className="mt-1 mb-1">
                                                <img className="img-fluid" alt={field.label} src={`${window.location.origin}/public/files/${this.state.slug}/${field._id}${this.getField(field._id).ext}`} />
                                            </div>
                                        }
                                        <input onChange={e => this.setField(field._id, e.target.files)} type="file" className="form-control" id={field.label} />
                                    </span>
                                  ) : (field.type === "file") ? (
                                    <span> 
                                        {this.getField(field._id) && this.getField(field._id).ext &&
                                            <div className="mt-1 mb-1">
                                                <a target="_blank" alt={field.label} href={`${window.location.origin}/public/files/${this.state.slug}/${field._id}.zip`}>Download {field.label}</a>
                                            </div>
                                        }
                                        <input onChange={e => this.setField(field._id, e.target.files)} type="file" className="form-control" id={field.label} />
                                    </span>
                                  ) : (field.type === "textarea") ? (
                                    <textarea onChange={e => this.setField(field._id, e.target.value)} value={this.getField(field._id, "")} className="form-control" id={field.label} placeholder="Enter text" />
                                  ) : (field.type === "link") ? (
                                    <div className="row">
                                        <div className="col">
                                            <input onChange={e => this.setInnerField(field._id, "label", e.target.value)} type="text" value={this.getInnerField(field._id, "label")} className="form-control" id={field.label} placeholder="Enter label" />
                                        </div>
                                        <div className="col">
                                            <input onChange={e => this.setInnerField(field._id, "url", e.target.value)} type="url" value={this.getInnerField(field._id, "url")} className="form-control" id={field.label} placeholder="Enter url" />
                                        </div>
                                    </div>
                                  ) : (field.type === "youtube") ? (
                                    <input onChange={e => this.setField(field._id, e.target.value)} type="url" value={this.getField(field._id, "")} className="form-control" id={field.label} placeholder="Enter YouTube embed url" />
                                  ) : (field.type === "reference") ? (
                                    <input onChange={e => this.setField(field._id, e.target.value)} value={this.getField(field._id, "")} className="form-control" id={field.label} placeholder="Enter entry slug" />
                                  ) : (field.type === "datepicker") ? (
                                      <DatePicker.default
                                        selected={this.getField(field._id) ? moment(this.getField(field._id)) : ""}
                                        onChange={value => this.setField(field._id, value.toDate())} />
                                  ) : (field.type === "wysiwyg") ? (
                                       <ReactQuill onChange={value => this.setField(field._id, value)} value={this.getField(field._id, "")} />
                                  ) : null
                                }
                            </div>
                        )}
                        { error }
                        <button onClick={this.submit} type="submit" className="btn btn-primary">Save</button>
                        <button onClick={() => this.props.history.goBack()} type="submit" className="btn btn-danger float-right">Cancel</button>
                    </form>
                </div>
            </div>
        );
    }
});