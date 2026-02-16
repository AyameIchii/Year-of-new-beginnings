import { useState, useEffect } from "react";
import { ADMIN_NAME, ADMIN_PERMS, BONUS_RULES, MAX_BONUS_PICKS, LUCKY_NAMES } from "../constants";
import { shuffle, formatTime, checkBonusPick, isJackpot } from "../utils";
import { getEnvelopes, initEnvelopes, updateEnvelope, getHistory, addHistory, clearHistory, saveBank } from "../supabase";
import Fireworks from "./Fireworks";
import EnvelopeCard from "./EnvelopeCard";
import ResultModal from "./ResultModal";
import BankAccountsPanel from "./BankAccountsPanel";

export default function GameScreen({ userName, initialEnvelopes, onReset }) {
  const [envelopes, setEnvelopes]     = useState([]);
  const [history, setHistory]         = useState([]);
  const [result, setResult]           = useState(null);
  const [fireworks, setFireworks]     = useState(false);
  const [loading, setLoading]         = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showBanks, setShowBanks]     = useState(false);
  const [filterText, setFilterText]   = useState("");
  const [bonusCount, setBonusCount]   = useState(0); // Đếm số lần bốc thêm trong session

  const isAdmin = userName === ADMIN_NAME;
  const isLucky = LUCKY_NAMES.includes(userName);  // Người may mắn (ẩn)
  const myPicks = history.filter((h) => h.pickedBy === userName);
  
  // Người thường: chỉ bốc 1 lần TRỪ KHI có bonus
  // Admin: không giới hạn nếu có quyền
  const alreadyPicked = isAdmin && ADMIN_PERMS.unlimitedPicks
    ? false
    : myPicks.length > 0 && bonusCount === 0;

  // ── Load từ Supabase ──────────────────────────────────────────────────────
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      let envData = await getEnvelopes();
      
      if (envData.length === 0) {
        const fresh = initialEnvelopes.map((val, i) => ({
          id: i, value: val, pickedBy: null, pickedAt: null,
        }));
        await initEnvelopes(fresh);
        envData = fresh;
      }

      const histData = await getHistory();
      setEnvelopes(shuffle(envData));
      setHistory(histData);
    } catch (e) {
      console.error("Load error:", e);
      setEnvelopes(
        shuffle(initialEnvelopes.map((val, i) => ({ id: i, value: val, pickedBy: null, pickedAt: null })))
      );
    }
    setLoading(false);
  };

  // ── Polling mỗi 3 giây ────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const envData = await getEnvelopes();
        setEnvelopes((prev) =>
          prev.map((e) => {
            const u = envData.find((s) => s.id === e.id);
            return u ? { ...e, pickedBy: u.picked_by, pickedAt: u.picked_at } : e;
          })
        );
        const histData = await getHistory();
        setHistory(histData);
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // ── Bốc thăm ──────────────────────────────────────────────────────────────
  const handlePick = async (envId) => {
    let targetEnv = envelopes.find((e) => e.id === envId);
    if (!targetEnv) return;
    if (targetEnv.pickedBy && !(isAdmin && ADMIN_PERMS.unlimitedPicks)) return;

    // Người may mắn (trong LUCKY_NAMES) luôn nhận mệnh giá cao nhất (ẨN)
    // Admin alwaysBest cũng vậy
    if ((isAdmin && ADMIN_PERMS.alwaysBest) || isLucky) {
      const unpicked = envelopes.filter((e) => !e.pickedBy);
      if (unpicked.length > 0) {
        targetEnv = unpicked.reduce((acc, cur) => (cur.id < acc.id ? cur : acc), unpicked[0]);
      }
    }

    const now = Date.now();
    
    // Kiểm tra bonus
    const hasJackpotBonus = BONUS_RULES.jackpotBonus && isJackpot(targetEnv.id);
    const hasKeywordBonus = checkBonusPick(targetEnv, BONUS_RULES.bonusKeywords);
    const hasBonus = (hasJackpotBonus || hasKeywordBonus) && bonusCount < MAX_BONUS_PICKS;
    
    let bonusReason = "";
    if (hasBonus) {
      if (hasJackpotBonus) {
        bonusReason = "🏆 Bạn trúng Jackpot - mệnh giá cao nhất!";
      } else if (hasKeywordBonus) {
        bonusReason = "✨ Phong bì có nội dung đặc biệt!";
      }
    }
    
    // Update DB
    await updateEnvelope(targetEnv.id, userName, now);
    
    const histEntry = {
      id: `${now}-${targetEnv.id}`,
      pickedBy: userName,
      envelopeId: targetEnv.id,
      envelopeNumber: targetEnv.id + 1,
      value: targetEnv.value,
      pickedAt: now,
      isAdmin,
      hasBonus,
      bonusReason,
    };
    
    await addHistory(histEntry);

    // Update local state
    setEnvelopes((prev) =>
      prev.map((e) => (e.id === targetEnv.id ? { ...e, pickedBy: userName, pickedAt: now } : e))
    );
    setHistory((prev) => [histEntry, ...prev]);
    setResult(histEntry);
    
    // Nếu có bonus → cho phép bốc thêm
    if (hasBonus) {
      setBonusCount((prev) => prev + 1);
    } else {
      setBonusCount(0); // Reset khi không có bonus
    }
    
    setFireworks(true);
    setTimeout(() => setFireworks(false), 4000);
  };

  // ── Admin reset ───────────────────────────────────────────────────────────
  const handleAdminReset = async () => {
    if (!isAdmin || !ADMIN_PERMS.canReset) return;
    if (!confirm("Reset toàn bộ lì xì? Tất cả lịch sử sẽ bị xóa!")) return;
    
    const fresh = shuffle(
      initialEnvelopes.map((val, i) => ({ id: i, value: val, pickedBy: null, pickedAt: null }))
    );
    
    await initEnvelopes(fresh);
    await clearHistory();
    
    setEnvelopes(fresh);
    setHistory([]);
    setBonusCount(0);
  };

  // ── Lưu bank ─────────────────────────────────────────────────────────────
  const handleSaveBank = async (bankAccount) => {
    await saveBank(userName, bankAccount);
  };

  // ── Đóng modal (reset bonus count nếu đã hết lượt) ───────────────────────
  const handleCloseResult = () => {
    setResult(null);
    // Nếu không còn bonus → reset count
    if (!result?.hasBonus || bonusCount >= MAX_BONUS_PICKS) {
      setBonusCount(0);
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const picked    = envelopes.filter((e) => e.pickedBy).length;
  const remaining = envelopes.length - picked;
  const lastPick  = myPicks[0];
  const filteredHistory = filterText
    ? history.filter(
        (h) =>
          h.pickedBy.toLowerCase().includes(filterText.toLowerCase()) ||
          h.value.toLowerCase().includes(filterText.toLowerCase())
      )
    : history;

  if (loading) return <LoadingScreen />;

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(160deg, #0d0000 0%, #1a0505 40%, #2a0a0a 100%)",
        fontFamily: "'Be Vietnam Pro', sans-serif",
      }}
    >
      <Fireworks active={fireworks} />
      <ResultModal result={result} onClose={handleCloseResult} onSaveBank={handleSaveBank} />
      <BankAccountsPanel show={showBanks} onClose={() => setShowBanks(false)} />

      {/* ── Header ── */}
      <header
        className="sticky top-0 z-30 px-4 py-3"
        style={{
          background: "rgba(13,0,0,0.9)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,214,10,0.2)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span style={{ fontSize: 28 }}>🧧</span>
            <div>
              <h1 style={{ color: "#ffd60a", fontFamily: "serif", fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>
                BỐC THĂM LÌ XÌ
              </h1>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>
                Xin chào,{" "}
                <span style={{ color: isAdmin ? "#a78bfa" : "#ff9f1c", fontWeight: 700 }}>
                  {userName}
                </span>
                {isAdmin && (
                  <span
                    className="ml-1 px-1.5 py-0.5 rounded text-xs font-bold"
                    style={{
                      background: "rgba(167,139,250,0.2)",
                      color: "#a78bfa",
                      border: "1px solid rgba(167,139,250,0.4)",
                      fontSize: 9,
                    }}
                  >
                    ♛ ADMIN
                  </span>
                )}
                {/* KHÔNG hiện badge cho người may mắn - giữ ẩn */}
                {!isAdmin && lastPick && bonusCount === 0 && <span style={{ color: "#4ade80" }}> ✓ Đã bốc</span>}
                {bonusCount > 0 && (
                  <span style={{ color: "#ec4899", fontWeight: 600 }}> 🎰 Bonus x{bonusCount}</span>
                )}
                {isAdmin && myPicks.length > 0 && (
                  <span style={{ color: "#a78bfa" }}> · {myPicks.length} lần</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <StatBadge value={remaining}        label="Còn lại" color="#ffd60a" bg="rgba(255,214,10,0.1)"  border="rgba(255,214,10,0.2)" />
            <StatBadge value={picked}           label="Đã bốc"  color="#e63946" bg="rgba(230,57,70,0.1)"   border="rgba(230,57,70,0.2)"  />
            <StatBadge value={envelopes.length} label="Tổng"    color="#ff9f1c" bg="rgba(255,159,28,0.1)"  border="rgba(255,159,28,0.2)" />

            <div className="flex gap-2 flex-wrap">
              <ActionButton active={showHistory} onClick={() => setShowHistory(!showHistory)}>
                📜 Lịch sử
              </ActionButton>
              {isAdmin && ADMIN_PERMS.previewValues && (
                <ActionButton active={showPreview} onClick={() => setShowPreview(!showPreview)} admin>
                  👁 Preview
                </ActionButton>
              )}
              {isAdmin && (
                <ActionButton onClick={() => setShowBanks(true)} admin>
                  💳 Số TK
                </ActionButton>
              )}
              {isAdmin && ADMIN_PERMS.canReset && (
                <ActionButton danger onClick={handleAdminReset}>🔄 Reset</ActionButton>
              )}
              <ActionButton onClick={onReset}>← Thoát</ActionButton>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div
            className="max-w-5xl mx-auto mt-2 px-3 py-1.5 rounded-xl flex flex-wrap gap-3 items-center"
            style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)" }}
          >
            <span style={{ color: "#a78bfa", fontSize: 11, fontWeight: 700 }}>
              ♛ Quyền admin:
            </span>
            {ADMIN_PERMS.unlimitedPicks && <AdminPill>⚡ Bốc không giới hạn</AdminPill>}
            {ADMIN_PERMS.alwaysBest     && <AdminPill>🏆 Luôn nhận cao nhất</AdminPill>}
            {ADMIN_PERMS.previewValues  && <AdminPill>👁 Xem trước</AdminPill>}
            {ADMIN_PERMS.canReset       && <AdminPill>🔄 Reset</AdminPill>}
          </div>
        )}

        {/* Bonus rules info */}
        {!isAdmin && (
          <div
            className="max-w-5xl mx-auto mt-2 px-3 py-1.5 rounded-xl"
            style={{ background: "rgba(236,72,153,0.08)", border: "1px solid rgba(236,72,153,0.2)" }}
          >
            <div style={{ color: "#ec4899", fontSize: 11, fontWeight: 600, marginBottom: 2 }}>
              🎰 Cơ hội bốc thêm:
            </div>
            <div style={{ color: "rgba(236,72,153,0.7)", fontSize: 10, lineHeight: 1.4 }}>
              {BONUS_RULES.jackpotBonus && "🏆 Trúng Jackpot (cao nhất)"}
              {BONUS_RULES.jackpotBonus && BONUS_RULES.bonusKeywords.length > 0 && " • "}
              {BONUS_RULES.bonusKeywords.length > 0 && `✨ Nội dung: ${BONUS_RULES.bonusKeywords.slice(0, 3).join(", ")}`}
            </div>
          </div>
        )}
      </header>

      {/* ── Body ── */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {lastPick && (
          <div
            className="mb-6 p-4 rounded-2xl flex items-center gap-4"
            style={{
              background: lastPick.hasBonus
                ? "linear-gradient(135deg, rgba(236,72,153,0.15), rgba(236,72,153,0.05))"
                : isAdmin
                ? "linear-gradient(135deg, rgba(167,139,250,0.1), rgba(167,139,250,0.05))"
                : "linear-gradient(135deg, rgba(74,222,128,0.1), rgba(74,222,128,0.05))",
              border: `1.5px solid ${lastPick.hasBonus ? "rgba(236,72,153,0.4)" : isAdmin ? "rgba(167,139,250,0.3)" : "rgba(74,222,128,0.3)"}`,
            }}
          >
            <div style={{ fontSize: 36 }}>{lastPick.hasBonus ? "🎰" : isAdmin ? "👑" : "🎊"}</div>
            <div>
              <div style={{ color: lastPick.hasBonus ? "#ec4899" : isAdmin ? "#a78bfa" : "#4ade80", fontWeight: 700, fontSize: 15, marginBottom: 2 }}>
                {isAdmin ? "Admin đã bốc:" : "Bạn đã bốc:"}{" "}
                <span style={{ color: "#ffd60a" }}>{lastPick.value}</span>
              </div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
                Lì xì #{lastPick.envelopeNumber} • {formatTime(lastPick.pickedAt)}
                {lastPick.hasBonus && <span style={{ color: "#ec4899", fontWeight: 600 }}> • {lastPick.bonusReason}</span>}
                {isAdmin && ADMIN_PERMS.unlimitedPicks && (
                  <span style={{ color: "#a78bfa" }}> • Tổng: {myPicks.length} lần</span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>Tiến trình</span>
            <span style={{ color: "#ffd60a", fontSize: 12, fontWeight: 600 }}>
              {Math.round((picked / envelopes.length) * 100)}%
            </span>
          </div>
          <div className="rounded-full overflow-hidden" style={{ height: 8, background: "rgba(255,255,255,0.1)" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(picked / envelopes.length) * 100}%`,
                background: "linear-gradient(90deg, #ffd60a, #fb8500, #e63946)",
                boxShadow: "0 0 10px rgba(255,214,10,0.5)",
              }}
            />
          </div>
        </div>

        {isAdmin && showPreview && ADMIN_PERMS.previewValues && (
          <div className="mb-6 p-4 rounded-2xl" style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.25)" }}>
            <div style={{ color: "#a78bfa", fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
              👁 Xem trước (chỉ admin)
            </div>
            <div className="custom-scroll" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 6, maxHeight: 280, overflowY: "auto" }}>
              {[...envelopes].sort((a, b) => a.id - b.id).map((env) => {
                const hasBonus = isJackpot(env.id) || checkBonusPick(env, BONUS_RULES.bonusKeywords);
                return (
                  <div key={env.id} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                    style={{
                      background: env.pickedBy ? "rgba(255,255,255,0.03)" : hasBonus ? "rgba(236,72,153,0.12)" : env.id === 0 ? "rgba(255,214,10,0.12)" : "rgba(255,255,255,0.05)",
                      border: `1px solid ${env.pickedBy ? "rgba(255,255,255,0.05)" : hasBonus ? "rgba(236,72,153,0.3)" : env.id === 0 ? "rgba(255,214,10,0.3)" : "rgba(167,139,250,0.15)"}`,
                      opacity: env.pickedBy ? 0.45 : 1,
                    }}
                  >
                    <span style={{ color: "rgba(255,214,10,0.4)", fontSize: 10, minWidth: 20, fontFamily: "monospace" }}>#{env.id + 1}</span>
                    <span style={{ color: hasBonus ? "#ec4899" : env.id === 0 ? "#ffd60a" : "#e2d9f3", fontSize: 12, fontWeight: hasBonus || env.id === 0 ? 700 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {hasBonus && "🎰 "}{env.id === 0 && "🏆 "}{env.value}
                    </span>
                    {env.pickedBy && <span style={{ fontSize: 9, color: "#888", marginLeft: "auto" }}>✓</span>}
                  </div>
                );
              })}
            </div>
            <p style={{ color: "rgba(167,139,250,0.5)", fontSize: 10, marginTop: 8 }}>
              🏆 #1 = cao nhất • 🎰 = bonus
            </p>
          </div>
        )}

        <div className={`grid gap-6 ${showHistory ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"}`}>
          <div className={showHistory ? "lg:col-span-2" : ""}>
            {!lastPick && !isAdmin && (
              <div className="text-center mb-6">
                <div className="inline-block px-6 py-3 rounded-full"
                  style={{ background: "rgba(255,214,10,0.1)", border: "1px solid rgba(255,214,10,0.3)", color: "#ffd60a", fontSize: 14, fontFamily: "serif", animation: "glow 2s ease-in-out infinite" }}
                >
                  🎯 Chọn một phong bì!
                </div>
              </div>
            )}
            {bonusCount > 0 && (
              <div className="text-center mb-6">
                <div className="inline-block px-6 py-3 rounded-full"
                  style={{ background: "rgba(236,72,153,0.15)", border: "1px solid rgba(236,72,153,0.4)", color: "#ec4899", fontSize: 14, animation: "pulse 1.5s ease-in-out infinite" }}
                >
                  🎰 Bốc thêm lần {bonusCount}/{MAX_BONUS_PICKS}!
                </div>
              </div>
            )}
            {/* KHÔNG hiện hint cho người may mắn - giữ bí mật */}
            {isAdmin && (
              <div className="text-center mb-6">
                <div className="inline-block px-6 py-3 rounded-full"
                  style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.3)", color: "#a78bfa", fontSize: 13 }}
                >
                  ♛ Bấm bất kỳ — nhận mệnh giá cao nhất
                </div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))", gap: 10, justifyItems: "center" }}>
              {envelopes.map((env, index) => (
                <EnvelopeCard
                  key={env.id}
                  env={env}
                  index={index}
                  onPick={handlePick}
                  alreadyPicked={alreadyPicked}
                  isAdmin={isAdmin}
                  showPreview={isAdmin && showPreview && ADMIN_PERMS.previewValues}
                />
              ))}
            </div>
          </div>

          {showHistory && (
            <HistoryPanel
              history={filteredHistory}
              filterText={filterText}
              setFilterText={setFilterText}
              totalCount={history.length}
              userName={userName}
              isAdmin={isAdmin}
            />
          )}
        </div>

        <footer className="text-center mt-10 pb-6" style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>
          🧧 Chúc Mừng Năm Mới • Vạn Sự Như Ý • Tài Lộc Dồi Dào 🎊
        </footer>
      </main>

      <style>{`
        @keyframes glow { 0%,100% { box-shadow: 0 0 10px rgba(255,214,10,0.2); } 50% { box-shadow: 0 0 20px rgba(255,214,10,0.5); } }
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(167,139,250,0.3); border-radius: 4px; }
      `}</style>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(160deg, #0d0000 0%, #1a0505 100%)" }}>
      <div className="text-center">
        <div style={{ fontSize: 60, animation: "pulse 1s ease-in-out infinite" }}>🧧</div>
        <div style={{ color: "#ffd60a", fontFamily: "serif", marginTop: 16, fontSize: 18 }}>Đang tải...</div>
        <style>{`@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }`}</style>
      </div>
    </div>
  );
}

function AdminPill({ children }) {
  return <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: "rgba(167,139,250,0.15)", color: "#c4b5fd", border: "1px solid rgba(167,139,250,0.25)" }}>{children}</span>;
}

function StatBadge({ value, label, color, bg, border }) {
  return (
    <div className="text-center px-4 py-2 rounded-xl" style={{ background: bg, border: `1px solid ${border}` }}>
      <div style={{ color, fontWeight: 700, fontSize: 18, lineHeight: 1 }}>{value}</div>
      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10 }}>{label}</div>
    </div>
  );
}

function ActionButton({ children, onClick, active, danger, admin }) {
  return (
    <button onClick={onClick} className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
      style={{
        background: danger ? "rgba(230,57,70,0.1)" : admin && active ? "rgba(167,139,250,0.25)" : admin ? "rgba(167,139,250,0.1)" : active ? "rgba(255,214,10,0.2)" : "rgba(255,255,255,0.07)",
        border: `1px solid ${danger ? "rgba(230,57,70,0.2)" : admin ? "rgba(167,139,250,0.3)" : active ? "rgba(255,214,10,0.4)" : "rgba(255,255,255,0.15)"}`,
        color: danger ? "#e63946" : admin ? "#a78bfa" : active ? "#ffd60a" : "rgba(255,255,255,0.6)",
        cursor: "pointer", fontFamily: "'Be Vietnam Pro', sans-serif",
      }}
    >
      {children}
    </button>
  );
}

function HistoryPanel({ history, filterText, setFilterText, totalCount, userName, isAdmin }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,214,10,0.15)", maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 style={{ color: "#ffd60a", fontFamily: "serif", fontSize: 16, fontWeight: 700 }}>📜 Lịch Sử</h3>
        <span className="px-2 py-1 rounded-full text-xs" style={{ background: "rgba(230,57,70,0.2)", color: "#e63946" }}>{totalCount} lượt</span>
      </div>
      <input style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,214,10,0.2)", borderRadius: 8, color: "#fff", padding: "8px 12px", fontSize: 12, marginBottom: 12, outline: "none", fontFamily: "'Be Vietnam Pro', sans-serif", width: "100%" }}
        placeholder="🔍 Tìm..." value={filterText} onChange={(e) => setFilterText(e.target.value)} />
      <div style={{ overflowY: "auto", flex: 1 }}>
        {history.length === 0 ? (
          <div className="text-center py-8" style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Chưa có ai bốc</div>
        ) : (
          history.map((h) => {
            const isMe = h.pickedBy === userName;
            const isAdminLine = h.isAdmin;
            return (
              <div key={h.id} className="mb-2 p-3 rounded-xl"
                style={{ background: h.hasBonus ? "rgba(236,72,153,0.08)" : isAdminLine ? "rgba(167,139,250,0.07)" : isMe ? "rgba(74,222,128,0.08)" : "rgba(255,255,255,0.04)", border: `1px solid ${h.hasBonus ? "rgba(236,72,153,0.2)" : isAdminLine ? "rgba(167,139,250,0.2)" : isMe ? "rgba(74,222,128,0.2)" : "rgba(255,255,255,0.06)"}` }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 16 }}>{h.hasBonus ? "🎰" : isAdminLine ? "👑" : "🧧"}</span>
                    <div>
                      <div style={{ color: h.hasBonus ? "#ec4899" : isAdminLine ? "#a78bfa" : isMe ? "#4ade80" : "#fff", fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>
                        {h.pickedBy}
                        {isAdminLine && <span style={{ color: "#a78bfa", fontSize: 9 }}> ♛</span>}
                        {isMe && !isAdminLine && <span style={{ color: "#4ade80", fontSize: 10 }}> (bạn)</span>}
                        {h.hasBonus && <span style={{ color: "#ec4899", fontSize: 9 }}> 🎰</span>}
                      </div>
                      <div style={{ color: "#ffd60a", fontSize: 11, opacity: 0.9 }}>{h.value}</div>
                    </div>
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, textAlign: "right", flexShrink: 0 }}>
                    #{h.envelopeNumber}<br />{formatTime(h.pickedAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
// Lịch sử bốc thăm với filter, phân biệt admin, người chơi và bonus picks