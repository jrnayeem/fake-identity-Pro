export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>404 — Page Not Found</h1>
        <p style={{ marginTop: "0.5rem", color: "#6b7280" }}>
          Did you forget to add the page to the router?
        </p>
      </div>
    </div>
  );
}
