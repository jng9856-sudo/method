-- ============================================================
-- 그린케미칼 제조법 관리 시스템 - Supabase 테이블 생성 SQL
-- Supabase 대시보드 → SQL Editor 에서 실행
-- ============================================================

CREATE TABLE IF NOT EXISTS manufacturing_docs (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_name  TEXT,
  doc_no        TEXT,
  revision_date TEXT,
  content       JSONB NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 전체 공개 읽기/쓰기 (사내 전용 사용 가정, 인증 불필요)
ALTER TABLE manufacturing_docs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON manufacturing_docs
  FOR ALL USING (true) WITH CHECK (true);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON manufacturing_docs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_mfg_docs_product ON manufacturing_docs (product_name);
CREATE INDEX IF NOT EXISTS idx_mfg_docs_updated ON manufacturing_docs (updated_at DESC);
