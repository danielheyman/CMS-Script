const server = `http://localhost:3001`;
const fieldTypes = {
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
    "file": "Downloadable file",
}

$.ajaxSetup({
    type: "POST",
    data: {},
    dataType: 'json',
    xhrFields: {
       withCredentials: true
    },
    crossDomain: true
});

class StoreClass {
    constructor() {
        this.setLoading(true);
        this.loadData(() => {
            this.setLoading(false);
        })
    }

    isAdmin() {
        return this.getCurrentUser() && this.getCurrentUser().isAdmin;
    }

    getCurrentUser() {
        return this.getUsers().find(x => x._id === this.currentUserId);
    }

    getUsers() {
        return this.users;
    }

    getUser(_id) {
        return this.getUsers().find(user => user._id === _id);
    }

    getStructures() {
        return this.structures;
    }

    getStructure(slug) {
        if (slug === "new") {
            return {
                _id: "new",
                fields: []
            };
        }
        return this.getStructures().find(x => x.slug === slug);
    }

    getEntries() {
        return this.entries;
    }

    getEntriesByStructure(slug) {
        return this.getEntries().filter(x => x.structureSlug === slug);
    }

    getEntry(slug, entrySlug) {
        if (entrySlug === "new") {
            return {
                _id: "new",
            };
        }
        return this.getEntriesByStructure(slug).find(x => x.slug === entrySlug);
    }

    getEntryById(_id) {
        return this.getEntries().find(x => x._id === _id);
    }

    getEntryWithoutSlug(entrySlug) {
        return this.getEntries().find(x => x.slug === entrySlug);
    }

    getFieldTypes() {
        return fieldTypes;
    }

    setHistoryObject(history) {
        this.history = history;
    }

    setFlashedSuccess(flashedSuccess) {
        this.flashedSuccess = flashedSuccess;
    }

    setFlashedError(flashedError) {
        this.flashedError = flashedError;
    }

    redirect(location, flashedSuccess, flashedError) {
        this.setFlashedSuccess(flashedSuccess);
        this.setFlashedError(flashedError);
        this.history.push(location);
        this.setLoading(false);
    }

    getFlashedSuccess() {
        // Remove the message after one show
        const flashedSuccess = this.flashedSuccess;
        this.flashedSuccess = null;
        return flashedSuccess;
    }

    getFlashedError() {
        // Remove the message after one show
        const flashedError = this.flashedError;
        this.flashedError = null;
        return flashedError;
    }

    setLoading(loading) {
        if (loading !== this.loading) {
            this.loading = loading;
            this.trigger();
        }
    }

    isLoading() {
        return this.loading;
    }

    subscribe(cb) {
        this._subscribe = cb;
    }

    trigger() {
        if (this._subscribe) {
            this._subscribe();
        }
    }

    // API calls

    loadData(cb) {
        async.parallel(
            [cb => {
                $.get(`${server}/users`)
                .then(data => {
                    this.users = data.all || [];
                    this.currentUserId = data.currentUser;
                    cb();
                })
            }, cb => {
                $.get(`${server}/structures`)
                .then(data => {
                    this.structures = data || [];
                    cb();
                })
            }, cb => {
                $.get(`${server}/entries`)
                .then(data => {
                    this.entries = data || [];
                    cb();
                })
            }],
            cb
        );
    }

    search(structureSlug, search) {
        return $.ajax({
            method: "POST",
            url: `${server}/entries/search`,
            data: {structureSlug, search}
        })
        .catch(e => {
            this.setFlashedError("Something strange happened :(");
        })
    }

    saveUser(newUser) {
        this.setLoading(true);
        $.ajax({
            method: "POST",
            url: `${server}/users`,
            data: newUser
        })
        .then(data => {
            this.users.push(data);
            this.setFlashedSuccess("Successfully create user. You may now login.");
            this.setLoading(false);
        }).catch(e => {
            this.setFlashedError("Unable to create user");
            this.setLoading(false);
        })
    }

    saveStructure(structure) {
        this.setLoading(true);
        $.ajax({
            method: structure._id === "new" ? "POST" : "PUT",
            url: `${server}/structures`,
            data: JSON.stringify(structure),
            contentType: 'application/json',
        })
        .then(data => {
            if (structure._id === "new") {
                this.structures.push(data);
            } else {
                const index = this.structures.findIndex(x => x._id === structure._id);
                if (index !== -1) {
                    this.structures[index] = data;
                }
            }
            this.redirect("/admin/structures", "Successfully saved");
        })
        .catch(e => {
            this.redirect("/admin/structures", null, "Unable to save structure");
        })
    }

