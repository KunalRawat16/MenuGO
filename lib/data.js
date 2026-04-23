import dbConnect from './db';
import Restaurant from '../models/Restaurant';

export const getRestaurantBySlug = async (slug) => {
  try {
    await dbConnect();
    let restaurant = await Restaurant.findOne({ slug });
    
    if (!restaurant) return null;

    // Check for subscription expiry
    if (restaurant.subscription && 
        restaurant.subscription.plan !== 'free' && 
        restaurant.subscription.validUntil && 
        new Date(restaurant.subscription.validUntil) < new Date()) {
      
      console.log(`Subscription expired for ${slug}. Downgrading to free plan.`);
      restaurant.subscription.plan = 'free';
      await restaurant.save();
    }
    
    // Convert to plain object for Next.js Server Components
    return JSON.parse(JSON.stringify(restaurant.toObject()));
  } catch (error) {
    console.error("Error getting restaurant:", error);
    return null;
  }
};

export const getAllRestaurants = async () => {
  try {
    await dbConnect();
    const restaurants = await Restaurant.find({}).lean();
    return JSON.parse(JSON.stringify(restaurants));
  } catch (error) {
    console.error("Error getting all restaurants:", error);
    return [];
  }
};
