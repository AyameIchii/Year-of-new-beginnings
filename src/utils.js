/** Xáo trộn mảng (Fisher-Yates) */
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Format timestamp → chuỗi ngày giờ tiếng Việt */
export function formatTime(ts) {
  return new Date(ts).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

/**
 * Kiểm tra xem phong bì có kích hoạt bốc thêm không
 * @param {object} envelope - { id, value, ... }
 * @param {array} bonusKeywords - danh sách từ khóa kích hoạt bonus
 * @returns {boolean}
 */
export function checkBonusPick(envelope, bonusKeywords = []) {
  if (!envelope || !envelope.value) return false;
  
  const valueLower = envelope.value.toLowerCase();
  return bonusKeywords.some(keyword => 
    valueLower.includes(keyword.toLowerCase())
  );
}

/**
 * Kiểm tra có phải phong bì Jackpot (cao nhất) không
 * @param {number} envelopeId
 * @returns {boolean}
 */
export function isJackpot(envelopeId) {
  return envelopeId === 0;
}
