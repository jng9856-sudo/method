import React from 'react';

// 변경 여부에 따른 텍스트 렌더링
function Val({ value, changed }) {
  if (value === undefined || value === null || value === '') return null;
  if (changed) return <span style={{fontWeight:'bold', fontStyle:'italic', textDecoration:'underline'}}>{value}</span>;
  return <>{value}</>;
}

// 공통 셀 스타일
const S = {
  td: { border:'1px solid #000', padding:'2px 4px', fontSize:'8.5pt', fontFamily:"'맑은 고딕','Malgun Gothic',sans-serif", verticalAlign:'middle' },
  thGray: { border:'1px solid #000', padding:'2px 4px', fontSize:'8.5pt', fontFamily:"'맑은 고딕','Malgun Gothic',sans-serif", verticalAlign:'middle', background:'#d9d9d9', fontWeight:'bold', textAlign:'center' },
  center: { textAlign:'center' },
  left: { textAlign:'left' },
};

export default function PrintPreview({ data }) {
  if (!data) return null;
  const d = data;
  const fc = d.flowConditions || {};

  // 빈 행 포함 총 10행 맞추기 (Material Balance)
  const matRows = [...(d.materials || [])];
  while (matRows.length < 10) matRows.push({ order:'', name:'', amount:'', note:'', changed:false });

  // 빈 행 포함 총 8행 맞추기 (제품규격)
  const specRows = [...(d.specs || [])];
  while (specRows.length < 8) specRows.push({ order:'', item:'', spec:'', method:'', changed:false });

  // 분석 규격 항목 (6단계 분석용)
  const specForAnalysis = d.specs?.filter(s => s.item && s.spec) || [];

  const pageStyle = {
    width: '210mm',
    minHeight: '290mm',
    margin: '0 auto 16px',
    padding: '8mm 10mm',
    background: 'white',
    boxSizing: 'border-box',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    position: 'relative',
  };

  const tbl = { width:'100%', borderCollapse:'collapse', tableLayout:'fixed' };

  return (
    <div id="print-area">

      {/* ══════════════ PAGE 1/4 : 헤더 + Material Balance + 제품규격 ══════════════ */}
      <div className="print-page" style={pageStyle}>
        {/* 그린케미칼(주) - 우측 상단 */}
        <div style={{textAlign:'right', fontSize:'9pt', fontWeight:'bold', fontFamily:"'맑은 고딕','Malgun Gothic',sans-serif", marginBottom:'3px'}}>그린케미칼(주)</div>

        {/* 헤더 테이블 - 원본 비율: 문서번호(3col=1883x3), 제목(4col=4034x4), 작성(468), 서명(921), 검토(468+468), 서명(921+921), 승인(411), 서명(997) */}
        <table style={{...tbl, marginBottom:'3px'}}>
          <colgroup>
            <col style={{width:'15%'}}/> {/* 문서번호 라벨 */}
            <col style={{width:'22%'}}/> {/* 제목 */}
            <col style={{width:'8%'}}/> {/* 작성 */}
            <col style={{width:'13%'}}/> {/* 작성 서명 */}
            <col style={{width:'8%'}}/> {/* 검토 */}
            <col style={{width:'13%'}}/> {/* 검토 서명 */}
            <col style={{width:'8%'}}/> {/* 승인 */}
            <col style={{width:'13%'}}/> {/* 승인 서명 */}
          </colgroup>
          <tbody>
            <tr style={{height:'18px'}}>
              <td style={{...S.thGray}}>문 서 번 호</td>
              <td style={{...S.thGray}}>제조법 문서 (Be품)</td>
              <td style={{...S.thGray, whiteSpace:'pre-line'}}>{'작\n성'}</td>
              <td style={{...S.td, ...S.center}}></td>
              <td style={{...S.thGray, whiteSpace:'pre-line'}}>{'검\n토'}</td>
              <td style={{...S.td, ...S.center}}></td>
              <td style={{...S.thGray, whiteSpace:'pre-line'}}>{'승\n인'}</td>
              <td style={{...S.td, ...S.center}}></td>
            </tr>
            <tr style={{height:'16px'}}>
              <td style={{...S.td, ...S.center, fontSize:'7.5pt'}}>{d.docNo}</td>
              <td style={{...S.td, ...S.center, fontWeight:'bold'}}>{d.productName}</td>
              <td style={{...S.td, ...S.center, fontSize:'7.5pt', whiteSpace:'pre-line'}}>{'작\n성'}</td>
              <td style={{...S.td, ...S.center, fontSize:'7.5pt'}}>/ {d.drafter}</td>
              <td style={{...S.td, ...S.center, fontSize:'7.5pt', whiteSpace:'pre-line'}}>{'검\n토'}</td>
              <td style={{...S.td, ...S.center, fontSize:'7.5pt'}}>/ {d.reviewer}</td>
              <td style={{...S.td, ...S.center, fontSize:'7.5pt', whiteSpace:'pre-line'}}>{'승\n인'}</td>
              <td style={{...S.td, ...S.center, fontSize:'7.5pt'}}>/ {d.approver}</td>
            </tr>
            <tr style={{height:'16px'}}>
              <td style={{...S.thGray}}>제정일자</td>
              <td style={{...S.td, ...S.center, fontSize:'7.5pt'}}>{d.establishDate}</td>
              <td style={{...S.thGray}}>개정일자</td>
              <td colSpan={2} style={{...S.td, ...S.center, fontSize:'7.5pt'}}>{d.revisionDate}</td>
              <td style={{...S.thGray}}>개정번호</td>
              <td style={{...S.td, ...S.center}}>{d.revisionNo}</td>
              <td style={{...S.td, ...S.center, fontSize:'7.5pt'}}>1/4</td>
            </tr>
          </tbody>
        </table>

        {/* 1.0 Material Balance */}
        <table style={{...tbl, marginBottom:'3px'}}>
          <colgroup>
            <col style={{width:'8%'}}/>
            <col style={{width:'42%'}}/>
            <col style={{width:'25%'}}/>
            <col style={{width:'25%'}}/>
          </colgroup>
          <tbody>
            <tr>
              <td colSpan={4} style={{...S.td, fontWeight:'bold', background:'#f2f2f2'}}>1.0 Material Balance</td>
            </tr>
            <tr style={{height:'18px'}}>
              <td style={{...S.thGray}}></td>
              <td style={{...S.thGray}}>원       료       명</td>
              <td style={{...S.thGray}}>투   입   량 (kg)</td>
              <td style={{...S.thGray}}>비      고</td>
            </tr>
            {matRows.map((row, i) => (
              <tr key={i} style={{height:'16px'}}>
                <td style={{...S.td, ...S.center}}>{row.order}</td>
                <td style={{...S.td, ...S.center}}><Val value={row.name} changed={row.changed}/></td>
                <td style={{...S.td, ...S.center}}><Val value={row.amount} changed={row.changed}/></td>
                <td style={{...S.td, ...S.center}}>{row.note}</td>
              </tr>
            ))}
            <tr style={{height:'16px'}}>
              <td style={{...S.td}}></td>
              <td style={{...S.td, ...S.center, fontWeight:'bold'}}>TOTAL</td>
              <td style={{...S.td, ...S.center, fontWeight:'bold', fontStyle:'italic', textDecoration:'underline'}}>{d.totalAmount}</td>
              <td style={{...S.td}}></td>
            </tr>
          </tbody>
        </table>

        {/* 2.0 제품규격 */}
        <table style={{...tbl, marginBottom:'3px'}}>
          <colgroup>
            <col style={{width:'8%'}}/>
            <col style={{width:'42%'}}/>
            <col style={{width:'25%'}}/>
            <col style={{width:'25%'}}/>
          </colgroup>
          <tbody>
            <tr>
              <td colSpan={4} style={{...S.td, fontWeight:'bold', background:'#f2f2f2'}}>2.0 제품규격</td>
            </tr>
            <tr style={{height:'18px'}}>
              <td style={{...S.thGray}}></td>
              <td style={{...S.thGray}}>항          목</td>
              <td style={{...S.thGray}}>규          격</td>
              <td style={{...S.thGray}}>시   험   법</td>
            </tr>
            {specRows.map((row, i) => (
              <tr key={i} style={{height:'16px'}}>
                <td style={{...S.td, ...S.center}}>{row.order}</td>
                <td style={{...S.td, ...S.center}}>{row.item}</td>
                <td style={{...S.td, ...S.center}}><Val value={row.spec} changed={row.changed}/></td>
                <td style={{...S.td, ...S.center}}>{row.method}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 개정 / 배포처 */}
        <table style={{...tbl}}>
          <colgroup>
            <col style={{width:'8%'}}/>
            <col style={{width:'92%'}}/>
          </colgroup>
          <tbody>
            <tr style={{height:'16px'}}>
              <td style={{...S.thGray}}>개  정</td>
              <td style={{...S.td}}>{d.revisionNote}</td>
            </tr>
            <tr style={{height:'16px'}}>
              <td style={{...S.thGray}}>배포처</td>
              <td style={{...S.td}}>{d.distributionMfg}</td>
            </tr>
          </tbody>
        </table>
        <div style={{fontSize:'7.5pt', marginTop:'4px', fontFamily:"'맑은 고딕','Malgun Gothic',sans-serif"}}>FB01-06(1)</div>
      </div>

      {/* ══════════════ PAGE 2/4 : 작업개요 공정 1~5 ══════════════ */}
      <div className="print-page" style={pageStyle}>
        <div style={{textAlign:'right', fontSize:'9pt', fontWeight:'bold', fontFamily:"'맑은 고딕','Malgun Gothic',sans-serif", marginBottom:'3px'}}>그린케미칼(주)</div>

        {/* 서브 헤더 */}
        <table style={{...tbl, marginBottom:'3px'}}>
          <colgroup><col style={{width:'50%'}}/><col style={{width:'50%'}}/></colgroup>
          <tbody>
            <tr style={{height:'18px'}}>
              <td style={{...S.thGray}}>제조법 문서 (Be품)</td>
              <td style={{...S.td, ...S.center, fontWeight:'bold'}}>{d.productName}</td>
            </tr>
            <tr style={{height:'14px'}}>
              <td style={{...S.thGray, fontSize:'7.5pt'}}>제정일자</td>
              <td style={{...S.td, fontSize:'7.5pt'}}>
                {d.establishDate} &nbsp;&nbsp; 개정일자 {d.revisionDate} &nbsp;&nbsp; 개정번호 {d.revisionNo} &nbsp;&nbsp; 페이지 2/4
              </td>
            </tr>
          </tbody>
        </table>

        {/* 3.0 작업개요 */}
        <table style={{...tbl}}>
          <colgroup><col style={{width:'21%'}}/><col style={{width:'79%'}}/></colgroup>
          <tbody>
            <tr>
              <td colSpan={2} style={{...S.td, fontWeight:'bold', background:'#f2f2f2'}}>3.0 작업개요</td>
            </tr>
            <tr style={{height:'18px'}}>
              <td style={{...S.thGray}}>FLOW SHEET</td>
              <td style={{...S.thGray}}>제    조    조    건</td>
            </tr>
            <tr>
              <td style={{...S.td, verticalAlign:'top', textAlign:'center', fontSize:'8pt', lineHeight:'1.8', padding:'8px 4px', whiteSpace:'pre-line'}}>
{`${fc.starter || 'Starter'}    ${fc.catalyst || '촉매'}
↓          ↓
1  원료사입

↓
2  치   환

↓
3  승   온
${fc.reactant || 'Reactant'}
↓
4  반   응

↓
5  숙    성`}
              </td>
              <td style={{...S.td, verticalAlign:'top', fontSize:'8.5pt', lineHeight:'1.7', padding:'8px', whiteSpace:'pre-line'}}>
{`<준 비> : 사용할 중합조가 충분히 세척, 건조되어 있는가를 확인한다.

1. 원료사입
    지시량의 ${fc.starter || 'Starter'}, ${fc.catalyst || '촉매'}를 사입한 후 교반을 실시한다.

2. 치   환
    0 kg/cm²G  ↔  -1 kg/cm²G 로 질소감압치환을 3회 실시한 후 최종압력은  -1.0 kg/cm²G 로 한다

3. 승  온
    반응온도까지 승온한다.(${fc.reactionTemp || 140}℃)

4. 반   응
    아래의 조건으로 ${fc.reactant || 'Reactant'} 반응을 실시한다.
    * 반응온도 : ${fc.reactionTemp || 140} ± 5℃
    * 반응압력 : ${fc.reactionPressure || 4} kg/cm²G 이하
    * 반응시간 : 지시량의 ${fc.reactant || 'Reactant'} 사입 종료까지

5. 숙   성
    지시량의 ${fc.reactant || 'Reactant'} 사입이 종료되면 아래의 조건에서 숙성을 실시한다.
    * 숙성온도 : ${fc.agingTemp || 140} ± 5℃
    * 숙성압력 : ${fc.agingPressure || 4} kg/cm²G 이하
    * 숙성시간 : 동일온도에서 압력평형상태가 30분간 지속될 때 까지`}
              </td>
            </tr>
          </tbody>
        </table>
        <div style={{fontSize:'7.5pt', marginTop:'4px', fontFamily:"'맑은 고딕','Malgun Gothic',sans-serif"}}>FB01-06(1)</div>
      </div>

      {/* ══════════════ PAGE 3/4 : 작업개요 공정 6~9 ══════════════ */}
      <div className="print-page" style={pageStyle}>
        <div style={{textAlign:'right', fontSize:'9pt', fontWeight:'bold', fontFamily:"'맑은 고딕','Malgun Gothic',sans-serif", marginBottom:'3px'}}>그린케미칼(주)</div>

        <table style={{...tbl, marginBottom:'3px'}}>
          <colgroup><col style={{width:'50%'}}/><col style={{width:'50%'}}/></colgroup>
          <tbody>
            <tr style={{height:'18px'}}>
              <td style={{...S.thGray}}>제조법 문서 (Be품)</td>
              <td style={{...S.td, ...S.center, fontWeight:'bold'}}>{d.productName}</td>
            </tr>
            <tr style={{height:'14px'}}>
              <td style={{...S.thGray, fontSize:'7.5pt'}}>제정일자</td>
              <td style={{...S.td, fontSize:'7.5pt'}}>
                {d.establishDate} &nbsp;&nbsp; 개정일자 {d.revisionDate} &nbsp;&nbsp; 개정번호 {d.revisionNo} &nbsp;&nbsp; 페이지 3/4
              </td>
            </tr>
          </tbody>
        </table>

        <table style={{...tbl}}>
          <colgroup><col style={{width:'21%'}}/><col style={{width:'79%'}}/></colgroup>
          <tbody>
            <tr>
              <td colSpan={2} style={{...S.td, fontWeight:'bold', background:'#f2f2f2'}}>3.0 작업개요</td>
            </tr>
            <tr style={{height:'18px'}}>
              <td style={{...S.thGray}}>FLOW SHEET</td>
              <td style={{...S.thGray}}>제    조    조    건</td>
            </tr>
            <tr>
              <td style={{...S.td, verticalAlign:'top', textAlign:'center', fontSize:'8pt', lineHeight:'1.8', padding:'8px 4px', whiteSpace:'pre-line'}}>
{`6  분   석

↓
7  냉   각

↓
8  탈   취

↓
9  포  장`}
              </td>
              <td style={{...S.td, verticalAlign:'top', fontSize:'8.5pt', lineHeight:'1.7', padding:'8px', whiteSpace:'pre-line'}}>
{`6. 분   석
    숙성이 종료되면 다음 항목을 분석한다.
${specForAnalysis.length > 0
  ? specForAnalysis.map(s => `       ${s.item.trim()}    : ${s.spec}`).join('\n')
  : `       외     관    : 투명균일액상
       색     상    : 
       수  분(%)    : 
       평균분자량   : `}

7. 냉   각
    분석치가 규격내인 것을 확인한 후 탈취온도까지 냉각한다.

8. 탈   취
    탈취온도(${fc.deodorTemp || 80}±5℃)에서 30분간 질소로 탈취한다.

9. 포  장
    본 제품은 Be품이므로 제품의 변질을 방지하기 위하여 질소를 충진하여
    포장한다.(포장온도 : ${fc.packingTemp || 60}℃ 이하)`}
              </td>
            </tr>
          </tbody>
        </table>
        <div style={{fontSize:'7.5pt', marginTop:'4px', fontFamily:"'맑은 고딕','Malgun Gothic',sans-serif"}}>FB01-06(1)</div>
      </div>

      {/* ══════════════ PAGE 4/4 : 제조기계/유해물질/포장/저장 ══════════════ */}
      <div className="print-page" style={pageStyle}>
        <div style={{textAlign:'right', fontSize:'9pt', fontWeight:'bold', fontFamily:"'맑은 고딕','Malgun Gothic',sans-serif", marginBottom:'3px'}}>그린케미칼(주)</div>

        <table style={{...tbl, marginBottom:'3px'}}>
          <colgroup><col style={{width:'50%'}}/><col style={{width:'50%'}}/></colgroup>
          <tbody>
            <tr style={{height:'18px'}}>
              <td style={{...S.thGray}}>제조법 문서 (Be품)</td>
              <td style={{...S.td, ...S.center, fontWeight:'bold'}}>{d.productName}</td>
            </tr>
            <tr style={{height:'14px'}}>
              <td style={{...S.thGray, fontSize:'7.5pt'}}>제정일자</td>
              <td style={{...S.td, fontSize:'7.5pt'}}>
                {d.establishDate} &nbsp;&nbsp; 개정일자 {d.revisionDate} &nbsp;&nbsp; 개정번호 {d.revisionNo} &nbsp;&nbsp; 페이지 4/4
              </td>
            </tr>
          </tbody>
        </table>

        <table style={{...tbl}}>
          <tbody>
            <tr>
              <td style={{...S.td, lineHeight:'2', padding:'8px 10px', whiteSpace:'pre-line', fontSize:'8.5pt'}}>
{`4.0 제조기계
    ${fc.reactorNo || 'V-302'} Reactor Type

5.0 유해물질명
    ${fc.hazardous || '해당없음'}

6.0 포장용기
    ${fc.packageType || 'Steel Drum (Net.Wt. : 230 kg)'}

7.0 저장, 보존, 취급, 폐기에 관한 사항
  7.1 저장 및 보존
      ${fc.storage || ''}
  7.2 취  급
      ${fc.handling || ''}
  7.3 폐  기
      ${fc.disposal || ''}`}
              </td>
            </tr>
          </tbody>
        </table>
        <div style={{fontSize:'7.5pt', marginTop:'4px', fontFamily:"'맑은 고딕','Malgun Gothic',sans-serif"}}>FB01-06(1)</div>
      </div>

      {/* ══════════════ PAGE 5 : 제품보증규격 ══════════════ */}
      <div className="print-page" style={pageStyle}>
        <div style={{textAlign:'right', fontSize:'9pt', fontWeight:'bold', fontFamily:"'맑은 고딕','Malgun Gothic',sans-serif", marginBottom:'3px'}}>그린케미칼(주)</div>

        {/* 헤더 - 원본 비율: 문서번호(2col=1858x2), 제목(6col=4001x6), 작성(483), 서명(921+921), 검토(509), 서명x3, 승인(469), 서명(1012) */}
        <table style={{...tbl, marginBottom:'3px'}}>
          <colgroup>
            <col style={{width:'15%'}}/>
            <col style={{width:'24%'}}/>
            <col style={{width:'7%'}}/>
            <col style={{width:'13%'}}/>
            <col style={{width:'7%'}}/>
            <col style={{width:'13%'}}/>
            <col style={{width:'7%'}}/>
            <col style={{width:'14%'}}/>
          </colgroup>
          <tbody>
            <tr style={{height:'18px'}}>
              <td style={{...S.thGray}}>문 서 번 호</td>
              <td style={{...S.thGray}}>제품규격 (Be품)</td>
              <td style={{...S.thGray, whiteSpace:'pre-line'}}>{'작\n성'}</td>
              <td style={{...S.td, ...S.center}}></td>
              <td style={{...S.thGray, whiteSpace:'pre-line'}}>{'검\n토'}</td>
              <td style={{...S.td, ...S.center}}></td>
              <td style={{...S.thGray, whiteSpace:'pre-line'}}>{'승\n인'}</td>
              <td style={{...S.td, ...S.center}}></td>
            </tr>
            <tr style={{height:'16px'}}>
              <td style={{...S.td, ...S.center, fontSize:'7.5pt'}}>{d.docNo?.replace('R41','R32')}</td>
              <td style={{...S.td, ...S.center, fontWeight:'bold'}}>{d.productName}</td>
              <td style={{...S.td, ...S.center, fontSize:'7.5pt', whiteSpace:'pre-line'}}>{'작\n성'}</td>
              <td style={{...S.td, ...S.center, fontSize:'7.5pt'}}>/ {d.drafter}</td>
              <td style={{...S.td, ...S.center, fontSize:'7.5pt', whiteSpace:'pre-line'}}>{'검\n토'}</td>
              <td style={{...S.td, ...S.center, fontSize:'7.5pt'}}>/ {d.reviewer}</td>
              <td style={{...S.td, ...S.center, fontSize:'7.5pt', whiteSpace:'pre-line'}}>{'승\n인'}</td>
              <td style={{...S.td, ...S.center, fontSize:'7.5pt'}}>/ {d.approver}</td>
            </tr>
            <tr style={{height:'14px'}}>
              <td style={{...S.thGray, fontSize:'7.5pt'}}>제정일자</td>
              <td style={{...S.td, ...S.center, fontSize:'7.5pt'}}>{d.establishDate}</td>
              <td style={{...S.thGray, fontSize:'7.5pt'}}>개정일자</td>
              <td colSpan={2} style={{...S.td, ...S.center, fontSize:'7.5pt'}}>{d.revisionDate}</td>
              <td style={{...S.thGray, fontSize:'7.5pt'}}>개정번호</td>
              <td style={{...S.td, ...S.center, fontSize:'7.5pt'}}>{d.revisionNo}</td>
              <td style={{...S.td, ...S.center, fontSize:'7.5pt'}}>1/1</td>
            </tr>
          </tbody>
        </table>

        {/* 공정도 + 분석표 - 원본 비율: 공정도(3col=2236x3=22%), 분석점(2col=1134x2=11%), 분석항목(2col=1701x2=17%), 분석법(3col=17%), 규격(4col=17%), 비고(3col=17%) */}
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
              <td style={{...S.td, ...S.center, fontWeight:'bold', fontSize:'11pt'}}>6</td>
              <td style={{...S.td, verticalAlign:'top', lineHeight:'2', padding:'4px'}}>
                {(d.specs || []).filter(s=>s.item).map((s,i)=><div key={i}>{s.item}</div>)}
              </td>
              <td style={{...S.td, verticalAlign:'top', lineHeight:'2', padding:'4px'}}>
                {(d.specs || []).filter(s=>s.method).map((s,i)=><div key={i}>{s.method}</div>)}
              </td>
              <td style={{...S.td, verticalAlign:'top', lineHeight:'2', padding:'4px'}}>
                {(d.specs || []).filter(s=>s.spec).map((s,i)=>(
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
            <tr style={{height:'16px'}}>
              <td style={{...S.thGray}}>개  정</td>
              <td style={{...S.td}}>{d.revisionNote}</td>
            </tr>
            <tr style={{height:'16px'}}>
              <td style={{...S.thGray}}>배포처</td>
              <td style={{...S.td}}>{d.distributionQuality}</td>
            </tr>
          </tbody>
        </table>
        <div style={{fontSize:'7.5pt', marginTop:'4px', fontFamily:"'맑은 고딕','Malgun Gothic',sans-serif"}}>FB01-07(1)</div>
      </div>

      {/* ══════════════ PAGE 6 : 품질보증규격 ══════════════ */}
      <div className="print-page" style={pageStyle}>
        <div style={{textAlign:'right', fontSize:'9pt', fontWeight:'bold', fontFamily:"'맑은 고딕','Malgun Gothic',sans-serif", marginBottom:'3px'}}>그린케미칼(주)</div>

        {/* 헤더 - 원본 비율: 문서번호(3col=1684x3=16%), 제목(5col=4240x5=42%), 작성(2col=549x2=11%), 서명(832), 검토(2col=548x2=11%), 서명x3, 승인(558), 서명x2 */}
        <table style={{...tbl, marginBottom:'3px'}}>
          <colgroup>
            <col style={{width:'16%'}}/>
            <col style={{width:'28%'}}/>
            <col style={{width:'8%'}}/>
            <col style={{width:'13%'}}/>
            <col style={{width:'8%'}}/>
            <col style={{width:'13%'}}/>
            <col style={{width:'7%'}}/>
            <col style={{width:'7%'}}/>
          </colgroup>
          <tbody>
            <tr style={{height:'18px'}}>
              <td style={{...S.thGray}}>문 서 번 호</td>
              <td style={{...S.thGray}}>품질보증규격</td>
              <td style={{...S.thGray, whiteSpace:'pre-line'}}>{'작\n성'}</td>
              <td style={{...S.td, ...S.center}}></td>
              <td style={{...S.thGray, whiteSpace:'pre-line'}}>{'검\n토'}</td>
              <td style={{...S.td, ...S.center}}></td>
              <td style={{...S.thGray, whiteSpace:'pre-line'}}>{'승\n인'}</td>
              <td style={{...S.td, ...S.center}}></td>
            </tr>
            <tr style={{height:'16px'}}>
              <td style={{...S.td, ...S.center, fontSize:'7.5pt'}}>{d.qaDocNo}</td>
              <td style={{...S.td, ...S.center, fontWeight:'bold'}}>KONION {d.productName}</td>
              <td style={{...S.td, ...S.center, fontSize:'7.5pt', whiteSpace:'pre-line'}}>{'작\n성'}</td>
              <td style={{...S.td, ...S.center, fontSize:'7.5pt'}}>/ {d.drafter}</td>
              <td style={{...S.td, ...S.center, fontSize:'7.5pt', whiteSpace:'pre-line'}}>{'검\n토'}</td>
              <td style={{...S.td, ...S.center, fontSize:'7.5pt'}}>/ {d.reviewer}</td>
              <td style={{...S.td, ...S.center, fontSize:'7.5pt', whiteSpace:'pre-line'}}>{'승\n인'}</td>
              <td style={{...S.td, ...S.center, fontSize:'7.5pt'}}>/ {d.approver}</td>
            </tr>
            <tr style={{height:'14px'}}>
              <td style={{...S.thGray, fontSize:'7.5pt'}}>제정일자</td>
              <td style={{...S.td, ...S.center, fontSize:'7.5pt'}}>{d.establishDate}</td>
              <td style={{...S.thGray, fontSize:'7.5pt'}}>개정일자</td>
              <td colSpan={2} style={{...S.td, ...S.center, fontSize:'7.5pt'}}>{d.qaRevisionDate || d.revisionDate}</td>
              <td style={{...S.thGray, fontSize:'7.5pt'}}>개정번호</td>
              <td style={{...S.td, ...S.center, fontSize:'7.5pt'}}>{d.qaRevisionNo || d.revisionNo}</td>
              <td style={{...S.td, ...S.center, fontSize:'7.5pt'}}>1/1</td>
            </tr>
          </tbody>
        </table>

        {/* 품질보증 규격표 - 원본: 구분/분석항목(4col=2471x4=25%), 제품명칸들(나머지 75%) */}
        <table style={{...tbl, marginBottom:'3px'}}>
          <colgroup>
            <col style={{width:'25%'}}/>
            <col style={{width:'75%'}}/>
          </colgroup>
          <tbody>
            <tr style={{height:'18px'}}>
              <td style={{...S.thGray, whiteSpace:'pre-line', textAlign:'center'}}>{'구 분\n분석항목'}</td>
              <td style={{...S.thGray, ...S.center}}>{d.productName}</td>
            </tr>
            {(d.qaSpecs || []).map((row, i) => (
              <tr key={i} style={{height:'18px'}}>
                <td style={{...S.td, ...S.center}}>{row.item}</td>
                <td style={{...S.td, ...S.center}}><Val value={row.spec} changed={row.changed}/></td>
              </tr>
            ))}
          </tbody>
        </table>

        <table style={{...tbl, marginBottom:'3px'}}>
          <tbody>
            <tr>
              <td style={{...S.td, padding:'6px 8px', whiteSpace:'pre-line', fontSize:'8.5pt'}}>
                {`특기사항\n* 제품보존기간 : ${d.qaPreservation || '2 년'}`}
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
