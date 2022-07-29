const mongoose = require('mongoose')
const CommentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    postid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }
},
{
    timestamps: true
})

module.exports = mongoose.model('Comment', CommentSchema)