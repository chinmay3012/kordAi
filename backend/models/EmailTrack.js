import mongoose from "mongoose";

const emailTrackSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
    },
    companyName: {
        type: String,
        required: true,
    },
    position: {
        type: String,
        required: true,
    },
    founderEmail: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["sent", "opened", "replied"],
        default: "sent",
    },
    sentAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model("EmailTrack", emailTrackSchema);
