import { connectToDatabase } from "../lib/mongodb.js";
import { User } from "../lib/models/user.js";
import { USER_ROLES } from "../lib/roles.js";

const [email, role] = process.argv.slice(2);
if (!email || !USER_ROLES.includes(role)) {
    console.error(`Usage: pnpm user:role <email> <${USER_ROLES.join("|")}>`);
    process.exit(1);
}

await connectToDatabase();
const user = await User.findOneAndUpdate({ email: email.trim().toLowerCase() }, { role }, { new: true });
if (!user) {
    console.error("User not found.");
    process.exit(1);
}
console.log(`Updated ${user.email} to ${role}.`);
