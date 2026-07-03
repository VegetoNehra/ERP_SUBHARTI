import Sidebar from "./Sidebar";

export default function AdminLayout({ children }) {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  );
}