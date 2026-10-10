

import "dotenv/config";

import express from "express";

import cors from "cors";

import OpenAI from "openai";

import { connectDB, getDB } from "./db.js";



const app = express();

const PORT = 5000;



app.use(cors());

app.use(express.json());



const initialInventory = [

  { sku: "TV-5501", product: "55-inch Smart TV", brand: "Samsung", category: "Televisions", sellingPrice: 54999, imageUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=160&h=160&fit=crop", store: "Store A", stock: 4, dailySales: 2, ageingDays: 12 },

  { sku: "TV-5501", product: "55-inch Smart TV", brand: "Samsung", category: "Televisions", sellingPrice: 54999, imageUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=160&h=160&fit=crop", store: "Store B", stock: 12, dailySales: 0.5, ageingDays: 8 },

  { sku: "HEAD-100", product: "Wireless Headphones", brand: "Sony", category: "Audio", sellingPrice: 4999, imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=160&h=160&fit=crop", store: "Store C", stock: 12, dailySales: 5, ageingDays: 6 },

  { sku: "TV-OLD-40", product: "Previous-Generation TV", brand: "LG", category: "Televisions", sellingPrice: 29999, imageUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=160&h=160&fit=crop", store: "Store D", stock: 26, dailySales: 0.4, ageingDays: 100 },

  { sku: "PH-200", product: "5G Smartphone", brand: "Samsung", category: "Mobiles", sellingPrice: 32999, imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=160&h=160&fit=crop", store: "Store A", stock: 18, dailySales: 4, ageingDays: 10 },

  { sku: "LAP-300", product: "Performance Laptop", brand: "Lenovo", category: "Laptops", sellingPrice: 74999, imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=160&h=160&fit=crop", store: "Store B", stock: 7, dailySales: 1.5, ageingDays: 15 },

  { sku: "TAB-400", product: "Android Tablet", brand: "Samsung", category: "Tablets", sellingPrice: 24999, imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=160&h=160&fit=crop", store: "Store C", stock: 10, dailySales: 1.2, ageingDays: 22 },

  { sku: "WATCH-500", product: "Smartwatch", brand: "Apple", category: "Wearables", sellingPrice: 29999, imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=160&h=160&fit=crop", store: "Store D", stock: 3, dailySales: 1.4, ageingDays: 5 },

  { sku: "GAME-600", product: "Gaming Console", brand: "Sony", category: "Gaming", sellingPrice: 49999, imageUrl: "https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=160&h=160&fit=crop", store: "Store A", stock: 6, dailySales: 2, ageingDays: 9 },

  { sku: "CAM-700", product: "Digital Camera", brand: "Canon", category: "Cameras", sellingPrice: 45999, imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=160&h=160&fit=crop", store: "Store B", stock: 5, dailySales: 0.8, ageingDays: 35 },

  { sku: "EAR-800", product: "Wireless Earbuds", brand: "Sony", category: "Audio", sellingPrice: 7999, imageUrl: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=160&h=160&fit=crop", store: "Store C", stock: 20, dailySales: 6, ageingDays: 4 },

  { sku: "SPK-900", product: "Bluetooth Speaker", brand: "JBL", category: "Audio", sellingPrice: 5999, imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=160&h=160&fit=crop", store: "Store D", stock: 14, dailySales: 2.5, ageingDays: 18 },

  { sku: "WATCH-ABCD-01", product: "Smartwatch", brand: "Apple", category: "Wearables", sellingPrice: 29999, imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=160&h=160&fit=crop", store: "Store ABCD", stock: 4, dailySales: 2, ageingDays: 5 },

  { sku: "EAR-ABCD-02", product: "Wireless Earbuds", brand: "Sony", category: "Audio", sellingPrice: 7999, imageUrl: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=160&h=160&fit=crop", store: "Store ABCD", stock: 5, dailySales: 4, ageingDays: 4 },

  { sku: "PH-ABCD-03", product: "5G Smartphone", brand: "Samsung", category: "Mobiles", sellingPrice: 32999, imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=160&h=160&fit=crop", store: "Store ABCD", stock: 15, dailySales: 2, ageingDays: 10 },

  { sku: "SPK-ABCD-04", product: "Bluetooth Speaker", brand: "JBL", category: "Audio", sellingPrice: 5999, imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=160&h=160&fit=crop", store: "Store ABCD", stock: 20, dailySales: 1, ageingDays: 18 }

];



const initialPurchaseOrders = [

  {

    id: "PO-1001",

    supplier: "Supplier A",

    sku: "TV-5501",

    quantity: 10,

    expectedDate: "2026-10-07",

    status: "Delayed"

  }

];



async function seedCollection(collectionName, initialData) {

  const collection = getDB().collection(collectionName);



  for (const item of initialData) {

    const filter =

      collectionName === "inventory"

        ? { sku: item.sku, store: item.store }

        : { id: item.id };



    await collection.updateOne(

      filter,

      { $setOnInsert: item },

      { upsert: true }

    );

  }



  console.log(`Checked sample data for ${collectionName}`);

}



app.get("/api/health", async (req, res) => {

  try {

    await getDB().command({ ping: 1 });

    res.json({

      success: true,

      message: "Festival Rush API and MongoDB are connected"

    });

  } catch (error) {

    res.status(500).json({ success: false, message: error.message });

  }

});



app.get("/api/dashboard", async (req, res) => {

  try {

    const db = getDB();



    const [inventory, purchaseOrders] = await Promise.all([

      db.collection("inventory").find({}).toArray(),

      db.collection("purchaseOrders").find({}).toArray()

    ]);



    const items = inventory.map((item) => ({

      ...item,

      daysOfStock:

        Number(item.dailySales) > 0

          ? Number((item.stock / item.dailySales).toFixed(1))

          : null

    }));



    res.json({

      success: true,

      inventory: items,

      purchaseOrders,

      summary: {

        productsTracked: new Set(items.map((item) => item.sku)).size,

        inventoryRecords: items.length,

        lowStockItems: items.filter(

          (item) => item.daysOfStock !== null && item.daysOfStock <= 3

        ).length,

        ageingItems: items.filter(

          (item) => Number(item.ageingDays) >= 60

        ).length,

        delayedOrders: purchaseOrders.filter(

          (order) => order.status === "Delayed"

        ).length

      }

    });

  } catch (error) {

    res.status(500).json({ success: false, message: error.message });

  }

});



app.get("/api/investigate/:sku", async (req, res) => {

  try {

    const { sku } = req.params;

    const stores = await getDB()

      .collection("inventory")

      .find({ sku })

      .toArray();



    if (stores.length < 2) {

      return res.status(404).json({

        success: false,

        message: "At least two store records are required for this investigation."

      });

    }



    const storeA = stores[0];

    const storeB = stores[1];

    const promotionStartsInDays = 3;



    const daysOfStockA =

      storeA.dailySales > 0 ? storeA.stock / storeA.dailySales : Infinity;

    const daysOfStockB =

      storeB.dailySales > 0 ? storeB.stock / storeB.dailySales : Infinity;



    const stockNeededBeforePromotion = Math.max(

      0,

      Math.ceil(storeA.dailySales * promotionStartsInDays - storeA.stock)

    );



    const transferableStock = Math.max(

      0,

      Math.floor(storeB.stock - storeB.dailySales * promotionStartsInDays)

    );



    const transferQuantity = Math.min(

      stockNeededBeforePromotion,

      transferableStock

    );



    res.json({

      success: true,

      product: storeA.product,

      sku,

      storeA: {

        store: storeA.store,

        stock: storeA.stock,

        dailySales: storeA.dailySales,

        daysOfStock: Number(daysOfStockA.toFixed(1))

      },

      storeB: {

        store: storeB.store,

        stock: storeB.stock,

        dailySales: storeB.dailySales,

        daysOfStock: Number(daysOfStockB.toFixed(1)),

        transferableStock

      },

      promotionStartsInDays,

      stockNeededBeforePromotion,

      transferQuantity,

      recommendation:

        transferQuantity >= stockNeededBeforePromotion

          ? "TRANSFER"

          : "REVIEW_SUPPLIER",

      reason:

        "Compare store stock, sales velocity, promotion timing, and supplier lead times before approving an action."

    });

  } catch (error) {

    res.status(500).json({ success: false, message: error.message });

  }

});



app.get("/api/predictions", async (req, res) => {

  try {

    const inventory = await getDB()

      .collection("inventory")

      .find({})

      .toArray();



    const predictions = inventory.map((item) => {

      const stock = Math.max(0, Number(item.stock) || 0);

      const dailySales = Math.max(0, Number(item.dailySales) || 0);

      const daysOfStock = dailySales > 0 ? stock / dailySales : null;



      // Illustrative planning assumption, not a trained forecasting model.

      const festivalDailySales = dailySales * 1.5;

      const festivalDaysOfStock =

        festivalDailySales > 0 ? stock / festivalDailySales : null;



      let risk = "Low";

      let reason = "Stock appears sufficient at the assumed festival sales rate.";

      let recommendedAction = "MONITOR";

      let suggestedQuantity = 0;



      if (stock === 0) {

        risk = "Critical";

        reason = "No stock is available at this store.";

        recommendedAction = "URGENT_REPLENISHMENT";

        suggestedQuantity = Math.max(1, Math.ceil(festivalDailySales * 7));

      } else if (festivalDaysOfStock !== null && festivalDaysOfStock <= 1) {

        risk = "Critical";

        reason = "Estimated festival demand could exhaust stock within one day.";

        recommendedAction = "URGENT_REPLENISHMENT";

        suggestedQuantity = Math.max(1, Math.ceil(festivalDailySales * 7 - stock));

      } else if (festivalDaysOfStock !== null && festivalDaysOfStock <= 3) {

        risk = "High";

        reason = "Estimated festival demand could exhaust stock within three days.";

        recommendedAction = "TRANSFER_OR_REORDER";

        suggestedQuantity = Math.max(1, Math.ceil(festivalDailySales * 7 - stock));

      } else if (festivalDaysOfStock !== null && festivalDaysOfStock <= 7) {

        risk = "Medium";

        reason = "Review stock coverage before the festival.";

        recommendedAction = "REVIEW_STOCK";

        suggestedQuantity = Math.max(0, Math.ceil(festivalDailySales * 7 - stock));

      }



      return {

        sku: item.sku,

        product: item.product,

        brand: item.brand,

        category: item.category,

        store: item.store,

        stock,

        dailySales,

        daysOfStock:

          daysOfStock === null ? null : Number(daysOfStock.toFixed(1)),

        estimatedFestivalDaysOfStock:

          festivalDaysOfStock === null

            ? null

            : Number(festivalDaysOfStock.toFixed(1)),

        assumedFestivalDemandIncrease: "50%",

        risk,

        reason,

        recommendedAction,

        suggestedQuantity

      };

    });



    const riskOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };



    predictions.sort(

      (a, b) =>

        riskOrder[a.risk] - riskOrder[b.risk] ||

        (a.estimatedFestivalDaysOfStock ?? Infinity) -

          (b.estimatedFestivalDaysOfStock ?? Infinity)

    );



    res.json({

      success: true,

      assumptions: {

        festivalDemandIncreasePercent: 50,

        planningHorizonDays: 7,

        note: "Illustrative estimates based on current daily sales. Actual festival demand may differ."

      },

      summary: {

        productsAnalyzed: predictions.length,

        critical: predictions.filter((p) => p.risk === "Critical").length,

        high: predictions.filter((p) => p.risk === "High").length,

        medium: predictions.filter((p) => p.risk === "Medium").length,

        low: predictions.filter((p) => p.risk === "Low").length

      },

      predictions

    });

  } catch (error) {

    console.error("Stockout prediction error:", error.message);

    res.status(500).json({

      success: false,

      message: "Could not calculate stockout predictions."

    });

  }

});



app.post("/api/transfers/approve", async (req, res) => {

  const { sku, from, to, quantity } = req.body || {};



  if (

    typeof sku !== "string" ||

    !sku.trim() ||

    typeof from !== "string" ||

    !from.trim() ||

    typeof to !== "string" ||

    !to.trim() ||

    from.trim() === to.trim() ||

    !Number.isInteger(quantity) ||

    quantity <= 0

  ) {

    return res.status(400).json({

      success: false,

      message: "Provide a SKU, different stores, and a positive whole-number quantity."

    });

  }



  try {

    const inventory = getDB().collection("inventory");

    const decisions = getDB().collection("decisions");

    const cleanSku = sku.trim();

    const sourceStore = from.trim();

    const destinationStore = to.trim();



    const source = await inventory.findOne({

      sku: cleanSku,

      store: sourceStore

    });

    const destination = await inventory.findOne({

      sku: cleanSku,

      store: destinationStore

    });



    if (!source || !destination) {

      return res.status(404).json({

        success: false,

        message: "Source or destination inventory record was not found."

      });

    }



    const sourceUpdate = await inventory.updateOne(

      { _id: source._id, stock: { $gte: quantity } },

      { $inc: { stock: -quantity } }

    );



    if (sourceUpdate.modifiedCount !== 1) {

      return res.status(409).json({

        success: false,

        message: `${sourceStore} does not have enough available stock.`

      });

    }



    try {

      const destinationUpdate = await inventory.updateOne(

        { _id: destination._id },

        { $inc: { stock: quantity } }

      );



      if (destinationUpdate.modifiedCount !== 1) {

        throw new Error("Could not update destination inventory.");

      }

    } catch (error) {

      await inventory.updateOne(

        { _id: source._id },

        { $inc: { stock: quantity } }

      );

      throw error;

    }



    const decision = {

      id: `DEC-${Date.now()}`,

      sku: cleanSku,

      action: "TRANSFER",

      quantity,

      from: sourceStore,

      to: destinationStore,

      status: "Completed",

      createdAt: new Date().toISOString()

    };



    try {

      await decisions.insertOne(decision);

    } catch (error) {

      await inventory.updateOne(

        { _id: destination._id, stock: { $gte: quantity } },

        { $inc: { stock: -quantity } }

      );

      await inventory.updateOne(

        { _id: source._id },

        { $inc: { stock: quantity } }

      );

      throw error;

    }



    res.json({

      success: true,

      message: `Transferred ${quantity} units of ${cleanSku} from ${sourceStore} to ${destinationStore}.`,

      decision

    });

  } catch (error) {

    console.error("Stock transfer failed:", error.message);

    res.status(500).json({

      success: false,

      message: error.message || "Could not complete the stock transfer."

    });

  }

});



app.post("/api/decisions", async (req, res) => {

  try {

    const { sku, action, quantity } = req.body || {};



    if (

      typeof sku !== "string" ||

      !sku.trim() ||

      !["TRANSFER", "ORDER", "REJECT"].includes(action) ||

      (action !== "REJECT" &&

        (!Number.isInteger(quantity) || quantity <= 0))

    ) {

      return res.status(400).json({

        success: false,

        message: "Provide a valid SKU, action, and positive quantity where required."

      });

    }



    const decision = {

      id: `DEC-${Date.now()}`,

      sku: sku.trim(),

      action,

      quantity: action === "REJECT" ? 0 : quantity,

      status: action === "REJECT" ? "Rejected" : "Approved (simulated)",

      createdAt: new Date().toISOString()

    };



    await getDB().collection("decisions").insertOne(decision);



    res.status(201).json({

      success: true,

      message: "Decision saved. Simulated orders do not contact suppliers.",

      decision

    });

  } catch (error) {

    res.status(500).json({ success: false, message: error.message });

  }

});



app.get("/api/decisions", async (req, res) => {

  try {

    const decisions = await getDB()

      .collection("decisions")

      .find({})

      .sort({ createdAt: -1 })

      .toArray();



    res.json({ success: true, decisions });

  } catch (error) {

    res.status(500).json({ success: false, message: error.message });

  }

});



// Dataset-driven recommendations: calculations use MongoDB sales, inventory,
// products, promotions, suppliers and purchase orders. OpenAI is not required
// for the core recommendation logic.
app.get("/api/ai-recommendations", async (req, res) => {
  try {
    const db = getDB();
    const [products, promotions, sales, suppliers, inventory, purchaseOrders] =
      await Promise.all([
        db.collection("products").find({}).toArray(),
        db.collection("promotions").find({}).toArray(),
        db.collection("sales").find({}).toArray(),
        db.collection("suppliers").find({}).toArray(),
        db.collection("inventory").find({}).toArray(),
        db.collection("purchaseOrders").find({}).toArray()
      ]);

    if (!inventory.length && !sales.length) {
      return res.status(400).json({
        success: false,
        message: "No inventory or sales records were found in MongoDB."
      });
    }

    const value = (obj, ...keys) => {
      for (const key of keys) {
        if (obj && obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
          return obj[key];
        }
      }
      return undefined;
    };
    const number = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };
    const dateOf = (v) => {
      if (!v) return null;
      const d = new Date(v);
      return Number.isNaN(d.getTime()) ? null : d;
    };

    const productBySku = new Map();
    for (const p of products) {
      const sku = String(value(p, "sku", "SKU") || "");
      if (sku) productBySku.set(sku, p);
    }

    // Prefer the latest 30 calendar days when sales dates are parseable.
    const datedSales = sales
      .map((sale) => ({ sale, date: dateOf(value(sale, "date", "sale_date", "createdAt")) }))
      .filter((entry) => entry.date);
    const latestDate = datedSales.length
      ? new Date(Math.max(...datedSales.map((entry) => entry.date.getTime())))
      : new Date();
    const cutoff = new Date(latestDate);
    cutoff.setDate(cutoff.getDate() - 29);
    const recentSales = datedSales.length
      ? datedSales.filter((entry) => entry.date >= cutoff && entry.date <= latestDate)
      : sales.map((sale) => ({ sale, date: null }));

    const salesBySkuStore = new Map();
    const salesBySku = new Map();
    const datesBySkuStore = new Map();
    for (const entry of recentSales) {
      const sale = entry.sale;
      const sku = String(value(sale, "sku", "SKU") || "");
      if (!sku) continue;
      const store = String(value(sale, "store", "location") || "Unknown store");
      const qty = Math.max(0, number(value(sale, "qty_sold", "quantitySold", "quantity", "qty")));
      const key = `${sku}|||${store}`;
      salesBySkuStore.set(key, (salesBySkuStore.get(key) || 0) + qty);
      salesBySku.set(sku, (salesBySku.get(sku) || 0) + qty);
      if (entry.date) {
        if (!datesBySkuStore.has(key)) datesBySkuStore.set(key, new Set());
        datesBySkuStore.get(key).add(entry.date.toISOString().slice(0, 10));
      }
    }

    const recommendations = inventory.map((item) => {
      const sku = String(value(item, "sku", "SKU") || "");
      const store = String(value(item, "store", "location") || "Unknown store");
      const product = productBySku.get(sku) || {};
      const matchingSales = salesBySkuStore.get(`${sku}|||${store}`) || 0;
      const totalSkuSales = salesBySku.get(sku) || 0;
      const activeDays = datesBySkuStore.get(`${sku}|||${store}`)?.size || 0;
      const dailySales = activeDays > 0
        ? matchingSales / activeDays
        : number(value(item, "dailySales", "daily_sales"));
      const stock = Math.max(0, number(value(item, "stock", "quantity", "qty_on_hand")));
      const daysOfStock = dailySales > 0 ? stock / dailySales : null;
      const category = String(value(item, "category") || value(product, "category") || "Unknown category");
      const name = String(value(item, "product", "product_name", "name") || value(product, "product", "product_name", "name") || sku || "Unknown product");
      const brand = value(item, "brand") || value(product, "brand");
      const price = number(value(item, "sellingPrice", "selling_price") || value(product, "sellingPrice", "selling_price"));
      const ageingDays = number(value(item, "ageingDays", "ageing_days"));
      const relatedPromotion = promotions.find((promo) => {
        const promoCategory = String(value(promo, "category", "product_category") || "").toLowerCase();
        return promoCategory && promoCategory === category.toLowerCase();
      });
      const relatedSuppliers = suppliers.filter((supplier) =>
        String(value(supplier, "sku", "SKU") || "") === sku
      );
      const availableSupplier = relatedSuppliers.find((supplier) =>
        !String(value(supplier, "availability", "status") || "").toLowerCase().includes("unavailable")
      );
      const openOrders = purchaseOrders.filter((order) =>
        String(value(order, "sku", "SKU") || "") === sku &&
        !["received", "completed", "cancelled", "closed"].includes(
          String(value(order, "status") || "").toLowerCase()
        )
      );

      let priority = "Low";
      let recommendedAction = "MONITOR";
      let reason = "Current recorded sales do not indicate an immediate stock risk.";
      let suggestedQuantity = 0;

      if (dailySales > 0 && daysOfStock !== null && daysOfStock <= 2) {
        priority = "Critical";
        recommendedAction = availableSupplier ? "URGENT_REPLENISHMENT" : "URGENT_STOCK_TRANSFER";
        suggestedQuantity = Math.max(1, Math.ceil(dailySales * 7 - stock));
        reason = `Recorded sales indicate approximately ${daysOfStock.toFixed(1)} days of stock remaining at ${store}.`;
      } else if (dailySales > 0 && daysOfStock !== null && daysOfStock <= 5) {
        priority = "High";
        recommendedAction = "TRANSFER_OR_REORDER";
        suggestedQuantity = Math.max(1, Math.ceil(dailySales * 7 - stock));
        reason = `At the recent sales rate, stock covers about ${daysOfStock.toFixed(1)} days at ${store}.`;
      } else if (stock === 0) {
        priority = "Critical";
        recommendedAction = "REPLENISH_OR_TRANSFER";
        suggestedQuantity = Math.max(1, Math.ceil(dailySales * 7));
        reason = `No stock is recorded at ${store}.`;
      } else if (ageingDays >= 60) {
        priority = "Medium";
        recommendedAction = "AGEING_STOCK_PROMOTION";
        reason = `Stock has been ageing for ${ageingDays} days; consider a promotion or transfer to a higher-demand store.`;
      } else if (relatedPromotion && dailySales > 0 && daysOfStock !== null && daysOfStock <= 10) {
        priority = "Medium";
        recommendedAction = "REVIEW_PROMOTION_STOCK";
        reason = `A promotion matches the product category and recorded stock covers about ${daysOfStock.toFixed(1)} days.`;
      }

      const supplierEvidence = availableSupplier
        ? `Supplier ${value(availableSupplier, "supplier", "name") || "available"}; lead time ${value(availableSupplier, "lead_time_days", "leadTimeDays") ?? "not recorded"} days; MOQ ${value(availableSupplier, "moq", "minimumOrderQuantity") ?? "not recorded"}.`
        : "No matching available supplier record was found for this SKU.";
      const promotionEvidence = relatedPromotion
        ? `Matching promotion: ${value(relatedPromotion, "promotion", "name", "title") || "promotion"}; dates ${value(relatedPromotion, "start_date", "startDate") || "not recorded"} to ${value(relatedPromotion, "end_date", "endDate") || "not recorded"}.`
        : "No promotion matched this product category.";
      const evidence = [
        `Store: ${store}; stock: ${stock} units.`,
        `Recent sales in selected window: ${matchingSales} units for this SKU/store; ${totalSkuSales} units across stores.`,
        `Calculated daily sales: ${dailySales.toFixed(2)} units/day${daysOfStock === null ? "" : `; stock cover: ${daysOfStock.toFixed(1)} days`}.`,
        supplierEvidence,
        promotionEvidence,
        openOrders.length ? `${openOrders.length} open purchase order(s) found for this SKU.` : "No open purchase order was found for this SKU."
      ];

      return {
        sku,
        product: name,
        brand,
        category,
        store,
        priority,
        recommendedAction,
        suggestedQuantity,
        reason,
        supportingEvidence: evidence,
        metrics: {
          stock,
          recentUnitsSoldAtStore: matchingSales,
          recentUnitsSoldAcrossStores: totalSkuSales,
          calculatedDailySales: Number(dailySales.toFixed(2)),
          daysOfStock: daysOfStock === null ? null : Number(daysOfStock.toFixed(1)),
          ageingDays,
          sellingPrice: price
        },
        supplier: availableSupplier ? {
          name: value(availableSupplier, "supplier", "name") || null,
          purchasePrice: value(availableSupplier, "purchase_price", "purchasePrice") ?? null,
          leadTimeDays: value(availableSupplier, "lead_time_days", "leadTimeDays") ?? null,
          minimumOrderQuantity: value(availableSupplier, "moq", "minimumOrderQuantity") ?? null
        } : null,
        promotion: relatedPromotion ? {
          name: value(relatedPromotion, "promotion", "name", "title") || null,
          startDate: value(relatedPromotion, "start_date", "startDate") || null,
          endDate: value(relatedPromotion, "end_date", "endDate") || null
        } : null,
        openPurchaseOrders: openOrders.length
      };
    });

    const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    recommendations.sort((a, b) =>
      priorityOrder[a.priority] - priorityOrder[b.priority] ||
      (a.metrics.daysOfStock ?? Infinity) - (b.metrics.daysOfStock ?? Infinity)
    );

    res.json({
      success: true,
      generatedBy: "Dataset-driven rules using MongoDB records",
      dataWindow: datedSales.length
        ? { from: cutoff.toISOString().slice(0, 10), to: latestDate.toISOString().slice(0, 10) }
        : { note: "Sales dates were not parseable; all imported sales records were used." },
      dataCounts: {
        inventory: inventory.length,
        products: products.length,
        promotions: promotions.length,
        sales: sales.length,
        salesUsed: recentSales.length,
        suppliers: suppliers.length,
        purchaseOrders: purchaseOrders.length
      },
      summary: {
        recommendations: recommendations.length,
        critical: recommendations.filter((r) => r.priority === "Critical").length,
        high: recommendations.filter((r) => r.priority === "High").length,
        medium: recommendations.filter((r) => r.priority === "Medium").length,
        low: recommendations.filter((r) => r.priority === "Low").length
      },
      recommendations: recommendations.slice(0, 50)
    });
  } catch (error) {
    console.error("Dataset recommendations error:", error);
    res.status(500).json({
      success: false,
      message: "Could not calculate dataset recommendations. Check the backend terminal."
    });
  }
});

async function startServer() {

  try {

    await connectDB();

    await seedCollection("inventory", initialInventory);

    await seedCollection("purchaseOrders", initialPurchaseOrders);



    app.listen(PORT, () => {

      console.log(`Festival Rush backend running at http://localhost:${PORT}`);

    });

  } catch (error) {

    console.error("Failed to start backend:", error.message);

    process.exit(1);

  }

}



startServer();
