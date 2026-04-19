const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://kumarkunal8482:TIrldAOZWhoK86Y4@ac-whz2klh-shard-00-00.aki2nya.mongodb.net:27017,ac-whz2klh-shard-00-01.aki2nya.mongodb.net:27017,ac-whz2klh-shard-00-02.aki2nya.mongodb.net:27017/digital-menu?ssl=true&replicaSet=atlas-yrv5p8-shard-0&authSource=admin&retryWrites=true&w=majority&appName=digital-menu";

async function getDetails() {
  try {
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      family: 4
    });
    console.log("Connected to MongoDB");

    const Restaurant = mongoose.model('Restaurant', new mongoose.Schema({
      name: String,
      slug: String,
      adminPassword: String
    }, { collection: 'restaurants' }));

    const Order = mongoose.model('Order', new mongoose.Schema({
      customerName: String,
      tableNumber: String,
      restaurantSlug: String
    }, { collection: 'orders' }));

    const restaurants = await Restaurant.find({});
    const orders = await Order.find({});

    console.log("\n--- RESTAURANT ADMINS ---");
    restaurants.forEach(r => {
      console.log(`Restaurant: ${r.name} | Slug (Username): ${r.slug} | Password: ${r.adminPassword}`);
    });

    console.log("\n--- CUSTOMERS (FROM ORDERS) ---");
    const uniqueCustomers = [...new Set(orders.map(o => `${o.customerName} (Table ${o.tableNumber}) at ${o.restaurantSlug}`))];
    uniqueCustomers.forEach(c => console.log(c));

    process.exit(0);
  } catch (err) {
    console.error("ERROR:", err.message);
    process.exit(1);
  }
}

getDetails();
