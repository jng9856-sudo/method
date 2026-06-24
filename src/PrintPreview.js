import React, { useState, useEffect } from 'react';

const inp = {width:'100%',border:'1px solid #d1d5db',borderRadius:4,padding:'4px 8px',fontSize:13,outline:'none',boxSizing:'border-box',fontFamily:'inherit'};
const lbl = {display:'block',fontSize:12,fontWeight:600,color:'#555',marginBottom:3};
const thS = {border:'1px solid #ccc',padding:'6px 8px',fontWeight:700,fontSize:12,textAlign:'center',background:'#e8f0fe'};
const tdS = {border:'1px solid #ccc',padding:4};

function Section({title,children}){
  return(
    <div style={{background:'white',borderRadius:8,boxShadow:'0 1px 4px rgba(0,0,0,0.1)',overflow:'hidden'}}>
      <div style={{background:'#1a3a5c',color:'white',padding:'10px 16px',fontWeight:700,fontSize:14}}>{title}</div>
      <div style={{padding:16}}>{children}</div>
    </div>
  );
}
function Grid({cols=2,children}){
  return <div style={{display:'grid',gridTemplateColumns:`repeat(${cols},1fr)`,gap:12}}>{children}</div>;
}
function Field({label,children}){
  return <div><label style={lbl}>{label}</label>{children}</div>;
}
function Inp({value,onChange,placeholder}){
  return <input style={inp} value={value||''} onChange={onChange} placeholder={placeholder||''}/>;
}
function Btn({onClick,color,children}){
  return <button onClick={onClick} style={{background:color||'#3b82f6',color:'white',border:'none',borderRadius:4,padding:'5px 12px',cursor:'pointer',fontSize:13}}>{children}</button>;
}

const defaultData = {
  docNo:'KPXGC-R41-', docType:'Be품', productName:'',
  drafter:'', reviewer:'', approver:'',
  establishDate:'2009년 01월 15일', revisionDate:'', revisionNo:'',
  materials:[
    {order:'C',name:'',amount:'',note:'',changed:false},
    {order:'B',name:'',amount:'',note:'',changed:false},
    {order:'A',name:'',amount:'',note:'',changed:false},
    {order:'',name:'',amount:'',note:'',changed:false},
    {order:'',name:'',amount:'',note:'',changed:false},
  ],
  totalAmount:'',
  specs:[
    {order:'D',item:'외       관',spec:'투명균일액상',method:'KPS-R42-3007',changed:false},
    {order:'C',item:'색       상',spec:'',method:'KPS-R42-3009',changed:false},
    {order:'B',item:'수   분 (%)',spec:'',method:'KPS-R42-3003',changed:false},
    {order:'A',item:'평균분자량',spec:'',method:'KPS-R42-3067',changed:false},
    {order:'',item:'',spec:'',method:'',changed:false},
  ],
  flowConditions:{
    starter:'',catalyst:'',reactant:'',
    reactionTemp:'140',reactionPressure:'4',
    agingTemp:'140',agingPressure:'4',
    deodorTemp:'80',packingTemp:'60',
    reactorNo:'V-302',packageType:'Steel Drum (Net.Wt. : 230 kg)',
    storage:'옥내외에 저장하고 보존기간은 생산일로부터 1년으로 하며, 선입선출을 원칙으로 한다.',
    handling:'피부나 눈에 접촉시 약간의 자극을 줄 수 있으므로 보호구 및 안전장갑을 착용, 취급한다.',
    disposal:'폐기물관리법 제 25 조에 준한다.',
    hazardous:'해당없음',
  },
  revisionNote:'',
  distributionMfg:'케미칼생산팀 사본 1부',
  distributionQuality:'케미칼품질팀 사본 2부',
  qaDocNo:'KPXGC-R32-', qaRevisionDate:'', qaRevisionNo:'',
  qaSpecs:[
    {item:'외    관',spec:'',changed:false},
    {item:'색    상',spec:'',changed:false},
    {item:'수분 (%)',spec:'',changed:false},
    {item:'평균분자량',spec:'',changed:false},
  ],
  qaPreservation:'2 년',
  qaDistribution:'케미칼 품질팀 사본 1부',
  qaRevisionNote:'',
};

