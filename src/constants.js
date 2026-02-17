export const MAX_ENVELOPES = 50;

export const FIREWORK_COLORS = [
  "#FFD700", "#FF4500", "#FF69B4",
  "#00CED1", "#ADFF2F", "#FF6347", "#FFA500",
];

export const STORAGE_KEY_ENVELOPES = "lixiapp:envelopes";
export const STORAGE_KEY_HISTORY   = "lixiapp:history";
export const STORAGE_KEY_SETUP     = "lixiapp:setup";
export const STORAGE_KEY_BANKS     = "lixiapp:banks";  // { userName: bankAccount }

// ─── Cơ chế bốc thêm ─────────────────────────────────────────────────────────
// Các điều kiện để được bốc thêm lì xì
export const BONUS_RULES = {
  // Bốc trúng phong bì có giá trị cao nhất (id = 0) → bốc thêm 1 lần
  jackpotBonus: true,
  
  // Từ khóa trong nội dung lì xì để kích hoạt bốc thêm
  // VD: "Bốc thêm", "Thêm 1 lần", "Lucky bonus"
  bonusKeywords: [
    "bốc thêm",
    "thêm 1 lần", 
    "thêm một lần",
    "lucky bonus",
    "bonus",
    "may mắn x2"
  ],
};

// Số lần bốc thêm tối đa cho 1 người (tránh vòng lặp vô hạn)
export const MAX_BONUS_PICKS = 3;

// ─── Cấu hình Admin ──────────────────────────────────────────────────────────
// Tên admin — đúng tên này khi đăng nhập sẽ có toàn quyền
export const ADMIN_NAME = "_np.k";

// Quyền hạn admin:
//   canReset        — reset toàn bộ lì xì
//   unlimitedPicks  — bốc nhiều lá không giới hạn
//   alwaysBest      — luôn nhận phong bì có giá trị cao nhất (index 0 sau sort)
//   previewValues   — xem trước giá trị tất cả phong bì trước khi bốc
export const ADMIN_PERMS = {
  canReset:       true,
  unlimitedPicks: true,
  alwaysBest:     true,
  previewValues:  true,
};

// ─── Danh sách người may mắn (ẩn, luôn nhận mệnh giá cao nhất) ─────────────
// Những người có tên trong danh sách này sẽ LUÔN nhận phong bì cao nhất
// khi bốc thăm, nhưng KHÔNG hiện badge đặc biệt (để ẩn, tránh người khác biết)
// 
// Cách dùng: Thêm CHÍNH XÁC tên người chơi vào đây
// VD: Nếu muốn "Nguyễn Văn A" luôn may mắn → thêm "Nguyễn Văn A"
export const LUCKY_NAMES = [ 
                            
  // "A",              // ← Bỏ comment và thêm tên
  // "Nguyễn Văn A",
  // "Khách VIP",
];

// ⚠️ LƯU Ý: 
// - Tên phải khớp CHÍNH XÁC (phân biệt chữ hoa/thường)
// - Người trong danh sách này sẽ KHÔNG biết họ được ưu tiên
// - Chỉ admin mới biết danh sách này tồn tại
