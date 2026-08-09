import { connectToDatabase } from "../lib/mongodb.js";
import { USER_ROLES } from "../lib/roles.js";

const [email, role] = process.argv.slice(2);
if (!email || !USER_ROLES.includes(role)) {
    console.error(`Usage: pnpm user:role <email> <${USER_ROLES.join("|")}>`);
    process.exit(1);
}

const connection = await connectToDatabase();
const users = connection.connection.db.collection("users");
const result = await users.findOneAndUpdate(
    { email: email.trim().toLowerCase() },
    { $set: { role, updatedAt: new Date() } },
    { returnDocument: "after", projection: { email: 1, role: 1 } },
);
if (!result) {
    console.error("User not found. Sign in to the app once before assigning a role.");
    process.exit(1);
}
console.log(`Updated ${result.email} to ${result.role}.`);
