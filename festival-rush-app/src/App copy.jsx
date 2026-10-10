
function AnalyticsCharts({ inventory = [], demandUplift = 50 }) {
  const getStock = (item) =>
    Number(item.stock ?? item.quantity ?? item.currentStock ?? 0);

  const getSales = (item) =>
    Number(item.dailySales ?? item.salesPerDay ?? 0);

  const getStore = (item) =>
    item.store || item.storeName || item.location || "Unknown store";

  const getProductName = (item) =>
    item.name || item.productName || item.title || item.sku || "Product";

  const stockStatus = (item) => {
    const qty = getStock(item);
    const daily = getSales(item);

    if (qty <= 5 || (daily > 0 && qty / daily <= 2)) return "Critical";
    if (qty <= 10 || (daily > 0 && qty / daily <= 5)) return "Low stock";
    return "Healthy";
  };

  const healthy = inventory.filter((item) => stockStatus(item) === "Healthy").length;
  const low = inventory.filter((item) => stockStatus(item) === "Low stock").length;
  const critical = inventory.filter((item) => stockStatus(item) === "Critical").length;
  const totalUnits = inventory.reduce((sum, item) => sum + getStock(item), 0);

  const storeTotals = {};
  inventory.forEach((item) => {
    const store = getStore(item);
    storeTotals[store] = (storeTotals[store] || 0) + getStock(item);
  });

  const products = [...inventory]
    .sort((a, b) => getStock(b) - getStock(a))
    .slice(0, 6);

  const maxStock = Math.max(1, ...products.map(getStock));
  const maxStoreStock = Math.max(1, ...Object.values(storeTotals));

  const dailySales = inventory.reduce((sum, item) => sum + getSales(item), 0);
  const festivalSales = dailySales * (1 + demandUplift / 100);
  const donutTotal = inventory.length || 1;
  const healthyPercent = (healthy / donutTotal) * 100;
  const lowPercent = (low / donutTotal) * 100;
  const criticalPercent = (critical / donutTotal) * 100;

  return (
    <section className="analytics-section">
      <div className="analytics-title">
        <div>
          <span className="section-kicker">VISUAL INTELLIGENCE</span>
          <h2>Inventory analytics</h2>
          <p>Live stock distribution and festival demand simulation.</p>
        </div>
        <span className="analytics-live">
          <span /> Based on loaded inventory
        </span>
      </div>

      <div className="analytics-grid">
        <article className="analytics-card">
          <h3>Stock by product</h3>
          <p className="analytics-subtitle">Available units for top six products</p>

          {products.length === 0 ? (
            <p>No inventory data available.</p>
          ) : (
            <div className="analytics-bars">
              {products.map((item, index) => (
                <div className="analytics-bar-row" key={item._id || item.sku || index}>
                  <span title={getProductName(item)}>{getProductName(item)}</span>
                  <div className="analytics-track">
                    <div
                      className={
                        "analytics-fill " +
                        (stockStatus(item) === "Critical"
                          ? "fill-critical"
                          : stockStatus(item) === "Low stock"
                          ? "fill-low"
                          : "")
                      }
                      style={{ width: `${(getStock(item) / maxStock) * 100}%` }}
                    />
                  </div>
                  <strong>{getStock(item)}</strong>
                </div>
              ))}
            </div>
          )}
          <p className="analytics-footnote">Stock quantities in units</p>
        </article>

        <article className="analytics-card">
          <h3>Inventory health</h3>
          <p className="analytics-subtitle">Status of recorded inventory items</p>

          <div className="analytics-health-layout">
            <div
              className="analytics-donut"
              style={{
                background: `conic-gradient(
                  #20ad83 0% ${healthyPercent}%,
                  #f0a43b ${healthyPercent}% ${healthyPercent + lowPercent}%,
                  #e65b6a ${healthyPercent + lowPercent}% 100%
                )`,
              }}
            >
              <div className="analytics-donut-center">
                <strong>{inventory.length}</strong>
                <span>Records</span>
              </div>
            </div>

            <div className="analytics-legend">
              <div><i className="legend-healthy" /> Healthy <strong>{healthy}</strong></div>
              <div><i className="legend-low" /> Low stock <strong>{low}</strong></div>
              <div><i className="legend-critical" /> Critical <strong>{critical}</strong></div>
            </div>
          </div>
        </article>

        <article className="analytics-card">
          <h3>Store distribution</h3>
          <p className="analytics-subtitle">Available stock by location</p>

          <div className="analytics-bars">
            {Object.entries(storeTotals).map(([store, quantity]) => (
              <div className="analytics-store-row" key={store}>
                <div className="analytics-store-heading">
                  <span>{store}</span>
                  <strong>{quantity.toLocaleString()} units</strong>
                </div>
                <div className="analytics-track">
                  <div
                    className="analytics-fill"
                    style={{ width: `${(quantity / maxStoreStock) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="analytics-footnote">
            Total stock recorded: {totalUnits.toLocaleString()} units
          </p>
        </article>

        <article className="analytics-card">
          <h3>Festival demand simulation</h3>
          <p className="analytics-subtitle">
            Compare current sales with the selected demand increase
          </p>

          <div className="analytics-demand-summary">
            <div>
              <span>Current daily sales</span>
              <strong>{dailySales.toLocaleString()}</strong>
            </div>
            <div>
              <span>Simulated daily sales</span>
              <strong>{festivalSales.toLocaleString(undefined, { maximumFractionDigits: 1 })}</strong>
            </div>
          </div>

          <div className="analytics-demand-chart">
            {[
              { label: "Current", value: dailySales, color: "#91a6c7" },
              { label: "Festival", value: festivalSales, color: "#3979ed" },
            ].map((bar) => (
              <div className="analytics-demand-column" key={bar.label}>
                <div className="analytics-demand-area">
                  <div
                    style={{
                      height: `${Math.max(3, (bar.value / Math.max(1, festivalSales)) * 100)}%`,
                      background: bar.color,
                    }}
                  />
                </div>
                <strong>{bar.value.toLocaleString(undefined, { maximumFractionDigits: 1 })}</strong>
                <span>{bar.label}</span>
              </div>
            ))}
          </div>

          <p className="analytics-footnote">
            Simulation assumes a {demandUplift}% increase. This is a rules-based estimate,
            not a trained AI forecast.
          </p>
        </article>
      </div>
    </section>
  );
}
export default App;