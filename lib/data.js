import dbConnect from './db';
import Restaurant from '../models/Restaurant';

export const getRestaurantBySlug = async (slug) => {
  try {
    await dbConnect();
    const restaurant = await Restaurant.findOne({ slug }).lean();
    
    if (!restaurant) return null;
    
    // Deep clone and convert ObjectIds to strings for Next.js Server Components
    return JSON.parse(JSON.stringify(restaurant));
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
