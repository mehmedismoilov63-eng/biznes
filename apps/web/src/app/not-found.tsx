import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "sans-serif", gap: 12 }}>
      <h1 style={{ fontSize: 48, fontWeight: 700, margin: 0 }}>404</h1>
      <p style={{ color: "#666", margin: 0 }}>Sahifa topilmadi</p>
      <Link href="/" style={{ color: "#6366f1", textDecoration: "none", marginTop: 8 }}>Bosh sahifaga qaytish</Link>
    </div>
  );
}
