import React, { useEffect, useMemo, useState } from "react";
import { getDashboard } from "./api";
import "./App.css";

const products = [
  { sku: "TV-5501", name: "Smart TV", category: "Television", price: 45999, stock: 8, sales: 32, store: "Store A", image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400" },
  { sku: "EAR-2201", name: "Wireless Earbuds", category: "Audio", price: 2499, stock: 45, sales: 90, store: "Store A", image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400" },
  { sku: "LAP-3301", name: "Gaming Laptop", category: "Computers", price: 74999, stock: 5, sales: 18, store: "Store B", image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400" },
  { sku: "WAT-1101", name: "Smart Watch", category: "Wearables", price: 5999, stock: 12, sales: 55, store: "Store A", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400" },
  { sku: "PWB-4401", name: "Power Bank", category: "Accessories", price: 1299, stock: 60, sales: 72, store: "Store B", image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400" },
  { sku: "PHN-1201", name: "Smartphone", category: "Mobiles", price: 28999, stock: 15, sales: 48, store: "Store A", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400" },
  { sku: "SPK-6601", name: "Bluetooth Speaker", category: "Audio", price: 3499, stock: 3, sales: 36, store: "Store B", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400" },
  { sku: "KEY-7701", name: "Mechanical Keyboard", category: "Computers", price: 4299, stock: 24, sales: 22, store: "Store A", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400" },
];

const initialOrders = [
  { id: "PO-1001", product: "Smart TV", quantity: 25, status: "In Transit" },
  { id: "PO-1002", product: "Gaming Laptop", quantity: 20, status: "Pending" },
  { id: "PO-1003", product: "Smart Watch", quantity: 40, status: "Approved" },
];

const initialDecisions = [
  { id: 1, product: "Smart TV", action: "Monitor inventory", reason: "Festival demand expected", status: "Recorded" },
  { id: 2, product: "Wireless Earbuds", action: "Maintain stock", reason: "Healthy inventory level", status: "Recorded" },
];

const money = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

const stockOf = (p) => Number(p.stock ?? p.quantity ?? p.currentStock ?? 0);
const salesOf = (p) => Number(p.sales ?? p.unitsSold ?? p.demand ?? 0);
const nameOf = (p) => p.name ?? p.productName ?? p.product ?? p.sku ?? "Product";

const styles = `
*{box-sizing:border-box}
body{margin:0;background:#f3f5fb;color:#192640;font-family:Inter,"Segoe UI",Arial,sans-serif}
button,input,select,textarea{font:inherit}
button{cursor:pointer}
.app{display:flex;min-height:100vh}
.sidebar{width:235px;flex-shrink:0;background:#111a2e;color:white;padding:24px 14px}
.brand{font-size:22px;font-weight:900;padding:5px 10px}
.brand span{color:#63e5be}
.brand-sub{font-size:10px;color:#a1aec6;padding:5px 10px 30px;letter-spacing:1px}
.nav-label{font-size:10px;color:#8291b0;padding:8px 10px;letter-spacing:1.5px}
.nav-btn{width:100%;display:flex;align-items:center;gap:12px;background:transparent;color:#bdc8dc;border:0;border-radius:8px;padding:12px 10px;margin:4px 0;text-align:left;font-size:13px}
.nav-btn:hover,.nav-btn.active{background:#263550;color:white}
.nav-btn.active{box-shadow:inset 3px 0 #63e5be}
.nav-icon{width:20px;text-align:center;font-size:17px}
.side-bottom{background:#1c2942;padding:14px;border-radius:10px;margin:40px 5px 0;color:#c2cde0;font-size:11px;line-height:1.8}
.main{min-width:0;flex:1}
.topbar{height:72px;background:white;border-bottom:1px solid #e6eaf2;display:flex;justify-content:space-between;align-items:center;padding:0 28px;gap:12px}
.crumb,.subtitle{font-size:12px;color:#8792a7}
.top-title{font-size:14px;font-weight:800;margin-top:5px}
.top-right{display:flex;align-items:center;gap:10px;font-size:12px;color:#68748a}
.avatar{display:grid;place-items:center;width:38px;height:38px;border-radius:50%;background:#d9f7ed;color:#087e60;font-weight:900}
.content{max-width:1600px;margin:auto;padding:27px 28px 40px}
.welcome{background:linear-gradient(115deg,#172947,#28547b);color:white;border-radius:16px;padding:29px;margin-bottom:25px;position:relative;overflow:hidden}
.welcome:after{content:"⚡";position:absolute;right:45px;top:0;font-size:100px;opacity:.12}
.eyebrow{font-size:10px;letter-spacing:1.7px;color:#63e5be;font-weight:800}
.welcome h1{font-size:clamp(25px,3vw,35px);margin:13px 0 9px}
.welcome p{font-size:13px;color:#d0dcec;line-height:1.7;max-width:650px;margin:0}
.page-title{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:20px}
h2{font-size:23px;margin:0;letter-spacing:-.5px}
.subtitle{margin-top:6px;line-height:1.6}
.metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:15px;margin-bottom:22px}
.metric,.panel{background:white;border:1px solid #e8ecf4;border-radius:12px;box-shadow:0 3px 12px #1c2d4b06}
.metric{padding:18px}
.metric-head{display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#768299}
.metric-icon{display:grid;place-items:center;width:34px;height:34px;border-radius:9px;background:#edf3ff;color:#456bd2;font-size:17px}
.metric-value{font-size:25px;font-weight:850;margin:12px 0 6px;letter-spacing:-.7px}
.metric-foot{font-size:11px;color:#8994a8}
.two-col{display:grid;grid-template-columns:1.3fr 1fr;gap:18px;margin-bottom:20px}
.panel{padding:20px;margin-bottom:20px;min-width:0}
.panel h3{font-size:14px;margin:0}
.panel-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:17px}
.panel-note{font-size:11px;color:#8994a8;margin-top:5px}
.chart{height:170px;display:flex;align-items:stretch;gap:12px;padding:12px 4px 0;border-bottom:1px solid #e9edf5}
.bar-col{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:7px}
.bar{width:min(38px,85%);min-height:5px;background:linear-gradient(#7193f5,#466bd6);border-radius:5px 5px 0 0}
.bar-label{font-size:10px;color:#8994a8;text-align:center}
.legend{font-size:11px;color:#78849b;margin-top:13px}
.legend i{display:inline-block;width:8px;height:8px;border-radius:3px;background:#597ce5;margin-right:6px}
.alert{display:flex;gap:10px;background:#fff8e9;border-radius:9px;padding:12px;margin-bottom:9px;font-size:12px}
.alert p{margin:5px 0 0;color:#81899a;line-height:1.5}
.alert-symbol{color:#c88a18;font-size:18px}
.table-wrap{overflow-x:auto}
table{width:100%;border-collapse:collapse;text-align:left;font-size:12px}
th{font-size:10px;text-transform:uppercase;letter-spacing:.6px;color:#8792a6;background:#fafbfe}
th,td{padding:12px 10px;border-bottom:1px solid #edf0f6;white-space:nowrap}
tbody tr:last-child td{border-bottom:0}
.product-cell{display:flex;align-items:center;gap:10px}
.product-img{width:44px;height:44px;object-fit:cover;border-radius:8px;background:#edf1f8}
.product-name{font-weight:750;color:#27334a}
.product-sku{font-size:10px;color:#98a2b2;margin-top:4px}
.badge{display:inline-flex;padding:5px 8px;border-radius:20px;font-size:10px;font-weight:750;background:#e7f8ef;color:#16875e}
.badge.warning{background:#fff2d9;color:#b57916}
.badge.danger{background:#ffe8eb;color:#d0475c}
.badge.neutral{background:#edf1f7;color:#63718a}
.btn{border:0;border-radius:8px;padding:10px 14px;background:#466de0;color:white;font-size:12px;font-weight:750}
.btn.secondary{background:#edf2ff;color:#435d91}
.btn.small{padding:7px 9px;font-size:11px}
.filters{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:17px}
.field{width:100%;padding:11px 12px;border:1px solid #e0e6f0;border-radius:8px;background:white;color:#26334b;outline:none;font-size:12px}
.filters .field{flex:1;min-width:170px;width:auto}
.field:focus{border-color:#6587e8}
.form-group{margin-bottom:15px}
.form-group label{display:block;font-size:11px;font-weight:750;color:#65718a;margin-bottom:7px}
textarea.field{min-height:90px;resize:vertical}
.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.detail-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.detail{padding:15px;border:1px solid #e9edf5;border-radius:10px}
.detail label{display:block;font-size:10px;color:#8490a6;margin-bottom:8px}
.detail strong{font-size:18px}
.store-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px}
.progress{height:7px;background:#edf0f7;border-radius:10px;overflow:hidden;margin:9px 0}
.progress>div{height:100%;background:#5479e5;border-radius:inherit}
.range{width:100%;accent-color:#5479e5}
.scenario-result{padding:18px;border-radius:12px;background:#f0f5ff;margin-top:18px}
.scenario-result strong{font-size:25px;color:#315ec7}
.toast{padding:12px 14px;background:#e5f8ef;color:#11764f;border-radius:9px;margin-bottom:17px;font-size:12px}
.empty{text-align:center;padding:25px;color:#8994a8;font-size:12px}
.footer{text-align:center;color:#9aa4b6;font-size:10px;padding:20px 0}
@media(max-width:1050px){.metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.two-col{grid-template-columns:1fr}.sidebar{width:205px}.content{padding:20px}}
@media(max-width:700px){.app{display:block}.sidebar{width:100%;padding:13px;min-height:auto}.brand-sub,.nav-label,.side-bottom{display:none}.sidebar nav{display:flex;flex-wrap:wrap}.nav-btn{width:auto;margin:2px;padding:9px}.topbar{padding:0 13px}.content{padding:15px 11px}.metrics{gap:9px}.metric{padding:12px}.metric-value{font-size:21px}.form-grid,.detail-grid{grid-template-columns:1fr}.welcome{padding:22px}}
`;

function App() {
  const [page, setPage] = useState("Overview");
  const [inventory, setInventory] = useState(products);
  const [orders, setOrders] = useState(initialOrders);
  const [decisions, setDecisions] = useState(initialDecisions);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState("All Stores");
  const [selectedSku, setSelectedSku] = useState("WAT-1101");
  const [note, setNote] = useState("");
  const [decisionType, setDecisionType] = useState("Replenish stock");
  const [uplift, setUplift] = useState(30);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    getDashboard()
      .then((data) => {
        if (!active || !data) return;
        const rows = data.inventory ?? data.products;
        if (Array.isArray(rows) && rows.length) {
          setInventory(rows.map((item, i) => {
            const fallback = products.find((p) => p.sku === item.sku) ?? products[i % products.length];
            return { ...fallback, ...item, name: nameOf(item), stock: stockOf(item), sales: salesOf(item) };
          }));
        }
        if (Array.isArray(data.purchaseOrders)) setOrders(data.purchaseOrders);
        else if (Array.isArray(data.orders)) setOrders(data.orders);
        if (Array.isArray(data.decisions)) setDecisions(data.decisions);
        setConnected(true);
      })
      .catch(() => {
        if (active) setConnected(false);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const totalUnits = inventory.reduce((sum, p) => sum + stockOf(p), 0);
  const totalSales = inventory.reduce((sum, p) => sum + salesOf(p), 0);
  const totalValue = inventory.reduce((sum, p) => sum + stockOf(p) * Number(p.price || 0), 0);
  const lowStock = inventory.filter((p) => stockOf(p) <= 8);
  const selected = inventory.find((p) => p.sku === selectedSku) ?? inventory[0];

  const filtered = useMemo(() => inventory.filter((p) => {
    const matches = `${nameOf(p)} ${p.sku} ${p.category ?? ""}`.toLowerCase().includes(search.toLowerCase());
    return matches && (storeFilter === "All Stores" || p.store === storeFilter);
  }), [inventory, search, storeFilter]);

  const navItems = [
    ["Overview", "▦"],
    ["Inventory", "▤"],
    ["Investigation", "⌕"],
    ["Supply Network", "⇄"],
    ["Scenario Lab", "◈"],
    ["Purchase Orders", "▣"],
    ["Decisions", "✓"],
  ];

  function recordDecision() {
    if (!selected) return;
    const decision = {
      id: Date.now(),
      product: nameOf(selected),
      sku: selected.sku,
      action: decisionType,
      reason: note.trim() || "Festival inventory review",
      status: "Recorded",
    };
    setDecisions((old) => [decision, ...old]);
    setMessage("Decision recorded in this session.");
    setNote("");
    fetch("/api/decisions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(decision),
    }).catch(() => {});
  }

  function approveOrder(order) {
    const id = order.id ?? order._id;
    setOrders((old) => old.map((o) =>
      (o.id ?? o._id) === id ? { ...o, status: "Approved" } : o
    ));
    setMessage(`${id ?? "Purchase order"} marked approved in this session.`);
    fetch("/api/transfers/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    }).catch(() => {});
  }

  function ProductTable({ rows }) {
    if (!rows.length) return <div className="empty">No products found. Try another search.</div>;
    return (
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Product</th><th>Store</th><th>Price</th><th>Stock</th><th>Sales</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {rows.map((p, i) => {
              const stock = stockOf(p);
              const image = p.image ?? products.find((x) => x.sku === p.sku)?.image;
              return (
                <tr key={`${p.sku}-${i}`}>
                  <td>
                    <div className="product-cell">
                      <img className="product-img" src={image} alt={nameOf(p)} onError={(e) => { e.currentTarget.style.display = "none"; }} />
                      <div><div className="product-name">{nameOf(p)}</div><div className="product-sku">{p.sku}</div></div>
                    </div>
                  </td>
                  <td>{p.store ?? p.location ?? "Main Store"}</td>
                  <td>{money(p.price)}</td>
                  <td><strong>{stock}</strong></td>
                  <td>{salesOf(p)} units</td>
                  <td><span className={`badge ${stock <= 3 ? "danger" : stock <= 8 ? "warning" : ""}`}>{stock <= 3 ? "Critical" : stock <= 8 ? "Low stock" : "Healthy"}</span></td>
                  <td><button className="btn secondary small" onClick={() => { setSelectedSku(p.sku); setPage("Investigation"); }}>Investigate</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  function Metrics() {
    const items = [
      ["Inventory units", totalUnits.toLocaleString("en-IN"), "Units tracked", "▤"],
      ["Inventory value", money(totalValue), "At listed prices", "₹"],
      ["Low-stock products", lowStock.length, "Require attention", "⚠"],
      ["Recorded demand", totalSales.toLocaleString("en-IN"), "Units across products", "↗"],
    ];
    return (
      <div className="metrics">
        {items.map(([label, value, foot, icon]) => (
          <div className="metric" key={label}>
            <div className="metric-head">{label}<span className="metric-icon">{icon}</span></div>
            <div className="metric-value">{value}</div>
            <div className="metric-foot">{foot}</div>
          </div>
        ))}
      </div>
    );
  }

  function SalesChart() {
    const rows = inventory.slice(0, 7);
    const max = Math.max(1, ...rows.map(salesOf));
    return (
      <div className="chart">
        {rows.map((p) => (
          <div className="bar-col" key={p.sku}>
            <div className="bar" title={`${nameOf(p)}: ${salesOf(p)}`} style={{ height: `${Math.max(5, salesOf(p) / max * 100)}%` }} />
            <div className="bar-label">{nameOf(p).split(" ")[0]}</div>
          </div>
        ))}
      </div>
    );
  }

  function Overview() {
    return (
      <>
        <div className="welcome">
          <div className="eyebrow">VOLTKART ELECTRONICS · FESTIVAL RUSH</div>
          <h1>Welcome, Ananya! 👋</h1>
          <p>Your festival command centre is ready. Track inventory, investigate products, explore demand scenarios, and make smarter decisions before the rush begins.</p>
        </div>
        <div className="page-title">
          <div><h2>Dashboard Overview</h2><div className="subtitle">Your inventory performance at a glance.</div></div>
          <span className={`badge ${connected ? "" : "warning"}`}>{connected ? "Backend connected" : loading ? "Connecting..." : "Demo data active"}</span>
        </div>
        <Metrics />
        <div className="two-col">
          <div className="panel">
            <div className="panel-head"><div><h3>Product Demand Overview</h3><div className="panel-note">Recorded demand by product</div></div><span className="badge">Sales</span></div>
            <SalesChart />
            <div className="legend"><i /> Units sold / demand</div>
          </div>
          <div className="panel">
            <div className="panel-head"><div><h3>Inventory Alerts</h3><div className="panel-note">Products that may need attention</div></div><span className="badge danger">{lowStock.length} alerts</span></div>
            {lowStock.length ? lowStock.slice(0, 5).map((p) => (
              <div className="alert" key={p.sku}><span className="alert-symbol">⚠</span><div><strong>{nameOf(p)} · {stockOf(p)} units</strong><p>Review demand and consider replenishment.</p></div></div>
            )) : <div className="empty">No low-stock products detected.</div>}
          </div>
        </div>
        <div className="panel">
          <div className="panel-head"><div><h3>Inventory Snapshot</h3><div className="panel-note">Quick view of product-level stock</div></div><button className="btn secondary" onClick={() => setPage("Inventory")}>View inventory →</button></div>
          <ProductTable rows={inventory.slice(0, 5)} />
        </div>
      </>
    );
  }

  function InventoryPage() {
    return (
      <>
        <div className="page-title"><div><h2>Inventory Management</h2><div className="subtitle">Search products, check stock, and investigate inventory.</div></div></div>
        <Metrics />
        <div className="panel">
          <div className="filters">
            <input className="field" placeholder="Search product or SKU..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <select className="field" value={storeFilter} onChange={(e) => setStoreFilter(e.target.value)}>
              <option>All Stores</option><option>Store A</option><option>Store B</option>
            </select>
          </div>
          <ProductTable rows={filtered} />
        </div>
      </>
    );
  }

  function InvestigationPage() {
    return (
      <>
        <div className="page-title"><div><h2>Product Investigation</h2><div className="subtitle">Review product health and record your recommended action.</div></div></div>
        <div className="panel">
          <div className="form-group">
            <label>Select product</label>
            <select className="field" value={selected?.sku ?? ""} onChange={(e) => setSelectedSku(e.target.value)}>
              {inventory.map((p, i) => <option key={`${p.sku}-${i}`} value={p.sku}>{nameOf(p)} — {p.sku}</option>)}
            </select>
          </div>
          {selected && (
            <>
              <div className="product-cell" style={{ margin: "20px 0" }}>
                <img className="product-img" style={{ width: 85, height: 85 }} src={selected.image ?? products.find((p) => p.sku === selected.sku)?.image} alt={nameOf(selected)} />
                <div><h3>{nameOf(selected)}</h3><div className="subtitle">{selected.category ?? "Electronics"} · {selected.sku}</div><div style={{ marginTop: 8 }}>{money(selected.price)}</div></div>
              </div>
              <div className="detail-grid">
                <div className="detail"><label>Current stock</label><strong>{stockOf(selected)} units</strong></div>
                <div className="detail"><label>Recorded demand</label><strong>{salesOf(selected)} units</strong></div>
                <div className="detail"><label>Approx. coverage</label><strong>{Math.round(stockOf(selected) / Math.max(1, salesOf(selected)) * 30)} days</strong></div>
              </div>
              <div className="panel" style={{ marginTop: 20, background: "#fafbff" }}>
                <h3>Decision recommendation</h3>
                <p className="subtitle">{stockOf(selected) <= 5 ? "Urgent review: current stock is critically low." : stockOf(selected) <= 12 ? "Monitor closely and assess replenishment before the festival." : "Stock is more comfortable. Continue monitoring demand and stock movement."}</p>
                <div className="form-grid">
                  <div className="form-group"><label>Action</label><select className="field" value={decisionType} onChange={(e) => setDecisionType(e.target.value)}><option>Replenish stock</option><option>Transfer inventory</option><option>Monitor inventory</option><option>Maintain stock</option><option>Reduce order quantity</option></select></div>
                  <div className="form-group"><label>Reason / notes</label><input className="field" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Enter your reasoning..." /></div>
                </div>
                <button className="btn" onClick={recordDecision}>Record decision</button>
              </div>
            </>
          )}
        </div>
      </>
    );
  }

  function SupplyPage() {
    return (
      <>
        <div className="page-title"><div><h2>Supply Network</h2><div className="subtitle">Compare stock across stores and review possible transfers.</div></div></div>
        <div className="two-col">
          {["Store A", "Store B"].map((store) => {
            const rows = inventory.filter((p) => p.store === store);
            const units = rows.reduce((sum, p) => sum + stockOf(p), 0);
            return (
              <div className="panel" key={store}>
                <div className="store-head"><strong>{store}</strong><span className="badge">{rows.length} products</span></div>
                <div className="detail"><label>Total recorded units</label><strong>{units}</strong></div>
                {rows.map((p) => (
                  <div key={p.sku} style={{ marginTop: 15 }}>
                    <div className="store-head"><span style={{ fontSize: 12 }}>{nameOf(p)}</span><strong>{stockOf(p)} units</strong></div>
                    <div className="progress"><div style={{ width: `${Math.min(100, stockOf(p) / 60 * 100)}%` }} /></div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        <div className="panel"><h3>Potential transfer candidates</h3><p className="subtitle">Products with low stock that may need a store-level review.</p><ProductTable rows={inventory.filter((p) => stockOf(p) <= 12)} /></div>
      </>
    );
  }

  function ScenarioPage() {
    const baseline = inventory.reduce((sum, p) => sum + salesOf(p), 0);
    const additional = Math.round(baseline * uplift / 100);
    const extraValue = inventory.reduce((sum, p) => sum + Math.round(salesOf(p) * uplift / 100) * Number(p.price || 0), 0);
    return (
      <>
        <div className="page-title"><div><h2>Festival Scenario Lab</h2><div className="subtitle">Explore the impact of an assumed increase in festival demand.</div></div><span className="badge warning">What-if simulation</span></div>
        <div className="two-col">
          <div className="panel">
            <h3>Demand uplift assumption</h3>
            <p className="subtitle">Adjust the assumed demand increase. This is a planning simulation, not a trained AI forecast.</p>
            <div style={{ fontSize: 38, fontWeight: 850, margin: "24px 0 10px" }}>+{uplift}%</div>
            <input className="range" type="range" min="0" max="100" step="5" value={uplift} onChange={(e) => setUplift(Number(e.target.value))} />
            <div className="store-head"><span className="subtitle">0%</span><span className="subtitle">100%</span></div>
            <div className="scenario-result"><div className="subtitle">Estimated additional units</div><strong>{additional.toLocaleString("en-IN")}</strong><p className="subtitle">Calculated from recorded demand and selected uplift.</p></div>
          </div>
          <div className="panel">
            <h3>Scenario summary</h3>
            <div className="detail-grid" style={{ gridTemplateColumns: "1fr", marginTop: 15 }}>
              <div className="detail"><label>Baseline recorded demand</label><strong>{baseline} units</strong></div>
              <div className="detail"><label>Demand after uplift</label><strong>{baseline + additional} units</strong></div>
              <div className="detail"><label>Indicative value of extra demand</label><strong>{money(extraValue)}</strong></div>
            </div>
            <p className="subtitle">Use this scenario to discuss stock buffers, purchase quantities, and understocking risks.</p>
            <button className="btn" onClick={() => { setDecisionType("Replenish stock"); setNote(`Scenario planning: ${uplift}% demand uplift; estimated ${additional} extra units.`); setPage("Investigation"); setMessage("Scenario notes prepared. Select a product and record your decision."); }}>Use scenario in decision →</button>
          </div>
        </div>
        <div className="panel">
          <h3>Product-level scenario impact</h3>
          <div className="table-wrap"><table><thead><tr><th>Product</th><th>Current stock</th><th>Baseline demand</th><th>Extra demand</th><th>Planning signal</th></tr></thead><tbody>
            {inventory.map((p, i) => {
              const extra = Math.ceil(salesOf(p) * uplift / 100);
              return <tr key={`${p.sku}-${i}`}><td>{nameOf(p)}</td><td>{stockOf(p)}</td><td>{salesOf(p)}</td><td>{extra}</td><td><span className={`badge ${stockOf(p) < extra ? "danger" : "warning"}`}>{stockOf(p) < extra ? "Review supply" : "Monitor"}</span></td></tr>;
            })}
          </tbody></table></div>
        </div>
      </>
    );
  }

  function OrdersPage() {
    return (
      <>
        <div className="page-title"><div><h2>Purchase Orders</h2><div className="subtitle">Track replenishment orders and their current status.</div></div><span className="badge">{orders.length} orders</span></div>
        <div className="metrics">
          {[["Total orders", orders.length], ["Pending", orders.filter((o) => /pending/i.test(o.status ?? "")).length], ["Approved", orders.filter((o) => /approved/i.test(o.status ?? "")).length], ["In transit", orders.filter((o) => /transit/i.test(o.status ?? "")).length]].map(([label, value]) => (
            <div className="metric" key={label}><div className="metric-head">{label}</div><div className="metric-value">{value}</div><div className="metric-foot">Current order status</div></div>
          ))}
        </div>
        <div className="panel">
          <div className="table-wrap"><table>
            <thead><tr><th>Order ID</th><th>Product</th><th>Quantity</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {orders.map((o, i) => (
                <tr key={o.id ?? o._id ?? i}>
                  <td><strong>{o.id ?? o._id ?? `PO-${i + 1}`}</strong></td>
                  <td>{o.product ?? o.productName ?? o.sku ?? "Electronics"}</td>
                  <td>{o.quantity ?? o.units ?? "—"}</td>
                  <td><span className={`badge ${/pending/i.test(o.status ?? "") ? "warning" : /transit/i.test(o.status ?? "") ? "neutral" : ""}`}>{o.status ?? "Pending"}</span></td>
                  <td><button className="btn secondary small" onClick={() => approveOrder(o)}>Approve</button></td>
                </tr>
              ))}
            </tbody>
          </table></div>
          {orders.length === 0 && <div className="empty">No purchase orders available.</div>}
        </div>
      </>
    );
  }

  function DecisionsPage() {
    return (
      <>
        <div className="page-title"><div><h2>Decision Log</h2><div className="subtitle">Review inventory decisions recorded in this session.</div></div><span className="badge">{decisions.length} decisions</span></div>
        <div className="panel">
          <div className="table-wrap"><table>
            <thead><tr><th>Product</th><th>Action</th><th>Reason</th><th>Status</th></tr></thead>
            <tbody>{decisions.map((d, i) => (
              <tr key={d.id ?? d._id ?? i}><td><strong>{d.product ?? d.sku ?? "Product"}</strong></td><td>{d.action ?? d.decision ?? "Review"}</td><td style={{ whiteSpace: "normal", minWidth: 170 }}>{d.reason ?? d.note ?? "—"}</td><td><span className="badge">{d.status ?? "Recorded"}</span></td></tr>
            ))}</tbody>
          </table></div>
          {!decisions.length && <div className="empty">No decisions recorded yet.</div>}
        </div>
        <div className="panel">
          <h3>Record a new decision</h3>
          <p className="subtitle">Choose a product and record the action you recommend.</p>
          <div className="form-grid" style={{ marginTop: 18 }}>
            <div className="form-group"><label>Product</label><select className="field" value={selected?.sku ?? ""} onChange={(e) => setSelectedSku(e.target.value)}>{inventory.map((p, i) => <option key={`${p.sku}-${i}`} value={p.sku}>{nameOf(p)}</option>)}</select></div>
            <div className="form-group"><label>Decision</label><select className="field" value={decisionType} onChange={(e) => setDecisionType(e.target.value)}><option>Replenish stock</option><option>Transfer inventory</option><option>Monitor inventory</option><option>Maintain stock</option><option>Reduce order quantity</option></select></div>
          </div>
          <div className="form-group"><label>Reason</label><textarea className="field" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Why are you making this decision?" /></div>
          <button className="btn" onClick={recordDecision}>Save decision</button>
        </div>
      </>
    );
  }

  const pages = {
    Overview: <Overview />,
    Inventory: <InventoryPage />,
    Investigation: <InvestigationPage />,
    "Supply Network": <SupplyPage />,
    "Scenario Lab": <ScenarioPage />,
    "Purchase Orders": <OrdersPage />,
    Decisions: <DecisionsPage />,
  };

  return (
    <div className="app">
      <style>{styles}</style>
      <aside className="sidebar">
        <div className="brand">⚡ VOLT<span>KART</span></div>
        <div className="brand-sub">ELECTRONICS · INTELLIGENCE</div>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          {navItems.map(([label, icon]) => (
            <button key={label} className={`nav-btn ${page === label ? "active" : ""}`} onClick={() => { setPage(label); setMessage(""); }}>
              <span className="nav-icon">{icon}</span>{label}
            </button>
          ))}
        </nav>
        <div className="side-bottom"><strong style={{ color: "#63e5be" }}>FESTIVAL RUSH</strong><br />Inventory planning workspace<br /><span style={{ color: connected ? "#63e5be" : "#e6c27b" }}>● {connected ? "Backend connected" : "Demo mode available"}</span></div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div><div className="crumb">VoltKart / {page}</div><div className="top-title">{page}</div></div>
          <div className="top-right"><span>● {connected ? "Live connection" : "Demo mode"}</span><div className="avatar">A</div><div><strong style={{ color: "#27334a" }}>Ananya</strong><div style={{ fontSize: 10, marginTop: 3 }}>Inventory Analyst</div></div></div>
        </header>
        <div className="content">
          {message && <div className="toast">{message}</div>}
          {pages[page] ?? <Overview />}
          <div className="footer">VOLTKART ELECTRONICS · FESTIVAL RUSH · INVENTORY INTELLIGENCE</div>
        </div>
      </main>
    </div>
  );
}

export default App;