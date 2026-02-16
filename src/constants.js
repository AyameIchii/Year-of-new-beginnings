export const MAX_ENVELOPES = 99;

export const FIREWORK_COLORS = [
  "#FFD700", "#FF4500", "#FF69B4",
  "#00CED1", "#ADFF2F", "#FF6347", "#FFA500",
];

export const STORAGE_KEY_ENVELOPES = "lixiapp:envelopes";
export const STORAGE_KEY_HISTORY   = "lixiapp:history";
export const STORAGE_KEY_SETUP     = "lixiapp:setup";
export const STORAGE_KEY_BANKS     = "lixiapp:banks";  // { userName: bankAccount }

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
