import React, { useState, useEffect } from 'react';

const defaultData = {
  // 공통
  docNo: 'KPXGC-R41-',
  docType: 'Be품',
  productName: '',
  drafter: '',
  reviewer: '',
  approver: '',
  establishDate: '2009년 01월 15일',
  revisionDate: '',
  revisionNo: '',
  // 원료 (최대 10행)
  materials: [
    { order: 'C', name: '', amount: '', note: '', changed: false },
    { order: 'B', name: '', amount: '', note: '', changed: false },
    { order: 'A', name: '', amount: '', note: '', changed: false },
    { order: '', name: '', amount: '', note: '', changed: false },
    { order: '', name: '', amount: '', note: '', changed: false },
    { order: '', name: '', amount: '', note: '', changed: false },
  ],
  totalAmount: '',
  // 제품규격
  specs: [
    { order: 'D', item: '외       관', spec: '투명균일액상', method: 'KPS-R42-3007', changed: false },
    { order: 'C', item: '색       상', spec: '', method: 'KPS-R42-3009', changed: false },
    { order: 'B', item: '수   분 (%)', spec: '', method: 'KPS-R42-3003', changed: false },
    { order: 'A', item: '평균분자량', spec: '', method: 'KPS-R42-3067', changed: false },
    { order: '', item: '', spec: '', method: '', changed: false },
    { order: '', item: '', spec: '', method: '', changed: false },
  ],
  // 작업개요 - 공정조건 (고정 문구 + 편집가능 부분)
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
  // 품질보증규격
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

const inputCls = "w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500";
const labelCls = "block text-xs font-semibold text-gray-600 mb-1";

export default function ManufacturingForm({ initialData, onDataChange }) {
  const [data, setData] = useState(initialData || defaultData);

  useEffect(() => {
    if (initialData) setData(initialData);
  }, [initialData]);

  const update = (field, value) => {
    const next = { ...data, [field]: value };
    setData(next);
    onDataChange && onDataChange(next);
  };

  const updateNested = (field, subfield, value) => {
    const next = { ...data, [field]: { ...data[field], [subfield]: value } };
    setData(next);
    onDataChange && onDataChange(next);
  };

  const updateRow = (arrayField, idx, key, value) => {
    const arr = data[arrayField].map((r, i) => i === idx ? { ...r, [key]: value } : r);
    const next = { ...data, [arrayField]: arr };
    setData(next);
    onDataChange && onDataChange(next);
  };

  const addRow = (arrayField, template) => {
    const next = { ...data, [arrayField]: [...data[arrayField], template] };
    setData(next);
    onDataChange && onDataChange(next);
  };

  const removeRow = (arrayField, idx) => {
    const arr = data[arrayField].filter((_, i) => i !== idx);
    const next = { ...data, [arrayField]: arr };
    setData(next);
    onDataChange && onDataChange(next);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* ───── 공통 헤더 정보 ───── */}
      <Section title="📋 공통 헤더 정보">
        <Grid cols={3}>
          <Field label="문서 유형">
            <select className={inputCls} value={data.docType||'Be품'} onChange={e => update('docType', e.target.value)}>
              <option value="Be품">제조법 문서 (Be품)</option>
              <option value="일반">제조법 문서</option>
            </select>
          </Field>
          <Field label="문서번호 (제조법)">
            <input className={inputCls} value={data.docNo} onChange={e => update('docNo', e.target.value)} />
          </Field>
          <Field label="제품명">
            <input className={inputCls} value={data.productName} onChange={e => update('productName', e.target.value)} placeholder="예) PEG-400Be" />
          </Field>
          <Field label="제정일자">
            <input className={inputCls} value={data.establishDate} onChange={e => update('establishDate', e.target.value)} placeholder="YYYY년 MM월 DD일" />
          </Field>
          <Field label="개정일자">
            <input className={inputCls} value={data.revisionDate} onChange={e => update('revisionDate', e.target.value)} placeholder="YYYY년 MM월 DD일" />
          </Field>
          <Field label="개정번호">
            <input className={inputCls} value={data.revisionNo} onChange={e => update('revisionNo', e.target.value)} placeholder="예) 1" />
          </Field>
          <Field label="작성 / 검토 / 승인">
            <div style={{ display: 'flex', gap: 4 }}>
              <input className={inputCls} value={data.drafter} onChange={e => update('drafter', e.target.value)} placeholder="작성" />
              <input className={inputCls} value={data.reviewer} onChange={e => update('reviewer', e.target.value)} placeholder="검토" />
              <input className={inputCls} value={data.approver} onChange={e => update('approver', e.target.value)} placeholder="승인" />
            </div>
          </Field>
        </Grid>
      </Section>

      {/* ───── 1.0 Material Balance ───── */}
      <Section title="1.0 Material Balance">
        <p style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
          ※ 변경 항목 체크 시 출력 양식에서 <strong><em><u>굵음+기울임+밑줄</u></em></strong>로 표시됩니다.
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#e8f0fe' }}>
              <th style={th}>순서</th>
              <th style={th}>원료명</th>
              <th style={th}>투입량 (kg)</th>
              <th style={th}>비고</th>
              <th style={th}>변경?</th>
              <th style={th}>삭제</th>
            </tr>
          </thead>
          <tbody>
            {data.materials.map((row, i) => (
              <tr key={i}>
                <td style={td}><input className={inputCls} value={row.order} onChange={e => updateRow('materials', i, 'order', e.target.value)} style={{ width: 50 }} /></td>
                <td style={td}><input className={inputCls} value={row.name} onChange={e => updateRow('materials', i, 'name', e.target.value)} placeholder="원료명" /></td>
                <td style={td}><input className={inputCls} value={row.amount} onChange={e => updateRow('materials', i, 'amount', e.target.value)} placeholder="kg" /></td>
                <td style={td}><input className={inputCls} value={row.note} onChange={e => updateRow('materials', i, 'note', e.target.value)} /></td>
                <td style={{ ...td, textAlign: 'center' }}>
                  <input type="checkbox" checked={row.changed} onChange={e => updateRow('materials', i, 'changed', e.target.checked)} />
                </td>
                <td style={{ ...td, textAlign: 'center' }}>
                  <button onClick={() => removeRow('materials', i)} style={btnSm}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
          <button onClick={() => addRow('materials', { order: '', name: '', amount: '', note: '', changed: false })} style={btnAdd}>+ 원료 행 추가</button>
          <label style={{ fontSize: 13 }}>TOTAL (kg):
            <input className={inputCls} value={data.totalAmount} onChange={e => update('totalAmount', e.target.value)}
              style={{ width: 100, marginLeft: 8 }} placeholder="합계" />
          </label>
        </div>
      </Section>

      {/* ───── 2.0 제품규격 ───── */}
      <Section title="2.0 제품규격">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#e8f0fe' }}>
              <th style={th}>순서</th>
              <th style={th}>항목</th>
              <th style={th}>규격</th>
              <th style={th}>시험법</th>
              <th style={th}>변경?</th>
              <th style={th}>삭제</th>
            </tr>
          </thead>
          <tbody>
            {data.specs.map((row, i) => (
              <tr key={i}>
                <td style={td}><input className={inputCls} value={row.order} onChange={e => updateRow('specs', i, 'order', e.target.value)} style={{ width: 50 }} /></td>
                <td style={td}><input className={inputCls} value={row.item} onChange={e => updateRow('specs', i, 'item', e.target.value)} /></td>
                <td style={td}><input className={inputCls} value={row.spec} onChange={e => updateRow('specs', i, 'spec', e.target.value)} /></td>
                <td style={td}><input className={inputCls} value={row.method} onChange={e => updateRow('specs', i, 'method', e.target.value)} /></td>
                <td style={{ ...td, textAlign: 'center' }}>
                  <input type="checkbox" checked={row.changed} onChange={e => updateRow('specs', i, 'changed', e.target.checked)} />
                </td>
                <td style={{ ...td, textAlign: 'center' }}>
                  <button onClick={() => removeRow('specs', i)} style={btnSm}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={() => addRow('specs', { order: '', item: '', spec: '', method: '', changed: false })} style={{ ...btnAdd, marginTop: 8 }}>+ 규격 행 추가</button>
      </Section>

      {/* ───── 3.0 작업개요 (공정조건) ───── */}
      <Section title="3.0 작업개요 — 제조 조건">
        <Grid cols={2}>
          <Field label="개시제 (Starter)">
            <input className={inputCls} value={data.flowConditions.starter} onChange={e => updateNested('flowConditions', 'starter', e.target.value)} placeholder="예) EG" />
          </Field>
          <Field label="촉매">
            <input className={inputCls} value={data.flowConditions.catalyst} onChange={e => updateNested('flowConditions', 'catalyst', e.target.value)} placeholder="예) KOH(96%)" />
          </Field>
          <Field label="반응물 (Reactant)">
            <input className={inputCls} value={data.flowConditions.reactant} onChange={e => updateNested('flowConditions', 'reactant', e.target.value)} placeholder="예) EO" />
          </Field>
          <Field label="반응온도 (℃)">
            <input className={inputCls} value={data.flowConditions.reactionTemp} onChange={e => updateNested('flowConditions', 'reactionTemp', e.target.value)} />
          </Field>
          <Field label="반응압력 (kg/cm²G 이하)">
            <input className={inputCls} value={data.flowConditions.reactionPressure} onChange={e => updateNested('flowConditions', 'reactionPressure', e.target.value)} />
          </Field>
          <Field label="숙성온도 (℃)">
            <input className={inputCls} value={data.flowConditions.agingTemp} onChange={e => updateNested('flowConditions', 'agingTemp', e.target.value)} />
          </Field>
          <Field label="숙성압력 (kg/cm²G 이하)">
            <input className={inputCls} value={data.flowConditions.agingPressure} onChange={e => updateNested('flowConditions', 'agingPressure', e.target.value)} />
          </Field>
          <Field label="탈취온도 (℃)">
            <input className={inputCls} value={data.flowConditions.deodorTemp} onChange={e => updateNested('flowConditions', 'deodorTemp', e.target.value)} />
          </Field>
          <Field label="포장온도 상한 (℃)">
            <input className={inputCls} value={data.flowConditions.packingTemp} onChange={e => updateNested('flowConditions', 'packingTemp', e.target.value)} />
          </Field>
        </Grid>
        <div style={{ marginTop: 12 }}>
          <label className={labelCls}>분석 규격 항목 (분석 단계 표시용, 예: 외관, 색상, 수분, 평균분자량 등)</label>
          <textarea className={inputCls} rows={3} value={data.flowConditions.specItems}
            onChange={e => updateNested('flowConditions', 'specItems', e.target.value)}
            placeholder="외관 : 투명균일액상&#10;색상 : 20 이하&#10;수분(%) : 0.1 이하&#10;평균분자량 : 270 ~ 300" />
        </div>
      </Section>

      {/* ───── 4.0~7.0 기타 정보 ───── */}
      <Section title="4.0 ~ 7.0 제조기계 / 유해물질 / 포장 / 저장">
        <Grid cols={2}>
          <Field label="제조기계 (Reactor No.)">
            <input className={inputCls} value={data.flowConditions.reactorNo} onChange={e => updateNested('flowConditions', 'reactorNo', e.target.value)} />
          </Field>
          <Field label="유해물질명">
            <input className={inputCls} value={data.flowConditions.hazardous} onChange={e => updateNested('flowConditions', 'hazardous', e.target.value)} />
          </Field>
          <Field label="포장용기">
            <input className={inputCls} value={data.flowConditions.packageType} onChange={e => updateNested('flowConditions', 'packageType', e.target.value)} />
          </Field>
        </Grid>
        <div style={{ marginTop: 10 }}>
          <Field label="7.1 저장 및 보존">
            <textarea className={inputCls} rows={2} value={data.flowConditions.storage} onChange={e => updateNested('flowConditions', 'storage', e.target.value)} />
          </Field>
        </div>
        <div style={{ marginTop: 10 }}>
          <Field label="7.2 취급">
            <textarea className={inputCls} rows={2} value={data.flowConditions.handling} onChange={e => updateNested('flowConditions', 'handling', e.target.value)} />
          </Field>
        </div>
        <div style={{ marginTop: 10 }}>
          <Field label="7.3 폐기">
            <input className={inputCls} value={data.flowConditions.disposal} onChange={e => updateNested('flowConditions', 'disposal', e.target.value)} />
          </Field>
        </div>
      </Section>

      {/* ───── 개정 및 배포처 (제조법) ───── */}
      <Section title="개정 내용 / 배포처">
        <Grid cols={2}>
          <Field label="개정 내용">
            <input className={inputCls} value={data.revisionNote} onChange={e => update('revisionNote', e.target.value)} placeholder="예) 원단위 및 제품규격 평균분자량 개정" />
          </Field>
          <Field label="배포처 (제조법)">
            <input className={inputCls} value={data.distributionMfg} onChange={e => update('distributionMfg', e.target.value)} />
          </Field>
          <Field label="배포처 (제품보증규격)">
            <input className={inputCls} value={data.distributionQuality} onChange={e => update('distributionQuality', e.target.value)} />
          </Field>
        </Grid>
      </Section>

      {/* ───── 품질보증규격 ───── */}
      <Section title="품질보증규격 (별도 문서)">
        <Grid cols={3}>
          <Field label="문서번호 (품질보증)">
            <input className={inputCls} value={data.qaDocNo} onChange={e => update('qaDocNo', e.target.value)} />
          </Field>
          <Field label="개정일자">
            <input className={inputCls} value={data.qaRevisionDate} onChange={e => update('qaRevisionDate', e.target.value)} placeholder="YYYY년 MM월 DD일" />
          </Field>
          <Field label="개정번호">
            <input className={inputCls} value={data.qaRevisionNo} onChange={e => update('qaRevisionNo', e.target.value)} />
          </Field>
        </Grid>
        <div style={{ marginTop: 12 }}>
          <p style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>품질보증 규격 항목</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#e8f0fe' }}>
                <th style={th}>항목</th>
                <th style={th}>규격</th>
                <th style={th}>변경?</th>
              </tr>
            </thead>
            <tbody>
              {data.qaSpecs.map((row, i) => (
                <tr key={i}>
                  <td style={td}><input className={inputCls} value={row.item} onChange={e => updateRow('qaSpecs', i, 'item', e.target.value)} /></td>
                  <td style={td}><input className={inputCls} value={row.spec} onChange={e => updateRow('qaSpecs', i, 'spec', e.target.value)} /></td>
                  <td style={{ ...td, textAlign: 'center' }}>
                    <input type="checkbox" checked={row.changed} onChange={e => updateRow('qaSpecs', i, 'changed', e.target.checked)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => addRow('qaSpecs', { item: '', spec: '', changed: false })} style={{ ...btnAdd, marginTop: 8 }}>+ 항목 추가</button>
        </div>
        <Grid cols={3} style={{ marginTop: 12 }}>
          <Field label="제품보존기간">
            <input className={inputCls} value={data.qaPreservation} onChange={e => update('qaPreservation', e.target.value)} placeholder="예) 2 년" />
          </Field>
          <Field label="배포처 (품질보증)">
            <input className={inputCls} value={data.qaDistribution} onChange={e => update('qaDistribution', e.target.value)} />
          </Field>
          <Field label="개정 내용 (품질보증)">
            <input className={inputCls} value={data.qaRevisionNote} onChange={e => update('qaRevisionNote', e.target.value)} />
          </Field>
        </Grid>
      </Section>
    </div>
  );
}

// ── helper sub-components ──
function Section({ title, children }) {
  return (
    <div style={{ background: 'white', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
      <div style={{ background: '#1a3a5c', color: 'white', padding: '10px 16px', fontWeight: 700, fontSize: 14 }}>{title}</div>
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  );
}
function Grid({ cols = 2, children, style }) {
  return <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12, ...style }}>{children}</div>;
}
function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}

const th = { border: '1px solid #ccc', padding: '6px 8px', fontWeight: 700, fontSize: 12, textAlign: 'center', background: '#e8f0fe' };
const td = { border: '1px solid #ccc', padding: 4 };
const btnSm = { background: '#ef4444', color: 'white', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontSize: 12 };
const btnAdd = { background: '#3b82f6', color: 'white', border: 'none', borderRadius: 4, padding: '6px 14px', cursor: 'pointer', fontSize: 13 };
