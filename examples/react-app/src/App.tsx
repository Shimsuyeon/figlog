import { useState } from "react";
import { useAutoLog } from "@figlog/runtime";

export function App() {
  useAutoLog({
    domainMap: { shop: "OnlineShop" },
    onLog: (eventType, payload) => {
      console.log(`[FigLog] ${eventType}`, payload);
    },
  });

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 40, fontFamily: "sans-serif" }}>
      <h1>FigLog Demo</h1>
      <p style={{ color: "#666", marginBottom: 32 }}>
        Open DevTools console to see log events.
      </p>

      <ProductListScreen />
      <hr style={{ margin: "32px 0", border: "none", borderTop: "1px solid #eee" }} />
      <CheckoutScreen />
    </div>
  );
}

function ProductListScreen() {
  const [cart, setCart] = useState(0);

  return (
    <div data-log-screen="productList">
      <h2>Product List</h2>
      <p style={{ marginBottom: 16, color: "#888" }}>
        Click events — DA-defined (with data-log-id) vs auto-generated (without)
      </p>

      <div style={{ display: "flex", gap: 12 }}>
        <div style={cardStyle}>
          <p style={{ fontWeight: 600 }}>Wireless Headphones</p>
          <p style={{ color: "#888", fontSize: 13 }}>$49.99</p>
          <button
            data-log="click"
            data-log-id="addToCart"
            onClick={() => setCart((c) => c + 1)}
            style={btnStyle}
          >
            Add to Cart ({cart})
          </button>
        </div>

        <div style={cardStyle}>
          <p style={{ fontWeight: 600 }}>USB-C Cable</p>
          <p style={{ color: "#888", fontSize: 13 }}>$9.99</p>
          <button
            data-log="click"
            style={{ ...btnStyle, background: "#f4f4f5", color: "#333" }}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckoutScreen() {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <h2>Checkout</h2>
      <p style={{ marginBottom: 16, color: "#888" }}>
        View event fires when the banner enters viewport
      </p>

      <button
        onClick={() => setVisible((v) => !v)}
        style={{ ...btnStyle, background: "#10b981" }}
      >
        {visible ? "Hide" : "Show"} Order Confirmation
      </button>

      {visible && (
        <div
          data-log-screen="checkout"
          data-log="view"
          data-log-id="orderComplete"
          style={{
            marginTop: 16,
            padding: 24,
            background: "#ecfdf5",
            borderRadius: 8,
            textAlign: "center",
            fontSize: 18,
            fontWeight: 600,
            color: "#065f46",
          }}
        >
          Order Confirmed!
          <br />
          <button
            data-log="click"
            data-log-id="continueShopping"
            style={{ ...btnStyle, marginTop: 12, background: "#059669" }}
          >
            Continue Shopping
          </button>
        </div>
      )}
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  flex: 1,
  padding: 16,
  border: "1px solid #e5e7eb",
  borderRadius: 8,
};

const btnStyle: React.CSSProperties = {
  padding: "10px 20px",
  border: "none",
  borderRadius: 6,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  background: "#6366f1",
  color: "#fff",
  marginTop: 8,
};
