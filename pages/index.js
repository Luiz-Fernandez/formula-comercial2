import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Save, Download, Users, DollarSign, TrendingUp, AlertCircle, CheckCircle, Clock, Calendar, FileText, Bell, RefreshCw, Moon, Sun, Menu, Target, Star, ClipboardList, UserCheck, Award, ChevronRight, ChevronDown, Plus, LogOut, Lock, Eye, EyeOff, Loader, CloudOff } from 'lucide-react';

const API_URL = 'https://script.google.com/macros/s/AKfycbx-S-Aq_6M1BbJiaX-LH2Sgij1-zTlyGLV4G1sRi1RdN-Ij4EHJyx-u6xiZwLMDFuyz/exec';

const MASTER = { id: 1, username: 'luizfernandezf@gmail.com', password: 'Luiz3362@*', nome: 'Luiz Fernandez', tipo: 'admin', consultor: '', ativo: true };

export default function App() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [lf, setLf] = useState({ u: '', p: '' });
  const [le, setLe] = useState('');
  const [showP, setShowP] = useState(false);
  const [tab, setTab] = useState('dashboard');
  const [clientes, setCli] = useState([]);
  const [consultores, setCons] = useState([]);
  const [custos, setCust] = useState([]);
  const [lancamentos, setLanc] = useState([]);
  const [tarefas, setTar] = useState([]);
  const [metas, setMet] = useState([]);
  const [loading, setLoad] = useState(true);
  const [saving, setSaving] = useState(false);
  const [online, setOnline] = useState(true);
  const [mes, setMes] = useState(new Date().toISOString().slice(0,7));
  const [dark, setDark] = useState(false);
  const [sb, setSb] = useState(false);
  const [exp, setExp] = useState({c:1,o:1,a:1,s:1});
  const [toast, setToast] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoad(true);
    try {
      const res = await fetch(`${API_URL}?action=listAll`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCons(data.consultores || []);
      setCli(data.clientes || []);
      setCust(data.custos || []);
      setLanc(data.lancamentos || []);
      setTar(data.tarefas || []);
      setMet(data.metas || []);
      let us = data.usuarios || [];
      if (!us.find(u => u.id === 1)) { us = [MASTER, ...us]; await saveSheet('Usuarios', us); }
      setUsers(us);
      setOnline(true);
      const sess = typeof window !== 'undefined' ? localStorage.getItem('fc-session') : null;
      if (sess) { const s = JSON.parse(sess); const uu = us.find(x => x.id === s.id && x.ativo); if (uu) setUser(uu); }
    } catch (e) { console.error(e); setOnline(false); }
    setLoad(false);
  };

  const saveSheet = async (sheet, data) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}?action=save&sheet=${sheet}`, { method: 'POST', body: JSON.stringify(data) });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      setOnline(true);
      return true;
    } catch (e) { console.error(e); setOnline(false); return false; }
    finally { setSaving(false); }
  };

  const notify = m => { setToast(m); setTimeout(() => setToast(null), 2500); };
  const svCli = async d => { setCli(d); const ok = await saveSheet('Clientes', d); notify(ok ? 'Salvo!' : 'Erro!'); };
  const svCons = async d => { setCons(d); const ok = await saveSheet('Consultores', d); notify(ok ? 'Salvo!' : 'Erro!'); };
  const svCust = async d => { setCust(d); const ok = await saveSheet('Custos', d); notify(ok ? 'Salvo!' : 'Erro!'); };
  const svLanc = async d => { setLanc(d); const ok = await saveSheet('Lancamentos', d); notify(ok ? 'Salvo!' : 'Erro!'); };
  const svTar = async d => { setTar(d); const ok = await saveSheet('Tarefas', d); notify(ok ? 'Salvo!' : 'Erro!'); };
  const svMet = async d => { setMet(d); const ok = await saveSheet('Metas', d); notify(ok ? 'Salvo!' : 'Erro!'); };
  const svUsers = async d => { setUsers(d); const ok = await saveSheet('Usuarios', d); notify(ok ? 'Salvo!' : 'Erro!'); };

  const login = () => {
    const u = users.find(x => x.username === lf.u && x.password === lf.p && x.ativo);
    if (u) { setUser(u); setLe(''); if(typeof window !== 'undefined') localStorage.setItem('fc-session', JSON.stringify({ id: u.id })); }
    else setLe('Usuário ou senha inválidos');
  };
  const logout = () => { setUser(null); if(typeof window !== 'undefined') localStorage.removeItem('fc-session'); setTab('dashboard'); };

  const isAdm = user?.tipo === 'admin';
  const isFin = user?.tipo === 'financeiro';
  const isCons = user?.tipo === 'consultor';
  const canViewAll = isAdm || isFin;
  const canEditAll = isAdm;
  const uCons = user?.consultor || '';

  const getCli = () => canViewAll ? clientes : clientes.filter(c => c.cons === uCons);
  const getLanc = () => canViewAll ? lancamentos : lancamentos.filter(l => clientes.find(c => c.nome === l.cli)?.cons === uCons);

  const fmt = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
  const pct = v => `${((v || 0) * 100).toFixed(1)}%`;
  const fmtD = d => d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '-';
  const diasR = d => { if (!d) return null; const h = new Date(); h.setHours(0,0,0,0); return Math.ceil((new Date(d + 'T00:00:00') - h) / 86400000); };
  const statR = c => { const d = diasR(c.renov); if (d === null) return { l: '-', cor: 'gray' }; if (d < 0) return { l: `${Math.abs(d)}d atraso`, cor: 'red' }; if (d <= 30) return { l: `${d}d`, cor: 'orange' }; return { l: `${d}d`, cor: 'green' }; };
  const getCusCli = n => custos.filter(c => c.cli === n).reduce((s, c) => s + (+c.val || 0), 0);
  const getC = n => consultores.find(c => c.nome === n);

  const calc = l => {
    const cl = clientes.find(c => c.nome === l.cli);
    const co = getC(cl?.cons);
    const bruto = +l.bruto || 0;
    const liq = bruto * (1 - (+l.taxa || 0));
    const part = liq * (+cl?.pctFix || 0) + (+cl?.valFix || 0);
    const metaFat = +cl?.metaFat || 0;
    const atingiuMeta = metaFat > 0 ? bruto >= metaFat : l.meta;
    const bon = atingiuMeta ? liq * (+cl?.pctBonus || 0) + (+cl?.valBonus || 0) : 0;
    const tot = part + bon;
    // Custo time comercial
    const cusCloser = (+cl?.fixCloser || 0) + liq * (+cl?.pctCloser || 0);
    const cusSDR = (+cl?.fixSDR || 0) + liq * (+cl?.pctSDR || 0);
    const cusSocial = (+cl?.fixSocial || 0) + liq * (+cl?.pctSocial || 0);
    const cusTime = cusCloser + cusSDR + cusSocial;
    const cusOp = getCusCli(l.cli);
    const cusTot = cusOp + (l.status === 'Recebido' ? cusTime : 0);
    // Base para comissão = pago - custos operacionais - custo time
    const base = Math.max(0, (+l.pago || 0) - cusTot);
    const com = l.status === 'Recebido' ? base * (co?.pctCom || 0.2) : 0;
    return { ...l, liq, part, bon, tot, cusOp, cusTime, cusCloser, cusSDR, cusSocial, cusTot, base, com, cons: cl?.cons || '', atingiuMeta };
  };

  const resumo = () => {
    const lm = getLanc().filter(l => l.mes === mes).map(calc);
    return { aRec: lm.filter(l => ['A Faturar', 'Faturado'].includes(l.status)).reduce((s, l) => s + l.tot, 0), rec: lm.filter(l => l.status === 'Recebido').reduce((s, l) => s + (+l.pago || 0), 0), venc: lm.filter(l => l.status === 'Vencido').reduce((s, l) => s + l.tot, 0), cust: custos.reduce((s, c) => s + (+c.val || 0), 0), com: lm.reduce((s, l) => s + l.com, 0), lm };
  };

  const comCons = () => {
    const lm = getLanc().filter(l => l.mes === mes).map(calc);
    const pc = {};
    lm.forEach(l => { if (l.cons) { if (!pc[l.cons]) { const c = getC(l.cons); pc[l.cons] = { rec: 0, com: 0, pend: 0, pct: c?.pctCom || 0.2 }; } if (l.status === 'Recebido') { pc[l.cons].rec += +l.pago || 0; pc[l.cons].com += l.com; } else pc[l.cons].pend += l.tot; } });
    return Object.entries(pc).map(([n, d]) => ({ nome: n, ...d }));
  };

  const perf = () => (canViewAll ? consultores : consultores.filter(c => c.nome === uCons)).map(c => { const cl = clientes.filter(x => x.cons === c.nome); const at = cl.filter(x => x.status === 'Ativo').length; const lc = lancamentos.filter(l => clientes.find(x => x.nome === l.cli)?.cons === c.nome).map(calc); const rec = lc.filter(l => l.status === 'Recebido').reduce((s, l) => s + (+l.pago || 0), 0); const mt = metas.find(m => m.cons === c.nome && m.mes === mes); return { ...c, at, rec, tk: at > 0 ? rec / at : 0, com: lc.reduce((s, l) => s + l.com, 0), metaV: mt?.val || 0, ating: mt?.val > 0 ? rec / mt.val : 0 }; });

  const proj = () => { const p = []; const h = new Date(); const cl = getCli(); for (let i = 0; i < 6; i++) { const ms = new Date(h.getFullYear(), h.getMonth() + i, 1).toISOString().slice(0, 7); let r = 0; cl.filter(c => c.status === 'Ativo').forEach(c => { const ul = lancamentos.filter(l => l.cli === c.nome).sort((a, b) => b.mes.localeCompare(a.mes))[0]; r += (ul ? calc(ul).tot : 0) * (c.probRen || 1); }); p.push({ mes: ms, val: r }); } return p; };

  const inad = () => getLanc().filter(l => l.status === 'Vencido' || (l.status === 'Faturado' && l.venc && new Date(l.venc) < new Date())).map(l => ({ ...calc(l), dias: Math.ceil((new Date() - new Date(l.venc)) / 86400000) })).sort((a, b) => b.dias - a.dias);

  const rank = () => getCli().map(c => { const lc = lancamentos.filter(l => l.cli === c.nome).map(calc); const rec = lc.filter(l => l.status === 'Recebido').reduce((s, l) => s + (+l.pago || 0), 0); const sr = statR(c); return { ...c, rec, mg: rec - getCusCli(c.nome) * lc.length, risco: sr.cor === 'red' ? 'Alto' : sr.cor === 'orange' ? 'Médio' : c.nps < 7 ? 'Médio' : 'Baixo' }; }).sort((a, b) => b.rec - a.rec);

  const alertR = () => getCli().map(c => ({ ...c, ...statR(c) })).filter(c => c.cor === 'orange' || c.cor === 'red');

  const expCSV = () => { const r = resumo(); const csv = `\ufeffFÓRMULA COMERCIAL - ${mes}\n\nRecebido;${r.rec}\nCustos;${r.cust}\nComissões;${r.com}\nResultado;${r.rec - r.cust - r.com}`; const b = new Blob([csv], { type: 'text/csv;charset=utf-8;' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `fc_${mes}.csv`; a.click(); notify('Exportado!'); };

  const gold = dark ? '#d4af37' : '#996515';
  const t = { bg: dark ? '#09090b' : '#fafaf9', card: dark ? '#18181b' : '#fff', alt: dark ? '#27272a' : '#f4f4f5', txt: dark ? '#fafafa' : '#18181b', txt2: dark ? '#a1a1aa' : '#71717a', txt3: dark ? '#52525b' : '#a1a1aa', brd: dark ? '#27272a' : '#e4e4e7', gold, goldBg: dark ? 'rgba(212,175,55,.15)' : 'rgba(153,101,21,.1)', grn: '#22c55e', grnBg: dark ? 'rgba(34,197,94,.2)' : 'rgba(34,197,94,.1)', red: '#ef4444', redBg: dark ? 'rgba(239,68,68,.2)' : 'rgba(239,68,68,.1)', org: '#f59e0b', orgBg: dark ? 'rgba(245,158,11,.2)' : 'rgba(245,158,11,.1)', pur: '#a855f7', purBg: dark ? 'rgba(168,85,247,.2)' : 'rgba(168,85,247,.1)' };
  const s = { card: { background: t.card, border: `1px solid ${t.brd}`, borderRadius: 14, padding: 16 }, inp: { width: '100%', padding: '10px 12px', background: t.card, border: `1px solid ${t.brd}`, borderRadius: 8, color: t.txt, fontSize: 14, outline: 'none' }, btn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: dark ? '#fff' : '#18181b', color: dark ? '#18181b' : '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }, lbl: { display: 'block', fontSize: 10, fontWeight: 600, color: t.txt3, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }, ttl: { fontSize: 16, fontWeight: 600, color: t.txt, marginBottom: 16 } };
  const Badge = ({ children, c = 'gray' }) => { const x = { gray: { bg: t.alt, txt: t.txt2 }, green: { bg: t.grnBg, txt: t.grn }, red: { bg: t.redBg, txt: t.red }, orange: { bg: t.orgBg, txt: t.org }, purple: { bg: t.purBg, txt: t.pur } }[c]; return <span style={{ padding: '4px 8px', background: x.bg, color: x.txt, borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{children}</span>; };
  const Logo = () => <svg viewBox="0 0 200 55" style={{ width: 110 }}><text x="100" y="22" textAnchor="middle" style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 300, letterSpacing: 4 }} fill={t.txt}>FÓRMULA</text><text x="100" y="44" textAnchor="middle" style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, letterSpacing: 2 }} fill={t.txt}>COMERCIAL</text><line x1="70" y1="52" x2="130" y2="52" stroke={t.gold} strokeWidth="2" /></svg>;
  const Toast = () => toast && <div style={{ position: 'fixed', bottom: 20, right: 20, padding: '12px 20px', background: toast.includes('Erro') ? t.red : t.grn, color: '#fff', borderRadius: 8, fontWeight: 600, zIndex: 999, display: 'flex', alignItems: 'center', gap: 6 }}>{saving && <Loader size={14} className="spin" />}{toast}</div>;

  if (!user) return <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
    <div style={{ ...s.card, width: '100%', maxWidth: 360, padding: 28 }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}><Logo /><p style={{ color: t.txt2, marginTop: 10, fontSize: 13 }}>Faça login</p></div>
      {!online && <div style={{ padding: 10, background: t.redBg, borderRadius: 8, marginBottom: 14, color: t.red, fontSize: 12, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><CloudOff size={14} />Sem conexão</div>}
      {le && <div style={{ padding: 10, background: t.redBg, borderRadius: 8, marginBottom: 14, color: t.red, fontSize: 12, textAlign: 'center' }}>{le}</div>}
      <div style={{ marginBottom: 14 }}><label style={s.lbl}>E-mail</label><input style={s.inp} value={lf.u} onChange={e => setLf({ ...lf, u: e.target.value })} onKeyDown={e => e.key === 'Enter' && login()} /></div>
      <div style={{ marginBottom: 18 }}><label style={s.lbl}>Senha</label><div style={{ position: 'relative' }}><input style={{ ...s.inp, paddingRight: 40 }} type={showP ? 'text' : 'password'} value={lf.p} onChange={e => setLf({ ...lf, p: e.target.value })} onKeyDown={e => e.key === 'Enter' && login()} /><button onClick={() => setShowP(!showP)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>{showP ? <EyeOff size={16} color={t.txt3} /> : <Eye size={16} color={t.txt3} />}</button></div></div>
      <button onClick={login} disabled={loading} style={{ ...s.btn, width: '100%', justifyContent: 'center', background: t.gold, color: '#fff' }}>{loading ? <><Loader size={14} className="spin" />Conectando...</> : <><Lock size={14} />Entrar</>}</button>
      <button onClick={loadData} style={{ width: '100%', marginTop: 10, padding: 8, background: 'none', border: `1px solid ${t.brd}`, borderRadius: 6, color: t.txt2, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><RefreshCw size={12} />Reconectar</button>
    </div>
  </div>;

  const Sidebar = () => {
    const tipoLabel = { admin: 'Admin', financeiro: 'Financeiro', consultor: 'Consultor' }[user.tipo];
    const tipoColor = { admin: 'purple', financeiro: 'orange', consultor: 'gray' }[user.tipo];
    const menuCad = canEditAll ? [{ id: 'consultores', l: 'Consultores', ic: UserCheck }, { id: 'clientes', l: 'Clientes', ic: Users }, { id: 'custos', l: 'Custos', ic: DollarSign }] : [{ id: 'clientes', l: isCons ? 'Meus Clientes' : 'Clientes', ic: Users }];
    const menu = [{ sc: 'm', it: [{ id: 'dashboard', l: 'Dashboard', ic: TrendingUp }] }, { sc: 'c', l: 'Cadastros', it: menuCad }, { sc: 'o', l: 'Operacional', it: [{ id: 'lancamentos', l: 'Lançamentos', ic: Calendar }, { id: 'comissoes', l: 'Comissões', ic: Award }, { id: 'tarefas', l: 'Tarefas', ic: ClipboardList }, { id: 'cobranca', l: 'Cobrança', ic: AlertCircle }] }, { sc: 'a', l: 'Análise', it: [{ id: 'projecao', l: 'Projeção', ic: TrendingUp }, { id: 'performance', l: 'Performance', ic: Target }, { id: 'ranking', l: 'Ranking', ic: Star }, { id: 'metas', l: 'Metas', ic: Target }, { id: 'relatorio', l: 'Relatório', ic: FileText }] }, ...(isAdm ? [{ sc: 's', l: 'Sistema', it: [{ id: 'usuarios', l: 'Usuários', ic: Users }] }] : [])];
    const navTo = id => { setTab(id); setSb(false); };
    return <aside style={{ position: 'fixed', left: 0, top: 0, width: sb ? 'min(240px, 80vw)' : 0, height: '100vh', background: t.card, borderRight: `1px solid ${t.brd}`, zIndex: 50, transition: 'width .3s', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 14, borderBottom: `1px solid ${t.brd}`, textAlign: 'center' }}><Logo /></div>
      <div style={{ padding: 10, borderBottom: `1px solid ${t.brd}`, background: t.goldBg }}><div style={{ fontSize: 12, fontWeight: 600, color: t.txt, marginBottom: 4 }}>{user.nome}</div><Badge c={tipoColor}>{tipoLabel}</Badge></div>
      <div style={{ padding: 10, borderBottom: `1px solid ${t.brd}` }}><input type="month" value={mes} onChange={e => setMes(e.target.value)} style={{ ...s.inp, padding: 8, fontSize: 12 }} /></div>
      <nav style={{ flex: 1, padding: 8, overflowY: 'auto' }}>{menu.map(g => <div key={g.sc} style={{ marginBottom: 4 }}>{g.l && <button onClick={() => setExp({ ...exp, [g.sc]: !exp[g.sc] })} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', background: 'none', border: 'none', color: t.txt3, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer' }}>{g.l}{exp[g.sc] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}</button>}{(g.sc === 'm' || exp[g.sc]) && g.it.map(i => <button key={i.id} onClick={() => navTo(i.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: tab === i.id ? t.goldBg : 'transparent', border: 'none', borderRadius: 6, color: tab === i.id ? t.gold : t.txt2, fontSize: 12, fontWeight: tab === i.id ? 600 : 400, cursor: 'pointer', marginBottom: 2 }}><i.ic size={14} />{i.l}</button>)}</div>)}</nav>
      <div style={{ padding: 8, borderTop: `1px solid ${t.brd}`, display: 'flex', gap: 4 }}><button onClick={() => setDark(!dark)} style={{ padding: 6, background: t.alt, border: 'none', borderRadius: 6, cursor: 'pointer' }}>{dark ? <Sun size={14} color={t.txt} /> : <Moon size={14} color={t.txt} />}</button><button onClick={loadData} style={{ padding: 6, background: t.alt, border: 'none', borderRadius: 6, cursor: 'pointer' }}><RefreshCw size={14} color={t.txt} /></button><button onClick={expCSV} style={{ flex: 1, ...s.btn, padding: 6, fontSize: 11, justifyContent: 'center' }}><Download size={12} />CSV</button><button onClick={logout} style={{ padding: 6, background: t.redBg, border: 'none', borderRadius: 6, cursor: 'pointer' }}><LogOut size={14} color={t.red} /></button></div>
    </aside>;
  };

  const Dashboard = () => {
    const r = resumo(); const al = alertR(); const ind = inad(); const res = r.rec - r.cust - r.com;
    const mg = metas.find(m => m.cons === (canViewAll ? 'GERAL' : uCons) && m.mes === mes); const at = mg?.val > 0 ? r.rec / mg.val : 0;
    const ev = []; const h = new Date(); for (let i = 5; i >= 0; i--) { const ms = new Date(h.getFullYear(), h.getMonth() - i, 1).toISOString().slice(0, 7); const lm = getLanc().filter(l => l.mes === ms).map(calc); ev.push({ m: ms.slice(5), v: lm.filter(l => l.status === 'Recebido').reduce((x, l) => x + (+l.pago || 0), 0) }); }
    return <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <h1 style={{ ...s.ttl, marginBottom: 0, fontSize: 18 }}>Olá, {user.nome.split(' ')[0]}!</h1>
      {(al.length > 0 || ind.length > 0) && <div style={{ ...s.card, borderLeft: `3px solid ${t.org}`, background: t.orgBg, padding: 10 }}><div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>{al.length > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Bell size={14} color={t.org} /><span style={{ color: t.txt, fontSize: 12 }}><b>{al.length}</b> renov</span></div>}{ind.length > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={14} color={t.red} /><span style={{ color: t.txt, fontSize: 12 }}><b>{fmt(ind.reduce((x, l) => x + l.tot, 0))}</b></span></div>}</div></div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>{[{ l: 'A Receber', v: r.aRec, ic: Clock, c: t.txt }, { l: 'Recebido', v: r.rec, ic: CheckCircle, c: t.grn }, { l: 'Vencido', v: r.venc, ic: AlertCircle, c: t.red }, { l: 'Custos', v: r.cust, ic: DollarSign, c: t.org }, { l: 'Comissões', v: r.com, ic: Users, c: t.pur }, { l: 'Resultado', v: res, ic: TrendingUp, c: res >= 0 ? t.grn : t.red, hl: 1 }].map((x, i) => <div key={i} style={{ ...s.card, padding: 10, border: x.hl ? `2px solid ${t.gold}` : s.card.border }}><div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}><x.ic size={12} color={x.c} /></div><div style={{ fontSize: 9, color: t.txt3, textTransform: 'uppercase' }}>{x.l}</div><div style={{ fontSize: 15, fontWeight: 700, color: x.c }}>{fmt(x.v)}</div></div>)}</div>
      {mg?.val > 0 && <div style={s.card}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><div><div style={{ fontSize: 9, color: t.txt3 }}>META</div><div style={{ fontSize: 16, fontWeight: 700, color: t.txt }}>{fmt(mg.val)}</div></div><div style={{ fontSize: 22, fontWeight: 700, color: at >= 1 ? t.grn : t.gold }}>{pct(at)}</div></div><div style={{ height: 6, background: t.alt, borderRadius: 3 }}><div style={{ height: '100%', width: `${Math.min(at * 100, 100)}%`, background: at >= 1 ? t.grn : t.gold, borderRadius: 3 }} /></div></div>}
      <div style={s.card}><h3 style={{ ...s.ttl, fontSize: 13 }}>Evolução</h3><ResponsiveContainer width="100%" height={140}><AreaChart data={ev}><defs><linearGradient id="gd" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={t.gold} stopOpacity={.4} /><stop offset="95%" stopColor={t.gold} stopOpacity={0} /></linearGradient></defs><XAxis dataKey="m" fontSize={9} stroke={t.txt3} axisLine={false} tickLine={false} /><YAxis fontSize={9} stroke={t.txt3} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} width={30} /><Tooltip formatter={v => fmt(v)} contentStyle={{ background: t.card, border: `1px solid ${t.brd}`, borderRadius: 6, fontSize: 10 }} /><Area type="monotone" dataKey="v" stroke={t.gold} strokeWidth={2} fill="url(#gd)" /></AreaChart></ResponsiveContainer></div>
    </div>;
  };

  const Consultores = () => {
    if (!canEditAll) return <div style={s.card}><p style={{ color: t.txt3, textAlign: 'center', padding: 20 }}>🔒 Acesso restrito a administradores</p></div>;
    const [f, setF] = useState({ nome: '', pctCom: 20, email: '', tel: '' }); const [ed, setEd] = useState(null);
    const salvar = async () => { if (!f.nome) return notify('Preencha o nome!'); const dados = { ...f, pctCom: (+f.pctCom || 0) / 100 }; if (ed) { await svCons(consultores.map(c => c.id === ed ? { ...dados, id: ed } : c)); setEd(null); } else await svCons([...consultores, { ...dados, id: Date.now() }]); setF({ nome: '', pctCom: 20, email: '', tel: '' }); };
    const del = async id => { if(!confirm('Tem certeza que deseja excluir este consultor?')) return; await svCons(consultores.filter(x => x.id !== id)); };
    const editar = c => { setF({ nome: c.nome, pctCom: (c.pctCom || 0.2) * 100, email: c.email || '', tel: c.tel || '' }); setEd(c.id); };
    return <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={s.card}>
        <h3 style={s.ttl}>{ed ? '✏️ Editar Consultor' : '➕ Novo Consultor'}</h3>
        <div style={{ fontSize: 11, color: t.txt3, marginBottom: 12 }}>Cadastre os consultores que gerenciam seus clientes</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          <div>
            <label style={s.lbl}>Nome Completo *</label>
            <input style={s.inp} value={f.nome} onChange={e => setF({ ...f, nome: e.target.value })} placeholder="Ex: João Silva" />
          </div>
          <div>
            <label style={s.lbl}>% Comissão</label>
            <input style={s.inp} type="number" value={f.pctCom} onChange={e => setF({ ...f, pctCom: +e.target.value || 0 })} placeholder="20" />
            <span style={{ fontSize: 9, color: t.txt3 }}>Percentual sobre recebimentos</span>
          </div>
          <div>
            <label style={s.lbl}>E-mail</label>
            <input style={s.inp} type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} placeholder="joao@email.com" />
          </div>
          <div>
            <label style={s.lbl}>Telefone</label>
            <input style={s.inp} value={f.tel} onChange={e => setF({ ...f, tel: e.target.value })} placeholder="(11) 99999-9999" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button onClick={salvar} disabled={saving} style={{ ...s.btn, background: t.gold, color: '#fff' }}>
            <Save size={14} />{ed ? 'Salvar Alterações' : 'Cadastrar Consultor'}
          </button>
          {ed && <button onClick={() => { setEd(null); setF({ nome: '', pctCom: 20, email: '', tel: '' }); }} style={{ ...s.btn, background: t.alt, color: t.txt }}>
            <X size={14} />Cancelar
          </button>}
        </div>
      </div>
      <div style={s.card}>
        <h3 style={s.ttl}>👥 Consultores Cadastrados ({consultores.length})</h3>
        {consultores.length === 0 ? <p style={{ color: t.txt3, textAlign: 'center', padding: 16 }}>Nenhum consultor cadastrado ainda</p> : 
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {consultores.map(c => <div key={c.id} style={{ padding: 12, background: t.alt, borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 600, color: t.txt, fontSize: 14 }}>{c.nome}</div>
                <div style={{ fontSize: 11, color: t.pur, fontWeight: 500, marginTop: 2 }}>
                  💰 {pct(c.pctCom)} de comissão • 👥 {clientes.filter(x => x.cons === c.nome).length} clientes
                </div>
                {c.email && <div style={{ fontSize: 10, color: t.txt3, marginTop: 4 }}>📧 {c.email}</div>}
                {c.tel && <div style={{ fontSize: 10, color: t.txt3 }}>📱 {c.tel}</div>}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => editar(c)} style={{ ...s.btn, padding: '4px 10px', fontSize: 11, background: t.goldBg, color: t.gold }}>
                  ✏️ Editar
                </button>
                <button onClick={() => del(c.id)} style={{ ...s.btn, padding: '4px 10px', fontSize: 11, background: t.redBg, color: t.red }}>
                  🗑️
                </button>
              </div>
            </div>
          </div>)}
        </div>}
      </div>
    </div>;
  };

  // Função para gerar lançamentos automáticos do contrato
  const gerarLancamentos = async (cliente, isNovo) => {
    if (!cliente.inicio || !cliente.prazo) return 0;
    
    const novoLancs = [];
    const dtInicio = new Date(cliente.inicio + 'T00:00:00');
    const prazoMeses = parseInt(cliente.prazo) || 12;
    const valorFixo = +cliente.valFix || 0;
    const diaPgto = +cliente.dtPgtoFix || 10;
    
    for (let i = 0; i < prazoMeses; i++) {
      const dtMes = new Date(dtInicio.getFullYear(), dtInicio.getMonth() + i, 1);
      const mesStr = dtMes.toISOString().slice(0, 7);
      
      // Verifica se já existe lançamento para este cliente/mês
      const jaExiste = lancamentos.find(l => l.cli === cliente.nome && l.mes === mesStr);
      if (jaExiste) continue;
      
      // Calcula data de vencimento
      const diaVenc = Math.min(diaPgto, new Date(dtMes.getFullYear(), dtMes.getMonth() + 1, 0).getDate());
      const dtVenc = new Date(dtMes.getFullYear(), dtMes.getMonth(), diaVenc);
      
      novoLancs.push({
        id: Date.now() + Math.random() * 10000 + i,
        mes: mesStr,
        cli: cliente.nome,
        bruto: valorFixo,
        taxa: 0.05,
        meta: false,
        venc: dtVenc.toISOString().slice(0, 10),
        status: 'A Faturar',
        pago: 0
      });
    }
    
    return novoLancs;
  };

  // Função para gerar lançamentos de TODOS os clientes ativos
  const gerarTodosLancamentos = async () => {
    const clientesAtivos = clientes.filter(c => c.status === 'Ativo' && c.inicio && c.prazo);
    if (clientesAtivos.length === 0) {
      notify('Nenhum cliente ativo com contrato!');
      return;
    }
    
    let todosNovos = [];
    for (const cli of clientesAtivos) {
      const novos = await gerarLancamentos(cli, false);
      if (novos && novos.length > 0) {
        todosNovos = [...todosNovos, ...novos];
      }
    }
    
    if (todosNovos.length > 0) {
      await svLanc([...lancamentos, ...todosNovos]);
      notify(`${todosNovos.length} lançamentos gerados!`);
    } else {
      notify('Todos lançamentos já existem!');
    }
  };

  const Clientes = () => {
    const ef = { nome: '', pctFix: 0, valFix: 0, pctBonus: 0, valBonus: 0, metaFat: 0, dtPgtoFix: '', dtPgtoCom: '', fixCloser: 0, pctCloser: 0, fixSDR: 0, pctSDR: 0, fixSocial: 0, pctSocial: 0, cons: '', inicio: '', renov: '', prazo: 12, status: 'Ativo', nps: '', probRen: 100 };
    const [f, setF] = useState(ef); const [ed, setEd] = useState(null);
    const cl = getCli();
    const salvar = async () => { 
      if (!f.nome) return notify('Nome!'); 
      const dados = { ...f, pctFix: (+f.pctFix || 0) / 100, pctBonus: (+f.pctBonus || 0) / 100, pctCloser: (+f.pctCloser || 0) / 100, pctSDR: (+f.pctSDR || 0) / 100, pctSocial: (+f.pctSocial || 0) / 100, probRen: (+f.probRen || 100) / 100 }; 
      
      if (ed) { 
        await svCli(clientes.map(c => c.id === ed ? { ...dados, id: ed } : c)); 
        // Se mudou início ou prazo, gera lançamentos faltantes
        const cliAntigo = clientes.find(c => c.id === ed);
        if (cliAntigo && (cliAntigo.inicio !== dados.inicio || cliAntigo.prazo !== dados.prazo)) {
          await gerarLancamentos(dados, false);
        }
        setEd(null); 
      } else { 
        const novoId = Date.now();
        const novoCli = { ...dados, id: novoId };
        await svCli([...clientes, novoCli]); 
        // Gera lançamentos para cliente novo
        if (dados.inicio && dados.prazo) {
          await gerarLancamentos(novoCli, true);
        }
      } 
      setF(ef); 
    };
    const del = async id => { if(!confirm('Tem certeza que deseja excluir este cliente? Os lançamentos vinculados não serão excluídos.')) return; await svCli(clientes.filter(x => x.id !== id)); };
    const editar = c => { 
      setF({ 
        ...c, 
        pctFix: (c.pctFix || 0) * 100, 
        pctBonus: (c.pctBonus || 0) * 100, 
        pctCloser: (c.pctCloser || 0) * 100, 
        pctSDR: (c.pctSDR || 0) * 100, 
        pctSocial: (c.pctSocial || 0) * 100, 
        probRen: (c.probRen || 1) * 100, 
        metaFat: c.metaFat || 0, 
        dtPgtoFix: c.dtPgtoFix || '', 
        dtPgtoCom: c.dtPgtoCom || '', 
        fixCloser: c.fixCloser || 0, 
        fixSDR: c.fixSDR || 0, 
        fixSocial: c.fixSocial || 0,
        valFix: c.valFix || 0,
        valBonus: c.valBonus || 0,
        cons: c.cons || '',
        status: c.status || 'Ativo',
        inicio: c.inicio || '',
        renov: c.renov || '',
        prazo: c.prazo || 12,
        nps: c.nps || ''
      }); 
      setEd(c.id); 
    };
    const calcR = () => { if (f.inicio && f.prazo) { const d = new Date(f.inicio); d.setMonth(d.getMonth() + parseInt(f.prazo)); setF({ ...f, renov: d.toISOString().slice(0, 10) }); } };
    const fmtFixo = c => { const p = []; if (c.pctFix > 0) p.push(pct(c.pctFix)); if (c.valFix > 0) p.push(fmt(c.valFix)); return p.length ? p.join('+') : '-'; };
    const temTime = c => (c.fixCloser > 0 || c.pctCloser > 0 || c.fixSDR > 0 || c.pctSDR > 0 || c.fixSocial > 0 || c.pctSocial > 0);

    if (!canEditAll) return <div style={s.card}><h3 style={s.ttl}>{isCons ? 'Meus Clientes' : 'Clientes'}</h3>{cl.length === 0 ? <p style={{ color: t.txt3, textAlign: 'center', padding: 16 }}>Nenhum</p> : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{cl.map(c => { const sr = statR(c); return <div key={c.id} style={{ padding: 10, background: t.alt, borderRadius: 8 }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ fontWeight: 600, color: t.txt, fontSize: 13 }}>{c.nome}</span><Badge c={c.status === 'Ativo' ? 'green' : 'gray'}>{c.status}</Badge></div><div style={{ fontSize: 11, color: t.txt2 }}>Fixo: {fmtFixo(c)} • <Badge c={sr.cor}>{sr.l}</Badge></div></div>; })}</div>}</div>;

    // Componente de dica
    const Dica = ({ texto }) => <span style={{ fontSize: 9, color: t.txt3, fontWeight: 400, display: 'block', marginTop: 2 }}>{texto}</span>;

    return <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={s.card}>
        <h3 style={s.ttl}>{ed ? '✏️ Editar Cliente' : '➕ Novo Cliente'}</h3>
        
        {/* Nome */}
        <div style={{ marginBottom: 12 }}>
          <label style={s.lbl}>Nome do Cliente *</label>
          <input style={s.inp} value={f.nome} onChange={e => setF({ ...f, nome: e.target.value })} placeholder="Ex: Empresa ABC Ltda" />
        </div>
        
        {/* Seção: Participação */}
        <div style={{ background: t.alt, padding: 12, borderRadius: 8, marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.gold, marginBottom: 4 }}>💰 SUA PARTICIPAÇÃO</div>
          <div style={{ fontSize: 10, color: t.txt3, marginBottom: 10 }}>Quanto você recebe deste cliente todo mês</div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            <div>
              <label style={s.lbl}>% sobre Faturamento</label>
              <input style={s.inp} type="number" value={f.pctFix} onChange={e => setF({ ...f, pctFix: +e.target.value || 0 })} placeholder="Ex: 10" />
              <Dica texto="Percentual fixo mensal" />
            </div>
            <div>
              <label style={s.lbl}>Valor Fixo Mensal (R$)</label>
              <input style={s.inp} type="number" value={f.valFix} onChange={e => setF({ ...f, valFix: +e.target.value || 0 })} placeholder="Ex: 3000" />
              <Dica texto="Valor garantido todo mês" />
            </div>
            <div>
              <label style={s.lbl}>% Bônus (se bater meta)</label>
              <input style={s.inp} type="number" value={f.pctBonus} onChange={e => setF({ ...f, pctBonus: +e.target.value || 0 })} placeholder="Ex: 5" />
              <Dica texto="Adicional se atingir meta" />
            </div>
            <div>
              <label style={s.lbl}>Bônus Fixo (R$)</label>
              <input style={s.inp} type="number" value={f.valBonus} onChange={e => setF({ ...f, valBonus: +e.target.value || 0 })} placeholder="Ex: 500" />
              <Dica texto="Valor extra se bater meta" />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={s.lbl}>Meta de Faturamento do Cliente (R$)</label>
              <input style={s.inp} type="number" value={f.metaFat} onChange={e => setF({ ...f, metaFat: +e.target.value || 0 })} placeholder="Ex: 50000" />
              <Dica texto="Se o cliente faturar acima deste valor, você ganha o bônus" />
            </div>
          </div>
        </div>
        
        {/* Seção: Datas de Pagamento */}
        <div style={{ background: t.alt, padding: 12, borderRadius: 8, marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.txt, marginBottom: 4 }}>📅 DATAS DE PAGAMENTO</div>
          <div style={{ fontSize: 10, color: t.txt3, marginBottom: 10 }}>Quando o cliente paga você</div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            <div>
              <label style={s.lbl}>Dia do Pgto Fixo</label>
              <input style={s.inp} type="number" min="1" max="31" value={f.dtPgtoFix} onChange={e => setF({ ...f, dtPgtoFix: +e.target.value || '' })} placeholder="Ex: 10" />
              <Dica texto="Dia do mês (1-31)" />
            </div>
            <div>
              <label style={s.lbl}>Dia do Pgto Comissão</label>
              <input style={s.inp} type="number" min="1" max="31" value={f.dtPgtoCom} onChange={e => setF({ ...f, dtPgtoCom: +e.target.value || '' })} placeholder="Ex: 15" />
              <Dica texto="Dia do mês (1-31)" />
            </div>
          </div>
        </div>
        
        {/* Seção: Time Comercial */}
        <div style={{ background: t.goldBg, padding: 12, borderRadius: 8, marginBottom: 12, border: `1px solid ${t.gold}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.gold, marginBottom: 4 }}>👥 TIME COMERCIAL (opcional)</div>
          <div style={{ fontSize: 10, color: t.txt3, marginBottom: 10 }}>Custos com profissionais terceirizados. Deixe zerado se não tiver.</div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            <div>
              <label style={s.lbl}>Closer - Fixo por Venda (R$)</label>
              <input style={s.inp} type="number" value={f.fixCloser} onChange={e => setF({ ...f, fixCloser: +e.target.value || 0 })} placeholder="0" />
            </div>
            <div>
              <label style={s.lbl}>Closer - % sobre Líquido</label>
              <input style={s.inp} type="number" value={f.pctCloser} onChange={e => setF({ ...f, pctCloser: +e.target.value || 0 })} placeholder="0" />
            </div>
            <div>
              <label style={s.lbl}>SDR - Fixo por Venda (R$)</label>
              <input style={s.inp} type="number" value={f.fixSDR} onChange={e => setF({ ...f, fixSDR: +e.target.value || 0 })} placeholder="0" />
            </div>
            <div>
              <label style={s.lbl}>SDR - % sobre Líquido</label>
              <input style={s.inp} type="number" value={f.pctSDR} onChange={e => setF({ ...f, pctSDR: +e.target.value || 0 })} placeholder="0" />
            </div>
            <div>
              <label style={s.lbl}>Social Seller - Fixo (R$)</label>
              <input style={s.inp} type="number" value={f.fixSocial} onChange={e => setF({ ...f, fixSocial: +e.target.value || 0 })} placeholder="0" />
            </div>
            <div>
              <label style={s.lbl}>Social Seller - %</label>
              <input style={s.inp} type="number" value={f.pctSocial} onChange={e => setF({ ...f, pctSocial: +e.target.value || 0 })} placeholder="0" />
            </div>
          </div>
        </div>
        
        {/* Seção: Contrato */}
        <div style={{ background: t.alt, padding: 12, borderRadius: 8, marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.txt, marginBottom: 4 }}>📋 CONTRATO</div>
          <div style={{ fontSize: 10, color: t.txt3, marginBottom: 10 }}>Informações do contrato com o cliente</div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            <div>
              <label style={s.lbl}>Consultor Responsável</label>
              <select style={s.inp} value={f.cons} onChange={e => setF({ ...f, cons: e.target.value })}>
                <option value="">Selecione...</option>
                {consultores.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
              </select>
            </div>
            <div>
              <label style={s.lbl}>Status do Cliente</label>
              <select style={s.inp} value={f.status} onChange={e => setF({ ...f, status: e.target.value })}>
                <option>Ativo</option>
                <option>Inativo</option>
                <option>Cancelado</option>
              </select>
            </div>
            <div>
              <label style={s.lbl}>Data de Início</label>
              <input style={s.inp} type="date" value={f.inicio} onChange={e => { const novoInicio = e.target.value; if (novoInicio && f.prazo) { const d = new Date(novoInicio); d.setMonth(d.getMonth() + parseInt(f.prazo)); setF({ ...f, inicio: novoInicio, renov: d.toISOString().slice(0, 10) }); } else { setF({ ...f, inicio: novoInicio }); }}} />
              <Dica texto="Quando começou o contrato" />
            </div>
            <div>
              <label style={s.lbl}>Duração (meses)</label>
              <input style={s.inp} type="number" value={f.prazo} onChange={e => { const novoPrazo = +e.target.value || 12; if (f.inicio && novoPrazo) { const d = new Date(f.inicio); d.setMonth(d.getMonth() + novoPrazo); setF({ ...f, prazo: novoPrazo, renov: d.toISOString().slice(0, 10) }); } else { setF({ ...f, prazo: novoPrazo }); }}} placeholder="12" />
              <Dica texto="Quantos meses de contrato" />
            </div>
            <div>
              <label style={s.lbl}>Data de Renovação</label>
              <input style={{ ...s.inp, background: t.card, cursor: 'not-allowed' }} type="date" value={f.renov} readOnly />
              <Dica texto="Calculado automaticamente" />
            </div>
            <div>
              <label style={s.lbl}>NPS (0-10)</label>
              <input style={s.inp} type="number" min="0" max="10" value={f.nps} onChange={e => setF({ ...f, nps: +e.target.value || '' })} placeholder="Ex: 9" />
              <Dica texto="Satisfação do cliente" />
            </div>
          </div>
        </div>
        
        {/* Botões */}
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button onClick={salvar} disabled={saving} style={{ ...s.btn, flex: 1, justifyContent: 'center', background: t.gold, color: '#fff' }}>
            <Save size={14} />{ed ? 'Salvar Alterações' : 'Cadastrar Cliente'}
          </button>
          {ed && <button onClick={() => { setEd(null); setF(ef); }} style={{ ...s.btn, background: t.alt, color: t.txt }}>
            <X size={14} />Cancelar
          </button>}
        </div>
      </div>
      
      {/* Botão Gerar Lançamentos */}
      <div style={{ ...s.card, background: t.goldBg, borderColor: t.gold }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: t.txt }}>📅 Gerar Lançamentos</div>
            <div style={{ fontSize: 11, color: t.txt2 }}>Cria automaticamente os lançamentos mensais para todos os clientes ativos</div>
          </div>
          <button onClick={gerarTodosLancamentos} disabled={saving} style={{ ...s.btn, background: t.gold, color: '#fff' }}>
            <Calendar size={14} />Gerar Todos
          </button>
        </div>
      </div>
      
      {/* Lista de Clientes */}
      <div style={s.card}>
        <h3 style={s.ttl}>📋 Clientes Cadastrados ({clientes.length})</h3>
        {clientes.length === 0 ? <p style={{ color: t.txt3, textAlign: 'center', padding: 16 }}>Nenhum cliente cadastrado ainda</p> : 
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {clientes.map(c => { 
            const sr = statR(c); 
            return <div key={c.id} style={{ padding: 12, background: t.alt, borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div>
                  <div style={{ fontWeight: 600, color: t.txt, fontSize: 14 }}>{c.nome}</div>
                  <div style={{ fontSize: 11, color: t.txt2, marginTop: 2 }}>
                    {c.cons || 'Sem consultor'}{c.metaFat > 0 ? ` • Meta: ${fmt(c.metaFat)}` : ''}{temTime(c) ? ' • 👥 Time' : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => editar(c)} style={{ ...s.btn, padding: '4px 10px', fontSize: 11, background: t.goldBg, color: t.gold }}>
                    ✏️ Editar
                  </button>
                  <button onClick={() => del(c.id)} style={{ ...s.btn, padding: '4px 10px', fontSize: 11, background: t.redBg, color: t.red }}>
                    🗑️
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <Badge c={c.status === 'Ativo' ? 'green' : 'gray'}>{c.status}</Badge>
                <Badge c={sr.cor}>Renova: {sr.l}</Badge>
                {c.valFix > 0 && <Badge c="blue">Fixo: {fmt(c.valFix)}</Badge>}
              </div>
            </div>; 
          })}
        </div>}
      </div>
    </div>;
  };

  const Custos = () => {
    if (!canEditAll) return <div style={s.card}><p style={{ color: t.txt3, textAlign: 'center', padding: 16 }}>🔒 Acesso restrito a administradores</p></div>;
    const ef = { cli: '', tipo: 'Ferramenta', descricao: '', val: 0 }; const [f, setF] = useState(ef); const [ed, setEd] = useState(null);
    const salvar = async () => { if (!f.cli || !f.descricao) return notify('Preencha cliente e descrição!'); if (ed) { await svCust(custos.map(c => c.id === ed ? { ...f, id: ed } : c)); setEd(null); } else await svCust([...custos, { ...f, id: Date.now() }]); setF(ef); };
    const del = async id => { if(!confirm('Tem certeza que deseja excluir este custo?')) return; await svCust(custos.filter(c => c.id !== id)); };
    const totalCustos = custos.reduce((x, c) => x + (+c.val || 0), 0);
    
    return <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={s.card}>
        <h3 style={s.ttl}>{ed ? '✏️ Editar Custo' : '➕ Novo Custo Operacional'}</h3>
        <div style={{ fontSize: 11, color: t.txt3, marginBottom: 12 }}>Ferramentas, serviços e outros custos vinculados a cada cliente</div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          <div>
            <label style={s.lbl}>Cliente *</label>
            <select style={s.inp} value={f.cli} onChange={e => setF({ ...f, cli: e.target.value })}>
              <option value="">Selecione o cliente...</option>
              {clientes.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
            </select>
          </div>
          <div>
            <label style={s.lbl}>Tipo de Custo</label>
            <select style={s.inp} value={f.tipo} onChange={e => setF({ ...f, tipo: e.target.value })}>
              <option>Ferramenta</option>
              <option>Terceirizado</option>
              <option>Outro</option>
            </select>
          </div>
          <div>
            <label style={s.lbl}>Descrição *</label>
            <input style={s.inp} value={f.descricao} onChange={e => setF({ ...f, descricao: e.target.value })} placeholder="Ex: RD Station, CRM, Hospedagem..." />
          </div>
          <div>
            <label style={s.lbl}>Valor Mensal (R$)</label>
            <input style={s.inp} type="number" value={f.val} onChange={e => setF({ ...f, val: +e.target.value || 0 })} placeholder="Ex: 500" />
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button onClick={salvar} disabled={saving} style={{ ...s.btn, background: t.gold, color: '#fff' }}>
            <Save size={14} />{ed ? 'Salvar Alterações' : 'Cadastrar Custo'}
          </button>
          {ed && <button onClick={() => { setEd(null); setF(ef); }} style={{ ...s.btn, background: t.alt, color: t.txt }}>
            <X size={14} />Cancelar
          </button>}
        </div>
      </div>
      
      {/* Totalizador */}
      <div style={{ ...s.card, background: t.orgBg, borderColor: t.org }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, color: t.txt3 }}>TOTAL DE CUSTOS MENSAIS</div>
            <div style={{ fontSize: 10, color: t.txt2 }}>{custos.length} custos cadastrados</div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: t.org }}>{fmt(totalCustos)}</div>
        </div>
      </div>
      
      <div style={s.card}>
        <h3 style={s.ttl}>💰 Custos Cadastrados</h3>
        {custos.length === 0 ? <p style={{ color: t.txt3, textAlign: 'center', padding: 16 }}>Nenhum custo cadastrado ainda</p> : 
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {custos.map(c => <div key={c.id} style={{ padding: 12, background: t.alt, borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, color: t.txt, fontSize: 14 }}>{c.descricao || c.desc}</div>
              <div style={{ fontSize: 11, color: t.txt2, marginTop: 2 }}>
                👤 {c.cli} • 🏷️ {c.tipo}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 700, color: t.org, fontSize: 14 }}>{fmt(c.val)}</span>
              <button onClick={() => { setF({ ...c, descricao: c.descricao || c.desc }); setEd(c.id); }} style={{ ...s.btn, padding: '4px 10px', fontSize: 11, background: t.goldBg, color: t.gold }}>
                ✏️
              </button>
              <button onClick={() => del(c.id)} style={{ ...s.btn, padding: '4px 10px', fontSize: 11, background: t.redBg, color: t.red }}>
                🗑️
              </button>
            </div>
          </div>)}
        </div>}
      </div>
    </div>;
  };

  const Lancamentos = () => {
    const ef = { mes, cli: '', bruto: 0, taxa: 5, meta: false, venc: '', status: 'A Faturar', pago: 0 };
    const [f, setF] = useState(ef); const [ed, setEd] = useState(null);
    const lm = getLanc().filter(l => l.mes === mes).map(calc);
    const cl = getCli().filter(c => c.status === 'Ativo');
    const salvar = async () => { if (!f.cli) return notify('Selecione um cliente!'); const dados = { ...f, taxa: (+f.taxa || 0) / 100 }; if (ed) { await svLanc(lancamentos.map(l => l.id === ed ? { ...dados, id: ed } : l)); setEd(null); } else await svLanc([...lancamentos, { ...dados, id: Date.now() }]); setF({ ...ef, mes }); };
    const del = async id => { if(!confirm('Tem certeza que deseja excluir este lançamento?')) return; await svLanc(lancamentos.filter(x => x.id !== id)); };
    const upd = async (id, k, v) => { await svLanc(lancamentos.map(l => l.id === id ? { ...l, [k]: v } : l)); };
    
    // Função para marcar como recebido rapidamente
    const marcarRecebido = async (l) => {
      await svLanc(lancamentos.map(x => x.id === l.id ? { ...x, status: 'Recebido', pago: l.tot } : x));
    };
    
    // Totalizadores
    const totBruto = lm.reduce((s, l) => s + (+l.bruto || 0), 0);
    const totRecebido = lm.filter(l => l.status === 'Recebido').reduce((s, l) => s + (+l.pago || 0), 0);
    const totPendente = lm.filter(l => l.status !== 'Recebido').reduce((s, l) => s + l.tot, 0);
    
    return <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={s.card}>
        <h3 style={s.ttl}>{ed ? '✏️ Editar Lançamento' : '➕ Novo Lançamento'}</h3>
        <div style={{ fontSize: 11, color: t.txt3, marginBottom: 12 }}>Registre o faturamento mensal de cada cliente</div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          <div>
            <label style={s.lbl}>Mês de Referência</label>
            <input style={s.inp} type="month" value={f.mes} onChange={e => setF({ ...f, mes: e.target.value })} />
          </div>
          <div>
            <label style={s.lbl}>Cliente *</label>
            <select style={s.inp} value={f.cli} onChange={e => setF({ ...f, cli: e.target.value })}>
              <option value="">Selecione o cliente...</option>
              {cl.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
            </select>
          </div>
          <div>
            <label style={s.lbl}>Faturamento Bruto (R$)</label>
            <input style={s.inp} type="number" value={f.bruto} onChange={e => setF({ ...f, bruto: +e.target.value || 0 })} placeholder="Valor total faturado" />
            <span style={{ fontSize: 9, color: t.txt3, display: 'block', marginTop: 2 }}>Quanto o cliente faturou no mês</span>
          </div>
          <div>
            <label style={s.lbl}>Taxa/Impostos (%)</label>
            <input style={s.inp} type="number" value={f.taxa} onChange={e => setF({ ...f, taxa: +e.target.value || 0 })} placeholder="Ex: 5" />
            <span style={{ fontSize: 9, color: t.txt3, display: 'block', marginTop: 2 }}>Gateway, impostos, etc</span>
          </div>
          <div>
            <label style={s.lbl}>Status do Pagamento</label>
            <select style={s.inp} value={f.status} onChange={e => setF({ ...f, status: e.target.value })}>
              <option>A Faturar</option>
              <option>Faturado</option>
              <option>Recebido</option>
              <option>Vencido</option>
            </select>
          </div>
          <div>
            <label style={s.lbl}>Valor Pago (R$)</label>
            <input style={s.inp} type="number" value={f.pago} onChange={e => setF({ ...f, pago: +e.target.value || 0 })} placeholder="Quanto você recebeu" />
            <span style={{ fontSize: 9, color: t.txt3, display: 'block', marginTop: 2 }}>Preencha ao receber</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button onClick={salvar} disabled={saving} style={{ ...s.btn, flex: 1, justifyContent: 'center', background: t.gold, color: '#fff' }}>
            <Save size={14} />{ed ? 'Salvar Alterações' : 'Adicionar Lançamento'}
          </button>
          {ed && <button onClick={() => { setEd(null); setF({ ...ef, mes }); }} style={{ ...s.btn, background: t.alt, color: t.txt }}>
            <X size={14} />Cancelar
          </button>}
        </div>
      </div>
      
      {/* Totalizadores */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        <div style={{ ...s.card, padding: 10, textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: t.txt3, textTransform: 'uppercase' }}>Bruto</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: t.txt }}>{fmt(totBruto)}</div>
        </div>
        <div style={{ ...s.card, padding: 10, textAlign: 'center', background: t.grnBg }}>
          <div style={{ fontSize: 9, color: t.txt3, textTransform: 'uppercase' }}>Recebido</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: t.grn }}>{fmt(totRecebido)}</div>
        </div>
        <div style={{ ...s.card, padding: 10, textAlign: 'center', background: t.orgBg }}>
          <div style={{ fontSize: 9, color: t.txt3, textTransform: 'uppercase' }}>Pendente</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: t.org }}>{fmt(totPendente)}</div>
        </div>
      </div>
      
      <div style={s.card}>
        <h3 style={s.ttl}>Lançamentos — {mes} ({lm.length})</h3>
        {lm.length === 0 ? <p style={{ color: t.txt3, textAlign: 'center', padding: 16 }}>Nenhum lançamento neste mês</p> : 
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {lm.map(l => <div key={l.id} style={{ padding: 12, background: l.status === 'Recebido' ? t.grnBg : t.alt, borderRadius: 8, border: l.status === 'Recebido' ? `1px solid ${t.grn}` : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 600, color: t.txt, fontSize: 14 }}>{l.cli}</div>
                <div style={{ fontSize: 11, color: t.txt2, marginTop: 2 }}>
                  Bruto: {fmt(l.bruto)} → Participação: {fmt(l.tot)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => { setF({ ...l, taxa: (l.taxa || 0) * 100 }); setEd(l.id); }} style={{ background: 'none', border: 'none', color: t.gold, cursor: 'pointer', fontSize: 11 }}>Ed</button>
                <button onClick={() => del(l.id)} style={{ background: 'none', border: 'none', color: t.red, cursor: 'pointer', fontSize: 11 }}>Ex</button>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              {l.status !== 'Recebido' ? (
                <button onClick={() => marcarRecebido(l)} style={{ ...s.btn, padding: '6px 12px', fontSize: 11, background: t.grn, color: '#fff' }}>
                  <CheckCircle size={12} /> Recebido
                </button>
              ) : (
                <Badge c="green">✓ Recebido</Badge>
              )}
              
              <select value={l.status} onChange={e => upd(l.id, 'status', e.target.value)} style={{ ...s.inp, padding: 6, width: 'auto', fontSize: 11 }}>
                <option>A Faturar</option>
                <option>Faturado</option>
                <option>Recebido</option>
                <option>Vencido</option>
              </select>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 10, color: t.txt3 }}>Pago:</span>
                <input type="number" value={l.pago || ''} onChange={e => upd(l.id, 'pago', +e.target.value || 0)} style={{ ...s.inp, padding: 6, width: 90, fontSize: 11 }} />
              </div>
            </div>
          </div>)}
        </div>}
      </div>
    </div>;
  };

  const Comissoes = () => { const cm = comCons(); return <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{cm.length === 0 ? <div style={s.card}><p style={{ color: t.txt3, textAlign: 'center', padding: 16 }}>Nenhuma</p></div> : cm.map(c => <div key={c.nome} style={s.card}><div style={{ marginBottom: 12 }}><h4 style={{ fontSize: 14, fontWeight: 600, color: t.txt }}>{c.nome}</h4><span style={{ fontSize: 11, color: t.txt3 }}>{pct(c.pct)}</span></div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>{[{ l: 'Base', v: c.rec }, { l: 'Com', v: c.com, c: t.pur }, { l: 'Pend', v: c.pend }].map((x, i) => <div key={i} style={{ padding: 10, background: x.c ? t.purBg : t.alt, borderRadius: 6, textAlign: 'center' }}><div style={{ fontSize: 14, fontWeight: 700, color: x.c || t.txt }}>{fmt(x.v)}</div><div style={{ fontSize: 9, color: t.txt3 }}>{x.l}</div></div>)}</div></div>)}{cm.length > 0 && <div style={{ ...s.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontWeight: 600, color: t.txt }}>Total</span><span style={{ fontSize: 20, fontWeight: 700, color: t.pur }}>{fmt(cm.reduce((x, c) => x + c.com, 0))}</span></div>}</div>; };

  const Tarefas = () => { const [f, setF] = useState({ cli: '', desc: '', dt: '', done: false }); const salvar = async () => { if (!f.desc) return notify('Desc!'); await svTar([...tarefas, { ...f, id: Date.now() }]); setF({ cli: '', desc: '', dt: '', done: false }); }; const tog = async id => { await svTar(tarefas.map(x => x.id === id ? { ...x, done: !x.done } : x)); }; const del = async id => { await svTar(tarefas.filter(x => x.id !== id)); }; const pnd = tarefas.filter(x => !x.done); return <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}><div style={s.card}><h3 style={s.ttl}>Nova</h3><div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><input style={s.inp} placeholder="Descrição *" value={f.desc} onChange={e => setF({ ...f, desc: e.target.value })} /><input style={s.inp} type="date" value={f.dt} onChange={e => setF({ ...f, dt: e.target.value })} /></div><button onClick={salvar} disabled={saving} style={{ ...s.btn, marginTop: 10 }}><Plus size={12} />Add</button></div><div style={s.card}><h3 style={s.ttl}>Pendentes ({pnd.length})</h3>{pnd.length === 0 ? <p style={{ color: t.txt3, textAlign: 'center', padding: 16 }}>Nenhuma</p> : <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{pnd.map(x => <div key={x.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, background: t.alt, borderRadius: 8 }}><input type="checkbox" checked={x.done} onChange={() => tog(x.id)} style={{ width: 16, height: 16 }} /><div style={{ flex: 1 }}><div style={{ color: t.txt, fontSize: 12 }}>{x.desc}</div>{x.dt && <div style={{ fontSize: 10, color: t.txt3 }}>{fmtD(x.dt)}</div>}</div><button onClick={() => del(x.id)} style={{ background: 'none', border: 'none', color: t.red, cursor: 'pointer', fontSize: 11 }}>Ex</button></div>)}</div>}</div></div>; };

  const Cobranca = () => { const ind = inad(); return <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}><div style={{ ...s.card, borderLeft: `3px solid ${t.red}` }}><div style={{ fontSize: 10, color: t.txt3 }}>INADIMPLÊNCIA</div><div style={{ fontSize: 24, fontWeight: 700, color: t.red }}>{fmt(ind.reduce((x, l) => x + l.tot, 0))}</div></div><div style={s.card}><h3 style={s.ttl}>Vencidas</h3>{ind.length === 0 ? <div style={{ textAlign: 'center', padding: 20 }}>🎉 Nenhuma!</div> : <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{ind.map(l => <div key={l.id} style={{ padding: 10, background: t.alt, borderRadius: 8, display: 'flex', justifyContent: 'space-between' }}><div><div style={{ fontWeight: 600, color: t.txt, fontSize: 13 }}>{l.cli}</div><div style={{ fontSize: 10, color: t.txt2 }}>{l.mes}</div></div><div style={{ textAlign: 'right' }}><div style={{ fontWeight: 600, color: t.txt }}>{fmt(l.tot)}</div><Badge c="red">{l.dias}d</Badge></div></div>)}</div>}</div></div>; };

  const Projecao = () => { const p = proj(); return <div style={s.card}><h3 style={s.ttl}>Projeção 6 Meses</h3><ResponsiveContainer width="100%" height={180}><AreaChart data={p}><defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={t.gold} stopOpacity={.4} /><stop offset="95%" stopColor={t.gold} stopOpacity={0} /></linearGradient></defs><XAxis dataKey="mes" fontSize={9} stroke={t.txt3} axisLine={false} tickLine={false} /><YAxis fontSize={9} stroke={t.txt3} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} width={35} /><Tooltip formatter={v => fmt(v)} contentStyle={{ background: t.card, border: `1px solid ${t.brd}`, borderRadius: 6 }} /><Area type="monotone" dataKey="val" stroke={t.gold} strokeWidth={2} fill="url(#pg)" /></AreaChart></ResponsiveContainer></div>; };

  const Performance = () => { const p = perf(); return <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{p.map(c => <div key={c.id} style={s.card}><div style={{ marginBottom: 12 }}><h4 style={{ fontSize: 14, fontWeight: 600, color: t.txt }}>{c.nome}</h4><span style={{ fontSize: 11, color: t.txt2 }}>{c.at} ativos</span></div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>{[{ l: 'Receita', v: fmt(c.rec) }, { l: 'Comissão', v: fmt(c.com), c: t.pur }, { l: 'Ticket', v: fmt(c.tk) }, { l: 'Ating', v: pct(c.ating), c: c.ating >= 1 ? t.grn : t.gold }].map((x, i) => <div key={i} style={{ padding: 10, background: t.alt, borderRadius: 6, textAlign: 'center' }}><div style={{ fontSize: 14, fontWeight: 700, color: x.c || t.txt }}>{x.v}</div><div style={{ fontSize: 9, color: t.txt3 }}>{x.l}</div></div>)}</div></div>)}</div>; };

  const Ranking = () => { const r = rank(); return <div style={s.card}><h3 style={s.ttl}>Ranking</h3>{r.length === 0 ? <p style={{ color: t.txt3, textAlign: 'center', padding: 16 }}>Nenhum</p> : <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{r.map((c, i) => <div key={c.id} style={{ padding: 10, background: t.alt, borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontWeight: 700, color: i < 3 ? t.gold : t.txt3, fontSize: 16 }}>{i + 1}º</span><div><div style={{ fontWeight: 600, color: t.txt, fontSize: 13 }}>{c.nome}</div><Badge c={c.risco === 'Alto' ? 'red' : c.risco === 'Médio' ? 'orange' : 'green'}>{c.risco}</Badge></div></div><div style={{ fontWeight: 700, color: t.txt }}>{fmt(c.rec)}</div></div>)}</div>}</div>; };

  const Metas = () => { const [f, setF] = useState({ cons: 'GERAL', mes, val: 0 }); const salvar = async () => { const ex = metas.findIndex(m => m.cons === f.cons && m.mes === f.mes); if (ex >= 0) await svMet(metas.map((m, i) => i === ex ? { ...f, id: m.id } : m)); else await svMet([...metas, { ...f, id: Date.now() }]); setF({ cons: 'GERAL', mes, val: 0 }); }; const r = resumo(); const mg = metas.find(m => m.cons === 'GERAL' && m.mes === mes); const at = mg?.val > 0 ? r.rec / mg.val : 0; return <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}><div style={s.card}><h3 style={s.ttl}>Definir Meta</h3><div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}><div><label style={s.lbl}>Consultor</label><select style={s.inp} value={f.cons} onChange={e => setF({ ...f, cons: e.target.value })}><option value="GERAL">Geral</option>{consultores.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}</select></div><div><label style={s.lbl}>Valor R$</label><input style={s.inp} type="number" value={f.val} onChange={e => setF({ ...f, val: +e.target.value || 0 })} /></div></div><button onClick={salvar} disabled={saving} style={{ ...s.btn, marginTop: 10 }}>Salvar</button></div><div style={s.card}><h3 style={s.ttl}>Meta x Real</h3><div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>{[{ l: 'Meta', v: fmt(mg?.val || 0) }, { l: 'Real', v: fmt(r.rec), c: t.grn }, { l: 'Ating', v: pct(at), c: at >= 1 ? t.grn : t.gold }].map((x, i) => <div key={i} style={{ textAlign: 'center' }}><div style={{ fontSize: 9, color: t.txt3 }}>{x.l}</div><div style={{ fontSize: 16, fontWeight: 700, color: x.c || t.txt }}>{x.v}</div></div>)}</div>{mg?.val > 0 && <div style={{ height: 8, background: t.alt, borderRadius: 4 }}><div style={{ height: '100%', width: `${Math.min(at * 100, 100)}%`, background: at >= 1 ? t.grn : t.gold, borderRadius: 4 }} /></div>}</div></div>; };

  const Relatorio = () => { const r = resumo(); const cm = comCons(); const res = r.rec - r.cust - r.com; return <div style={{ maxWidth: 500, margin: '0 auto' }}><div style={{ ...s.card, textAlign: 'center', marginBottom: 14 }}><Logo /><h2 style={{ ...s.ttl, fontSize: 16, marginTop: 14 }}>Relatório {mes}</h2></div><div style={{ ...s.card, marginBottom: 14 }}><h3 style={{ fontSize: 13, fontWeight: 600, color: t.txt, marginBottom: 10 }}>Receitas</h3>{[['A Rec', r.aRec], ['Recebido', r.rec, t.grn], ['Vencido', r.venc, t.red]].map(([l, v, c]) => <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ color: t.txt2, fontSize: 12 }}>{l}</span><span style={{ fontWeight: 600, color: c || t.txt, fontSize: 12 }}>{fmt(v)}</span></div>)}</div><div style={{ ...s.card, marginBottom: 14 }}><h3 style={{ fontSize: 13, fontWeight: 600, color: t.txt, marginBottom: 10 }}>Comissões</h3>{cm.map(c => <div key={c.nome} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ color: t.txt2, fontSize: 12 }}>{c.nome}</span><span style={{ fontWeight: 600, color: t.pur, fontSize: 12 }}>{fmt(c.com)}</span></div>)}</div><div style={{ ...s.card, background: t.alt }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontWeight: 700, color: t.txt }}>Resultado</span><span style={{ fontSize: 20, fontWeight: 700, color: res >= 0 ? t.grn : t.red }}>{fmt(res)}</span></div></div></div>; };

  const Usuarios = () => {
    if (!isAdm) return <div style={s.card}><p style={{ color: t.txt3, textAlign: 'center', padding: 16 }}>Restrito</p></div>;
    const ef = { username: '', password: '', nome: '', tipo: 'consultor', consultor: '', ativo: true };
    const [f, setF] = useState(ef); const [ed, setEd] = useState(null);
    const salvar = async () => { if (!f.username || !f.password || !f.nome) return notify('Preencha!'); if (ed) { await svUsers(users.map(u => u.id === ed ? { ...f, id: ed } : u)); setEd(null); } else await svUsers([...users, { ...f, id: Date.now() }]); setF(ef); };
    const del = async id => { if (id === 1) return notify('Master!'); await svUsers(users.filter(x => x.id !== id)); };
    return <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={s.card}><h3 style={s.ttl}>{ed ? 'Editar' : 'Novo'} Usuário</h3><div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}><div><label style={s.lbl}>Login *</label><input style={s.inp} value={f.username} onChange={e => setF({ ...f, username: e.target.value })} /></div><div><label style={s.lbl}>Senha *</label><input style={s.inp} type="password" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} /></div><div><label style={s.lbl}>Nome *</label><input style={s.inp} value={f.nome} onChange={e => setF({ ...f, nome: e.target.value })} /></div><div><label style={s.lbl}>Tipo</label><select style={s.inp} value={f.tipo} onChange={e => setF({ ...f, tipo: e.target.value })}><option value="admin">Admin</option><option value="financeiro">Financeiro</option><option value="consultor">Consultor</option></select></div><div><label style={s.lbl}>Consultor</label><select style={s.inp} value={f.consultor} onChange={e => setF({ ...f, consultor: e.target.value })}><option value="">-</option>{consultores.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}</select></div><div><label style={s.lbl}>Ativo</label><select style={s.inp} value={f.ativo ? 'sim' : 'nao'} onChange={e => setF({ ...f, ativo: e.target.value === 'sim' })}><option value="sim">Sim</option><option value="nao">Não</option></select></div></div><div style={{ display: 'flex', gap: 6, marginTop: 12 }}><button onClick={salvar} disabled={saving} style={s.btn}><Save size={12} />{ed ? 'Salvar' : 'Add'}</button>{ed && <button onClick={() => { setEd(null); setF(ef); }} style={{ ...s.btn, background: t.alt, color: t.txt }}>Cancelar</button>}</div></div>
      <div style={s.card}><h3 style={s.ttl}>Usuários</h3>{users.map(u => <div key={u.id} style={{ padding: 10, background: t.alt, borderRadius: 8, marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><div style={{ fontWeight: 600, color: t.txt, fontSize: 13 }}>{u.nome}</div><div style={{ fontSize: 10, color: t.txt2 }}>{u.username}</div></div><div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Badge c={u.tipo === 'admin' ? 'purple' : 'gray'}>{u.tipo}</Badge>{u.id !== 1 && <><button onClick={() => { setF(u); setEd(u.id); }} style={{ background: 'none', border: 'none', color: t.gold, cursor: 'pointer', fontSize: 11 }}>Ed</button><button onClick={() => del(u.id)} style={{ background: 'none', border: 'none', color: t.red, cursor: 'pointer', fontSize: 11 }}>Ex</button></>}</div></div>)}</div>
    </div>;
  };

  if (loading) return <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}><Logo /><Loader size={24} color={t.gold} className="spin" /></div>;

  const C = { dashboard: Dashboard, consultores: Consultores, clientes: Clientes, custos: Custos, lancamentos: Lancamentos, comissoes: Comissoes, tarefas: Tarefas, cobranca: Cobranca, projecao: Projecao, performance: Performance, ranking: Ranking, metas: Metas, relatorio: Relatorio, usuarios: Usuarios }[tab] || Dashboard;

  return <div style={{ minHeight: '100vh', background: t.bg }}>
    <Sidebar />
    <Toast />
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 50, background: t.card, borderBottom: `1px solid ${t.brd}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', zIndex: 30 }}>
      <button onClick={() => setSb(!sb)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}><Menu size={20} color={t.txt} /></button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{saving && <Loader size={14} color={t.org} className="spin" />}{!online && <CloudOff size={14} color={t.red} />}<Logo /></div>
      <button onClick={() => setDark(!dark)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>{dark ? <Sun size={18} color={t.txt} /> : <Moon size={18} color={t.txt} />}</button>
    </header>
    {sb && <div onClick={() => setSb(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 40 }} />}
    <main style={{ paddingTop: 58, minHeight: '100vh' }}><div style={{ padding: 12, maxWidth: 600, margin: '0 auto' }}><C /></div></main>
  </div>;
}
2} fill="url(#pg)" /></AreaChart></ResponsiveContainer></div>; };

  const Performance = () => { const p = perf(); return <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{p.map(c => <div key={c.id} style={s.card}><div style={{ marginBottom: 12 }}><h4 style={{ fontSize: 14, fontWeight: 600, color: t.txt }}>{c.nome}</h4><span style={{ fontSize: 11, color: t.txt2 }}>{c.at} ativos</span></div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>{[{ l: 'Receita', v: fmt(c.rec) }, { l: 'Comissão', v: fmt(c.com), c: t.pur }, { l: 'Ticket', v: fmt(c.tk) }, { l: 'Ating', v: pct(c.ating), c: c.ating >= 1 ? t.grn : t.gold }].map((x, i) => <div key={i} style={{ padding: 10, background: t.alt, borderRadius: 6, textAlign: 'center' }}><div style={{ fontSize: 14, fontWeight: 700, color: x.c || t.txt }}>{x.v}</div><div style={{ fontSize: 9, color: t.txt3 }}>{x.l}</div></div>)}</div></div>)}</div>; };

  const Ranking = () => { const r = rank(); return <div style={s.card}><h3 style={s.ttl}>Ranking</h3>{r.length === 0 ? <p style={{ color: t.txt3, textAlign: 'center', padding: 16 }}>Nenhum</p> : <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{r.map((c, i) => <div key={c.id} onClick={() => setCliDetalhe(c.id)} style={{ padding: 10, background: t.alt, borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontWeight: 700, color: i < 3 ? t.gold : t.txt3, fontSize: 16 }}>{i + 1}º</span><div><div style={{ fontWeight: 600, color: t.txt, fontSize: 13 }}>{c.nome}</div><Badge c={c.risco === 'Alto' ? 'red' : c.risco === 'Médio' ? 'orange' : 'green'}>{c.risco}</Badge></div></div><div style={{ fontWeight: 700, color: t.txt }}>{fmt(c.rec)}</div></div>)}</div>}</div>; };

  const Metas = () => { const [f, setF] = useState({ cons: 'GERAL', mes, val: 0 }); const salvar = async () => { const ex = metas.findIndex(m => m.cons === f.cons && m.mes === f.mes); if (ex >= 0) await svMet(metas.map((m, i) => i === ex ? { ...f, id: m.id } : m)); else await svMet([...metas, { ...f, id: Date.now() }]); setF({ cons: 'GERAL', mes, val: 0 }); }; const r = resumo(); const mg = metas.find(m => m.cons === 'GERAL' && m.mes === mes); const at = mg?.val > 0 ? r.rec / mg.val : 0; return <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}><div style={s.card}><h3 style={s.ttl}>Definir Meta</h3><div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}><div><label style={s.lbl}>Consultor</label><select style={s.inp} value={f.cons} onChange={e => setF({ ...f, cons: e.target.value })}><option value="GERAL">Geral</option>{consultores.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}</select></div><div><label style={s.lbl}>Valor R$</label><input style={s.inp} type="number" value={f.val} onChange={e => setF({ ...f, val: +e.target.value || 0 })} /></div></div><button onClick={salvar} disabled={saving} style={{ ...s.btn, marginTop: 10 }}>Salvar</button></div><div style={s.card}><h3 style={s.ttl}>Meta x Real</h3><div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>{[{ l: 'Meta', v: fmt(mg?.val || 0) }, { l: 'Real', v: fmt(r.rec), c: t.grn }, { l: 'Ating', v: pct(at), c: at >= 1 ? t.grn : t.gold }].map((x, i) => <div key={i} style={{ textAlign: 'center' }}><div style={{ fontSize: 9, color: t.txt3 }}>{x.l}</div><div style={{ fontSize: 16, fontWeight: 700, color: x.c || t.txt }}>{x.v}</div></div>)}</div>{mg?.val > 0 && <div style={{ height: 8, background: t.alt, borderRadius: 4 }}><div style={{ height: '100%', width: `${Math.min(at * 100, 100)}%`, background: at >= 1 ? t.grn : t.gold, borderRadius: 4 }} /></div>}</div></div>; };

  const Relatorio = () => { const r = resumo(); const cm = comCons(); const res = r.rec - r.cust - r.com; return <div style={{ maxWidth: 500, margin: '0 auto' }}><div style={{ ...s.card, textAlign: 'center', marginBottom: 14 }}><Logo /><h2 style={{ ...s.ttl, fontSize: 16, marginTop: 14 }}>Relatório {mes}</h2></div><div style={{ ...s.card, marginBottom: 14 }}><h3 style={{ fontSize: 13, fontWeight: 600, color: t.txt, marginBottom: 10 }}>Receitas</h3>{[['A Rec', r.aRec], ['Recebido', r.rec, t.grn], ['Vencido', r.venc, t.red]].map(([l, v, c]) => <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ color: t.txt2, fontSize: 12 }}>{l}</span><span style={{ fontWeight: 600, color: c || t.txt, fontSize: 12 }}>{fmt(v)}</span></div>)}</div><div style={{ ...s.card, marginBottom: 14 }}><h3 style={{ fontSize: 13, fontWeight: 600, color: t.txt, marginBottom: 10 }}>Comissões</h3>{cm.map(c => <div key={c.nome} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ color: t.txt2, fontSize: 12 }}>{c.nome}</span><span style={{ fontWeight: 600, color: t.pur, fontSize: 12 }}>{fmt(c.com)}</span></div>)}</div><div style={{ ...s.card, background: t.alt }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontWeight: 700, color: t.txt }}>Resultado</span><span style={{ fontSize: 20, fontWeight: 700, color: res >= 0 ? t.grn : t.red }}>{fmt(res)}</span></div></div></div>; };

  const Usuarios = () => {
    if (!isAdm) return <div style={s.card}><p style={{ color: t.txt3, textAlign: 'center', padding: 16 }}>Restrito</p></div>;
    const ef = { username: '', password: '', nome: '', tipo: 'consultor', consultor: '', ativo: true };
    const [f, setF] = useState(ef); const [ed, setEd] = useState(null);
    const salvar = async () => { if (!f.username || !f.password || !f.nome) return notify('Preencha!'); if (ed) { await svUsers(users.map(u => u.id === ed ? { ...f, id: ed } : u)); setEd(null); } else await svUsers([...users, { ...f, id: Date.now() }]); setF(ef); };
    const del = async id => { if (id === 1) return notify('Master!'); await svUsers(users.filter(x => x.id !== id)); };
    return <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={s.card}><h3 style={s.ttl}>{ed ? 'Editar' : 'Novo'} Usuário</h3><div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}><div><label style={s.lbl}>Login *</label><input style={s.inp} value={f.username} onChange={e => setF({ ...f, username: e.target.value })} /></div><div><label style={s.lbl}>Senha *</label><input style={s.inp} type="password" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} /></div><div><label style={s.lbl}>Nome *</label><input style={s.inp} value={f.nome} onChange={e => setF({ ...f, nome: e.target.value })} /></div><div><label style={s.lbl}>Tipo</label><select style={s.inp} value={f.tipo} onChange={e => setF({ ...f, tipo: e.target.value })}><option value="admin">Admin</option><option value="financeiro">Financeiro</option><option value="consultor">Consultor</option></select></div><div><label style={s.lbl}>Consultor</label><select style={s.inp} value={f.consultor} onChange={e => setF({ ...f, consultor: e.target.value })}><option value="">-</option>{consultores.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}</select></div><div><label style={s.lbl}>Ativo</label><select style={s.inp} value={f.ativo ? 'sim' : 'nao'} onChange={e => setF({ ...f, ativo: e.target.value === 'sim' })}><option value="sim">Sim</option><option value="nao">Não</option></select></div></div><div style={{ display: 'flex', gap: 6, marginTop: 12 }}><button onClick={salvar} disabled={saving} style={s.btn}><Save size={12} />{ed ? 'Salvar' : 'Add'}</button>{ed && <button onClick={() => { setEd(null); setF(ef); }} style={{ ...s.btn, background: t.alt, color: t.txt }}>Cancelar</button>}</div></div>
      <div style={s.card}><h3 style={s.ttl}>Usuários</h3>{users.map(u => <div key={u.id} style={{ padding: 10, background: t.alt, borderRadius: 8, marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><div style={{ fontWeight: 600, color: t.txt, fontSize: 13 }}>{u.nome}</div><div style={{ fontSize: 10, color: t.txt2 }}>{u.username}</div></div><div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Badge c={u.tipo === 'admin' ? 'purple' : 'gray'}>{u.tipo}</Badge>{u.id !== 1 && <><button onClick={() => { setF(u); setEd(u.id); }} style={{ background: 'none', border: 'none', color: t.gold, cursor: 'pointer', fontSize: 11 }}>Ed</button><button onClick={() => del(u.id)} style={{ background: 'none', border: 'none', color: t.red, cursor: 'pointer', fontSize: 11 }}>Ex</button></>}</div></div>)}</div>
    </div>;
  };

  if (loading) return <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}><Logo /><Loader size={24} color={t.gold} className="spin" /></div>;

  const C = { dashboard: Dashboard, consultores: Consultores, clientes: Clientes, custos: Custos, lancamentos: Lancamentos, comissoes: Comissoes, tarefas: Tarefas, cobranca: Cobranca, projecao: Projecao, performance: Performance, ranking: Ranking, metas: Metas, relatorio: Relatorio, usuarios: Usuarios }[tab] || Dashboard;

  return <div style={{ minHeight: '100vh', background: t.bg }}>
    <Sidebar />
    <Toast />
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 50, background: t.card, borderBottom: `1px solid ${t.brd}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', zIndex: 30 }}>
      <button onClick={() => setSb(!sb)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}><Menu size={20} color={t.txt} /></button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{saving && <Loader size={14} color={t.org} className="spin" />}{!online && <CloudOff size={14} color={t.red} />}<Logo /></div>
      <button onClick={() => setDark(!dark)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>{dark ? <Sun size={18} color={t.txt} /> : <Moon size={18} color={t.txt} />}</button>
    </header>
    {sb && <div onClick={() => setSb(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 40 }} />}
    <main style={{ paddingTop: 58, minHeight: '100vh' }}><div style={{ padding: 12, maxWidth: 600, margin: '0 auto' }}><C /></div></main>
  </div>;
}
