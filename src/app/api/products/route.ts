import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectDB();
    let products = await Product.find().sort({ order: 1 });

    // Seed initial data if empty
    if (products.length === 0) {
      const initialProducts = [
        {
          name: "Super Premium 98",
          category: "petrol",
          price: "85.50",
          image: "https://images.pexels.com/photos/38271/pumping-gas-gas-station-gas-pump-fuel-38271.jpeg?auto=compress&cs=tinysrgb&w=800",
          desc: "Highest octane rating for maximum engine performance and cleaner combustion.",
          features: ["Octane 98", "Engine Cleaning", "Anti-Knock"],
          order: 0
        },
        {
          name: "Premium Unleaded 95",
          category: "petrol",
          price: "82.20",
          image: "https://images.pexels.com/photos/1703312/pexels-photo-1703312.jpeg?auto=compress&cs=tinysrgb&w=800",
          desc: "Optimal balance of power and efficiency for modern passenger vehicles.",
          features: ["Octane 95", "Fuel Economy", "Standard Grade"],
          order: 1
        },
        {
          name: "Eco-Plus Petrol",
          category: "petrol",
          price: "81.50",
          image: "https://images.pexels.com/photos/257850/pexels-photo-257850.jpeg?auto=compress&cs=tinysrgb&w=800",
          desc: "Reduced emission formula optimized for hybrid and small-engine urban cars.",
          features: ["Low Carbon", "High MPG", "Hybrid Ready"],
          order: 2
        },
        {
          name: "Standard Petrol",
          category: "petrol",
          price: "79.80",
          image: "https://images.pexels.com/photos/979602/pexels-photo-979602.jpeg?auto=compress&cs=tinysrgb&w=800",
          desc: "Reliable, high-quality fuel for daily commuting and older vehicle models.",
          features: ["Octane 91", "Cost Effective", "Pure Distillate"],
          order: 3
        },
        {
          name: "Euro 6 Ultra Diesel",
          category: "diesel",
          price: "78.90",
          image: "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=800",
          desc: "Ultra-low sulfur formula designed for the latest heavy-duty Euro 6 engines.",
          features: ["Ultra Low Sulfur", "Particulate Filter Safe", "High Torque"],
          order: 4
        },
        {
          name: "High-Performance Diesel",
          category: "diesel",
          price: "76.50",
          image: "https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=800",
          desc: "Enhanced cetane rating for better ignition and power in commercial trucks.",
          features: ["High Cetane", "Cold Start Optimized", "Heavy Load"],
          order: 5
        },
        {
          name: "Bio-Diesel Blend",
          category: "diesel",
          price: "75.20",
          image: "https://images.pexels.com/photos/163726/belgium-antwerp-gas-station-fuel-163726.jpeg?auto=compress&cs=tinysrgb&w=800",
          desc: "Sustainable energy blend reducing reliance on traditional fossil distillates.",
          features: ["Eco-Friendly", "Renewable Source", "Clean Exhaust"],
          order: 6
        },
        {
          name: "Standard Nafta",
          category: "diesel",
          price: "73.80",
          image: "https://images.pexels.com/photos/2101137/pexels-photo-2101137.jpeg?auto=compress&cs=tinysrgb&w=800",
          desc: "Standard commercial diesel for transport logistics and industrial machinery.",
          features: ["Standard Grade", "High Volume", "Reliable"],
          order: 7
        }
      ];
      await Product.insertMany(initialProducts);
      products = await Product.find().sort({ order: 1 });
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error("products GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
