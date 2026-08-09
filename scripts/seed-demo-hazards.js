import { connectToDatabase } from "../lib/mongodb.js";

const locations = [
    ["Srinagar", 34.0837, 74.7973], ["Jammu", 32.7266, 74.8570], ["Shimla", 31.1048, 77.1734], ["Chandigarh", 30.7333, 76.7794], ["Amritsar", 31.6340, 74.8723], ["Delhi", 28.6139, 77.2090], ["Gurugram", 28.4595, 77.0266], ["Jaipur", 26.9124, 75.7873], ["Lucknow", 26.8467, 80.9462], ["Agra", 27.1767, 78.0081],
    ["Dehradun", 30.3165, 78.0322], ["Patna", 25.5941, 85.1376], ["Ranchi", 23.3441, 85.3096], ["Kolkata", 22.5726, 88.3639], ["Siliguri", 26.7271, 88.3953], ["Guwahati", 26.1445, 91.7362], ["Bhubaneswar", 20.2961, 85.8245], ["Raipur", 21.2514, 81.6296], ["Bhopal", 23.2599, 77.4126], ["Indore", 22.7196, 75.8577],
    ["Ahmedabad", 23.0225, 72.5714], ["Surat", 21.1702, 72.8311], ["Mumbai", 19.0760, 72.8777], ["Pune", 18.5204, 73.8567], ["Nagpur", 21.1458, 79.0882], ["Panaji", 15.4909, 73.8278], ["Hyderabad", 17.3850, 78.4867], ["Visakhapatnam", 17.6868, 83.2185], ["Vijayawada", 16.5062, 80.6480], ["Bengaluru", 12.9716, 77.5946],
    ["Mysuru", 12.2958, 76.6394], ["Chennai", 13.0827, 80.2707], ["Coimbatore", 11.0168, 76.9558], ["Madurai", 9.9252, 78.1198], ["Kochi", 9.9312, 76.2673], ["Thiruvananthapuram", 8.5241, 76.9366], ["Mangaluru", 12.9141, 74.8560], ["Varanasi", 25.3176, 82.9739], ["Kanpur", 26.4499, 80.3319], ["Meerut", 28.9845, 77.7064],
    ["Nashik", 19.9975, 73.7898], ["Aurangabad", 19.8762, 75.3433], ["Vadodara", 22.3072, 73.1812], ["Rajkot", 22.3039, 70.8022], ["Jodhpur", 26.2389, 73.0243], ["Udaipur", 24.5854, 73.7125], ["Jabalpur", 23.1815, 79.9864], ["Durg", 21.1904, 81.2849], ["Cuttack", 20.4625, 85.8828], ["Dhanbad", 23.7957, 86.4304],
    ["Darjeeling", 27.0410, 88.2663], ["Imphal", 24.8170, 93.9368], ["Shillong", 25.5788, 91.8933], ["Aizawl", 23.7271, 92.7176], ["Kohima", 25.6751, 94.1086], ["Agartala", 23.8315, 91.2868], ["Itanagar", 27.0844, 93.6053], ["Port Blair", 11.6234, 92.7265], ["Kavaratti", 10.5667, 72.6417], ["Leh", 34.1526, 77.5771],
];
const types = ["road-accident", "fire", "flooding", "landslide", "blocked-route", "infrastructure", "electrical", "pollution", "severe-weather", "other"];
const descriptions = {
    "road-accident": "Traffic obstruction reported. Use caution and follow local diversion signs.", fire: "Smoke or fire risk reported. Keep clear and contact emergency services if immediate danger is present.", flooding: "Waterlogging reported near the marked area. Avoid driving through standing water.", landslide: "Debris or slope instability reported. Avoid the affected route.", "blocked-route": "Public route obstruction reported. Check for an alternate route.", infrastructure: "Potentially unsafe public infrastructure reported. Keep a safe distance.", electrical: "Electrical safety concern reported. Do not touch fallen wires or equipment.", pollution: "Possible pollution or waste hazard reported. Avoid direct contact.", "severe-weather": "Weather-related hazard reported. Follow official local advisories.", other: "Public safety concern reported. Exercise caution in the area.",
};

const connection = await connectToDatabase();
const users = connection.connection.db.collection("users");
const hazards = connection.connection.db.collection("hazards");
const demoEmail = "demo-reports@jagrukbharat.local";
await users.updateOne({ email: demoEmail }, { $setOnInsert: { email: demoEmail, firstName: "Jagruk", lastName: "Demo", region: "India", role: "citizen", status: "active", emailVerifiedAt: new Date(), createdAt: new Date(), updatedAt: new Date() } }, { upsert: true });
const reporter = await users.findOne({ email: demoEmail }, { projection: { _id: 1 } });
const now = Date.now();
for (let index = 0; index < locations.length; index += 1) {
    const [place, lat, lng] = locations[index]; const type = types[index % types.length]; const severity = index % 7 === 0 ? "high" : index % 3 === 0 ? "medium" : "low";
    const emergency = index % 11 === 0; const approved = index % 4 === 0;
    await hazards.updateOne({ id: `sample-hazard-${String(index + 1).padStart(2, "0")}` }, { $set: {
        title: `Sample Hazard ${String(index + 1).padStart(2, "0")} — ${place}`, type, severity, lat, lng, location: { type: "Point", coordinates: [lng, lat] }, locationDescription: `${place} (sample data)`, description: descriptions[type], reports: 1 + (index % 5), upvotes: 3 + ((index * 7) % 47), downvotes: index % 6, emergency, isDemo: true, verificationStatus: approved ? "admin-approved" : "community", status: "active", moderationStatus: "published", expiresAt: new Date(now + 365 * 24 * 60 * 60 * 1000), deleteAfter: new Date(now + 730 * 24 * 60 * 60 * 1000), reportedByUserId: reporter._id, createdAt: new Date(now - index * 47 * 60 * 1000).toISOString(),
    }, $setOnInsert: { id: `sample-hazard-${String(index + 1).padStart(2, "0")}` } }, { upsert: true });
}
console.log(`Seeded ${locations.length} labelled sample hazards. Existing non-sample reports were not changed.`);
