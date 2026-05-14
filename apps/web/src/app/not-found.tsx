export default function NotFound() {
  return (
    <html>
      <body>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "sans-serif" }}>
          <h1 style={{ fontSize: 48, fontWeight: 700, margin: 0 }}>404</h1>
          <p style={{ color: "#666", marginTop: 8 }}>Sahifa topilmadi</p>
          <a href="/" style={{ marginTop: 16, color: "#6366f1" }}>Bosh sahifaga qaytish</a>
        </div>
      </body>
    </html>
  );
}
