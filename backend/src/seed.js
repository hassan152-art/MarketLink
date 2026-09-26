import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { getDB, saveDB, connectDB, flush } from './config/db.js';

dotenv.config();

export const seedDatabase = async () => {
  const passwordHash = await bcrypt.hash('password123', 10);
  const adminHash = await bcrypt.hash('admin123', 10);

  const initialSeed = {
    users: [
      {
        id: 1,
        username: 'admin_master',
        email: 'admin@marketlink.com',
        password_hash: adminHash,
        role: 'Admin',
        name: 'Platform Administrator',
        contact_number: '+1 (555) 019-2831',
        address: '100 Green Tech Plaza, Suite 400',
        status: 'active',
        created_at: new Date('2026-01-01').toISOString()
      },
      {
        id: 2,
        username: 'greenacres',
        email: 'farmer1@marketlink.com',
        password_hash: passwordHash,
        role: 'Farmer',
        name: 'Robert Vance (Green Acres Farm)',
        stall_name: 'Green Acres Organic Produce',
        contact_number: '+1 (555) 234-5678',
        address: '452 Valley View Road, Farmville',
        markets_attended: [1, 2],
        operating_days: ['Saturday', 'Sunday', 'Wednesday'],
        pickup_time_windows: '8:00 AM - 2:00 PM',
        latitude: 40.7829,
        longitude: -73.9654,
        status: 'approved',
        bio: 'Family-owned pesticide-free organic vegetable farm serving the local community for 3 generations.',
        created_at: new Date('2026-01-10').toISOString()
      },
      {
        id: 3,
        username: 'sunvalley',
        email: 'farmer2@marketlink.com',
        password_hash: passwordHash,
        role: 'Farmer',
        name: 'Elena Rostova (Sun Valley Dairy & Orchard)',
        stall_name: 'Sun Valley Fresh Dairy & Berries',
        contact_number: '+1 (555) 345-6789',
        address: '88 Meadowbrook Lane, Hillside',
        markets_attended: [1, 3],
        operating_days: ['Friday', 'Saturday'],
        pickup_time_windows: '9:00 AM - 3:00 PM',
        latitude: 40.7589,
        longitude: -73.9851,
        status: 'approved',
        bio: 'Artisan cheese, grass-fed fresh milk, raw honey, and handpicked organic berries.',
        created_at: new Date('2026-01-12').toISOString()
      },
      {
        id: 4,
        username: 'heritagefarm',
        email: 'farmer3@marketlink.com',
        password_hash: passwordHash,
        role: 'Farmer',
        name: 'David Miller (Heritage Homestead)',
        stall_name: 'Heritage Bakery & Free-Range Poultry',
        contact_number: '+1 (555) 456-7890',
        address: '12 Timberland Road, Pine Ridge',
        markets_attended: [2, 3],
        operating_days: ['Sunday', 'Thursday'],
        pickup_time_windows: '8:30 AM - 1:00 PM',
        latitude: 40.7128,
        longitude: -74.0060,
        status: 'approved',
        bio: 'Sourdough breads, pasture-raised eggs, organic poultry, and homemade fruit preserves.',
        created_at: new Date('2026-01-15').toISOString()
      },
      {
        id: 5,
        username: 'sarah_j',
        email: 'customer1@marketlink.com',
        password_hash: passwordHash,
        role: 'Customer',
        name: 'Sarah Johnson',
        contact_number: '+1 (555) 876-5432',
        address: '742 Evergreen Terrace, Cityville',
        status: 'active',
        created_at: new Date('2026-02-01').toISOString()
      },
      {
        id: 6,
        username: 'michael_b',
        email: 'customer2@marketlink.com',
        password_hash: passwordHash,
        role: 'Customer',
        name: 'Michael Brown',
        contact_number: '+1 (555) 987-6543',
        address: '120 Oakwood Avenue, Apt 4B',
        status: 'active',
        created_at: new Date('2026-02-05').toISOString()
      }
    ],

    markets: [
      {
        id: 1,
        name: 'Central Park Farmers Market',
        address: '79th St & 5th Ave, Central Park, NY 10021',
        operating_days: ['Saturday', 'Sunday'],
        operating_hours: '8:00 AM - 3:00 PM',
        latitude: 40.7829,
        longitude: -73.9654,
        description: 'New York’s flagship weekend community market offering fresh local harvests, artisanal cheeses, and live cooking demos.',
        map_provider: 'OpenStreetMap',
        image_url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 2,
        name: 'Downtown Union Plaza Market',
        address: '1 Union Square W, New York, NY 10003',
        operating_days: ['Wednesday', 'Saturday'],
        operating_hours: '8:00 AM - 4:00 PM',
        latitude: 40.7359,
        longitude: -73.9911,
        description: 'Bustling midweek and weekend bazaar featuring over 40 regional growers, plant nurseries, and organic bakers.',
        map_provider: 'OpenStreetMap',
        image_url: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 3,
        name: 'Riverside Waterfront Greenmarket',
        address: 'Riverside Park at 96th Street, NY 10025',
        operating_days: ['Friday', 'Sunday'],
        operating_hours: '9:00 AM - 2:00 PM',
        latitude: 40.7952,
        longitude: -73.9723,
        description: 'Scenic waterfront market offering seasonal fruits, pasture-raised meats, fresh flowers, and fresh squeezed juices.',
        map_provider: 'OpenStreetMap',
        image_url: 'https://images.unsplash.com/photo-1573246123716-6b1782bfc499?auto=format&fit=crop&w=800&q=80'
      }
    ],

    categories: [
      { id: 1, name: 'Organic Vegetables', icon: 'Carrot', description: 'Freshly harvested carrots, leafy greens, heirloom tomatoes, and root veggies' },
      { id: 2, name: 'Fresh Fruits & Berries', icon: 'Apple', description: 'Crisp apples, wild berries, juicy peaches, and orchard delights' },
      { id: 3, name: 'Artisan Dairy & Cheese', icon: 'Milk', description: 'Raw milk, farm-fresh butter, Greek yogurt, and aged farm cheeses' },
      { id: 4, name: 'Fresh Bakery & Grains', icon: 'Bread', description: 'Artisanal sourdough, whole-grain loaves, and freshly baked pastries' },
      { id: 5, name: 'Poultry & Eggs', icon: 'Egg', description: 'Pasture-raised organic eggs, free-range chicken, and turkey cuts' },
      { id: 6, name: 'Honey, Jams & Preserves', icon: 'Jar', description: 'Pure raw wildflowers honey, maple syrup, and handmade fruit jams' }
    ],

    products: [
      {
        id: 1,
        farmer_id: 2,
        market_id: 1,
        name: 'Heirloom Organic Tomatoes',
        category: 'Organic Vegetables',
        price: 4.99,
        unit: 'per lb',
        stock_quantity: 85,
        status: 'available',
        description: 'Sweet, juicy, multi-colored heirloom tomatoes grown without synthetic pesticides.',
        image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
        created_at: new Date('2026-02-10').toISOString()
      },
      {
        id: 2,
        farmer_id: 2,
        market_id: 1,
        name: 'Crisp Baby Spinach & Kale Mix',
        category: 'Organic Vegetables',
        price: 3.50,
        unit: 'per bag (8 oz)',
        stock_quantity: 40,
        status: 'available',
        description: 'Triple-washed nutrient-dense organic baby spinach and tender kale leaves.',
        image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80',
        created_at: new Date('2026-02-12').toISOString()
      },
      {
        id: 3,
        farmer_id: 3,
        market_id: 1,
        name: 'Raw Wildflower Honey Jar',
        category: 'Honey, Jams & Preserves',
        price: 12.00,
        unit: '16 oz jar',
        stock_quantity: 25,
        status: 'available',
        description: 'Unfiltered, unpasteurized honey harvested straight from local hives rich in floral pollen.',
        image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
        created_at: new Date('2026-02-14').toISOString()
      },
      {
        id: 4,
        farmer_id: 3,
        market_id: 2,
        name: 'Grass-Fed Whole Whole Milk',
        category: 'Artisan Dairy & Cheese',
        price: 6.50,
        unit: '1 Half Gallon',
        stock_quantity: 30,
        status: 'available',
        description: 'Creamy non-homogenized milk from pasture-raised Jersey cows.',
        image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
        created_at: new Date('2026-02-15').toISOString()
      },
      {
        id: 5,
        farmer_id: 4,
        market_id: 2,
        name: 'Artisan Country Sourdough Loaf',
        category: 'Fresh Bakery & Grains',
        price: 8.00,
        unit: 'per loaf',
        stock_quantity: 20,
        status: 'available',
        description: 'Naturally fermented 36-hour sourdough loaf with a crispy crust and chewy airy crumb.',
        image_url: 'https://images.unsplash.com/photo-1585478259715-876a6a81fc08?auto=format&fit=crop&w=800&q=80',
        created_at: new Date('2026-02-18').toISOString()
      },
      {
        id: 6,
        farmer_id: 4,
        market_id: 3,
        name: 'Pasture-Raised Brown Farm Eggs',
        category: 'Poultry & Eggs',
        price: 7.50,
        unit: 'per dozen',
        stock_quantity: 50,
        status: 'available',
        description: 'Large brown eggs from hens free to forage outdoors on organic clover fields.',
        image_url: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=800&q=80',
        created_at: new Date('2026-02-20').toISOString()
      },
      {
        id: 7,
        farmer_id: 3,
        market_id: 3,
        name: 'Organic Sweet Blueberries',
        category: 'Fresh Fruits & Berries',
        price: 5.99,
        unit: 'per pint',
        stock_quantity: 35,
        status: 'available',
        description: 'Handpicked sun-ripened organic blueberries packed with antioxidants.',
        image_url: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=800&q=80',
        created_at: new Date('2026-02-22').toISOString()
      }
    ],

    orders: [
      {
        id: 101,
        customer_id: 5,
        farmer_id: 2,
        market_id: 1,
        items: [
          { product_id: 1, name: 'Heirloom Organic Tomatoes', price: 4.99, quantity: 2, unit: 'per lb' },
          { product_id: 2, name: 'Crisp Baby Spinach & Kale Mix', price: 3.50, quantity: 1, unit: 'per bag (8 oz)' }
        ],
        total_amount: 13.48,
        pickup_date: '2026-09-26',
        pickup_time_slot: '10:00 AM - 11:00 AM',
        order_status: 'ready_for_pickup',
        payment_method: 'Pay on Pickup (Cash/Card)',
        notes: 'Please select firm tomatoes if possible.',
        created_at: new Date('2026-09-22T10:30:00').toISOString()
      },
      {
        id: 102,
        customer_id: 6,
        farmer_id: 4,
        market_id: 2,
        items: [
          { product_id: 5, name: 'Artisan Country Sourdough Loaf', price: 8.00, quantity: 1, unit: 'per loaf' },
          { product_id: 6, name: 'Pasture-Raised Brown Farm Eggs', price: 7.50, quantity: 1, unit: 'per dozen' }
        ],
        total_amount: 15.50,
        pickup_date: '2026-09-27',
        pickup_time_slot: '11:00 AM - 12:00 PM',
        order_status: 'accepted',
        payment_method: 'Pay on Pickup (Cash/Card)',
        notes: '',
        created_at: new Date('2026-09-22T14:15:00').toISOString()
      }
    ],

    reviews: [
      {
        id: 1,
        farmer_id: 2,
        product_id: 1,
        customer_id: 5,
        customer_name: 'Sarah Johnson',
        rating: 5,
        comment: 'The sweetest tomatoes I have ever tasted! You can really tell they are grown naturally with love.',
        farmer_response: 'Thank you Sarah! Glad you enjoyed this week harvest.',
        created_at: new Date('2026-09-20').toISOString()
      },
      {
        id: 2,
        farmer_id: 4,
        product_id: 5,
        customer_id: 6,
        customer_name: 'Michael Brown',
        rating: 5,
        comment: 'Crust was perfection. Sourdough smell filled my whole kitchen! Will be ordering weekly.',
        farmer_response: '',
        created_at: new Date('2026-09-21').toISOString()
      }
    ],

    favorites: [
      { customer_id: 5, farmer_id: 2, product_id: 1 },
      { customer_id: 5, farmer_id: 3, product_id: 3 }
    ],

    announcements: [
      {
        id: 1,
        title: 'Fall Harvest Special Festival!',
        content: 'Join us this Saturday at Central Park Farmers Market for free apple cider tastings and fresh pumpkin pickings!',
        author: 'Admin',
        date: '2026-09-22'
      }
    ],

    reports: [
      {
        id: 1,
        report_type: 'Monthly Sales Summary',
        period: 'September 2026',
        total_orders: 142,
        total_revenue: 3480.50,
        top_farmer: 'Green Acres Organic Produce',
        generated_at: new Date('2026-09-22').toISOString()
      }
    ]
  };

  saveDB(initialSeed);
  console.log('✅ MarketLink Database successfully seeded!');
};

// Execute if run directly (e.g. `npm run seed`)
if (process.argv[1]?.includes('seed.js')) {
  connectDB()
    .then(() => seedDatabase())
    .then(() => flush())
    .then(() => {
      console.log('💾 Seed data flushed to MongoDB.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    });
}