    saveEntry(entry) {
        this.setLoading(true);
        const structure = this.getStructure(entry.structureSlug);
        let data = new FormData();
        let fileNumber = 0;
        Object.keys(entry.fields).forEach(key => {
            if (entry.fields[key].constructor === FileList) {
                const field = structure.fields.find(f => f._id === key);
                data.append(`file-${fileNumber}`, entry.fields[key][0]);
                const toZip = field && field.type === "file";
                let ext = entry.fields[key][0].name.match(/\.\w+$/);
                ext = ext ? ext[0] : undefined;
                entry.fields[key] = {file: fileNumber, ext, toZip };
                fileNumber++;
            }
        });
        data.append('data', JSON.stringify(entry));
        $.ajax({
            method: entry._id === "new" ? "POST" : "PUT",
            url: `${server}/entries`,
            data: data,
            processData: false,
            contentType: false
        })
        .then(data => {
            if (entry._id === "new") {
                this.entries.push(data);
            } else {
                const index = this.entries.findIndex(x => x._id === entry._id);
                if (index !== -1) {
                    this.entries[index] = data;
                }
            }
            this.redirect(`/admin/structures/${entry.structureSlug}/list`, "Successfully saved");
        })
        .catch(e => {
            this.redirect(`/admin/structures/${entry.structureSlug}/list`, null, "Unable to save entry");
        })
    }

    addComment(entryId, comment) {
        this.setLoading(true);
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            return this.redirect(`/${entry.structureSlug}/${entry.slug}`, null, "Must be logged in");
        }
        const entry = this.getEntryById(entryId);
        $.ajax({
            method: "POST",
            url: `${server}/entries/comment`,
            data: { _id: entryId, comment }
        })
        .then(data => {
            entry.comments.push(data);
            this.redirect(`/${entry.structureSlug}/${entry.slug}`, "Successfully commented");
        })
        .catch(e => {
            this.redirect(`/${entry.structureSlug}/${entry.slug}`, null, "Unable to save entry");
        })
    }

    deleteStructure(_id) {
        this.setLoading(true);
        $.ajax({
            method: "DELETE",
            url: `${server}/structures`,
            data: {_id},
        })
        .then(data => {
            const index = this.structures.findIndex(x => x._id === _id);
            if (index !== -1) {
                this.structures.splice(index, 1);
            }
            this.redirect("/admin/structures", "Successfully deleted structure");
        })
        .catch(e => {
            this.redirect("/admin/structures", null, "Unable to delete structure");
        })
    }

    deleteEntry(_id) {
        const index = this.entries.findIndex(x => x._id === _id);
        if (index === -1) {
            return;
        }
        const structureSlug = this.entries[index].structureSlug;
        this.setLoading(true);
        $.ajax({
            method: "DELETE",
            url: `${server}/entries`,
            data: {_id},
        })
        .then(data => {
            this.entries.splice(index, 1);
            this.redirect(`/admin/structures/${structureSlug}/list`, "Successfully deleted entry");
        })
        .catch(e => {
            this.redirect(`/admin/structures/${structureSlug}/list`, "Unable to delete entry");
        });
    }

    promote(_id) {
        this.setLoading(true);
        $.ajax({
            method: "PUT",
            url: `${server}/users/promote`,
            data: {_id},
        })
        .then(data => {
            const user = this.users.find(x => x._id === _id);
            if (user) {
                user.isAdmin = true;
            }
            this.redirect("/admin/users", "Successfully promoted user");
        })
        .catch(e => {
            this.redirect("/admin/users", null, "Unable to promote user");
        });
    }

    toggleFavorite(_id) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            this.setFlashedError("You must be logged in");
            return this.trigger();
        }
        $.ajax({
            method: "PUT",
            url: `${server}/users/toggle-favorite`,
            data: {_id},
        })
        .then(data => {
            const index = currentUser.favorites.indexOf(_id);
            if (index === -1) {
                currentUser.favorites.push(_id);
            } else {
                currentUser.favorites.splice(index, 1);
            }
            this.trigger();
        })
        .catch(e => {
            this.setFlashedError("An unkown error occured");
            this.trigger();
        })
    }

    login(username, password) {
        this.setLoading(true);
        $.post(`${server}/login`, {username, password})
        .then(_id => {
            this.currentUserId = _id;
            this.setFlashedSuccess("Successfully logged in");
            this.setLoading(false);
        })
        .catch(e => {
            this.setFlashedError("Invalid username/password");
            this.setLoading(false);
        });
    }

    logout() {
        this.setLoading(true);
        $.post(`${server}/logout`)
        .then(() => {
            this.currentUserId = null;
            this.setFlashedSuccess("Successfully logged out");
            this.setLoading(false);
        })
    }
}

const Store = new StoreClass();