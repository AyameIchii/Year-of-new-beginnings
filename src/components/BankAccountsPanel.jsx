import { useState, useEffect } from "react";
import { getBanks } from "../supabase";

export default function BankAccountsPanel({ show, onClose }) {
  const [banks, setBanks] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (!show) return;
    loadBanks();
    const interval = setInterval(loadBanks, 5000);
    return () => clearInterval(interval);
  }, [show]);

  const loadBanks = async () => {
    try {
      const data = await getBanks();
      setBanks(data);
    } catch {}
    setLoading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (!show) return null;

  const entries = Object.entries(banks);
  const filtered = filter
    ? entries.filter(([name, acc]) =>
        name.toLowerCase().includes(filter.toLowerCase()) ||
        acc.toLowerCase().includes(filter.toLowerCase())
      )
    : entries;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 px-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl p-6 w-full"
        style={{
          background: "linear-gradient(135deg, #1a0a0a 0%, #2a0515 100%)",
          border: "2px solid rgba(167,139,250,0.3)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
          maxWidth: 600,
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 style={{ color: "#a78bfa", fontFamily: "serif", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
              💳 Danh Sách Số Tài Khoản
            </h2>
            <p style={{ color: "rgba(167,139,250,0.5)", fontSize: 11 }}>
              Chỉ admin • {entries.length} người
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(167,139,250,0.1)",
              border: "1px solid rgba(167,139,250,0.3)",
              color: "#a78bfa",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "'Be Vietnam Pro', sans-serif",
            }}
          >
            ✕ Đóng
          </button>
        </div>

        <input
          type="text"
          placeholder="🔍 Tìm kiếm..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px",
            marginBottom: 12,
            borderRadius: 10,
            border: "1px solid rgba(167,139,250,0.2)",
            background: "rgba(0,0,0,0.3)",
            color: "#fff",
            fontSize: 13,
            outline: "none",
            fontFamily: "'Be Vietnam Pro', sans-serif",
          }}
        />

        <div className="flex-1 overflow-y-auto custom-scroll" style={{ paddingRight: 4 }}>
          {loading ? (
            <div className="text-center py-8" style={{ color: "rgba(167,139,250,0.5)", fontSize: 13 }}>
              Đang tải...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8" style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
              {filter ? "Không tìm thấy" : "Chưa có ai nhập"}
            </div>
          ) : (
            filtered.map(([name, account]) => (
              <div
                key={name}
                className="mb-2 p-3 rounded-xl flex items-center justify-between gap-3"
                style={{
                  background: "rgba(167,139,250,0.05)",
                  border: "1px solid rgba(167,139,250,0.15)",
                }}
              >
                <div className="flex-1">
                  <div style={{ color: "#fff", fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
                    {name}
                  </div>
                  <div style={{ color: "#a78bfa", fontSize: 14, fontFamily: "monospace", letterSpacing: 1 }}>
                    {account}
                  </div>
                </div>
                <button
                  onClick={() => {
                    copyToClipboard(account);
                    const btn = event.currentTarget;
                    const orig = btn.textContent;
                    btn.textContent = "✓";
                    setTimeout(() => (btn.textContent = orig), 1000);
                  }}
                  style={{
                    background: "rgba(167,139,250,0.15)",
                    border: "1px solid rgba(167,139,250,0.3)",
                    color: "#a78bfa",
                    borderRadius: 6,
                    padding: "4px 10px",
                    fontSize: 11,
                    cursor: "pointer",
                    fontFamily: "'Be Vietnam Pro', sans-serif",
                    flexShrink: 0,
                  }}
                >
                  📋 Copy
                </button>
              </div>
            ))
          )}
        </div>

        <style>{`
          .custom-scroll::-webkit-scrollbar { width: 4px; }
          .custom-scroll::-webkit-scrollbar-track { background: rgba(167,139,250,0.05); border-radius: 4px; }
          .custom-scroll::-webkit-scrollbar-thumb { background: rgba(167,139,250,0.3); border-radius: 4px; }
        `}</style>
      </div>
    </div>
  );
}
