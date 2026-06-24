import React from 'react';

function Val({ value, changed }) {
  if (!value) return null;
  if (changed) return <span style={{fontWeight:'bold',fontStyle:'italic',textDecoration:'underline'}}>{value}</span>;
  return <span>{value}</span>;
}

export default function PrintPreview({ data }) {
  if (!data) return <div>데이터 없음</div>;

  const d = data;
  const fc = d.flowConditions || {};
  const docLabel = (d.docType === 'Be품') ? '제조법 문서 (Be품)' : '제조법 문서';

  const matRows = [...(d.materials || [])];
  while (matRows.length < 10) matRows.push({ order:'', name:'', amount:'', note:'', changed:false });

  const specRows = [...(d.specs || [])];
  while (specRows.length < 8) specRows.push({ order:'', item:'', spec:'', method:'', changed:false });

  const specForAnalysis = (d.specs || []).filter(s => s.item && s.spec);

  const page = {
    width:'210mm', minHeight:'290mm', margin:'0 auto 16px',
    padding:'7mm 9mm', background:'white', boxSizing:'border-box',
    boxShadow:'0 2px 8px rgba(0,0,0,0.15)',
  };

  const tbl = { width:'100%', borderCollapse:'collapse', tableLayout:'fixed', marginBottom:3 };

  const td = { border:'1px solid #000', padding:'2px 4px', fontSize:'8.5pt',
    fontFamily:"'맑은 고딕','Malgun Gothic',sans-serif", verticalAlign:'middle' };
  const th = { ...td, background:'#d9d9d9', fontWeight:'bold', textAlign:'center' };
  const tc = { textAlign:'center' };

  const CompanyTop = () => (
    <div style={{textAlign:'right',fontSize:'9pt',fontWeight:'bold',
      fontFamily:"'맑은 고딕','Malgun Gothic',sans-serif",marginBottom:2}}>그린케미칼(주)</div>
  );

  const CompanyBottom = () => (
    <div style={{textAlign:'center',fontSize:'9pt',fontWeight:'bold',
      fontFamily:"'맑은 고딕','Malgun Gothic',sans-serif",marginTop:4}}>그린케미칼(주)</div>
  );

  const FooterCode = ({ code }) => (
    <div style={{fontSize:'7pt',marginTop:3,fontFamily:"'맑은 고딕','Malgun Gothic',sans-serif",color:'#444'}}>{code}</div>
  );

  const MainHeader = ({ page: pg }) => (
    <table style={tbl}>
      <colgroup>
        <col style={{width:'13%'}}/><col style={{width:'35%'}}/><col style={{width:'7%'}}/>
        <col style={{width:'10%'}}/><col style={{width:'7%'}}/><col style={{width:'10%'}}/>
        <col style={{width:'7%'}}/><col style={{width:'11%'}}/>
      </colgroup>
      <tbody>
        <tr style={{height:20}}>
          <td style={th}>문 서 번 호</td>
          <td style={th}>{docLabel}</td>
          <td style={th}>작성</td><td style={td}></td>
          <td style={th}>검토</td><td style={td}></td>
          <td style={th}>승인</td><td style={td}></td>
        </tr>
        <tr style={{height:18}}>
          <td style={{...td,...tc,fontSize:'7.5pt'}}>{d.docNo}</td>
          <td style={{...td,...tc,fontWeight:'bold'}}>{d.productName}</td>
          <td style={{...td,...tc,fontSize:'7.5pt'}}>작성</td>
          <td style={{...td,...tc,fontSize:'7.5pt'}}>/ {d.drafter}</td>
          <td style={{...td,...tc,fontSize:'7.5pt'}}>검토</td>
          <td style={{...td,...tc,fontSize:'7.5pt'}}>/ {d.reviewer}</td>
          <td style={{...td,...tc,fontSize:'7.5pt'}}>승인</td>
          <td style={{...td,...tc,fontSize:'7.5pt'}}>/ {d.approver}</td>
        </tr>
        <tr style={{height:15}}>
          <td style={{...th,fontSize:'7.5pt'}}>제정일자</td>
          <td style={{...td,...tc,fontSize:'7.5pt'}}>{d.establishDate}</td>
          <td style={{...th,fontSize:'7.5pt'}}>개정일자</td>
          <td colSpan={2} style={{...td,...tc,fontSize:'7.5pt'}}>{d.revisionDate}</td>
          <td style={{...th,fontSize:'7.5pt'}}>개정번호</td>
          <td style={{...td,...tc,fontSize:'7.5pt'}}>{d.revisionNo}</td>
          <td style={{...td,...tc,fontSize:'7.5pt'}}>{pg}/4</td>
        </tr>
      </tbody>
    </table>
  );

  const SubHeader = ({ page: pg }) => (
    <table style={tbl}>
      <colgroup><col style={{width:'50%'}}/><col style={{width:'50%'}}/></colgroup>
      <tbody>
        <tr style={{height:18}}>
          <td style={th}>{docLabel}</td>
          <td style={{...td,...tc,fontWeight:'bold'}}>{d.productName}</td>
        </tr>
        <tr style={{height:14}}>
          <td style={{...th,fontSize:'7.5pt'}}>제정일자</td>
          <td style={{...td,fontSize:'7.5pt'}}>
            {d.establishDate} 개정일자 {d.revisionDate} 개정번호 {d.revisionNo} 페이지 {pg}/4
          </td>
        </tr>
      </tbody>
    </table>
  );

  return (
    <div id="print-area">

      {/* PAGE 1/4 */}
      <div className="print-page" style={page}>
        <CompanyTop />
        <MainHeader page="1" />

        <table style={tbl}>
          <colgroup>
            <col style={{width:'7%'}}/><col style={{width:'44%'}}/>
            <col style={{width:'24%'}}/><col style={{width:'25%'}}/>
          </colgroup>
          <tbody>
            <tr><td colSpan={4} style={{...td,fontWeight:'bold',background:'#f2f2f2'}}>1.0 Material Balance</td></tr>
            <tr style={{height:18}}>
              <td style={th}></td>
              <td style={th}>원       료       명</td>
              <td style={th}>투   입   량 (kg)</td>
              <td style={th}>비      고</td>
            </tr>
            {matRows.map((r, i) => (
              <tr key={i} style={{height: r.name ? 20 : 8}}>
                <td style={{...td,...tc}}>{r.order}</td>
                <td style={{...td,...tc}}><Val value={r.name} changed={r.changed}/></td>
                <td style={{...td,...tc}}><Val value={r.amount} changed={r.changed}/></td>
                <td style={{...td,...tc}}>{r.note}</td>
              </tr>
            ))}
            <tr style={{height:18}}>
              <td style={td}></td>
              <td style={{...td,...tc,fontWeight:'bold'}}>TOTAL</td>
              <td style={{...td,...tc,fontWeight:'bold',fontStyle:'italic',textDecoration:'underline'}}>{d.totalAmount}</td>
              <td style={td}></td>
            </tr>
          </tbody>
        </table>

        <table style={tbl}>
          <colgroup>
            <col style={{width:'7%'}}/><col style={{width:'44%'}}/>
            <col style={{width:'24%'}}/><col style={{width:'25%'}}/>
          </colgroup>
          <tbody>
            <tr><td colSpan={4} style={{...td,fontWeight:'bold',background:'#f2f2f2'}}>2.0 제품규격</td></tr>
            <tr style={{height:18}}>
              <td style={th}></td>
              <td style={th}>항          목</td>
              <td style={th}>규          격</td>
              <td style={th}>시   험   법</td>
            </tr>
            {specRows.map((r, i) => (
              <tr key={i} style={{height: r.item ? 20 : 8}}>
                <td style={{...td,...tc}}>{r.order}</td>
                <td style={{...td,...tc}}>{r.item}</td>
                <td style={{...td,...tc}}><Val value={r.spec} changed={r.changed}/></td>
                <td style={{...td,...tc}}>{r.method}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <table style={tbl}>
          <colgroup><col style={{width:'8%'}}/><col style={{width:'92%'}}/></colgroup>
          <tbody>
            <tr style={{height:16}}><td style={th}>개  정</td><td style={td}>{d.revisionNote}</td></tr>
            <tr style={{height:16}}><td style={th}>배포처</td><td style={td}>{d.distributionMfg}</td></tr>
          </tbody>
        </table>
        <FooterCode code="FB01-06(1)" />
        <CompanyBottom />
      </div>

      {/* PAGE 2/4 */}
      <div className="print-page" style={page}>
        <SubHeader page="2" />
        <table style={tbl}>
          <colgroup><col style={{width:'21%'}}/><col style={{width:'79%'}}/></colgroup>
          <tbody>
            <tr><td colSpan={2} style={{...td,fontWeight:'bold',background:'#f2f2f2'}}>3.0 작업개요</td></tr>
            <tr style={{height:18}}><td style={th}>FLOW SHEET</td><td style={th}>제    조    조    건</td></tr>
            <tr>
              <td style={{...td,verticalAlign:'top',textAlign:'center',fontSize:'8pt',lineHeight:'2',padding:'6px 4px',whiteSpace:'pre-line'}}>
                {fc.starter || 'Starter'}{'  '}{fc.catalyst || '촉매'}{'\n'}
                {'↓\n1  원료사입\n↓\n2  치   환\n↓\n3  승   온\n'}
                {fc.reactant || 'Reactant'}{'\n↓\n4  반   응\n↓\n5  숙    성'}
              </td>
              <td style={{...td,verticalAlign:'top',fontSize:'8.5pt',lineHeight:'1.8',padding:'8px',whiteSpace:'pre-line'}}>
                {'<준 비> : 사용할 중합조가 충분히 세척, 건조되어 있는가를 확인한다.\n\n'}
                {'1. 원료사입\n    지시량의 '}{fc.starter||'Starter'}{', '}{fc.catalyst||'촉매'}{'를 사입한 후 교반을 실시한다.\n\n'}
                {'2. 치   환\n    0 kg/cm²G  ↔  -1 kg/cm²G 로 질소감압치환을 3회 실시한다\n\n'}
                {'3. 승  온\n    반응온도까지 승온한다.('}{fc.reactionTemp||140}{'℃)\n\n'}
                {'4. 반   응\n    * 반응온도 : '}{fc.reactionTemp||140}{' ± 5℃\n'}
                {'    * 반응압력 : '}{fc.reactionPressure||4}{' kg/cm²G 이하\n\n'}
                {'5. 숙   성\n    * 숙성온도 : '}{fc.agingTemp||140}{' ± 5℃\n'}
                {'    * 숙성압력 : '}{fc.agingPressure||4}{' kg/cm²G 이하\n'}
                {'    * 숙성시간 : 동일온도에서 압력평형상태가 30분간 지속될 때 까지'}
              </td>
            </tr>
          </tbody>
        </table>
        <FooterCode code="FB01-06(1)" />
        <CompanyBottom />
      </div>

      {/* PAGE 3/4 */}
      <div className="print-page" style={page}>
        <SubHeader page="3" />
        <table style={tbl}>
          <colgroup><col style={{width:'21%'}}/><col style={{width:'79%'}}/></colgroup>
          <tbody>
            <tr><td colSpan={2} style={{...td,fontWeight:'bold',background:'#f2f2f2'}}>3.0 작업개요</td></tr>
            <tr style={{height:18}}><td style={th}>FLOW SHEET</td><td style={th}>제    조    조    건</td></tr>
            <tr>
              <td style={{...td,verticalAlign:'top',textAlign:'center',fontSize:'8pt',lineHeight:'2',padding:'6px 4px',whiteSpace:'pre-line'}}>
                {'6  분   석\n↓\n7  냉   각\n↓\n8  탈   취\n↓\n9  포  장'}
              </td>
              <td style={{...td,verticalAlign:'top',fontSize:'8.5pt',lineHeight:'1.8',padding:'8px'}}>
                <div>{'6. 분   석'}</div>
                <div style={{marginLeft:16}}>{'숙성이 종료되면 다음 항목을 분석한다.'}</div>
                {specForAnalysis.map((s, i) => (
                  <div key={i} style={{marginLeft:32}}>{s.item.trim()} : {s.spec}</div>
                ))}
                <div style={{marginTop:8}}>{'7. 냉   각'}</div>
                <div style={{marginLeft:16}}>{'분석치가 규격내인 것을 확인한 후 탈취온도까지 냉각한다.'}</div>
                <div style={{marginTop:8}}>{'8. 탈   취'}</div>
                <div style={{marginLeft:16}}>{'탈취온도('}{fc.deodorTemp||80}{'±5℃)에서 30분간 질소로 탈취한다.'}</div>
                <div style={{marginTop:8}}>{'9. 포  장'}</div>
                <div style={{marginLeft:16}}>{'본 제품은 Be품이므로 제품의 변질을 방지하기 위하여 질소를 충진하여 포장한다.(포장온도 : '}{fc.packingTemp||60}{'℃ 이하)'}</div>
              </td>
            </tr>
          </tbody>
        </table>
        <FooterCode code="FB01-06(1)" />
        <CompanyBottom />
      </div>

      {/* PAGE 4/4 */}
      <div className="print-page" style={page}>
        <SubHeader page="4" />
        <table style={tbl}>
          <tbody>
            <tr>
              <td style={{...td,lineHeight:'1.9',padding:'8px 10px',fontSize:'8.5pt'}}>
                <div><strong>4.0 제조기계</strong></div>
                <div style={{marginLeft:16}}>{fc.reactorNo||'V-302'} Reactor Type</div>
                <div style={{marginTop:8}}><strong>5.0 유해물질명</strong></div>
                <div style={{marginLeft:16}}>{fc.hazardous||'해당없음'}</div>
                <div style={{marginTop:8}}><strong>6.0 포장용기</strong></div>
                <div style={{marginLeft:16}}>{fc.packageType||'Steel Drum (Net.Wt. : 230 kg)'}</div>
                <div style={{marginTop:8}}><strong>7.0 저장, 보존, 취급, 폐기에 관한 사항</strong></div>
                <div style={{marginLeft:16}}><strong>7.1 저장 및 보존</strong></div>
                <div style={{marginLeft:32}}>{fc.storage}</div>
                <div style={{marginLeft:16,marginTop:4}}><strong>7.2 취  급</strong></div>
                <div style={{marginLeft:32}}>{fc.handling}</div>
                <div style={{marginLeft:16,marginTop:4}}><strong>7.3 폐  기</strong></div>
                <div style={{marginLeft:32}}>{fc.disposal}</div>
              </td>
            </tr>
          </tbody>
        </table>
        <FooterCode code="FB01-06(1)" />
        <CompanyBottom />
      </div>

      {/* PAGE 5 : 제품보증규격 */}
      <div className="print-page" style={page}>
        <CompanyTop />
        <table style={tbl}>
          <colgroup>
            <col style={{width:'13%'}}/><col style={{width:'30%'}}/><col style={{width:'7%'}}/>
            <col style={{width:'12%'}}/><col style={{width:'7%'}}/><col style={{width:'12%'}}/>
            <col style={{width:'7%'}}/><col style={{width:'12%'}}/>
          </colgroup>
          <tbody>
            <tr style={{height:20}}>
              <td style={th}>문 서 번 호</td><td style={th}>제품규격 (Be품)</td>
              <td style={th}>작성</td><td style={td}></td>
              <td style={th}>검토</td><td style={td}></td>
              <td style={th}>승인</td><td style={td}></td>
            </tr>
            <tr style={{height:18}}>
              <td style={{...td,...tc,fontSize:'7.5pt'}}>{d.docNo ? d.docNo.replace('R41','R32') : ''}</td>
              <td style={{...td,...tc,fontWeight:'bold'}}>{d.productName}</td>
              <td style={{...td,...tc,fontSize:'7.5pt'}}>작성</td>
              <td style={{...td,...tc,fontSize:'7.5pt'}}>/ {d.drafter}</td>
              <td style={{...td,...tc,fontSize:'7.5pt'}}>검토</td>
              <td style={{...td,...tc,fontSize:'7.5pt'}}>/ {d.reviewer}</td>
              <td style={{...td,...tc,fontSize:'7.5pt'}}>승인</td>
              <td style={{...td,...tc,fontSize:'7.5pt'}}>/ {d.approver}</td>
            </tr>
            <tr style={{height:15}}>
              <td style={{...th,fontSize:'7.5pt'}}>제정일자</td>
              <td style={{...td,...tc,fontSize:'7.5pt'}}>{d.establishDate}</td>
              <td style={{...th,fontSize:'7.5pt'}}>개정일자</td>
              <td colSpan={2} style={{...td,...tc,fontSize:'7.5pt'}}>{d.revisionDate}</td>
              <td style={{...th,fontSize:'7.5pt'}}>개정번호</td>
              <td style={{...td,...tc,fontSize:'7.5pt'}}>{d.revisionNo}</td>
              <td style={{...td,...tc,fontSize:'7.5pt'}}>1/1</td>
            </tr>
          </tbody>
        </table>

        <table style={tbl}>
          <colgroup>
            <col style={{width:'22%'}}/><col style={{width:'11%'}}/><col style={{width:'17%'}}/>
            <col style={{width:'17%'}}/><col style={{width:'17%'}}/><col style={{width:'16%'}}/>
          </colgroup>
          <tbody>
            <tr style={{height:18}}>
              <td style={th}>공  정  도</td><td style={th}>분 석 점</td>
              <td style={th}>분 석 항 목</td><td style={th}>분 석 법</td>
              <td style={th}>규    격</td><td style={th}>비    고</td>
            </tr>
            <tr>
              <td style={{...td,textAlign:'center',fontSize:'8pt',lineHeight:'2',padding:'6px 4px',whiteSpace:'pre-line',verticalAlign:'middle'}}>
                {'1  원료사입\n2  치    환\n3  승    온\n4  반    응\n5  숙    성\n6  분    석\n7  냉    각\n8  탈    취\n9  포    장'}
              </td>
              <td style={{...td,...tc,fontWeight:'bold',fontSize:'11pt'}}>6</td>
              <td style={{...td,verticalAlign:'top',lineHeight:'2',padding:'4px'}}>
                {(d.specs||[]).filter(s=>s.item).map((s,i)=><div key={i}>{s.item}</div>)}
              </td>
              <td style={{...td,verticalAlign:'top',lineHeight:'2',padding:'4px'}}>
                {(d.specs||[]).filter(s=>s.method).map((s,i)=><div key={i}>{s.method}</div>)}
              </td>
              <td style={{...td,verticalAlign:'top',lineHeight:'2',padding:'4px'}}>
                {(d.specs||[]).filter(s=>s.spec).map((s,i)=>(
                  <div key={i}><Val value={s.spec} changed={s.changed}/></div>
                ))}
              </td>
              <td style={td}></td>
            </tr>
          </tbody>
        </table>

        <table style={tbl}>
          <colgroup><col style={{width:'10%'}}/><col style={{width:'90%'}}/></colgroup>
          <tbody>
            <tr style={{height:16}}><td style={th}>개  정</td><td style={td}>{d.revisionNote}</td></tr>
            <tr style={{height:16}}><td style={th}>배포처</td><td style={td}>{d.distributionQuality}</td></tr>
          </tbody>
        </table>
        <FooterCode code="FB01-07(1)" />
        <CompanyBottom />
      </div>

      {/* PAGE 6 : 품질보증규격 */}
      <div className="print-page" style={page}>
        <CompanyTop />
        <table style={tbl}>
          <colgroup>
            <col style={{width:'14%'}}/><col style={{width:'30%'}}/><col style={{width:'7%'}}/>
            <col style={{width:'12%'}}/><col style={{width:'7%'}}/><col style={{width:'12%'}}/>
            <col style={{width:'7%'}}/><col style={{width:'11%'}}/>
          </colgroup>
          <tbody>
            <tr style={{height:20}}>
              <td style={th}>문 서 번 호</td><td style={th}>품질보증규격</td>
              <td style={th}>작성</td><td style={td}></td>
              <td style={th}>검토</td><td style={td}></td>
              <td style={th}>승인</td><td style={td}></td>
            </tr>
            <tr style={{height:18}}>
              <td style={{...td,...tc,fontSize:'7.5pt'}}>{d.qaDocNo}</td>
              <td style={{...td,...tc,fontWeight:'bold'}}>KONION {d.productName}</td>
              <td style={{...td,...tc,fontSize:'7.5pt'}}>작성</td>
              <td style={{...td,...tc,fontSize:'7.5pt'}}>/ {d.drafter}</td>
              <td style={{...td,...tc,fontSize:'7.5pt'}}>검토</td>
              <td style={{...td,...tc,fontSize:'7.5pt'}}>/ {d.reviewer}</td>
              <td style={{...td,...tc,fontSize:'7.5pt'}}>승인</td>
              <td style={{...td,...tc,fontSize:'7.5pt'}}>/ {d.approver}</td>
            </tr>
            <tr style={{height:15}}>
              <td style={{...th,fontSize:'7.5pt'}}>제정일자</td>
              <td style={{...td,...tc,fontSize:'7.5pt'}}>{d.establishDate}</td>
              <td style={{...th,fontSize:'7.5pt'}}>개정일자</td>
              <td colSpan={2} style={{...td,...tc,fontSize:'7.5pt'}}>{d.qaRevisionDate||d.revisionDate}</td>
              <td style={{...th,fontSize:'7.5pt'}}>개정번호</td>
              <td style={{...td,...tc,fontSize:'7.5pt'}}>{d.qaRevisionNo||d.revisionNo}</td>
              <td style={{...td,...tc,fontSize:'7.5pt'}}>1/1</td>
            </tr>
          </tbody>
        </table>

        <table style={tbl}>
          <colgroup><col style={{width:'25%'}}/><col style={{width:'75%'}}/></colgroup>
          <tbody>
            <tr style={{height:18}}>
              <td style={th}>구 분 / 분석항목</td>
              <td style={{...th,...tc}}>{d.productName}</td>
            </tr>
            {(d.qaSpecs||[]).map((r,i) => (
              <tr key={i} style={{height:18}}>
                <td style={{...td,...tc}}>{r.item}</td>
                <td style={{...td,...tc}}><Val value={r.spec} changed={r.changed}/></td>
              </tr>
            ))}
          </tbody>
        </table>

        <table style={tbl}>
          <tbody>
            <tr>
              <td style={{...td,padding:'6px 8px',fontSize:'8.5pt'}}>
                <div><strong>특기사항</strong></div>
                <div>* 제품보존기간 : {d.qaPreservation||'2 년'}</div>
              </td>
            </tr>
          </tbody>
        </table>

        <table style={tbl}>
          <colgroup><col style={{width:'13%'}}/><col style={{width:'87%'}}/></colgroup>
          <tbody>
            <tr style={{height:16}}><td style={th}>배 포 처</td><td style={td}>{d.qaDistribution}</td></tr>
          </tbody>
        </table>
      </div>

    </div>
  );
}
