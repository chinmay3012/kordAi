import mongoose from "mongoose";

/**
 * Database Connection Configuration
 * Handles MongoDB connection with retry logic and connection events
 */

const MONGO_OPTIONS = {
    // Connection pool settings
    maxPoolSize: 10,
    minPoolSize: 2,

    // Timeout settings
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,

    // Keep alive
    heartbeatFrequencyMS: 10000,
};

let isConnected = false;

/**
 * Connect to MongoDB with retry logic
 */
export async function connectDB(retries = 5) {
    if (isConnected) {
        console.log("📦 Using existing MongoDB connection");
        return;
    }

    const uri = process.env.MONGO_URI;

    if (!uri) {
        console.error("❌ MONGO_URI is not defined in environment variables");
        process.exit(1);
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await mongoose.connect(uri, MONGO_OPTIONS);
            isConnected = true;
            console.log("✅ MongoDB connected successfully");
            console.log(`📊 Database: ${mongoose.connection.name}`);
            return;
        } catch (err) {
            console.error(`❌ MongoDB connection attempt ${attempt}/${retries} failed:`, err.message);

            if (attempt === retries) {
                console.error("❌ All connection attempts failed. Exiting...");
                process.exit(1);
            }

            // Wait before retrying (exponential backoff)
            const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000);
            console.log(`⏳ Retrying in ${waitTime / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
}

/**
 * Disconnect from MongoDB gracefully
 */
export async function disconnectDB() {
    if (!isConnected) return;

    try {
        await mongoose.disconnect();
        isConnected = false;
        console.log("📴 MongoDB disconnected");
    } catch (err) {
        console.error("❌ Error disconnecting from MongoDB:", err);
    }
}

/**
 * Get connection status
 */
export function getConnectionStatus() {
    return {
        isConnected,
        readyState: mongoose.connection.readyState,
        // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
        readyStateLabel: ["disconnected", "connected", "connecting", "disconnecting"][
            mongoose.connection.readyState
        ],
        database: mongoose.connection.name || null,
    };
}

// Connection event handlers
mongoose.connection.on("connected", () => {
    isConnected = true;
    console.log("🔗 Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
    console.error("❌ Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
    isConnected = false;
    console.log("🔌 Mongoose disconnected from MongoDB");
});

// Handle graceful shutdown
process.on("SIGINT", async () => {
    await disconnectDB();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    await disconnectDB();
    process.exit(0);
});

export default { connectDB, disconnectDB, getConnectionStatus };
