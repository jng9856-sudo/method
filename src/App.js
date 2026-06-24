import React, { useState, useRef, useCallback } from 'react';
import ManufacturingForm from './ManufacturingForm';
import PrintPreview from './PrintPreview';
import DocumentList from './DocumentList';
import { supabase } from './supabaseClient';

const defaultData = {
  docNo: 'KPXGC-R41-',
  productName: '',
  drafter: '',
  reviewer: '',
  approver: '',
  establishDate: '2009년 01월 15일',
  revisionDate: '',
  revisionNo: '',
  materials: [
    { order: 'C', name: '', amount: '', note: '', changed: false },
    { order: 'B', name: '', amount: '', note: '', changed: false },
    { order: 'A', name: '', amount: '', note: '', changed: false },
    { order: '', name: '', amount: '', note: '', changed: false },
    { order: '', name: '', amount: '', note: '', changed: false },
  ],
  totalAmount: '',
  specs: [
    { order: 'D', item: '외       관', spec: '투명균일액상', method: 'KPS-R42-3007', changed: false },
    { order: 'C', item: '색       상', spec: '', method: 'KPS-R42-3009', changed: false },
    { order: 'B', item: '수   분 (%)', spec: '', method: 'KPS-R42-3003', changed: false },
    { order: 'A', item: '평균분자량', spec: '', method: 'KPS-R42-3067', changed: false },
    { order: '', item: '', spec: '', method: '', changed: false },
  ],
  flowConditions: {
    starter: '',
    catalyst: '',
    reactant: '',
    reactionTemp: '140',
    reactionPressure: '4',
    agingTemp: '140',
    agingPressure: '4',
    specItems: '',
    deodorTemp: '80',
    packingTemp: '60',
    reactorNo: 'V-302',
    packageType: 'Steel Drum (Net.Wt. : 230 kg)',
    storage: '옥내외에 저장하고 보존기간은 생산일로부터 1년으로 하며, 선입선출을 원칙으로 한다.',
    handling: '피부나 눈에 접촉시 약간의 자극을 줄 수 있으므로 보호구 및 안전장갑을 착용, 취급한다.',
    disposal: '폐기물관리법 제 25 조에 준한다.',
    hazardous: '해당없음',
  },
  revisionNote: '',
  distributionMfg: '케미칼생산팀 사본 1부',
  distributionQuality: '케미칼품질팀 사본 2부',
  qaDocNo: 'KPXGC-R32-',
  qaRevisionDate: '',
  qaRevisionNo: '',
  qaSpecs: [
    { item: '외    관', spec: '', changed: false },
    { item: '색    상', spec: '', changed: false },
    { item: '수분 (%)', spec: '', changed: false },
    { item: '평균분자량', spec: '', changed: false },
  ],
  qaPreservation: '2 년',
  qaDistribution: '케미칼 품질팀 사본 1부',
  qaRevisionNote: '',
};

export default function App() {
  const [formData, setFormData] = useState(defaultData);
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState('form'); // 'form' | 'preview'
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const printRef = useRef();

  const handleDataChange = useCallback((data) => {
    setFormData(data);
  }, []);

  const handleNew = () => {
    setFormData({ ...defaultData });
    setSelectedId(null);
    setActiveTab('form');
  };

  const handleSelect = async (id) => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('manufacturing_docs')
      .select('*')
      .eq('id', id)
      .single();
    if (!error && data) {
      setFormData(data.content);
      setSelectedId(id);
      setActiveTab('form');
    }
  };

  const handleSave = async () => {
    if (!supabase) {
      alert('Supabase가 연결되지 않았습니다.\n.env 파일에 REACT_APP_SUPABASE_URL과 REACT_APP_SUPABASE_ANON_KEY를 입력해주세요.');
      return;
    }
    setSaving(true);
    const payload = {
      product_name: formData.productName,
      doc_no: formData.docNo,
      revision_date: formData.revisionDate,
      content: formData,
      updated_at: new Date().toISOString(),
    };
    let error;
    if (selectedId) {
      ({ error } = await supabase.from('manufacturing_docs').update(payload).eq('id', selectedId));
    } else {
      const res = await supabase.from('manufacturing_docs').insert(payload).select().single();
      error = res.error;
      if (!error && res.data) setSelectedId(res.data.id);
    }
    setSaving(false);
    setSaveMsg(error ? '❌ 저장 실패: ' + error.message : '✅ 저장되었습니다!');
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const handlePrint = () => {
    setActiveTab('preview');
    setTimeout(() => window.print(), 300);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* ── 사이드바 (문서 목록) ── */}
      <div className="no-print" style={{
        width: 220, minWidth: 220, background: 'white',
        borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column',
        boxShadow: '2px 0 6px rgba(0,0,0,0.06)'
      }}>
        <div style={{ padding: '14px 12px', background: '#1a3a5c', color: 'white' }}>
          <div style={{ fontWeight: 800, fontSize: 13, letterSpacing: 0.5 }}>🧪 그린케미칼</div>
          <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>제조법 관리 시스템</div>
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <DocumentList onSelect={handleSelect} selectedId={selectedId} onNew={handleNew} />
        </div>
      </div>

      {/* ── 메인 영역 ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* 상단 툴바 */}
        <div className="no-print" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 20px', background: 'white',
          borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
        }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#1a3a5c', marginRight: 8 }}>
            {formData.productName || '새 문서'} 
            {selectedId && <span style={{ fontSize: 11, fontWeight: 400, color: '#888', marginLeft: 6 }}>(저장됨)</span>}
          </div>

          {/* 탭 */}
          <TabBtn active={activeTab === 'form'} onClick={() => setActiveTab('form')}>✏️ 입력</TabBtn>
          <TabBtn active={activeTab === 'preview'} onClick={() => setActiveTab('preview')}>👁 미리보기</TabBtn>

          <div style={{ flex: 1 }} />

          {saveMsg && <span style={{ fontSize: 13, color: saveMsg.startsWith('✅') ? '#16a34a' : '#dc2626' }}>{saveMsg}</span>}

          <button onClick={handleSave} disabled={saving} style={{
            padding: '8px 18px', background: '#1a3a5c', color: 'white',
            border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: 'pointer'
          }}>{saving ? '저장 중...' : '💾 저장'}</button>

          <button onClick={handlePrint} style={{
            padding: '8px 18px', background: '#059669', color: 'white',
            border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: 'pointer'
          }}>🖨 인쇄</button>
        </div>

        {/* 콘텐츠 영역 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: activeTab === 'form' ? '20px 24px' : '20px 0' }}>
          {activeTab === 'form' ? (
            <ManufacturingForm initialData={formData} onDataChange={handleDataChange} />
          ) : (
            <div ref={printRef}>
              <PrintPreview data={formData} />
            </div>
          )}
        </div>

        {/* 미리보기 탭에서도 print-area 유지 (hidden) */}
        {activeTab === 'form' && (
          <div style={{ position: 'absolute', left: -9999, top: 0 }} id="hidden-print" ref={printRef}>
            <PrintPreview data={formData} />
          </div>
        )}
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: '6px 16px', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600,
      background: active ? '#dbeafe' : '#f1f5f9',
      color: active ? '#1d4ed8' : '#64748b',
      outline: active ? '2px solid #3b82f6' : 'none',
    }}>{children}</button>
  );
}
