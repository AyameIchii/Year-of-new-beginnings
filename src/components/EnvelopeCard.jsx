import { useState } from "react";

/**
 * Một phong bì lì xì trong lưới.
 * Props:
 *   env          {object}   — { id, value, pickedBy, pickedAt }
 *   index        {number}   — vị trí trong mảng (tạo xoay nhẹ)
 *   onPick       {function} — callback(envId)
 *   alreadyPicked{boolean}  — người dùng đã bốc rồi (chỉ chặn người thường)
 *   isAdmin      {boolean}  — có phải admin không
 *   showPreview  {boolean}  — admin: hiện giá trị khi hover
 */
export default function EnvelopeCard({ env, index, onPick, alreadyPicked, isAdmin = false, showPreview = false }) {
  const [hover, setHover] = useState(false);

  const isPicked   = !!env.pickedBy;
  const isDisabled = isPicked || alreadyPicked;
  const isBest     = isAdmin && env.id === 0; // phong bì mệnh giá cao nhất

  return (
    <div className="relative" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Tooltip preview cho admin */}
      {showPreview && hover && !isPicked && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(13,0,13,0.95)",
            border: `1px solid ${isBest ? "rgba(255,214,10,0.6)" : "rgba(167,139,250,0.4)"}`,
            borderRadius: 8,
            padding: "5px 10px",
            whiteSpace: "nowrap",
            zIndex: 100,
            pointerEvents: "none",
            boxShadow: isBest ? "0 0 12px rgba(255,214,10,0.4)" : "0 4px 12px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ color: isBest ? "#ffd60a" : "#c4b5fd", fontSize: 11, fontWeight: 600 }}>
            {isBest && "🏆 "}{env.value}
          </div>
          {/* mũi tên nhỏ */}
          <div style={{
            position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
            width: 0, height: 0,
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderTop: `5px solid ${isBest ? "rgba(255,214,10,0.6)" : "rgba(167,139,250,0.4)"}`,
          }} />
        </div>
      )}

      <button
        className="relative focus:outline-none"
        style={{
          transform: hover && !isDisabled
            ? `translateY(-8px) rotate(${(index % 5 - 2) * 2}deg)`
            : `rotate(${(index % 5 - 2) * 1}deg)`,
          transition: "transform 0.25s cubic-bezier(.34,1.56,.64,1)",
          cursor: isDisabled ? "not-allowed" : "pointer",
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => !isDisabled && onPick(env.id)}
        disabled={isDisabled}
        title={
          isPicked
            ? `Đã được bốc bởi: ${env.pickedBy}`
            : alreadyPicked
            ? isAdmin ? "" : "Bạn đã bốc rồi!"
            : "Bốc lì xì!"
        }
      >
        {/* Thân phong bì */}
        <div
          className="relative w-16 h-20 rounded-lg flex flex-col items-center justify-end pb-2"
          style={{
            background: isPicked
              ? "linear-gradient(135deg, #888 0%, #555 100%)"
              : isBest && isAdmin
              ? "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)"
              : "linear-gradient(135deg, #e63946 0%, #c1121f 40%, #9d0208 100%)",
            border: isPicked
              ? "2px solid #777"
              : isBest && isAdmin
              ? "2px solid #a78bfa"
              : "2px solid #ffd60a",
            boxShadow: hover && !isDisabled
              ? isBest && isAdmin
                ? "0 12px 40px rgba(124,58,237,0.8), 0 0 20px rgba(167,139,250,0.6)"
                : "0 12px 40px rgba(230,57,70,0.7), 0 0 20px rgba(255,214,10,0.5)"
              : isPicked
              ? "0 2px 8px rgba(0,0,0,0.4)"
              : isBest && isAdmin
              ? "0 4px 15px rgba(124,58,237,0.5)"
              : "0 4px 15px rgba(230,57,70,0.5)",
          }}
        >
          {/* Nắp phong bì */}
          <div
            className="absolute top-0 left-0 right-0 h-8 rounded-t-lg"
            style={{
              background: isPicked
                ? "linear-gradient(135deg, #777 0%, #444 100%)"
                : isBest && isAdmin
                ? "linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%)"
                : "linear-gradient(135deg, #c1121f 0%, #9d0208 100%)",
              clipPath: "polygon(0 0, 100% 0, 50% 65%)",
            }}
          />

          {/* Icon giữa */}
          <div
            className="absolute top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full flex items-center justify-center"
            style={{
              background: isPicked
                ? "#666"
                : isBest && isAdmin
                ? "linear-gradient(135deg, #a78bfa, #7c3aed)"
                : "linear-gradient(135deg, #ffd60a, #fb8500)",
              color: isPicked ? "#aaa" : isBest && isAdmin ? "#fff" : "#9d0208",
              fontSize: "15px",
              boxShadow: isPicked
                ? "none"
                : isBest && isAdmin
                ? "0 0 10px rgba(167,139,250,0.8)"
                : "0 0 8px rgba(255,214,10,0.8)",
              zIndex: 2,
            }}
          >
            {isPicked ? "✓" : isBest && isAdmin ? "♛" : "🎁"}
          </div>

          {/* Tên người đã bốc */}
          {isPicked && (
            <div className="text-center px-1" style={{ zIndex: 2 }}>
              <div style={{ fontSize: "7px", color: "#ccc", lineHeight: 1.2, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                {env.pickedBy.length > 8 ? env.pickedBy.slice(0, 7) + "…" : env.pickedBy}
              </div>
            </div>
          )}
        </div>

        {/* Số thứ tự */}
        <div
          className="mt-1 text-center font-bold"
          style={{
            fontSize: "11px",
            color: isPicked ? "#888" : isBest && isAdmin ? "#a78bfa" : "#ffd60a",
            fontFamily: "serif",
            textShadow: "0 1px 3px rgba(0,0,0,0.5)",
          }}
        >
          #{index + 1}
        </div>
      </button>
    </div>
  );
}
// Mỗi phong bì là một nút với hiệu ứng hover và trạng thái picked. Admin sẽ thấy giá trị khi hover, người thường chỉ thấy khi đã bốc.
