const Entry = React.createClass({
    getInitialState() {
        return {
            comment: ""
        };
    },

    toggleFavorite(id) {
        Store.toggleFavorite(id);
    },

    comment(e, id) {
        e.preventDefault();
        if (this.state.comment !== "") {
            Store.addComment(id, this.state.comment);
            this.setState({comment: ""});
        }
    },

    render() {
        const currentUser = Store.getCurrentUser();
        const slug = this.props.match.params.structure;
        const entrySlug = this.props.match.params.entryslug;
        const entry = Store.getEntry(slug, entrySlug);

        if (!entry) {
            return (
                <div className="alert alert-danger mt-3" role="alert">
                    Cannot find entry :(
                </div>
            );
        }

        const structure = Store.getStructure(slug);
        const favorited = currentUser && currentUser.favorites.includes(entry._id) ? "favorited" : "";

        return (
            <div className="mt-3">
                <h1 className="h2">
                    {entry.title}
                    {currentUser &&
                        <i onClick={() => this.toggleFavorite(entry._id)} className={`fa fa-star ml-2 favorite ${favorited}`} aria-hidden="true"></i>
                    }
                </h1>
                <p>
                {Intl.DateTimeFormat([], {
                        year:    "numeric",
                        month:  "short",
                        day:    "numeric",
                    }).format(entry.createdDate)
                } by {Store.getUser(entry.author).username}
                </p>
                {structure.fields.map(field => {
                    const _id = field._id;
                    const value = entry.fields[_id];
                    if (!value) {
                        return null;
                    }
                    const generateReference = () => {
                        const ref = Store.getEntryWithoutSlug(value);
                        if (!ref) {
                            return null;
                        }
                        return (
                            <span>
                                <Link to={`/${ref.structureSlug}/${value}`}>{ref.title}</Link> ({ref.structureSlug})
                                <p>{ref.blurb}</p>
                            </span>
                        )
                    };
                    return (
                        <div key={_id} className="box mb-2">
                            <div className="field">{field.label}</div>
                            {["text", "textarea", "wysiwyg"].includes(field.type)
                                ? <p className="mb-0" dangerouslySetInnerHTML={{__html: value}} /> // Safe to use this because only admin can set the content
                                : field.type === "number"
                                ? <span className="badge badge-warning">{value}</span>
                                : field.type === "checkbox"
                                ? <span className="badge badge-warning">{value ? "Yes" : "No"}</span>
                                : field.type === "link"
                                ? <a href={value.url} target="_blank">{value.label}</a>
                                : field.type === "reference"
                                ? generateReference()
                                : field.type === "picture"
                                ? <img className="img-fluid" alt={field.label} src={`${window.location.origin}/public/files/${entrySlug}/${_id}${value.ext}`} />
                                : field.type === "file"
                                ? <a href={`${window.location.origin}/public/files/${entrySlug}/${_id}.zip`} target="_blank">Download {field.label}</a>
                                : field.type === "youtube"
                                ? <iframe width="640" height="360" src={value} frameBorder="0" allowFullScreen></iframe>
                                : field.type === "datepicker"
                                ? <span className="badge badge-warning">{Intl.DateTimeFormat([], {
                                        year:    "numeric",
                                        month:  "short",
                                        day:    "numeric",
                                    }).format(new Date(value))}</span>
                                : null
                            }
                        </div>
                    );
                })}
                <h2 className="h3 mt-4">Comments</h2>
                {entry.comments.map((comment, index) =>
                    <div key={index} className="box mb-3">
                        <span className="author">
                            {Store.getUser(comment.author).username}
                            <span className="badge badge-warning ml-2">
                                {Intl.DateTimeFormat([], {
                                    year:    "numeric",
                                    month:  "short",
                                    day:    "numeric",
                                }).format(entry.createdDate)}
                            </span>
                        </span>
                        <br />
                        <span className="comment">{comment.text}</span>
                    </div>
                )}
                {currentUser ? (
                        <form onSubmit={e => this.comment(e, entry._id)} className="form box mb-3">
                            <div className="form-group">
                                <textarea aria-label="Your Comment" onChange={e => this.setState({comment: e.target.value})} value={this.state.comment} type="text" className="form-control" id="comment" placeholder="Enter comment" />
                            </div>
                            <button type="submit" className="btn btn-primary">Comment</button>
                        </form>
                    ) : (
                        <div className="alert alert-warning mt-3" role="alert">
                            Login to comment!
                        </div>
                    )
                }
            </div>
        );
    }
});