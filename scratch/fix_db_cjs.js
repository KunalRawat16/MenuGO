const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://kumarkunal8482:TIrldAOZWhoK86Y4@ac-whz2klh-shard-00-00.aki2nya.mongodb.net:27017,ac-whz2klh-shard-00-01.aki2nya.mongodb.net:27017,ac-whz2klh-shard-00-02.aki2nya.mongodb.net:27017/digital-menu?ssl=true&replicaSet=atlas-yrv5p8-shard-0&authSource=admin&retryWrites=true&w=majority&appName=digital-menu";

const RestaurantSchema = new mongoose.Schema({
  name: String,
  logo: String,
  banner: String,
  slug: String
});

const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', RestaurantSchema);

async function fixPaths() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
    
    const restaurants = await Restaurant.find({});
    for (const r of restaurants) {
      let changed = false;
      if (r.logo && r.logo.includes("localhost:3000")) {
        r.logo = r.logo.replace(/http:\/\/localhost:3000/g, "");
        changed = true;
      }
      if (r.banner && r.banner.includes("localhost:3000")) {
        r.banner = r.banner.replace(/http:\/\/localhost:3000/g, "");
        changed = true;
      }
      
      if (changed) {
        await r.save();
        console.log(`Fixed paths for ${r.name} (${r.slug})`);
      }
    }
    
    console.log("Database fix complete.");
    process.exit(0);
  } catch (err) {
    console.error("Error fixing database:", err);
    process.exit(1);
  }
}

fixPaths();