export default function ManufacturingForm({initialData,onDataChange}){
  const [data,setData]=useState(initialData||defaultData);
  useEffect(()=>{if(initialData)setData(initialData);},[initialData]);

  const upd=(f,v)=>{const n={...data,[f]:v};setData(n);onDataChange&&onDataChange(n);};
  const updN=(f,s,v)=>{const n={...data,[f]:{...data[f],[s]:v}};setData(n);onDataChange&&onDataChange(n);};
  const updR=(arr,i,k,v)=>{const n={...data,[arr]:data[arr].map((r,j)=>j===i?{...r,[k]:v}:r)};setData(n);onDataChange&&onDataChange(n);};
  const addR=(arr,t)=>{const n={...data,[arr]:[...data[arr],t]};setData(n);onDataChange&&onDataChange(n);};
  const delR=(arr,i)=>{const n={...data,[arr]:data[arr].filter((_,j)=>j!==i)};setData(n);onDataChange&&onDataChange(n);};

  return(
    <div style={{display:'flex',flexDirection:'column',gap:24}}>

      <Section title="📋 공통 헤더 정보">
        <Grid cols={3}>
          <Field label="문서 유형">
            <select style={inp} value={data.docType||'Be품'} onChange={e=>upd('docType',e.target.value)}>
              <option value="Be품">제조법 문서 (Be품)</option>
              <option value="일반">제조법 문서</option>
            </select>
          </Field>
          <Field label="문서번호 (제조법)"><Inp value={data.docNo} onChange={e=>upd('docNo',e.target.value)}/></Field>
          <Field label="제품명"><Inp value={data.productName} onChange={e=>upd('productName',e.target.value)} placeholder="예) PEG-400Be"/></Field>
          <Field label="제정일자"><Inp value={data.establishDate} onChange={e=>upd('establishDate',e.target.value)}/></Field>
          <Field label="개정일자"><Inp value={data.revisionDate} onChange={e=>upd('revisionDate',e.target.value)} placeholder="YYYY년 MM월 DD일"/></Field>
          <Field label="개정번호"><Inp value={data.revisionNo} onChange={e=>upd('revisionNo',e.target.value)} placeholder="예) 1"/></Field>
          <Field label="작성"><Inp value={data.drafter} onChange={e=>upd('drafter',e.target.value)}/></Field>
          <Field label="검토"><Inp value={data.reviewer} onChange={e=>upd('reviewer',e.target.value)}/></Field>
          <Field label="승인"><Inp value={data.approver} onChange={e=>upd('approver',e.target.value)}/></Field>
        </Grid>
      </Section>

      <Section title="1.0 Material Balance">
        <p style={{fontSize:12,color:'#666',marginBottom:8}}>※ 변경 항목 체크 시 <strong><em><u>굵음+기울임+밑줄</u></em></strong>로 표시됩니다.</p>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
          <thead><tr>
            <th style={thS}>순서</th><th style={thS}>원료명</th><th style={thS}>투입량(kg)</th>
            <th style={thS}>비고</th><th style={thS}>변경?</th><th style={thS}>삭제</th>
          </tr></thead>
          <tbody>
            {data.materials.map((r,i)=>(
              <tr key={i}>
                <td style={tdS}><input style={{...inp,width:50}} value={r.order} onChange={e=>updR('materials',i,'order',e.target.value)}/></td>
                <td style={tdS}><Inp value={r.name} onChange={e=>updR('materials',i,'name',e.target.value)}/></td>
                <td style={tdS}><Inp value={r.amount} onChange={e=>updR('materials',i,'amount',e.target.value)}/></td>
                <td style={tdS}><Inp value={r.note} onChange={e=>updR('materials',i,'note',e.target.value)}/></td>
                <td style={{...tdS,textAlign:'center'}}><input type="checkbox" checked={r.changed} onChange={e=>updR('materials',i,'changed',e.target.checked)}/></td>
                <td style={{...tdS,textAlign:'center'}}><Btn onClick={()=>delR('materials',i)} color="#ef4444">✕</Btn></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{display:'flex',gap:12,marginTop:8,alignItems:'center'}}>
          <Btn onClick={()=>addR('materials',{order:'',name:'',amount:'',note:'',changed:false})}>+ 행 추가</Btn>
          <label style={{fontSize:13}}>TOTAL (kg): <input style={{...inp,width:120,display:'inline-block'}} value={data.totalAmount} onChange={e=>upd('totalAmount',e.target.value)}/></label>
        </div>
      </Section>

      <Section title="2.0 제품규격">
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
          <thead><tr>
            <th style={thS}>순서</th><th style={thS}>항목</th><th style={thS}>규격</th>
            <th style={thS}>시험법</th><th style={thS}>변경?</th><th style={thS}>삭제</th>
          </tr></thead>
          <tbody>
            {data.specs.map((r,i)=>(
              <tr key={i}>
                <td style={tdS}><input style={{...inp,width:50}} value={r.order} onChange={e=>updR('specs',i,'order',e.target.value)}/></td>
                <td style={tdS}><Inp value={r.item} onChange={e=>updR('specs',i,'item',e.target.value)}/></td>
                <td style={tdS}><Inp value={r.spec} onChange={e=>updR('specs',i,'spec',e.target.value)}/></td>
                <td style={tdS}><Inp value={r.method} onChange={e=>updR('specs',i,'method',e.target.value)}/></td>
                <td style={{...tdS,textAlign:'center'}}><input type="checkbox" checked={r.changed} onChange={e=>updR('specs',i,'changed',e.target.checked)}/></td>
                <td style={{...tdS,textAlign:'center'}}><Btn onClick={()=>delR('specs',i)} color="#ef4444">✕</Btn></td>
              </tr>
            ))}
          </tbody>
        </table>
        <Btn onClick={()=>addR('specs',{order:'',item:'',spec:'',method:'',changed:false})} style={{marginTop:8}}>+ 행 추가</Btn>
      </Section>

      <Section title="3.0 작업개요 — 제조 조건">
        <Grid cols={2}>
          <Field label="개시제 (Starter)"><Inp value={data.flowConditions.starter} onChange={e=>updN('flowConditions','starter',e.target.value)}/></Field>
          <Field label="촉매"><Inp value={data.flowConditions.catalyst} onChange={e=>updN('flowConditions','catalyst',e.target.value)}/></Field>
          <Field label="반응물 (Reactant)"><Inp value={data.flowConditions.reactant} onChange={e=>updN('flowConditions','reactant',e.target.value)}/></Field>
          <Field label="반응온도 (℃)"><Inp value={data.flowConditions.reactionTemp} onChange={e=>updN('flowConditions','reactionTemp',e.target.value)}/></Field>
          <Field label="반응압력 (kg/cm²G 이하)"><Inp value={data.flowConditions.reactionPressure} onChange={e=>updN('flowConditions','reactionPressure',e.target.value)}/></Field>
          <Field label="숙성온도 (℃)"><Inp value={data.flowConditions.agingTemp} onChange={e=>updN('flowConditions','agingTemp',e.target.value)}/></Field>
          <Field label="숙성압력 (kg/cm²G 이하)"><Inp value={data.flowConditions.agingPressure} onChange={e=>updN('flowConditions','agingPressure',e.target.value)}/></Field>
          <Field label="탈취온도 (℃)"><Inp value={data.flowConditions.deodorTemp} onChange={e=>updN('flowConditions','deodorTemp',e.target.value)}/></Field>
          <Field label="포장온도 상한 (℃)"><Inp value={data.flowConditions.packingTemp} onChange={e=>updN('flowConditions','packingTemp',e.target.value)}/></Field>
        </Grid>
      </Section>

      <Section title="4.0 ~ 7.0 제조기계 / 유해물질 / 포장 / 저장">
        <Grid cols={2}>
          <Field label="제조기계 (Reactor No.)"><Inp value={data.flowConditions.reactorNo} onChange={e=>updN('flowConditions','reactorNo',e.target.value)}/></Field>
          <Field label="유해물질명"><Inp value={data.flowConditions.hazardous} onChange={e=>updN('flowConditions','hazardous',e.target.value)}/></Field>
          <Field label="포장용기"><Inp value={data.flowConditions.packageType} onChange={e=>updN('flowConditions','packageType',e.target.value)}/></Field>
        </Grid>
        <div style={{marginTop:10}}><Field label="7.1 저장 및 보존"><textarea style={{...inp,resize:'vertical'}} rows={2} value={data.flowConditions.storage} onChange={e=>updN('flowConditions','storage',e.target.value)}/></Field></div>
        <div style={{marginTop:10}}><Field label="7.2 취급"><textarea style={{...inp,resize:'vertical'}} rows={2} value={data.flowConditions.handling} onChange={e=>updN('flowConditions','handling',e.target.value)}/></Field></div>
        <div style={{marginTop:10}}><Field label="7.3 폐기"><Inp value={data.flowConditions.disposal} onChange={e=>updN('flowConditions','disposal',e.target.value)}/></Field></div>
      </Section>

      <Section title="개정 내용 / 배포처">
        <Grid cols={3}>
          <Field label="개정 내용"><Inp value={data.revisionNote} onChange={e=>upd('revisionNote',e.target.value)}/></Field>
          <Field label="배포처 (제조법)"><Inp value={data.distributionMfg} onChange={e=>upd('distributionMfg',e.target.value)}/></Field>
          <Field label="배포처 (제품보증규격)"><Inp value={data.distributionQuality} onChange={e=>upd('distributionQuality',e.target.value)}/></Field>
        </Grid>
      </Section>

      <Section title="품질보증규격 (별도 문서)">
        <Grid cols={3}>
          <Field label="문서번호 (품질보증)"><Inp value={data.qaDocNo} onChange={e=>upd('qaDocNo',e.target.value)}/></Field>
          <Field label="개정일자"><Inp value={data.qaRevisionDate} onChange={e=>upd('qaRevisionDate',e.target.value)}/></Field>
          <Field label="개정번호"><Inp value={data.qaRevisionNo} onChange={e=>upd('qaRevisionNo',e.target.value)}/></Field>
        </Grid>
        <div style={{marginTop:12}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
            <thead><tr>
              <th style={thS}>항목</th><th style={thS}>규격</th><th style={thS}>변경?</th>
            </tr></thead>
            <tbody>
              {data.qaSpecs.map((r,i)=>(
                <tr key={i}>
                  <td style={tdS}><Inp value={r.item} onChange={e=>updR('qaSpecs',i,'item',e.target.value)}/></td>
                  <td style={tdS}><Inp value={r.spec} onChange={e=>updR('qaSpecs',i,'spec',e.target.value)}/></td>
                  <td style={{...tdS,textAlign:'center'}}><input type="checkbox" checked={r.changed} onChange={e=>updR('qaSpecs',i,'changed',e.target.checked)}/></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{marginTop:8}}><Btn onClick={()=>addR('qaSpecs',{item:'',spec:'',changed:false})}>+ 행 추가</Btn></div>
        </div>
        <div style={{marginTop:12}}>
          <Grid cols={3}>
            <Field label="제품보존기간"><Inp value={data.qaPreservation} onChange={e=>upd('qaPreservation',e.target.value)}/></Field>
            <Field label="배포처 (품질보증)"><Inp value={data.qaDistribution} onChange={e=>upd('qaDistribution',e.target.value)}/></Field>
            <Field label="개정 내용 (품질보증)"><Inp value={data.qaRevisionNote} onChange={e=>upd('qaRevisionNote',e.target.value)}/></Field>
          </Grid>
        </div>
      </Section>

    </div>
  );
}
