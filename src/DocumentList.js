import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function DocumentList({ onSelect, selectedId, onNew }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchDocs = async () => {
    if (!supabase) { setDocs([]); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('manufacturing_docs')
      .select('id, product_name, doc_no, revision_date, updated_at')
      .order('updated_at', { ascending: false });
    if (!error && data) setDocs(data);
    setLoading(false);
  };

  useEffect(() => { fetchDocs(); }, []);

  const filtered = docs.filter(d =>
    (d.product_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.doc_no || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('이 문서를 삭제하시겠습니까?')) return;
    await supabase.from('manufacturing_docs').delete().eq('id', id);
    fetchDocs();
    if (selectedId === id) onNew();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '12px 10px', borderBottom: '1px solid #e2e8f0' }}>
        <button onClick={onNew} style={{
          width: '100%', padding: '10px', background: '#1a3a5c', color: 'white',
          border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 14, cursor: 'pointer', marginBottom: 10
        }}>+ 새 문서 작성</button>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="제품명 검색..."
          style={{ width: '100%', padding: '7px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }}
        />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 6px' }}>
        {!supabase && (
          <div style={{ padding: 12, fontSize: 12, color: '#888', textAlign: 'center', lineHeight: 1.6 }}>
            ⚠️ Supabase 미연결<br />
            .env 파일에 키를 입력하면<br />공유 저장소가 활성화됩니다.
          </div>
        )}
        {loading && <div style={{ padding: 12, textAlign: 'center', color: '#888' }}>불러오는 중...</div>}
        {filtered.length === 0 && !loading && supabase && (
          <div style={{ padding: 12, textAlign: 'center', color: '#aaa', fontSize: 13 }}>저장된 문서 없음</div>
        )}
        {filtered.map(doc => (
          <div key={doc.id} onClick={() => onSelect(doc.id)}
            style={{
              padding: '10px 12px', marginBottom: 4, borderRadius: 6,
              background: selectedId === doc.id ? '#dbeafe' : '#f8fafc',
              border: `1px solid ${selectedId === doc.id ? '#3b82f6' : '#e2e8f0'}`,
              cursor: 'pointer', position: 'relative',
            }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#1a3a5c' }}>{doc.product_name || '(제품명 없음)'}</div>
            <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{doc.doc_no}</div>
            <div style={{ fontSize: 10, color: '#aaa', marginTop: 1 }}>
              {doc.revision_date || ''} &nbsp;
              {doc.updated_at ? new Date(doc.updated_at).toLocaleDateString('ko-KR') : ''}
            </div>
            <button onClick={(e) => handleDelete(doc.id, e)}
              style={{ position: 'absolute', top: 6, right: 6, background: 'transparent', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 14 }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}
