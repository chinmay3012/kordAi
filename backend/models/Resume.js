import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    name: {
        type: String,
        required: true,
        default: "My Resume",
    },
    fileUrl: {
        type: String,
    },
    content: {
        type: String, // Parsed text or builder data
    },
    version: {
        type: String,
        default: "1.0",
    },
    isPrimary: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model("Resume", resumeSchema);
