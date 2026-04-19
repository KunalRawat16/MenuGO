import dbConnect from "./lib/db.js";
import Restaurant from "./models/Restaurant.js";

async function fixPaths() {
  await dbConnect();
  const restaurants = await Restaurant.find({});
  for (const r of restaurants) {
    if (r.logo && r.logo.startsWith("http://localhost:3000")) {
      r.logo = r.logo.replace("http://localhost:3000", "");
    }
    if (r.banner && r.banner.startsWith("http://localhost:3000")) {
      r.banner = r.banner.replace("http://localhost:3000", "");
    }
    await r.save();
    console.log(`Fixed paths for ${r.name}`);
  }
  process.exit(0);
}

fixPaths();
