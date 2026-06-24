import React from 'react';

function Val({ value, changed }) {
  if (value === undefined || value === null || value === '') return null;
  if (changed) return <span style={{fontWeight:'bold', fontStyle:'italic', textDecoration:'underline'}}>{value}</span>;
  return <>{value}</>;
}

const S = {
  td:     { border:'1px solid #000', padding:'2px 4px', fontSize:'8.5pt', fontFamily:"'맑은 고딕','Malgun Gothic',sans-serif", verticalAlign:'middle' },
  thGray: { border:'1px solid #000', padding:'2px 4px', fontSize:'8.5pt', fontFamily:"'맑은 고딕','Malgun Gothic',sans-serif", verticalAlign:'middle', background:'#d9d9d9', fontWeight:'bold', textAlign:'center' },
  center: { textAlign:'center' },
};

export default function PrintPreview({ data }) {
  if (!data) return null;
  const d = data;
  const fc = d.flowConditions || {};
  const docType = d.docType || 'Be품'; // 'Be품' or '일반'

  const matRows = [...(d.materials || [])];
  while (matRows.length < 10) matRows.push({ order:'', name:'', amount:'', note:'', changed:false });

  const specRows = [...(d.specs || [])];
  while (specRows.length < 8) specRows.push({ order:'', item:'', spec:'', method:'', changed:false });

  const specForAnalysis = d.specs?.filter(s => s.item && s.spec) || [];

  const pageStyle = {
    width: '210mm',
    minHeight: '290mm',
    margin: '0 auto 16px',
    padding: '7mm 9mm',
    background: 'white',
    boxSizing: 'border-box',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  };

  const tbl = { width:'100%', borderCollapse:'collapse', tableLayout:'fixed' };

  // 문서 유형 라벨
  const docLabel = docType === 'Be품' ? '제조법 문서 (Be품)' : '제조법 문서';

  // 헤더 공통 컴포넌트
  const PageHeader1 = ({ page }) => (
    <table style={{...tbl, marginBottom:'3px'}}>
      <colgroup>
        <col style={{width:'13%'}}/>{/* 문서번호 라벨 */}
        <col style={{width:'30%'}}/>{/* 제품명 - 넓게 */}
        <col style={{width:'7%'}}/>{/* 작성 */}
        <col style={{width:'12%'}}/>{/* 작성서명 */}
        <col style={{width:'7%'}}/>{/* 검토 */}
        <col style={{width:'12%'}}/>{/* 검토서명 */}
        <col style={{width:'7%'}}/>{/* 승인 */}
        <col style={{width:'12%'}}/>{/* 승인서명 */}
      </colgroup>
      <tbody>
        <tr style={{height:'20px'}}>
          <td style={{...S.thGray}}>문 서 번 호</td>
          <td style={{...S.thGray}}>{docLabel}</td>
          <td style={{...S.thGray}}>작성</td>
          <td style={{...S.td,...S.center}}></td>
          <td style={{...S.thGray}}>검토</td>
          <td style={{...S.td,...S.center}}></td>
          <td style={{...S.thGray}}>승인</td>
          <td style={{...S.td,...S.center}}></td>
        </tr>
        <tr style={{height:'18px'}}>
          <td style={{...S.td,...S.center, fontSize:'7.5pt'}}>{d.docNo}</td>
          <td style={{...S.td,...S.center, fontWeight:'bold'}}>{d.productName}</td>
          <td style={{...S.td,...S.center, fontSize:'7.5pt'}}>작성</td>
          <td style={{...S.td,...S.center, fontSize:'7.5pt'}}>/ {d.drafter}</td>
          <td style={{...S.td,...S.center, fontSize:'7.5pt'}}>검토</td>
          <td style={{...S.td,...S.center, fontSize:'7.5pt'}}>/ {d.reviewer}</td>
          <td style={{...S.td,...S.center, fontSize:'7.5pt'}}>승인</td>
          <td style={{...S.td,...S.center, fontSize:'7.5pt'}}>/ {d.approver}</td>
        </tr>
        <tr style={{height:'15px'}}>
          <td style={{...S.thGray, fontSize:'7.5pt'}}>제정일자</td>
          <td style={{...S.td,...S.center, fontSize:'7.5pt'}}>{d.establishDate}</td>
          <td style={{...S.thGray, fontSize:'7.5pt'}}>개정일자</td>
          <td colSpan={2} style={{...S.td,...S.center, fontSize:'7.5pt'}}>{d.revisionDate}</td>
          <td style={{...S.thGray, fontSize:'7.5pt'}}>개정번호</td>
          <td style={{...S.td,...S.center, fontSize:'7.5pt'}}>{d.revisionNo}</td>
          <td style={{...S.td,...S.center, fontSize:'7.5pt'}}>{page}/4</td>
        </tr>
      </tbody>
    </table>
  );

  const SubHeader = ({ page }) => (
    <table style={{...tbl, marginBottom:'3px'}}>
      <colgroup><col style={{width:'50%'}}/><col style={{width:'50%'}}/></colgroup>
      <tbody>
        <tr style={{height:'18px'}}>
          <td style={{...S.thGray}}>{docLabel}</td>
          <td style={{...S.td,...S.center, fontWeight:'bold'}}>{d.productName}</td>
        </tr>
        <tr style={{height:'14px'}}>
          <td style={{...S.thGray, fontSize:'7.5pt'}}>제정일자</td>
          <td style={{...S.td, fontSize:'7.5pt'}}>
            {d.establishDate}&nbsp;&nbsp;개정일자 {d.revisionDate}&nbsp;&nbsp;개정번호 {d.revisionNo}&nbsp;&nbsp;페이지 {page}/4
          </td>
        </tr>
      </tbody>
    </table>
  );

  return (
    <div id="print-area">

      {/* ══ PAGE 1/4 ══ */}
      <div className="print-page" style={pageStyle}>
        <div style={{textAlign:'right', fontSize:'9pt', fontWeight:'bold', fontFamily:"'맑은 고딕','Malgun Gothic',sans-serif", marginBottom:'2px'}}>그린케미칼(주)</div>
        <PageHeader1 page="1" />

        {/* 1.0 Material Balance */}
        <table style={{...tbl, marginBottom:'3px'}}>
          <colgroup>
            <col style={{width:'7%'}}/>
            <col style={{width:'44%'}}/>
            <col style={{width:'24%'}}/>
            <col style={{width:'25%'}}/>
          </colgroup>
          <tbody>
            <tr><td colSpan={4} style={{...S.td, fontWeight:'bold', background:'#f2f2f2', padding:'3px 6px'}}>1.0 Material Balance</td></tr>
            <tr style={{height:'18px'}}>
              <td style={{...S.thGray}}></td>
              <td style={{...S.thGray}}>원       료       명</td>
              <td style={{...S.thGray}}>투   입   량 (kg)</td>
              <td style={{...S.thGray}}>비      고</td>
            </tr>
            {matRows.map((row, i) => (
              <tr key={i} style={{height: row.name ? '18px' : '13px'}}>
                <td style={{...S.td,...S.center}}>{row.order}</td>
                <td style={{...S.td,...S.center}}><Val value={row.name} changed={row.changed}/></td>
                <td style={{...S.td,...S.center}}><Val value={row.amount} changed={row.changed}/></td>
                <td style={{...S.td,...S.center}}>{row.note}</td>
              </tr>
            ))}
            <tr style={{height:'18px'}}>
              <td style={{...S.td}}></td>
              <td style={{...S.td,...S.center, fontWeight:'bold'}}>TOTAL</td>
              <td style={{...S.td,...S.center, fontWeight:'bold', fontStyle:'italic', textDecoration:'underline'}}>{d.totalAmount}</td>
              <td style={{...S.td}}></td>
            </tr>
          </tbody>
        </table>

        {/* 2.0 제품규격 */}
        <table style={{...tbl, marginBottom:'3px'}}>
          <colgroup>
            <col style={{width:'7%'}}/>
            <col style={{width:'44%'}}/>
            <col style={{width:'24%'}}/>
            <col style={{width:'25%'}}/>
          </colgroup>
          <tbody>
            <tr><td colSpan={4} style={{...S.td, fontWeight:'bold', background:'#f2f2f2', padding:'3px 6px'}}>2.0 제품규격</td></tr>
            <tr style={{height:'18px'}}>
              <td style={{...S.thGray}}></td>
              <td style={{...S.thGray}}>항          목</td>
              <td style={{...S.thGray}}>규          격</td>
              <td style={{...S.thGray}}>시   험   법</td>
            </tr>
            {specRows.map((row, i) => (
              <tr key={i} style={{height: row.item ? '18px' : '13px'}}>
                <td style={{...S.td,...S.center}}>{row.order}</td>
                <td style={{...S.td,...S.center}}>{row.item}</td>
                <td style={{...S.td,...S.center}}><Val value={row.spec} changed={row.changed}/></td>
                <td style={{...S.td,...S.center}}>{row.method}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <table style={{...tbl}}>
          <colgroup><col style={{width:'8%'}}/><col style={{width:'92%'}}/></colgroup>
          <tbody>
            <tr style={{height:'16px'}}><td style={{...S.thGray}}>개  정</td><td style={{...S.td}}>{d.revisionNote}</td></tr>
            <tr style={{height:'16px'}}><td style={{...S.thGray}}>배포처</td><td style={{...S.td}}>{d.distributionMfg}</td></tr>
          </tbody>
        </table>
        <div style={{fontSize:'7pt', marginTop:'3px', fontFamily:"'맑은 고딕','Malgun Gothic',sans-serif", color:'#444'}}>FB01-06(1)</div>
        <div style={{textAlign:'center', fontSize:'9pt', fontWeight:'bold', fontFamily:"'맑은 고딕','Malgun Gothic',sans-serif", marginTop:'4px'}}>그린케미칼(주)</div>
      </div>

      {/* ══ PAGE 2/4 ══ */}
      <div className="print-page" style={pageStyle}>
        <SubHeader page="2" />
        <table style={{...tbl}}>
          <colgroup><col style={{width:'21%'}}/><col style={{width:'79%'}}/></colgroup>
          <tbody>
            <tr><td colSpan={2} style={{...S.td, fontWeight:'bold', background:'#f2f2f2', padding:'3px 6px'}}>3.0 작업개요</td></tr>
            <tr style={{height:'18px'}}>
              <td style={{...S.thGray}}>FLOW SHEET</td>
              <td style={{...S.thGray}}>제    조    조    건</td>
            </tr>
            <tr>
              <td style={{...S.td, verticalAlign:'top', textAlign:'center', fontSize:'8pt', lineHeight:'2.0', padding:'6px 4px', whiteSpace:'pre-line'}}>
{`${fc.starter||'Starter'}  ${fc.catalyst||'촉매'}
↓
1  원료사입

↓
2  치   환

↓
3  승   온
${fc.reactant||'Reactant'}
↓
4  반   응

↓
5  숙    성`}
              </td>
              <td style={{...S.td, verticalAlign:'top', fontSize:'8.5pt', lineHeight:'1.8', padding:'8px', whiteSpace:'pre-line'}}>
{`<준 비> : 사용할 중합조가 충분히 세척, 건조되어 있는가를 확인한다.

1. 원료사입
    지시량의 ${fc.starter||'Starter'}, ${fc.catalyst||'촉매'}를 사입한 후 교반을 실시한다.

2. 치   환
    0 kg/cm²G  ↔  -1 kg/cm²G 로 질소감압치환을 3회 실시한 후 최종압력은  -1.0 kg/cm²G 로 한다

3. 승  온
    반응온도까지 승온한다.(${fc.reactionTemp||140}℃)

4. 반   응
    아래의 조건으로 ${fc.reactant||'Reactant'} 반응을 실시한다.
    * 반응온도 : ${fc.reactionTemp||140} ± 5℃
    * 반응압력 : ${fc.reactionPressure||4} kg/cm²G 이하
    * 반응시간 : 지시량의 ${fc.reactant||'Reactant'} 사입 종료까지

5. 숙   성
    지시량의 ${fc.reactant||'Reactant'} 사입이 종료되면 아래의 조건에서 숙성을 실시한다.
    * 숙성온도 : ${fc.agingTemp||140} ± 5℃
    * 숙성압력 : ${fc.agingPressure||4} kg/cm²G 이하
    * 숙성시간 : 동일온도에서 압력평형상태가 30분간 지속될 때 까지`}
              </td>
            </tr>
          </tbody>
        </table>
        <div style={{fontSize:'7pt', marginTop:'3px', fontFamily:"'맑은 고딕','Malgun Gothic',sans-serif", color:'#444'}}>FB01-06(1)</div>
        <div style={{textAlign:'center', fontSize:'9pt', fontWeight:'bold', fontFamily:"'맑은 고딕','Malgun Gothic',sans-serif", marginTop:'4px'}}>그린케미칼(주)</div>
      </div>

      {/* ══ PAGE 3/4 ══ */}
      <div className="print-page" style={pageStyle}>
        <SubHeader page="3" />
        <table style={{...tbl}}>
          <colgroup><col style={{width:'21%'}}/><col style={{width:'79%'}}/></colgroup>
          <tbody>
            <tr><td colSpan={2} style={{...S.td, fontWeight:'bold', background:'#f2f2f2', padding:'3px 6px'}}>3.0 작업개요</td></tr>
            <tr style={{height:'18px'}}>
              <td style={{...S.thGray}}>FLOW SHEET</td>
              <td style={{...S.thGray}}>제    조    조    건</td>
            </tr>
            <tr>
              <td style={{...S.td, verticalAlign:'top', textAlign:'center', fontSize:'8pt', lineHeight:'2.0', padding:'6px 4px', whiteSpace:'pre-line'}}>
{`6  분   석

↓
7  냉   각

↓
8  탈   취

↓
9  포  장`}
              </td>
              <td style={{...S.td, verticalAlign:'top', fontSize:'8.5pt', lineHeight:'1.8', padding:'8px', whiteSpace:'pre-line'}}>
{`6. 분   석
    숙성이 종료되면 다음 항목을 분석한다.
${specForAnalysis.length > 0
  ? specForAnalysis.map(s=>`       ${s.item.trim().replace(/\s+/,' ')}    : ${s.spec}`).join('\n')
  : `       외     관    : 투명균일액상
       색     상    : 
       수  분(%)    : 
       평균분자량   : `}

7. 냉   각
    분석치가 규격내인 것을 확인한 후 탈취온도까지 냉각한다.

8. 탈   취
    탈취온도(${fc.deodorTemp||80}±5℃)에서 30분간 질소로 탈취한다.

9. 포  장
    본 제품은 Be품이므로 제품의 변질을 방지하기 위하여 질소를 충진하여
    포장한다.(포장온도 : ${fc.packingTemp||60}℃ 이하)`}
              </td>
            </tr>
          </tbody>
        </table>
        <div style={{fontSize:'7pt', marginTop:'3px', fontFamily:"'맑은 고딕','Malgun Gothic',sans-serif", color:'#444'}}>FB01-06(1)</div>
        <div style={{textAlign:'center', fontSize:'9pt', fontWeight:'bold', fontFamily:"'맑은 고딕','Malgun Gothic',sans-serif", marginTop:'4px'}}>그린케미칼(주)</div>
      </div>

      {/* ══ PAGE 4/4 ══ */}
      <div className="print-page" style={pageStyle}>
        <SubHeader page="4" />
        <table style={{...tbl}}>
          <tbody>
            <tr>
              <td style={{...S.td, lineHeight:'1.9', padding:'8px 10px', whiteSpace:'pre-line', fontSize:'8.5pt'}}>
{`4.0 제조기계
    ${fc.reactorNo||'V-302'} Reactor Type

5.0 유해물질명
    ${fc.hazardous||'해당없음'}

6.0 포장용기
    ${fc.packageType||'Steel Drum (Net.Wt. : 230 kg)'}

7.0 저장, 보존, 취급, 폐기에 관한 사항
  7.1 저장 및 보존
      ${fc.storage||''}
  7.2 취  급
      ${fc.handling||''}
  7.3 폐  기
      ${fc.disposal||''}`}
              </td>
            </tr>
          </tbody>
        </table>
        <div style={{fontSize:'7pt', marginTop:'3px', fontFamily:"'맑은 고딕','Malgun Gothic',sans-serif", color:'#444'}}>FB01-06(1)</div>
        <div style={{textAlign:'center', fontSize:'9pt', fontWeight:'bold', fontFamily:"'맑은 고딕','Malgun Gothic',sans-serif", marginTop:'4px'}}>그린케미칼(주)</div>
      </div>

      {/* ══ PAGE 5 : 제품보증규격 ══ */}
      <div className="print-page" style={pageStyle}>
        <div style={{textAlign:'right', fontSize:'9pt', fontWeight:'bold', fontFamily:"'맑은 고딕','Malgun Gothic',sans-serif", marginBottom:'2px'}}>그린케미칼(주)</div>
        <table style={{...tbl, marginBottom:'3px'}}>
          <colgroup>
            <col style={{width:'13%'}}/>
            <col style={{width:'30%'}}/>
            <col style={{width:'7%'}}/>
            <col style={{width:'12%'}}/>
            <col style={{width:'7%'}}/>
            <col style={{width:'12%'}}/>
            <col style={{width:'7%'}}/>
            <col style={{width:'12%'}}/>
          </colgroup>
          <tbody>
            <tr style={{height:'20px'}}>
              <td style={{...S.thGray}}>문 서 번 호</td>
              <td style={{...S.thGray}}>제품규격 (Be품)</td>
              <td style={{...S.thGray}}>작성</td>
              <td style={{...S.td,...S.center}}></td>
              <td style={{...S.thGray}}>검토</td>
              <td style={{...S.td,...S.center}}></td>
              <td style={{...S.thGray}}>승인</td>
              <td style={{...S.td,...S.center}}></td>
            </tr>
            <tr style={{height:'18px'}}>
              <td style={{...S.td,...S.center, fontSize:'7.5pt'}}>{d.docNo?.replace('R41','R32')}</td>
              <td style={{...S.td,...S.center, fontWeight:'bold'}}>{d.productName}</td>
              <td style={{...S.td,...S.center, fontSize:'7.5pt'}}>작성</td>
              <td style={{...S.td,...S.center, fontSize:'7.5pt'}}>/ {d.drafter}</td>
              <td style={{...S.td,...S.center, fontSize:'7.5pt'}}>검토</td>
              <td style={{...S.td,...S.center, fontSize:'7.5pt'}}>/ {d.reviewer}</td>
              <td style={{...S.td,...S.center, fontSize:'7.5pt'}}>승인</td>
              <td style={{...S.td,...S.center, fontSize:'7.5pt'}}>/ {d.approver}</td>
            </tr>
            <tr style={{height:'15px'}}>
              <td style={{...S.thGray, fontSize:'7.5pt'}}>제정일자</td>
              <td style={{...S.td,...S.center, fontSize:'7.5pt'}}>{d.establishDate}</td>
              <td style={{...S.thGray, fontSize:'7.5pt'}}>개정일자</td>
              <td colSpan={2} style={{...S.td,...S.center, fontSize:'7.5pt'}}>{d.revisionDate}</td>
              <td style={{...S.thGray, fontSize:'7.5pt'}}>개정번호</td>
              <td style={{...S.td,...S.center, fontSize:'7.5pt'}}>{d.revisionNo}</td>
              <td style={{...S.td,...S.center, fontSize:'7.5pt'}}>1/1</td>
            </tr>
          </tbody>
        </table>

        <table style={{...tbl, marginBottom:'3px'}}>
          <colgroup>
            <col style={{width:'22%'}}/>
            <col style={{width:'11%'}}/>
            <col style={{width:'17%'}}/>
            <col style={{width:'17%'}}/>
            <col style={{width:'17%'}}/>
            <col style={{width:'16%'}}/>
          </colgroup>
          <tbody>
            <tr style={{height:'18px'}}>
              <td style={{...S.thGray}}>공  정  도</td>
              <td style={{...S.thGray}}>분 석 점</td>
              <td style={{...S.thGray}}>분 석 항 목</td>
              <td style={{...S.thGray}}>분 석 법</td>
              <td style={{...S.thGray}}>규    격</td>
              <td style={{...S.thGray}}>비    고</td>
            </tr>
            <tr>
              <td style={{...S.td, verticalAlign:'middle', textAlign:'center', fontSize:'8pt', lineHeight:'2', padding:'6px 4px', whiteSpace:'pre-line'}}>
{`1  원료사입
2  치    환
3  승    온
4  반    응
5  숙    성
6  분    석
7  냉    각
8  탈    취
9  포    장`}
              </td>
              <td style={{...S.td,...S.center, fontWeight:'bold', fontSize:'11pt'}}>6</td>
              <td style={{...S.td, verticalAlign:'top', lineHeight:'2', padding:'4px'}}>
                {(d.specs||[]).filter(s=>s.item).map((s,i)=><div key={i}>{s.item}</div>)}
              </td>
              <td style={{...S.td, verticalAlign:'top', lineHeight:'2', padding:'4px'}}>
                {(d.specs||[]).filter(s=>s.method).map((s,i)=><div key={i}>{s.method}</div>)}
              </td>
              <td style={{...S.td, verticalAlign:'top', lineHeight:'2', padding:'4px'}}>
                {(d.specs||[]).filter(s=>s.spec).map((s,i)=>(
                  <div key={i}><Val value={s.spec} changed={s.changed}/></div>
                ))}
              </td>
              <td style={{...S.td}}></td>
            </tr>
          </tbody>
        </table>
        <table style={{...tbl}}>
          <colgroup><col style={{width:'10%'}}/><col style={{width:'90%'}}/></colgroup>
          <tbody>
            <tr style={{height:'16px'}}><td style={{...S.thGray}}>개  정</td><td style={{...S.td}}>{d.revisionNote}</td></tr>
            <tr style={{height:'16px'}}><td style={{...S.thGray}}>배포처</td><td style={{...S.td}}>{d.distributionQuality}</td></tr>
          </tbody>
        </table>
        <div style={{fontSize:'7pt', marginTop:'3px', fontFamily:"'맑은 고딕','Malgun Gothic',sans-serif", color:'#444'}}>FB01-07(1)</div>
        <div style={{textAlign:'center', fontSize:'9pt', fontWeight:'bold', fontFamily:"'맑은 고딕','Malgun Gothic',sans-serif", marginTop:'4px'}}>그린케미칼(주)</div>
      </div>

      {/* ══ PAGE 6 : 품질보증규격 ══ */}
      <div className="print-page" style={pageStyle}>
        <div style={{textAlign:'right', fontSize:'9pt', fontWeight:'bold', fontFamily:"'맑은 고딕','Malgun Gothic',sans-serif", marginBottom:'2px'}}>그린케미칼(주)</div>
        <table style={{...tbl, marginBottom:'3px'}}>
          <colgroup>
            <col style={{width:'14%'}}/>
            <col style={{width:'30%'}}/>
            <col style={{width:'7%'}}/>
            <col style={{width:'12%'}}/>
            <col style={{width:'7%'}}/>
            <col style={{width:'12%'}}/>
            <col style={{width:'7%'}}/>
            <col style={{width:'11%'}}/>
          </colgroup>
          <tbody>
            <tr style={{height:'20px'}}>
              <td style={{...S.thGray}}>문 서 번 호</td>
              <td style={{...S.thGray}}>품질보증규격</td>
              <td style={{...S.thGray}}>작성</td>
              <td style={{...S.td,...S.center}}></td>
              <td style={{...S.thGray}}>검토</td>
              <td style={{...S.td,...S.center}}></td>
              <td style={{...S.thGray}}>승인</td>
              <td style={{...S.td,...S.center}}></td>
            </tr>
            <tr style={{height:'18px'}}>
              <td style={{...S.td,...S.center, fontSize:'7.5pt'}}>{d.qaDocNo}</td>
              <td style={{...S.td,...S.center, fontWeight:'bold'}}>KONION {d.productName}</td>
              <td style={{...S.td,...S.center, fontSize:'7.5pt'}}>작성</td>
              <td style={{...S.td,...S.center, fontSize:'7.5pt'}}>/ {d.drafter}</td>
              <td style={{...S.td,...S.center, fontSize:'7.5pt'}}>검토</td>
              <td style={{...S.td,...S.center, fontSize:'7.5pt'}}>/ {d.reviewer}</td>
              <td style={{...S.td,...S.center, fontSize:'7.5pt'}}>승인</td>
              <td style={{...S.td,...S.center, fontSize:'7.5pt'}}>/ {d.approver}</td>
            </tr>
            <tr style={{height:'15px'}}>
              <td style={{...S.thGray, fontSize:'7.5pt'}}>제정일자</td>
              <td style={{...S.td,...S.center, fontSize:'7.5pt'}}>{d.establishDate}</td>
              <td style={{...S.thGray, fontSize:'7.5pt'}}>개정일자</td>
              <td colSpan={2} style={{...S.td,...S.center, fontSize:'7.5pt'}}>{d.qaRevisionDate||d.revisionDate}</td>
              <td style={{...S.thGray, fontSize:'7.5pt'}}>개정번호</td>
              <td style={{...S.td,...S.center, fontSize:'7.5pt'}}>{d.qaRevisionNo||d.revisionNo}</td>
              <td style={{...S.td,...S.center, fontSize:'7.5pt'}}>1/1</td>
            </tr>
          </tbody>
        </table>

        <table style={{...tbl, marginBottom:'3px'}}>
          <colgroup>
            <col style={{width:'25%'}}/>
            <col style={{width:'75%'}}/>
          </colgroup>
          <tbody>
            <tr style={{height:'18px'}}>
              <td style={{...S.thGray}}>구 분 / 분석항목</td>
              <td style={{...S.thGray,...S.center}}>{d.productName}</td>
            </tr>
            {(d.qaSpecs||[]).map((row,i)=>(
              <tr key={i} style={{height:'18px'}}>
                <td style={{...S.td,...S.center}}>{row.item}</td>
                <td style={{...S.td,...S.center}}><Val value={row.spec} changed={row.changed}/></td>
              </tr>
            ))}
          </tbody>
        </table>

        <table style={{...tbl, marginBottom:'3px'}}>
          <tbody>
            <tr>
              <td style={{...S.td, padding:'6px 8px', fontSize:'8.5pt'}}>
                <div style={{fontWeight:'bold'}}>특기사항</div>
                <div>* 제품보존기간 : {d.qaPreservation||'2 년'}</div>
              </td>
            </tr>
          </tbody>
        </table>
        <table style={{...tbl}}>
          <colgroup><col style={{width:'13%'}}/><col style={{width:'87%'}}/></colgroup>
          <tbody>
            <tr style={{height:'16px'}}>
              <td style={{...S.thGray}}>배 포 처</td>
              <td style={{...S.td}}>{d.qaDistribution}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
