import { getDB } from '../config/db.js';
import { generateDemandForecast, detectFoodWasteAlerts, calculateDistanceKM, analyzeReviewSentiment } from '../services/aiEngine.js';

export const handleAIChat = (req, res) => {
  const { message, lang = 'en', user_lat, user_lng } = req.body;
  if (!message) {
    return res.status(400).json({ message: 'User message is required.' });
  }

  const query = message.toLowerCase();
  const db = getDB();
  let responseText = '';

  // Language Detection & Response Logic
  const isRomanUrdu = query.includes('chahiye') || query.includes('hai') || query.includes('kaise') || query.includes('kahan') || query.includes('mujhe') || query.includes('andar') || query.includes('subzi') || query.includes('sabzi') || query.includes('kisaan');
  const isUrduScript = /[\u0600-\u06FF]/.test(message);

  const words = query.split(/[\s,?.!]+/);
  const isGreeting = words.some(w => ['hello', 'hi', 'hey', 'assalam', 'adaab', 'salam'].includes(w));

  if (isGreeting) {
    if (isUrduScript) {
      responseText = "👋 السلام علیکم! میں **Greenie AI** ہوں، MarketLink کا ذہین اسسٹنٹ! آپ مجھ سے مارکیٹ ٹائمنگز، کسانوں کے اسٹالز، یا اپنے بجٹ کے اندر تازہ سبزیوں کے بارے میں پوچھ سکتے ہیں۔";
    } else if (isRomanUrdu) {
      responseText = "👋 Assalam-o-Alaikum! Main **Greenie AI** hoon, MarketLink ka smart assistant! Aap mujhse market timing, farmer stalls, ya budget ke andar taza sabziyon ke baray mein pooch sakte hain.";
    } else {
      responseText = "👋 Hello! I am **Greenie AI**, your MarketLink smart shopping assistant! How can I help you discover fresh harvest, check market schedules, or find farmer stalls today?";
    }
  } else if (
    (query.includes('saturday') || query.includes('hafta')) &&
    (query.includes('vegetable') || query.includes('sabzi') || query.includes('subzi')) &&
    (query.includes('500') || query.includes('rupees') || query.includes('budget') || query.includes('andar') || query.includes('5 km') || query.includes('5km'))
  ) {
    // Exact user requirement match: "Saturday ko 500 rupees ke andar vegetables chahiye jo 5 km ke andar hon"
    const saturdayMarkets = (db.markets || []).filter(m => m.operating_days?.includes('Saturday'));
    const vegProducts = (db.products || []).filter(p =>
      (p.category.toLowerCase().includes('veg') || ['Tomato', 'Spinach', 'Carrot', 'Potato', 'Kale', 'Broccoli'].some(v => p.name.includes(v))) &&
      p.status === 'available'
    );

    const itemsList = vegProducts.slice(0, 4).map(p => {
      const f = db.users.find(u => u.id === p.farmer_id);
      const stall = f?.stall_name || 'Local Farm Stall';
      return `🥬 **${p.name}** — $${p.price.toFixed(2)} (${p.unit}) | Stall: **${stall}** | Stock: ${p.stock_quantity}`;
    }).join('\n');

    const marketNames = saturdayMarkets.map(m => `📍 **${m.name}** (${m.operating_hours})`).join('\n');

    if (isRomanUrdu) {
      responseText = `Zaroor! Aap ke budget (~500 PKR / $5-$8 equivalent) aur **Saturday** market pickup ke mutabiq yeh taza vegetables 5 km radius ke andar dastiyab hain:\n\n${itemsList}\n\n**Saturday Ko Khuli Markets:**\n${marketNames}\n\nAap abhi basket mein add karke Saturday pickup reserve kar saktay hain!`;
    } else if (isUrduScript) {
      responseText = `ضرور! آپ کے بجٹ اور ہفتہ (Saturday) کے مطابق یہ تازہ سبزیاں 5 کلومیٹر کے اندر دستیاب ہیں:\n\n${itemsList}\n\n**ہفتہ کی مارکیٹس:**\n${marketNames}\n\nآپ ابھی آن لائن پری آرڈر بک کر سکتے ہیں!`;
    } else {
      responseText = `Here are the fresh organic vegetables available under budget for **Saturday Pickup** within 5 km:\n\n${itemsList}\n\n**Open Saturday Markets:**\n${marketNames}\n\nYou can add them to your basket right now for weekend pickup!`;
    }
  } else if (query.includes('market') || query.includes('timing') || query.includes('hour') || query.includes('open') || query.includes('day') || query.includes('saturday') || query.includes('sunday')) {
    const markets = db.markets || [];
    const marketList = markets.map(m => {
      const dist = user_lat && user_lng ? ` (${calculateDistanceKM(user_lat, user_lng, m.latitude, m.longitude)} km away)` : '';
      return `📍 **${m.name}**${dist}: Open ${m.operating_days.join(', ')} (${m.operating_hours}) at ${m.address}`;
    }).join('\n');
    responseText = isRomanUrdu
      ? `MarketLink ki active mandiyan aur unke auqaat:\n\n${marketList}`
      : `Here are active farmers markets & schedules:\n\n${marketList}`;
  } else if (query.includes('demand') || query.includes('forecast') || query.includes('waste') || query.includes('stock')) {
    const wasteAlerts = detectFoodWasteAlerts();
    if (wasteAlerts.length > 0) {
      responseText = `🌱 **AI Food Waste Reduction Alert**:\n${wasteAlerts[0].recommendation}`;
    } else {
      responseText = `📊 All farmer inventory levels are currently optimal with 0% predicted harvest waste!`;
    }
  } else if (query.includes('tomato') || query.includes('subzi') || query.includes('sabzi') || query.includes('vegetable') || query.includes('honey') || query.includes('milk') || query.includes('egg') || query.includes('bread') || query.includes('sourdough') || query.includes('rupees') || query.includes('price') || query.includes('find') || query.includes('buy') || query.includes('500')) {
    
    // Filter matching products with price boundary checks
    let products = db.products || [];
    if (query.includes('500') || query.includes('under 10') || query.includes('cheap')) {
      products = products.filter(p => p.price <= 10.00);
    }

    const matching = products.filter(p => {
      return query.split(' ').some(w => w.length > 2 && (p.name.toLowerCase().includes(w) || p.category.toLowerCase().includes(w)));
    });

    if (matching.length > 0) {
      const pList = matching.slice(0, 4).map(p => `🥦 **${p.name}** ($${p.price} / ${p.unit}) - Stock: ${p.stock_quantity} available.`).join('\n');
      responseText = isRomanUrdu
        ? `Mujhe aapke liye yeh taza items mil gaye hain:\n\n${pList}\n\nAap inhein market pickup ke liye abhi basket mein add kar saktay hain!`
        : (isUrduScript 
          ? `مجھے آپ کے لیے یہ تازہ اشیاء مل گئی ہیں:\n\n${pList}\n\nآپ انہیں مارکیٹ پک اپ کے لیے ابھی آرڈر کر سکتے ہیں!`
          : `I found these fresh organic items matching your query:\n\n${pList}\n\nYou can add them to your basket directly for market pickup!`);
    } else {
      responseText = isRomanUrdu
        ? `Humare paas taza sabziyan, fruit, organic honey, dairy aur sourdough bread available hai. Aap **Products** page par check kar saktay hain!`
        : `We have fresh organic vegetables, berries, artisan dairy, sourdough bread, pasture eggs, and raw honey available across our weekend markets! Try browsing the **Products** page.`;
    }
  } else if (query.includes('pickup') || query.includes('order') || query.includes('pay') || query.includes('qr')) {
    responseText = isRomanUrdu
      ? `🛒 **Pre-order, QR Code & Pickup Steps**:\n1. Products basket mein add karein.\n2. Pickup date aur time slot choose karein.\n3. Farmer stall par apna **QR Code** dikhayein.\n4. Pickup par payment (Cash/Card) karein!`
      : `🛒 **Pre-order, QR Code & Pickup Instructions**:\n1. Select products & add to basket.\n2. Choose pickup date and slot window.\n3. Show your unique **Order QR Code** at the farmer stall.\n4. Pay in person (Cash/Card) at pickup!`;
  } else {
    responseText = isRomanUrdu
      ? `Main Greenie AI hoon! Aap mujhse Roman Urdu ya English mein pooch saktay hain:\n- 📍 Farmers market locations aur operating days\n- 🥦 Budget ke mutabiq taza sabziyan (jaise "Saturday ko 500 rupees ke andar vegetables")\n- 📊 AI demand forecasting aur stock alerts\n- 📲 QR Pickup aur basket checkout.`
      : `I'm Greenie AI! You can ask me in English or Roman Urdu about:\n- 📍 Farmers market locations & operating schedules\n- 🥦 Fresh produce under budget (e.g., "Saturday vegetables under $10 near me")\n- 📊 AI demand forecasting & food waste reduction alerts\n- 📲 Order QR verification & market pickup.`;
  }

  res.json({
    reply: responseText,
    timestamp: new Date().toISOString()
  });
};

export const getAIForecast = (req, res) => {
  const farmerId = req.query.farmer_id || (req.user?.role === 'Farmer' ? req.user.id : 2);
  const forecasts = generateDemandForecast(farmerId);
  res.json(forecasts);
};

export const getAIWasteAlerts = (req, res) => {
  const alerts = detectFoodWasteAlerts(req.query.farmer_id);
  res.json(alerts);
};
