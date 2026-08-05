import mongoose from "mongoose";
import { connectToDatabase } from "../lib/mongodb.js";
import { normalizeEmail } from "../lib/auth-crypto.js";
import { Session } from "../lib/models/session.js";
import { User } from "../lib/models/user.js";

const email = normalizeEmail(process.argv[2]);
const reason = process.argv.slice(3).join(" ") || "Suspended by administrator";

if (!email) {
    console.error("Usage: pnpm user:suspend user@example.com Optional reason");
    process.exitCode = 1;
}
else {
    await connectToDatabase();
    const user = await User.findOneAndUpdate({ email }, {
        status: "suspended",
        suspendedAt: new Date(),
        suspensionReason: reason,
    }, { new: true });
    if (!user) {
        console.error("No account was found for that email.");
        process.exitCode = 1;
    }
    else {
        await Session.deleteMany({ userId: user._id });
        console.log(`Suspended ${user.email} and removed all active sessions.`);
    }
    await mongoose.disconnect();
}
