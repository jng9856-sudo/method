import React from 'react';

// 변경 여부에 따른 텍스트 렌더링
function Val({ value, changed }) {
  if (!value) return null;
  if (changed) return <span className="changed-field">{value}</span>;
  return <>{value}</>;
}

export default function PrintPreview({ data }) {
  if (!data) return null;
  const d = data;
  const fc = d.flowConditions || {};

  // 분석 규격 항목 파싱 (specItems → 배열)
  const specLines = (fc.specItems || '')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  // 제품규격을 분석 단계 표시용으로도 사용
  const specDisplay = specLines.length > 0 ? specLines : d.specs
    .filter(s => s.item && s.spec)
    .map(s => `${s.item.trim()} : ${s.spec}`);

  return (
    <div id="print-area">

      {/* ══════════════════════════════
          PAGE 1 : 제조법 헤더 + Material Balance + 제품규격
          ══════════════════════════════ */}
      <div className="print-page" style={pageStyle}>
        <div className="company-header">그린케미칼(주)</div>

        {/* 헤더 테이블 */}
        <table className="doc-table" style={{ marginBottom: 6 }}>
          <tbody>
            <tr>
              <td className="header-cell" style={{ width: '13%' }}>문 서 번 호</td>
              <td className="header-cell" style={{ width: '22%' }}>제조법 문서 (Be품)</td>
              <td className="header-cell" style={{ width: '8%' }}>작 성</td>
              <td style={{ width: '13%', textAlign: 'center' }}>{d.drafter}</td>
              <td className="header-cell" style={{ width: '8%' }}>검 토</td>
              <td style={{ width: '13%', textAlign: 'center' }}>{d.reviewer}</td>
              <td className="header-cell" style={{ width: '8%' }}>승 인</td>
              <td style={{ width: '13%', textAlign: 'center' }}>{d.approver}</td>
            </tr>
            <tr>
              <td style={{ textAlign: 'center', fontSize: '8pt' }}>{d.docNo}</td>
              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{d.productName}</td>
              <td colSpan={2} style={{ textAlign: 'center', fontSize: '8pt' }}>/ {d.drafter}</td>
              <td colSpan={2} style={{ textAlign: 'center', fontSize: '8pt' }}>/ {d.reviewer}</td>
              <td colSpan={2} style={{ textAlign: 'center', fontSize: '8pt' }}>/ {d.approver}</td>
            </tr>
            <tr>
              <td className="header-cell">제정일자</td>
              <td style={{ textAlign: 'center', fontSize: '8pt' }}>{d.establishDate}</td>
              <td className="header-cell">개정일자</td>
              <td colSpan={2} style={{ textAlign: 'center', fontSize: '8pt' }}>{d.revisionDate}</td>
              <td className="header-cell" style={{ textAlign: 'center' }}>개정번호</td>
              <td style={{ textAlign: 'center' }}>{d.revisionNo}</td>
              <td style={{ textAlign: 'center', fontSize: '8pt' }}>1/4</td>
            </tr>
          </tbody>
        </table>

        {/* 1.0 Material Balance */}
        <table className="doc-table" style={{ marginBottom: 6 }}>
          <tbody>
            <tr>
              <td colSpan={4} className="header-cell" style={{ textAlign: 'left', padding: '4px 6px' }}>1.0 Material Balance</td>
            </tr>
            <tr>
              <td className="header-cell" style={{ width: '8%' }}></td>
              <td className="header-cell" style={{ textAlign: 'center' }}>원       료       명</td>
              <td className="header-cell" style={{ width: '20%', textAlign: 'center' }}>투   입   량 (kg)</td>
              <td className="header-cell" style={{ width: '20%', textAlign: 'center' }}>비      고</td>
            </tr>
            {d.materials.map((row, i) => (
              <tr key={i}>
                <td style={{ textAlign: 'center' }}>{row.order}</td>
                <td style={{ textAlign: 'center' }}><Val value={row.name} changed={row.changed} /></td>
                <td style={{ textAlign: 'center' }}><Val value={row.amount} changed={row.changed} /></td>
                <td style={{ textAlign: 'center' }}>{row.note}</td>
              </tr>
            ))}
            <tr>
              <td></td>
              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>TOTAL</td>
              <td style={{ textAlign: 'center', fontWeight: 'bold' }}><Val value={d.totalAmount} changed={false} /></td>
              <td></td>
            </tr>
          </tbody>
        </table>

        {/* 2.0 제품규격 */}
        <table className="doc-table" style={{ marginBottom: 6 }}>
          <tbody>
            <tr>
              <td colSpan={4} className="header-cell" style={{ textAlign: 'left', padding: '4px 6px' }}>2.0 제품규격</td>
            </tr>
            <tr>
              <td className="header-cell" style={{ width: '8%' }}></td>
              <td className="header-cell" style={{ textAlign: 'center' }}>항          목</td>
              <td className="header-cell" style={{ textAlign: 'center' }}>규          격</td>
              <td className="header-cell" style={{ textAlign: 'center' }}>시   험   법</td>
            </tr>
            {d.specs.map((row, i) => (
              <tr key={i}>
                <td style={{ textAlign: 'center' }}>{row.order}</td>
                <td style={{ textAlign: 'center' }}>{row.item}</td>
                <td style={{ textAlign: 'center' }}><Val value={row.spec} changed={row.changed} /></td>
                <td style={{ textAlign: 'center' }}>{row.method}</td>
              </tr>
            ))}
            <tr><td></td><td></td><td></td><td></td></tr>
          </tbody>
        </table>

        {/* 개정 / 배포처 */}
        <table className="doc-table">
          <tbody>
            <tr>
              <td className="header-cell" style={{ width: '12%' }}>개  정</td>
              <td>{d.revisionNote}</td>
            </tr>
            <tr>
              <td className="header-cell">배포처</td>
              <td>{d.distributionMfg}</td>
            </tr>
          </tbody>
        </table>
        <div className="form-footer">FB01-06(1)</div>
      </div>

      {/* ══════════════════════════════
          PAGE 2 : 작업개요 (공정 1~5)
          ══════════════════════════════ */}
      <div className="print-page" style={pageStyle}>
        <div className="company-header">그린케미칼(주)</div>
        <table className="doc-table" style={{ marginBottom: 6 }}>
          <tbody>
            <tr>
              <td className="header-cell" style={{ width: '35%' }}>제조법 문서 (Be품)</td>
              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{d.productName}</td>
            </tr>
            <tr>
              <td className="header-cell">제정일자</td>
              <td style={{ fontSize: '8pt' }}>{d.establishDate} &nbsp;&nbsp; 개정일자 {d.revisionDate} &nbsp;&nbsp; 개정번호 {d.revisionNo} &nbsp;&nbsp; 페이지 2/4</td>
            </tr>
          </tbody>
        </table>

        <table className="doc-table">
          <tbody>
            <tr>
              <td colSpan={2} className="header-cell" style={{ textAlign: 'left', padding: '4px 6px' }}>3.0 작업개요</td>
            </tr>
            <tr>
              <td className="header-cell" style={{ width: '28%', textAlign: 'center' }}>FLOW SHEET</td>
              <td className="header-cell" style={{ textAlign: 'center' }}>제    조    조    건</td>
            </tr>
            <tr>
              <td className="flow-cell" style={{ verticalAlign: 'top', padding: '8px' }}>
                {`${fc.starter || '개시제'}\t${fc.catalyst || '촉매'}\n↓\n1 원료사입\n↓\n2 치   환\n↓\n3 승   온\n${fc.reactant || '반응물'}\n↓\n4 반   응\n↓\n5 숙    성`}
              </td>
              <td className="condition-cell">
                {`<준 비> : 사용할 중합조가 충분히 세척, 건조되어 있는가를 확인한다.\n\n1. 원료사입\n\t지시량의 ${fc.starter || '개시제'}, ${fc.catalyst || '촉매'}를 사입한 후 교반을 실시한다.\n\n2. 치   환\n\t0 kg/cm²G  ↔  -1 kg/cm²G 로 질소감압치환을 3회 실시한 후 최종압력은 -1.0 kg/cm²G 로 한다\n\n3. 승  온\n\t반응온도까지 승온한다.(${fc.reactionTemp || 140}℃)\n\n4. 반   응\n\t아래의 조건으로 ${fc.reactant || '반응물'} 반응을 실시한다.\n\t  * 반응온도 : ${fc.reactionTemp || 140} ± 5℃\n\t  * 반응압력 : ${fc.reactionPressure || 4} kg/cm²G 이하\n\t  * 반응시간 : 지시량의 ${fc.reactant || '반응물'} 사입 종료까지\n\n5. 숙   성\n\t지시량의 ${fc.reactant || '반응물'} 사입이 종료되면 아래의 조건에서 숙성을 실시한다.\n\t  * 숙성온도 : ${fc.agingTemp || 140} ± 5℃\n\t  * 숙성압력 : ${fc.agingPressure || 4} kg/cm²G 이하\n\t  * 숙성시간 : 동일온도에서 압력평형상태가 30분간 지속될 때 까지`}
              </td>
            </tr>
          </tbody>
        </table>
        <div className="form-footer">FB01-06(1)</div>
      </div>

      {/* ══════════════════════════════
          PAGE 3 : 작업개요 (공정 6~9)
          ══════════════════════════════ */}
      <div className="print-page" style={pageStyle}>
        <div className="company-header">그린케미칼(주)</div>
        <table className="doc-table" style={{ marginBottom: 6 }}>
          <tbody>
            <tr>
              <td className="header-cell" style={{ width: '35%' }}>제조법 문서 (Be품)</td>
              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{d.productName}</td>
            </tr>
            <tr>
              <td className="header-cell">제정일자</td>
              <td style={{ fontSize: '8pt' }}>{d.establishDate} &nbsp;&nbsp; 개정일자 {d.revisionDate} &nbsp;&nbsp; 개정번호 {d.revisionNo} &nbsp;&nbsp; 페이지 3/4</td>
            </tr>
          </tbody>
        </table>

        <table className="doc-table">
          <tbody>
            <tr>
              <td colSpan={2} className="header-cell" style={{ textAlign: 'left', padding: '4px 6px' }}>3.0 작업개요</td>
            </tr>
            <tr>
              <td className="header-cell" style={{ width: '28%', textAlign: 'center' }}>FLOW SHEET</td>
              <td className="header-cell" style={{ textAlign: 'center' }}>제    조    조    건</td>
            </tr>
            <tr>
              <td className="flow-cell" style={{ verticalAlign: 'top', padding: '8px' }}>
                {`6 분   석\n↓\n7 냉   각\n↓\n8 탈   취\n↓\n9 포  장`}
              </td>
              <td className="condition-cell">
                {`6. 분   석\n\t숙성이 종료되면 다음 항목을 분석한다.\n${specDisplay.map(l => '\t\t' + l).join('\n')}\n\n7. 냉   각\n\t분석치가 규격내인 것을 확인한 후 탈취온도까지 냉각한다.\n\n8. 탈   취\n\t탈취온도(${fc.deodorTemp || 80}±5℃)에서 30분간 질소로 탈취한다.\n\n9. 포  장\n\t본 제품은 Be품이므로 제품의 변질을 방지하기 위하여 질소를 충진하여 포장한다.(포장온도 : ${fc.packingTemp || 60}℃ 이하)`}
              </td>
            </tr>
          </tbody>
        </table>
        <div className="form-footer">FB01-06(1)</div>
      </div>

      {/* ══════════════════════════════
          PAGE 4 : 제조기계/유해물질/포장/저장
          ══════════════════════════════ */}
      <div className="print-page" style={pageStyle}>
        <div className="company-header">그린케미칼(주)</div>
        <table className="doc-table" style={{ marginBottom: 6 }}>
          <tbody>
            <tr>
              <td className="header-cell" style={{ width: '35%' }}>제조법 문서 (Be품)</td>
              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{d.productName}</td>
            </tr>
            <tr>
              <td className="header-cell">제정일자</td>
              <td style={{ fontSize: '8pt' }}>{d.establishDate} &nbsp;&nbsp; 개정일자 {d.revisionDate} &nbsp;&nbsp; 개정번호 {d.revisionNo} &nbsp;&nbsp; 페이지 4/4</td>
            </tr>
          </tbody>
        </table>

        <table className="doc-table">
          <tbody>
            <tr>
              <td colSpan={2} style={{ padding: '6px 8px', lineHeight: 2 }}>
                <div><strong>4.0 제조기계</strong> &nbsp;&nbsp; {fc.reactorNo} Reactor Type</div>
                <div style={{ marginTop: 6 }}><strong>5.0 유해물질명</strong> &nbsp;&nbsp; {fc.hazardous}</div>
                <div style={{ marginTop: 6 }}><strong>6.0 포장용기</strong> &nbsp;&nbsp; {fc.packageType}</div>
                <div style={{ marginTop: 10 }}><strong>7.0 저장, 보존, 취급, 폐기에 관한 사항</strong></div>
                <div style={{ marginTop: 4, marginLeft: 16 }}>
                  <div><strong>7.1 저장 및 보존</strong></div>
                  <div style={{ marginLeft: 8 }}>{fc.storage}</div>
                </div>
                <div style={{ marginTop: 4, marginLeft: 16 }}>
                  <div><strong>7.2 취  급</strong></div>
                  <div style={{ marginLeft: 8 }}>{fc.handling}</div>
                </div>
                <div style={{ marginTop: 4, marginLeft: 16 }}>
                  <div><strong>7.3 폐  기</strong></div>
                  <div style={{ marginLeft: 8 }}>{fc.disposal}</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="form-footer">FB01-06(1)</div>
      </div>

      {/* ══════════════════════════════
          PAGE 5 : 제품보증규격
          ══════════════════════════════ */}
      <div className="print-page" style={pageStyle}>
        <div className="company-header">그린케미칼(주)</div>
        <table className="doc-table" style={{ marginBottom: 6 }}>
          <tbody>
            <tr>
              <td className="header-cell" style={{ width: '13%' }}>문 서 번 호</td>
              <td className="header-cell" style={{ width: '22%' }}>제품규격 (Be품)</td>
              <td className="header-cell" style={{ width: '8%' }}>작 성</td>
              <td style={{ width: '13%', textAlign: 'center' }}>{d.drafter}</td>
              <td className="header-cell" style={{ width: '8%' }}>검 토</td>
              <td style={{ width: '13%', textAlign: 'center' }}>{d.reviewer}</td>
              <td className="header-cell" style={{ width: '8%' }}>승 인</td>
              <td style={{ width: '13%', textAlign: 'center' }}>{d.approver}</td>
            </tr>
            <tr>
              <td style={{ textAlign: 'center', fontSize: '8pt' }}>{d.docNo}</td>
              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{d.productName}</td>
              <td colSpan={2} style={{ textAlign: 'center', fontSize: '8pt' }}>/ {d.drafter}</td>
              <td colSpan={2} style={{ textAlign: 'center', fontSize: '8pt' }}>/ {d.reviewer}</td>
              <td colSpan={2} style={{ textAlign: 'center', fontSize: '8pt' }}>/ {d.approver}</td>
            </tr>
            <tr>
              <td className="header-cell">제정일자</td>
              <td style={{ textAlign: 'center', fontSize: '8pt' }}>{d.establishDate}</td>
              <td className="header-cell">개정일자</td>
              <td colSpan={2} style={{ textAlign: 'center', fontSize: '8pt' }}>{d.revisionDate}</td>
              <td className="header-cell" style={{ textAlign: 'center' }}>개정번호</td>
              <td style={{ textAlign: 'center' }}>{d.revisionNo}</td>
              <td style={{ textAlign: 'center', fontSize: '8pt' }}>1/1</td>
            </tr>
          </tbody>
        </table>

        {/* 공정도 + 분석표 */}
        <table className="doc-table" style={{ marginBottom: 6 }}>
          <tbody>
            <tr>
              <td className="header-cell" style={{ width: '20%', textAlign: 'center' }}>공  정  도</td>
              <td className="header-cell" style={{ width: '10%', textAlign: 'center' }}>분 석 점</td>
              <td className="header-cell" style={{ width: '18%', textAlign: 'center' }}>분 석 항 목</td>
              <td className="header-cell" style={{ width: '18%', textAlign: 'center' }}>분 석 법</td>
              <td className="header-cell" style={{ width: '20%', textAlign: 'center' }}>규    격</td>
              <td className="header-cell" style={{ width: '14%', textAlign: 'center' }}>비    고</td>
            </tr>
            <tr>
              <td className="flow-cell" style={{ padding: '8px', verticalAlign: 'middle' }}>
                {`1 원료사입\n2 치    환\n3 승    온\n4 반    응\n5 숙    성\n6 분    석\n7 냉    각\n8 탈    취\n9 포    장`}
              </td>
              <td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold', fontSize: '11pt' }}>6</td>
              <td style={{ verticalAlign: 'middle', padding: '4px 6px', lineHeight: 2 }}>
                {d.specs.filter(s => s.item).map((s, i) => <div key={i}>{s.item}</div>)}
              </td>
              <td style={{ verticalAlign: 'middle', padding: '4px 6px', lineHeight: 2 }}>
                {d.specs.filter(s => s.method).map((s, i) => <div key={i}>{s.method}</div>)}
              </td>
              <td style={{ verticalAlign: 'middle', padding: '4px 6px', lineHeight: 2 }}>
                {d.specs.filter(s => s.spec).map((s, i) => (
                  <div key={i}><Val value={s.spec} changed={s.changed} /></div>
                ))}
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>

        <table className="doc-table">
          <tbody>
            <tr>
              <td className="header-cell" style={{ width: '12%' }}>개  정</td>
              <td>{d.revisionNote}</td>
            </tr>
            <tr>
              <td className="header-cell">배포처</td>
              <td>{d.distributionQuality}</td>
            </tr>
          </tbody>
        </table>
        <div className="form-footer">FB01-07(1)</div>
      </div>

      {/* ══════════════════════════════
          PAGE 6 : 품질보증규격
          ══════════════════════════════ */}
      <div className="print-page" style={pageStyle}>
        <div className="company-header">그린케미칼(주)</div>
        <table className="doc-table" style={{ marginBottom: 6 }}>
          <tbody>
            <tr>
              <td className="header-cell" style={{ width: '13%' }}>문 서 번 호</td>
              <td className="header-cell" style={{ width: '22%' }}>품질보증규격</td>
              <td className="header-cell" style={{ width: '8%' }}>작 성</td>
              <td style={{ width: '13%', textAlign: 'center' }}>{d.drafter}</td>
              <td className="header-cell" style={{ width: '8%' }}>검 토</td>
              <td style={{ width: '13%', textAlign: 'center' }}>{d.reviewer}</td>
              <td className="header-cell" style={{ width: '8%' }}>승 인</td>
              <td style={{ width: '13%', textAlign: 'center' }}>{d.approver}</td>
            </tr>
            <tr>
              <td style={{ textAlign: 'center', fontSize: '8pt' }}>{d.qaDocNo}</td>
              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>KONION {d.productName}</td>
              <td colSpan={2} style={{ textAlign: 'center', fontSize: '8pt' }}>/ {d.drafter}</td>
              <td colSpan={2} style={{ textAlign: 'center', fontSize: '8pt' }}>/ {d.reviewer}</td>
              <td colSpan={2} style={{ textAlign: 'center', fontSize: '8pt' }}>/ {d.approver}</td>
            </tr>
            <tr>
              <td className="header-cell">제정일자</td>
              <td style={{ textAlign: 'center', fontSize: '8pt' }}>{d.establishDate}</td>
              <td className="header-cell">개정일자</td>
              <td colSpan={2} style={{ textAlign: 'center', fontSize: '8pt' }}>{d.qaRevisionDate || d.revisionDate}</td>
              <td className="header-cell" style={{ textAlign: 'center' }}>개정번호</td>
              <td style={{ textAlign: 'center' }}>{d.qaRevisionNo || d.revisionNo}</td>
              <td style={{ textAlign: 'center', fontSize: '8pt' }}>1/1</td>
            </tr>
          </tbody>
        </table>

        {/* 품질보증 규격표 */}
        <table className="doc-table" style={{ marginBottom: 6 }}>
          <tbody>
            <tr>
              <td className="header-cell" style={{ width: '25%' }} rowSpan={2}>구 분<br />분석항목</td>
              <td className="header-cell" colSpan={3} style={{ textAlign: 'center' }}>{d.productName}</td>
            </tr>
            <tr>
              <td colSpan={3}></td>
            </tr>
            {d.qaSpecs.map((row, i) => (
              <tr key={i}>
                <td style={{ textAlign: 'center', padding: '4px 8px' }}>{row.item}</td>
                <td colSpan={3} style={{ textAlign: 'center', padding: '4px 8px' }}>
                  <Val value={row.spec} changed={row.changed} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <table className="doc-table" style={{ marginBottom: 6 }}>
          <tbody>
            <tr>
              <td className="header-cell" style={{ width: '15%' }}>특기사항</td>
              <td>* 제품보존기간 : {d.qaPreservation}</td>
            </tr>
          </tbody>
        </table>

        <table className="doc-table">
          <tbody>
            <tr>
              <td className="header-cell" style={{ width: '15%' }}>배 포 처</td>
              <td>{d.qaDistribution}</td>
            </tr>
          </tbody>
        </table>
        {d.qaRevisionNote && (
          <div style={{ fontSize: '8pt', marginTop: 6, color: '#333' }}>개정: {d.qaRevisionNote}</div>
        )}
      </div>

    </div>
  );
}

const pageStyle = {
  width: '210mm',
  minHeight: '270mm',
  margin: '0 auto 20px',
  padding: '10mm 12mm',
  background: 'white',
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  position: 'relative',
};
