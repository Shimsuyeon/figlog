import { useState } from "react";
import { useAutoLog } from "@figlog/runtime";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

const products: Product[] = [
  { id: "headphones", name: "무선 헤드폰", description: "프리미엄 노이즈 캔슬링 헤드폰", price: 129000, image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop" },
  { id: "phone", name: "스마트폰", description: "최신 5G 스마트폰, 256GB", price: 899000, image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=300&fit=crop" },
  { id: "laptop", name: "노트북", description: "고성능 워크스테이션 노트북", price: 1299000, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop" },
  { id: "earbuds", name: "무선 이어버드", description: "프리미엄 사운드, 액티브 노이즈 캔슬링", price: 189000, image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&h=300&fit=crop" },
  { id: "watch", name: "스마트워치", description: "건강 모니터링 & 피트니스 트래커", price: 449000, image: "https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=400&h=300&fit=crop" },
  { id: "tablet", name: "태블릿", description: "12.9인치 프로 태블릿, 128GB", price: 599000, image: "https://images.unsplash.com/photo-1561154464-82e6b1c0dbf7?w=400&h=300&fit=crop" },
];

const fmt = (n: number) =>
  "₩" + n.toLocaleString("ko-KR");

export function App() {
  const [cart, setCart] = useState<string[]>([]);

  useAutoLog({
    domainMap: { shop: "OnlineShop" },
    onLog: (eventType, payload) => {
      console.log(`[FigLog] ${eventType}`, payload);
    },
  });

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div className="header-inner" style={styles.headerInner}>
          <span style={styles.logo}>쇼핑몰</span>
          <button
            data-log="click"
            data-log-id="openCart"
            style={styles.cartBtn}
            onClick={() => alert(`장바구니: ${cart.length}개 상품`)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            장바구니{cart.length > 0 && ` (${cart.length})`}
          </button>
        </div>
      </header>

      <main
        data-log-screen="productList"
        data-log="view"
        data-log-id="productList"
        className="main-content"
        style={styles.main}
      >
        <div style={styles.sectionHeader}>
          <h2 className="section-title" style={styles.title}>인기 상품</h2>
          <p style={styles.subtitle}>최신 전자기기를 만나보세요</p>
        </div>

        <div className="product-grid" style={styles.grid}>
          {products.map((product) => (
            <div
              key={product.id}
              data-log="view"
              data-log-id="productCard"
              style={styles.card}
            >
              <div
                data-log="click"
                data-log-id="productCard"
                onClick={() => alert(`${product.name} 상세 페이지로 이동`)}
                style={{ cursor: "pointer" }}
              >
                <div className="card-image" style={styles.imageWrapper}>
                  <img src={product.image} alt={product.name} style={styles.productImage} />
                </div>
                <div style={styles.cardBody}>
                  <h3 style={styles.productName}>{product.name}</h3>
                  <p style={styles.productDesc}>{product.description}</p>
                </div>
              </div>
              <div style={styles.cardFooter}>
                <span style={styles.price}>{fmt(product.price)}</span>
                <button
                  data-log="click"
                  data-log-id="addToCart"
                  style={styles.addBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCart((prev) => [...prev, product.id]);
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  담기
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer style={styles.footer}>
        <p>Open DevTools console to see FigLog events</p>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    color: "#0a0a0a",
    background: "#f9fafb",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    background: "#fff",
    borderBottom: "1px solid rgba(0,0,0,0.1)",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  headerInner: {
    maxWidth: 738,
    margin: "0 auto",
    padding: "16px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: "0.3%",
  },
  cartBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 16px",
    background: "transparent",
    border: "none",
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 400,
    cursor: "pointer",
    color: "#0a0a0a",
    transition: "background 0.15s",
  },
  main: {
    maxWidth: 738,
    width: "100%",
    margin: "0 auto",
    padding: "32px 24px",
    flex: 1,
  },
  sectionHeader: {
    marginBottom: 32,
  },
  title: {
    fontSize: 30,
    fontWeight: 700,
    lineHeight: 1.2,
    margin: 0,
  },
  subtitle: {
    fontSize: 16,
    color: "#4a5565",
    marginTop: 8,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 16,
  },
  card: {
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.1)",
    borderRadius: 10,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    transition: "box-shadow 0.2s",
  },
  imageWrapper: {
    height: 200,
    overflow: "hidden",
    backgroundColor: "#f3f4f6",
  },
  productImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  cardBody: {
    padding: "16px 16px 0",
  },
  productName: {
    fontSize: 18,
    fontWeight: 600,
    margin: 0,
  },
  productDesc: {
    fontSize: 14,
    color: "#4a5565",
    marginTop: 4,
    marginBottom: 0,
  },
  cardFooter: {
    padding: "12px 16px 16px",
    marginTop: "auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: 18,
    fontWeight: 600,
    color: "#155dfc",
  },
  addBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    background: "#155dfc",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.15s",
  },
  footer: {
    textAlign: "center" as const,
    padding: "24px 0",
    fontSize: 13,
    color: "#999",
  },
};
