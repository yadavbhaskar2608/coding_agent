const Note = require('../models/note.model.js');

// Create and Save a new Note
exports.create = (req, res) => {
    // Validate request
    if(!req.body.content) {
        return res.status(400).send({
            message: "Note content can not be empty"
        });
    }

    // Process tags array if passed as string or array
    let tags = [];
    if (req.body.tags) {
        tags = Array.isArray(req.body.tags)
            ? req.body.tags
            : String(req.body.tags).split(',').map(t => t.trim()).filter(Boolean);
    }

    // Create a Note
    const note = new Note({
        title: req.body.title || "Untitled Note", 
        content: req.body.content,
        category: req.body.category || "General",
        tags: tags
    });

    // Save Note in the database
    note.save()
    .then(data => {
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Note."
        });
    });
};

// Retrieve and return all notes from the database (with support for search, filtering, and sorting).
exports.findAll = (req, res) => {
    const filter = {};

    // Search by title or content (query param: search or q)
    const searchTerm = req.query.search || req.query.q;
    if (searchTerm) {
        filter.$or = [
            { title: { $regex: searchTerm, $options: 'i' } },
            { content: { $regex: searchTerm, $options: 'i' } }
        ];
    }

    // Filter by category
    if (req.query.category) {
        filter.category = { $regex: new RegExp('^' + req.query.category + '$', 'i') };
    }

    // Filter by tag(s)
    const tagFilter = req.query.tag || req.query.tags;
    if (tagFilter) {
        const tagList = Array.isArray(tagFilter)
            ? tagFilter
            : String(tagFilter).split(',').map(t => t.trim()).filter(Boolean);
        if (tagList.length > 0) {
            filter.tags = { $in: tagList };
        }
    }

    // Sorting parameters
    const sortBy = req.query.sortBy || 'createdAt';
    const order = req.query.order === 'asc' ? 1 : -1;

    Note.find(filter)
    .sort({ [sortBy]: order })
    .then(notes => {
        res.send(notes);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving notes."
        });
    });
};

// Find a single note with a noteId
exports.findOne = (req, res) => {
    Note.findById(req.params.noteId)
    .then(note => {
        if(!note) {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });            
        }
        res.send(note);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });                
        }
        return res.status(500).send({
            message: "Error retrieving note with id " + req.params.noteId
        });
    });
};

// Update a note identified by the noteId in the request
exports.update = (req, res) => {
    // Validate Request
    if(!req.body.content) {
        return res.status(400).send({
            message: "Note content can not be empty"
        });
    }

    const updateFields = {
        title: req.body.title || "Untitled Note",
        content: req.body.content
    };

    if (req.body.category !== undefined) {
        updateFields.category = req.body.category;
    }

    if (req.body.tags !== undefined) {
        updateFields.tags = Array.isArray(req.body.tags)
            ? req.body.tags
            : String(req.body.tags).split(',').map(t => t.trim()).filter(Boolean);
    }

    // Find note and update it with the request body
    Note.findByIdAndUpdate(req.params.noteId, updateFields, {new: true})
    .then(note => {
        if(!note) {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });
        }
        res.send(note);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });                
        }
        return res.status(500).send({
            message: "Error updating note with id " + req.params.noteId
        });
    });
};

// Delete a note with the specified noteId in the request
exports.delete = (req, res) => {
    Note.findByIdAndRemove(req.params.noteId)
    .then(note => {
        if(!note) {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });
        }
        res.send({message: "Note deleted successfully!"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });                
        }
        return res.status(500).send({
            message: "Could not delete note with id " + req.params.noteId
        });
    });
};
