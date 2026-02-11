import { useState, useEffect } from "react";

/**
 * Modal hiển thị kết quả sau khi bốc thăm thành công.
 * Props:
 *   result  {object|null} — { pickedBy, value, envelopeNumber } hoặc null để ẩn
 *   onClose {function}    — callback đóng modal
 */
export default function ResultModal({ result, onClose }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (result) setTimeout(() => setShow(true), 50);
    else setShow(false);
  }, [result]);

  if (!result) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-40"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="relative text-center rounded-2xl p-8 mx-4"
        style={{
          background: "linear-gradient(135deg, #1a0a0a 0%, #3d0000 50%, #1a0a0a 100%)",
          border: "3px solid #ffd60a",
          boxShadow:
            "0 0 60px rgba(255,214,10,0.4), 0 0 120px rgba(230,57,70,0.3)",
          maxWidth: 400,
          transform: show ? "scale(1)" : "scale(0.5)",
          opacity: show ? 1 : 0,
          transition: "all 0.4s cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        {/* Icon quay */}
        <div className="text-5xl mb-2" style={{ animation: "spin 2s linear infinite" }}>
          🎊
        </div>

        <div
          style={{
            color: "#ffd60a",
            fontFamily: "serif",
            fontSize: "13px",
            letterSpacing: 4,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Chúc Mừng!
        </div>

        {/* Tên người bốc */}
        <div style={{ color: "#fff", fontFamily: "serif", fontSize: "20px", fontWeight: "bold", marginBottom: 4 }}>
          {result.pickedBy}
        </div>
        <div style={{ color: "#ffd60a", fontFamily: "serif", fontSize: "13px", marginBottom: 16, opacity: 0.8 }}>
          đã bốc được lì xì
        </div>

        {/* Phong bì lớn */}
        <div
          className="mx-auto flex items-center justify-center rounded-xl mb-4"
          style={{
            width: 120, height: 80,
            background: "linear-gradient(135deg, #e63946, #9d0208)",
            border: "3px solid #ffd60a",
            boxShadow: "0 0 30px rgba(255,214,10,0.6)",
          }}
        >
          <div style={{ fontSize: "40px" }}>🧧</div>
        </div>

        {/* Giá trị lì xì */}
        <div style={{ color: "#ff9f1c", fontFamily: "serif", fontSize: "18px", fontWeight: "bold", marginBottom: 4 }}>
          {result.value}
        </div>
        <div style={{ color: "#aaa", fontSize: "11px", marginBottom: 24 }}>
          Lì xì #{result.envelopeNumber}
        </div>

        <button
          onClick={onClose}
          className="px-8 py-3 rounded-full font-bold text-sm transition-all duration-200"
          style={{
            background: "linear-gradient(135deg, #ffd60a, #fb8500)",
            color: "#1a0a0a",
            border: "none",
            fontFamily: "'Be Vietnam Pro', sans-serif",
            letterSpacing: 1,
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(255,214,10,0.5)",
          }}
        >
          Tuyệt vời! 🎉
        </button>

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
