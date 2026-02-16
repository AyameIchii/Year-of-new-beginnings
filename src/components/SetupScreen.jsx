import { useState, useEffect } from "react";
import { MAX_ENVELOPES } from "../constants";
import { formatTime } from "../utils";
import { getSetup, saveSetup } from "../supabase";

const inputStyle = {
  background: "rgba(255,255,255,0.07)",
  border: "1.5px solid rgba(255,214,10,0.35)",
  borderRadius: 10,
  color: "#fff",
  fontFamily: "'Be Vietnam Pro', sans-serif",
  padding: "10px 14px",
  outline: "none",
  width: "100%",
  fontSize: 14,
  transition: "border-color 0.2s",
};

export default function SetupScreen({ onStart }) {
  const [name, setName]               = useState("");
  const [envelopes, setEnvelopes]     = useState(
    Array(MAX_ENVELOPES).fill("").map((_, i) => `Lì xì ${i + 1}`)
  );
  const [activeTab, setActiveTab]     = useState("name");
  const [animIn, setAnimIn]           = useState(false);
  const [existingSetup, setExistingSetup] = useState(null);
  const [loadingStorage, setLoadingStorage] = useState(true);

  useEffect(() => {
    setTimeout(() => setAnimIn(true), 50);

    (async () => {
      try {
        const setup = await getSetup();
        if (setup?.envelopes) {
          setExistingSetup(setup);
          setEnvelopes(setup.envelopes);
        }
      } catch {}
      setLoadingStorage(false);
    })();
  }, []);

  const handleStart = async () => {
    if (!name.trim()) return;
    const filled = envelopes.map((e, i) => e.trim() || `Lì xì ${i + 1}`);
    try {
      await saveSetup(filled);
    } catch {}
    onStart(name.trim(), filled);
  };

  const handleBulkPaste = (text) => {
    const lines = text
      .split(/[\n,;]+/)
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, MAX_ENVELOPES);
    setEnvelopes((prev) => {
      const next = [...prev];
      lines.forEach((l, i) => { if (i < next.length) next[i] = l; });
      return next;
    });
  };

  const handleEnvelopeChange = (idx, value) => {
    setEnvelopes((prev) => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
  };

  const handleReset = () =>
    setEnvelopes(Array(MAX_ENVELOPES).fill("").map((_, i) => `Lì xì ${i + 1}`));

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(160deg, #0d0000 0%, #1a0505 40%, #2a0a0a 100%)",
        fontFamily: "'Be Vietnam Pro', sans-serif",
      }}
    >
      <FloatingParticles />

      <div
        style={{
          maxWidth: 540,
          width: "100%",
          opacity: animIn ? 1 : 0,
          transform: animIn ? "translateY(0)" : "translateY(30px)",
          transition: "all 0.6s cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        <div className="text-center mb-8">
          <div style={{ fontSize: 64, lineHeight: 1, marginBottom: 12 }}>🧧</div>
          <h1
            style={{
              color: "#ffd60a",
              fontSize: 36,
              fontWeight: 900,
              fontFamily: "serif",
              letterSpacing: 2,
              textShadow: "0 0 30px rgba(255,214,10,0.6), 0 2px 4px rgba(0,0,0,0.5)",
              marginBottom: 6,
            }}
          >
            BỐC THĂM LÌ XÌ
          </h1>
          <p style={{ color: "#ff9f1c", fontSize: 13, letterSpacing: 3, textTransform: "uppercase", opacity: 0.8 }}>
            Chúc Mừng Năm Mới ✨ Vạn Sự Như Ý
          </p>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1.5px solid rgba(255,214,10,0.2)",
            borderRadius: 20,
            padding: 28,
            backdropFilter: "blur(10px)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {loadingStorage ? (
            <div className="text-center py-8" style={{ color: "#ffd60a", opacity: 0.6 }}>
              Đang tải...
            </div>
          ) : (
            <>
              <div className="flex mb-6 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,214,10,0.2)" }}>
                {["name", "envelopes"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      flex: 1, padding: "10px 0", cursor: "pointer",
                      background: activeTab === tab
                        ? "linear-gradient(135deg, #e63946, #9d0208)"
                        : "transparent",
                      color: activeTab === tab ? "#ffd60a" : "rgba(255,255,255,0.5)",
                      border: "none",
                      fontFamily: "'Be Vietnam Pro', sans-serif",
                      fontWeight: 600, fontSize: 13,
                      transition: "all 0.2s",
                    }}
                  >
                    {tab === "name" ? "👤 Tên của bạn" : "🎁 Danh sách lì xì"}
                  </button>
                ))}
              </div>

              {activeTab === "name" && (
                <div style={{ animation: "fadeIn 0.3s ease" }}>
                  <label style={{ color: "#ffd60a", fontSize: 13, display: "block", marginBottom: 8, fontWeight: 600 }}>
                    Nhập tên của bạn:
                  </label>
                  <input
                    style={inputStyle}
                    placeholder="VD: Nguyễn Văn A..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleStart()}
                    autoFocus
                    onFocus={(e) => (e.target.style.borderColor = "rgba(255,214,10,0.7)")}
                    onBlur={(e)  => (e.target.style.borderColor = "rgba(255,214,10,0.35)")}
                  />
                  {existingSetup && (
                    <div
                      className="mt-4 p-3 rounded-xl"
                      style={{ background: "rgba(255,214,10,0.07)", border: "1px solid rgba(255,214,10,0.2)" }}
                    >
                      <div style={{ color: "#ffd60a", fontSize: 12, marginBottom: 4 }}>
                        ✅ Đã có danh sách từ Supabase ({existingSetup.envelopes.length} phong bì)
                      </div>
                      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>
                        Cập nhật: {formatTime(new Date(existingSetup.updated_at).getTime())}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "envelopes" && (
                <div style={{ animation: "fadeIn 0.3s ease" }}>
                  <div className="flex items-center justify-between mb-3">
                    <label style={{ color: "#ffd60a", fontSize: 13, fontWeight: 600 }}>
                      🎁 {envelopes.filter((e) => e.trim()).length}/{MAX_ENVELOPES} lì xì
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const text = prompt("Dán danh sách (mỗi dòng 1 tên):");
                          if (text) handleBulkPaste(text);
                        }}
                        style={{
                          background: "rgba(255,214,10,0.15)",
                          border: "1px solid rgba(255,214,10,0.3)",
                          color: "#ffd60a", borderRadius: 8,
                          padding: "4px 10px", fontSize: 11, cursor: "pointer",
                          fontFamily: "'Be Vietnam Pro', sans-serif",
                        }}
                      >
                        📋 Dán
                      </button>
                      <button
                        onClick={handleReset}
                        style={{
                          background: "rgba(230,57,70,0.15)",
                          border: "1px solid rgba(230,57,70,0.3)",
                          color: "#e63946", borderRadius: 8,
                          padding: "4px 10px", fontSize: 11, cursor: "pointer",
                          fontFamily: "'Be Vietnam Pro', sans-serif",
                        }}
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  <div
                    className="custom-scroll"
                    style={{
                      height: 320, overflowY: "auto",
                      display: "grid", gridTemplateColumns: "1fr 1fr",
                      gap: 6, paddingRight: 4,
                    }}
                  >
                    {envelopes.map((val, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span style={{ color: "rgba(255,214,10,0.4)", fontSize: 10, minWidth: 22, textAlign: "right", fontFamily: "monospace" }}>
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <input
                          style={{ ...inputStyle, padding: "6px 10px", fontSize: 12 }}
                          value={val}
                          onChange={(e) => handleEnvelopeChange(idx, e.target.value)}
                          placeholder={`Lì xì ${idx + 1}`}
                          onFocus={(e) => (e.target.style.borderColor = "rgba(255,214,10,0.7)")}
                          onBlur={(e)  => (e.target.style.borderColor = "rgba(255,214,10,0.35)")}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleStart}
                disabled={!name.trim()}
                className="w-full mt-6 py-4 rounded-xl font-bold text-lg transition-all duration-200"
                style={{
                  background: name.trim()
                    ? "linear-gradient(135deg, #ffd60a 0%, #fb8500 100%)"
                    : "rgba(255,255,255,0.1)",
                  color: name.trim() ? "#1a0505" : "rgba(255,255,255,0.3)",
                  border: "none",
                  fontFamily: "serif",
                  letterSpacing: 2,
                  cursor: name.trim() ? "pointer" : "not-allowed",
                  boxShadow: name.trim() ? "0 6px 30px rgba(255,214,10,0.4)" : "none",
                  transform: name.trim() ? "scale(1)" : "scale(0.98)",
                }}
              >
                🎊 VÀO BỐC THĂM
              </button>
            </>
          )}
        </div>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0);   }
          }
          .custom-scroll::-webkit-scrollbar { width: 4px; }
          .custom-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 4px; }
          .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,214,10,0.3);   border-radius: 4px; }
        `}</style>
      </div>
    </div>
  );
}

function FloatingParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width:  4 + (i % 4) * 3,
            height: 4 + (i % 4) * 3,
            background: i % 2 === 0 ? "#ffd60a" : "#e63946",
            left: `${(i * 17 + 5) % 100}%`,
            top:  `${(i * 23 + 10) % 100}%`,
            opacity: 0.15 + (i % 4) * 0.05,
            animation: `float-${i % 3} ${4 + (i % 3)}s ease-in-out infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes float-0 { 0%,100%{transform:translateY(0px) rotate(0deg)}   50%{transform:translateY(-20px) rotate(180deg)}  }
        @keyframes float-1 { 0%,100%{transform:translateY(0px) rotate(0deg)}   50%{transform:translateY(-30px) rotate(-180deg)} }
        @keyframes float-2 { 0%,100%{transform:translateY(0px) rotate(0deg)}   50%{transform:translateY(-15px) rotate(90deg)}   }
      `}</style>
    </div>
  );
}
