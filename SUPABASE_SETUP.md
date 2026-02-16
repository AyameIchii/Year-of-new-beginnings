# 🎊 HƯỚNG DẪN TÍCH HỢP SUPABASE

## 📋 Bước 1: Tạo project Supabase

1. Truy cập **https://supabase.com** → Sign up/Login
2. Click **"New Project"**
3. Điền thông tin:
   - **Name**: lixi-app (hoặc tên bất kỳ)
   - **Database Password**: Tạo mật khẩu mạnh
   - **Region**: Singapore (gần VN nhất)
4. Click **"Create new project"** → đợi ~2 phút

---

## 📋 Bước 2: Tạo database tables

1. Vào project vừa tạo
2. Click menu **"SQL Editor"** bên trái
3. Click **"New query"**
4. Copy toàn bộ đoạn SQL dưới đây và paste vào:

```sql
-- Bảng lưu setup (danh sách lì xì)
CREATE TABLE lixi_setup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  envelopes JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng lưu trạng thái phong bì
CREATE TABLE lixi_envelopes (
  id INTEGER PRIMARY KEY,
  value TEXT NOT NULL,
  picked_by TEXT,
  picked_at BIGINT
);

-- Bảng lưu lịch sử bốc thăm
CREATE TABLE lixi_history (
  id TEXT PRIMARY KEY,
  picked_by TEXT NOT NULL,
  envelope_id INTEGER NOT NULL,
  envelope_number INTEGER NOT NULL,
  value TEXT NOT NULL,
  picked_at BIGINT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE
);

-- Bảng lưu số tài khoản
CREATE TABLE lixi_banks (
  user_name TEXT PRIMARY KEY,
  bank_account TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE lixi_setup ENABLE ROW LEVEL SECURITY;
ALTER TABLE lixi_envelopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lixi_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE lixi_banks ENABLE ROW LEVEL SECURITY;

-- Cho phép mọi người đọc/ghi (public access)
CREATE POLICY "Allow public read" ON lixi_setup FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON lixi_setup FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON lixi_setup FOR UPDATE USING (true);

CREATE POLICY "Allow public read" ON lixi_envelopes FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON lixi_envelopes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON lixi_envelopes FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON lixi_envelopes FOR DELETE USING (true);

CREATE POLICY "Allow public read" ON lixi_history FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON lixi_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete" ON lixi_history FOR DELETE USING (true);

CREATE POLICY "Allow public read" ON lixi_banks FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON lixi_banks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON lixi_banks FOR UPDATE USING (true);
```

5. Click **"Run"** (hoặc Ctrl + Enter)
6. Thấy **"Success. No rows returned"** là ok ✅

---

## 📋 Bước 3: Lấy API credentials

1. Click menu **"Project Settings"** (icon bánh răng) ở dưới cùng bên trái
2. Click **"API"** trong menu
3. Copy 2 thông tin sau:

   **a) Project URL** (ở section "Project URL")
   ```
   VD: https://abcxyz.supabase.co
   ```

   **b) anon public key** (ở section "Project API keys")
   ```
   VD: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   (rất dài, bắt đầu bằng eyJ)
   ```

---

## 📋 Bước 4: Cài đặt trong project

### 4.1 Cài Supabase client

```bash
npm install @supabase/supabase-js
```

### 4.2 Cập nhật file `src/supabase.js`

Mở file `src/supabase.js` và thay đổi 2 dòng đầu:

```js
// ⚠️ THAY ĐỔI 2 DÒNG NÀY
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';  // ← Dán Project URL vào đây
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE';              // ← Dán anon key vào đây
```

**Ví dụ sau khi thay:**
```js
const SUPABASE_URL = 'https://abcxyz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY3h5eiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjc4ODg4ODg4LCJleHAiOjE5OTQ0NjQ4ODh9.abcdefghijklmnopqrstuvwxyz1234567890';
```

---

## 📋 Bước 5: Chạy app

```bash
npm run dev
```

Mở **http://localhost:5173** và test!

---

## ✅ Checklist hoàn thành

- [ ] Tạo project Supabase thành công
- [ ] Chạy SQL script tạo 4 bảng
- [ ] Copy được Project URL và anon key
- [ ] Thay 2 giá trị vào `src/supabase.js`
- [ ] `npm install @supabase/supabase-js` thành công
- [ ] App chạy không lỗi
- [ ] Bốc thăm → data lưu vào Supabase
- [ ] Mở nhiều tab → data đồng bộ

---

## 🔍 Kiểm tra data trong Supabase

1. Vào Supabase Dashboard
2. Click menu **"Table Editor"**
3. Chọn từng bảng để xem data:
   - `lixi_envelopes` — trạng thái 99 phong bì
   - `lixi_history` — lịch sử bốc thăm
   - `lixi_banks` — số tài khoản
   - `lixi_setup` — danh sách lì xì

---

## 🚀 Deploy lên production

Sau khi test xong local, bạn có thể deploy lên:

### Option 1: Vercel
```bash
npm install -g vercel
vercel
```

### Option 2: Netlify
```bash
npm run build
# Upload folder dist/ lên Netlify
```

### Option 3: GitHub Pages
Thêm vào `package.json`:
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

Rồi:
```bash
npm install -D gh-pages
npm run deploy
```

---

## ❓ Troubleshooting

**Lỗi: "Invalid API key"**
→ Kiểm tra lại `SUPABASE_URL` và `SUPABASE_ANON_KEY` trong `src/supabase.js`

**Lỗi: "Failed to fetch"**
→ Kiểm tra policies trong Supabase (phải enable RLS và tạo policies cho public)

**Data không đồng bộ giữa các tab**
→ Kiểm tra console có lỗi network không, đảm bảo polling đang chạy

**App chạy chậm**
→ Supabase free tier có giới hạn, cân nhắc nâng cấp hoặc optimize queries

---

## 📞 Support

Nếu gặp vấn đề, check:
1. Supabase Dashboard → Logs
2. Browser Console (F12) → xem lỗi
3. Network tab → xem request nào fail

Good luck! 🎊
