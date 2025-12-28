import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Save, Download, Users, DollarSign, TrendingUp, AlertCircle, CheckCircle, Clock, Calendar, FileText, Bell, RefreshCw, Moon, Sun, Menu, Target, Star, ClipboardList, UserCheck, Award, ChevronRight, ChevronDown, Plus, LogOut, Lock, Eye, EyeOff, Loader, CloudOff, Search, X, ArrowLeft, Home } from 'lucide-react';

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
  const [sb, setSb] = useState(true);
  const [exp, setExp] = useState({c:1,o:1,a:1,s:1});
  const [toast, setToast] = useState(null);
  const [cliDetalhe, setCliDetalhe] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => { 
    loadData(); 
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setSb(!mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    const cusCloser = (+cl?.fixCloser || 0) + liq * (+cl?.pctCloser || 0);
    const cusSDR = (+cl?.fixSDR || 0) + liq * (+cl?.pctSDR || 0);
    const cusSocial = (+cl?.fixSocial || 0) + liq * (+cl?.pctSocial || 0);
    const cusTime = cusCloser + cusSDR + cusSocial;
    const cusOp = getCusCli(l.cli);
    const cusTot = cusOp + (l.status === 'Recebido' ? cusTime : 0);
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
  
  const getNotificacoes = () => {
    const notifs = [];
    const hoje = new Date(); hoje.setHours(0,0,0,0);
    getCli().filter(c => c.status === 'Ativo').forEach(c => {
      const d = diasR(c.renov);
      if (d !== null && d <= 30 && d >= 0) notifs.push({ tipo: 'renov', cli: c.nome, dias: d, cor: d <= 7 ? 'red' : 'orange', msg: `${c.nome} renova em ${d} dias` });
      else if (d !== null && d < 0) notifs.push({ tipo: 'renov', cli: c.nome, dias: d, cor: 'red', msg: `${c.nome} renovação atrasada ${Math.abs(d)} dias` });
    });
    inad().forEach(l => notifs.push({ tipo: 'venc', cli: l.cli, dias: l.dias, cor: 'red', msg: `${l.cli}: ${fmt(l.tot)} vencido há ${l.dias} dias` }));
    return notifs;
  };
  
  const receitaPorCliente = () => {
    const lm = getLanc().filter(l => l.mes === mes && l.status === 'Recebido');
    const porCli = {};
    lm.forEach(l => { if (!porCli[l.cli]) porCli[l.cli] = 0; porCli[l.cli] += +l.pago || 0; });
    return Object.entries(porCli).map(([nome, valor]) => ({ nome, valor })).sort((a, b) => b.valor - a.valor).slice(0, 5);
  };

  const gerarLancamentos = async (cliente) => {
    if (!cliente.inicio || !cliente.prazo) return [];
    const novoLancs = [];
    const dtInicio = new Date(cliente.inicio + 'T00:00:00');
    const prazoMeses = parseInt(cliente.prazo) || 12;
    const valorFixo = +cliente.valFix || 0;
    const diaPgto = +cliente.dtPgtoFix || 10;
    for (let i = 0; i < prazoMeses; i++) {
      const dtMes = new Date(dtInicio.getFullYear(), dtInicio.getMonth() + i, 1);
      const mesStr = dtMes.toISOString().slice(0, 7);
      const jaExiste = lancamentos.find(l => l.cli === cliente.nome && l.mes === mesStr);
      if (jaExiste) continue;
      const diaVenc = Math.min(diaPgto, new Date(dtMes.getFullYear(), dtMes.getMonth() + 1, 0).getDate());
      const dtVenc = new Date(dtMes.getFullYear(), dtMes.getMonth(), diaVenc);
      novoLancs.push({ id: Date.now() + Math.random() * 10000 + i, mes: mesStr, cli: cliente.nome, bruto: valorFixo, taxa: 0.05, meta: false, venc: dtVenc.toISOString().slice(0, 10), status: 'A Faturar', pago: 0 });
    }
    return novoLancs;
  };

  const gerarTodosLancamentos = async () => {
    const clientesAtivos = clientes.filter(c => c.status === 'Ativo' && c.inicio && c.prazo);
    if (clientesAtivos.length === 0) { notify('Nenhum cliente ativo com contrato!'); return; }
    let todosNovos = [];
    for (const cli of clientesAtivos) {
      const novos = await gerarLancamentos(cli);
      if (novos.length > 0) todosNovos = [...todosNovos, ...novos];
    }
    if (todosNovos.length > 0) { await svLanc([...lancamentos, ...todosNovos]); notify(`${todosNovos.length} lançamentos gerados!`); }
    else notify('Todos lançamentos já existem!');
  };

  const expCSV = () => { const r = resumo(); const csv = `\ufeffFÓRMULA COMERCIAL - ${mes}\n\nRecebido;${r.rec}\nCustos;${r.cust}\nComissões;${r.com}\nResultado;${r.rec - r.cust - r.com}`; const b = new Blob([csv], { type: 'text/csv;charset=utf-8;' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `fc_${mes}.csv`; a.click(); notify('Exportado!'); };

  // Theme
  const gold = dark ? '#d4af37' : '#996515';
  const COLORS = ['#996515', '#22c55e', '#3b82f6', '#a855f7', '#f59e0b'];
  const t = { bg: dark ? '#09090b' : '#f8f9fa', card: dark ? '#18181b' : '#fff', alt: dark ? '#27272a' : '#f4f4f5', txt: dark ? '#fafafa' : '#18181b', txt2: dark ? '#a1a1aa' : '#71717a', txt3: dark ? '#52525b' : '#a1a1aa', brd: dark ? '#27272a' : '#e4e4e7', gold, goldBg: dark ? 'rgba(212,175,55,.15)' : 'rgba(153,101,21,.08)', grn: '#22c55e', grnBg: dark ? 'rgba(34,197,94,.2)' : 'rgba(34,197,94,.1)', red: '#ef4444', redBg: dark ? 'rgba(239,68,68,.2)' : 'rgba(239,68,68,.1)', org: '#f59e0b', orgBg: dark ? 'rgba(245,158,11,.2)' : 'rgba(245,158,11,.1)', pur: '#a855f7', purBg: dark ? 'rgba(168,85,247,.2)' : 'rgba(168,85,247,.1)', blue: '#3b82f6', blueBg: dark ? 'rgba(59,130,246,.2)' : 'rgba(59,130,246,.1)' };
  
  // Sidebar width
  const sideW = sb ? 260 : 0;
  
  const s = { 
    card: { background: t.card, border: `1px solid ${t.brd}`, borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,.05)' }, 
    inp: { width: '100%', padding: '12px 14px', background: t.alt, border: `1px solid ${t.brd}`, borderRadius: 10, color: t.txt, fontSize: 14, outline: 'none' }, 
    btn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', background: dark ? '#fff' : '#18181b', color: dark ? '#18181b' : '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all .2s' }, 
    lbl: { display: 'block', fontSize: 11, fontWeight: 600, color: t.txt2, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }, 
    ttl: { fontSize: 18, fontWeight: 700, color: t.txt, marginBottom: 16 } 
  };
  
  const Badge = ({ children, c = 'gray' }) => { const x = { gray: { bg: t.alt, txt: t.txt2 }, green: { bg: t.grnBg, txt: t.grn }, red: { bg: t.redBg, txt: t.red }, orange: { bg: t.orgBg, txt: t.org }, purple: { bg: t.purBg, txt: t.pur }, blue: { bg: t.blueBg, txt: t.blue } }[c]; return <span style={{ padding: '5px 10px', background: x.bg, color: x.txt, borderRadius: 8, fontSize: 12, fontWeight: 600 }}>{children}</span>; };
  const Logo = () => <svg viewBox="0 0 200 55" style={{ width: 130 }}><text x="100" y="22" textAnchor="middle" style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 300, letterSpacing: 4 }} fill={t.txt}>FÓRMULA</text><text x="100" y="44" textAnchor="middle" style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, letterSpacing: 2 }} fill={t.txt}>COMERCIAL</text><line x1="70" y1="52" x2="130" y2="52" stroke={t.gold} strokeWidth="2" /></svg>;
  const Toast = () => toast && <div style={{ position: 'fixed', bottom: 24, right: 24, padding: '14px 24px', background: toast.includes('Erro') ? t.red : t.grn, color: '#fff', borderRadius: 12, fontWeight: 600, zIndex: 999, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(0,0,0,.15)' }}>{saving && <Loader size={16} className="spin" />}{toast}</div>;
  const Dica = ({ texto }) => <span style={{ fontSize: 10, color: t.txt3, fontWeight: 400, display: 'block', marginTop: 4 }}>{texto}</span>;

  // Login
  if (!user) return <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${t.bg} 0%, ${t.alt} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
    <div style={{ ...s.card, width: '100%', maxWidth: 400, padding: 40 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}><Logo /><p style={{ color: t.txt2, marginTop: 12, fontSize: 14 }}>Faça login para continuar</p></div>
      {!online && <div style={{ padding: 12, background: t.redBg, borderRadius: 10, marginBottom: 16, color: t.red, fontSize: 13, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><CloudOff size={16} />Sem conexão com o servidor</div>}
      {le && <div style={{ padding: 12, background: t.redBg, borderRadius: 10, marginBottom: 16, color: t.red, fontSize: 13, textAlign: 'center' }}>{le}</div>}
      <div style={{ marginBottom: 16 }}><label style={s.lbl}>E-mail</label><input style={s.inp} value={lf.u} onChange={e => setLf({ ...lf, u: e.target.value })} onKeyDown={e => e.key === 'Enter' && login()} placeholder="seu@email.com" /></div>
      <div style={{ marginBottom: 24 }}><label style={s.lbl}>Senha</label><div style={{ position: 'relative' }}><input style={{ ...s.inp, paddingRight: 44 }} type={showP ? 'text' : 'password'} value={lf.p} onChange={e => setLf({ ...lf, p: e.target.value })} onKeyDown={e => e.key === 'Enter' && login()} placeholder="••••••••" /><button onClick={() => setShowP(!showP)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>{showP ? <EyeOff size={18} color={t.txt3} /> : <Eye size={18} color={t.txt3} />}</button></div></div>
      <button onClick={login} disabled={loading} style={{ ...s.btn, width: '100%', justifyContent: 'center', background: t.gold, color: '#fff', padding: 14 }}>{loading ? <><Loader size={16} className="spin" />Conectando...</> : <><Lock size={16} />Entrar</>}</button>
      <button onClick={loadData} style={{ width: '100%', marginTop: 12, padding: 12, background: 'none', border: `1px solid ${t.brd}`, borderRadius: 10, color: t.txt2, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><RefreshCw size={14} />Reconectar ao servidor</button>
    </div>
  </div>;

  // Sidebar
  const Sidebar = () => {
    const tipoLabel = { admin: 'Administrador', financeiro: 'Financeiro', consultor: 'Consultor' }[user.tipo];
    const tipoColor = { admin: 'purple', financeiro: 'orange', consultor: 'gray' }[user.tipo];
    const menuCad = canEditAll ? [{ id: 'consultores', l: 'Consultores', ic: UserCheck }, { id: 'clientes', l: 'Clientes', ic: Users }, { id: 'custos', l: 'Custos', ic: DollarSign }] : [{ id: 'clientes', l: isCons ? 'Meus Clientes' : 'Clientes', ic: Users }];
    const menu = [{ sc: 'm', it: [{ id: 'dashboard', l: 'Dashboard', ic: Home }] }, { sc: 'c', l: 'Cadastros', it: menuCad }, { sc: 'o', l: 'Operacional', it: [{ id: 'lancamentos', l: 'Lançamentos', ic: Calendar }, { id: 'comissoes', l: 'Comissões', ic: Award }, { id: 'tarefas', l: 'Tarefas', ic: ClipboardList }, { id: 'cobranca', l: 'Cobrança', ic: AlertCircle }] }, { sc: 'a', l: 'Análise', it: [{ id: 'projecao', l: 'Projeção', ic: TrendingUp }, { id: 'performance', l: 'Performance', ic: Target }, { id: 'ranking', l: 'Ranking', ic: Star }, { id: 'metas', l: 'Metas', ic: Target }, { id: 'relatorio', l: 'Relatório', ic: FileText }] }, ...(isAdm ? [{ sc: 's', l: 'Sistema', it: [{ id: 'usuarios', l: 'Usuários', ic: Users }] }] : [])];
    const navTo = id => { setTab(id); setCliDetalhe(null); if (isMobile) setSb(false); };
    const notifs = getNotificacoes();
    
    return <aside style={{ position: 'fixed', left: 0, top: 0, width: sideW, height: '100vh', background: t.card, borderRight: `1px solid ${t.brd}`, zIndex: 50, transition: 'width .3s ease', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 20, borderBottom: `1px solid ${t.brd}`, textAlign: 'center' }}><Logo /></div>
      <div style={{ padding: 16, borderBottom: `1px solid ${t.brd}`, background: t.goldBg }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: t.txt, marginBottom: 6 }}>{user.nome}</div>
        <Badge c={tipoColor}>{tipoLabel}</Badge>
      </div>
      <div style={{ padding: 12, borderBottom: `1px solid ${t.brd}` }}>
        <label style={{ ...s.lbl, marginBottom: 8 }}>Período</label>
        <input type="month" value={mes} onChange={e => setMes(e.target.value)} style={{ ...s.inp, padding: 10, fontSize: 13 }} />
      </div>
      {notifs.length > 0 && <div style={{ padding: 12, borderBottom: `1px solid ${t.brd}`, background: t.orgBg, maxHeight: 140, overflowY: 'auto' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: t.org, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Bell size={14} /> {notifs.length} ALERTAS</div>
        {notifs.slice(0, 4).map((n, i) => <div key={i} style={{ fontSize: 11, color: t.txt2, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 4, background: t[n.cor], flexShrink: 0 }} />{n.msg}</div>)}
      </div>}
      <nav style={{ flex: 1, padding: 12, overflowY: 'auto' }}>{menu.map(g => <div key={g.sc} style={{ marginBottom: 8 }}>{g.l && <button onClick={() => setExp({ ...exp, [g.sc]: !exp[g.sc] })} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'none', border: 'none', color: t.txt3, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer', letterSpacing: 0.5 }}>{g.l}{exp[g.sc] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</button>}{(g.sc === 'm' || exp[g.sc]) && g.it.map(i => <button key={i.id} onClick={() => navTo(i.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: tab === i.id ? t.goldBg : 'transparent', border: 'none', borderRadius: 8, color: tab === i.id ? t.gold : t.txt2, fontSize: 13, fontWeight: tab === i.id ? 600 : 400, cursor: 'pointer', marginBottom: 4, transition: 'all .2s' }}><i.ic size={16} />{i.l}</button>)}</div>)}</nav>
      <div style={{ padding: 12, borderTop: `1px solid ${t.brd}`, display: 'flex', gap: 6 }}>
        <button onClick={() => setDark(!dark)} style={{ padding: 10, background: t.alt, border: 'none', borderRadius: 8, cursor: 'pointer', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{dark ? <Sun size={16} color={t.txt} /> : <Moon size={16} color={t.txt} />}</button>
        <button onClick={loadData} style={{ padding: 10, background: t.alt, border: 'none', borderRadius: 8, cursor: 'pointer' }}><RefreshCw size={16} color={t.txt} /></button>
        <button onClick={expCSV} style={{ padding: 10, background: t.alt, border: 'none', borderRadius: 8, cursor: 'pointer' }}><Download size={16} color={t.txt} /></button>
        <button onClick={logout} style={{ padding: 10, background: t.redBg, border: 'none', borderRadius: 8, cursor: 'pointer' }}><LogOut size={16} color={t.red} /></button>
      </div>
    </aside>;
  };

  // Dashboard
  const Dashboard = () => {
    const r = resumo(); const notifs = getNotificacoes(); const recCli = receitaPorCliente();
    const mg = metas.find(m => m.cons === (canViewAll ? 'GERAL' : uCons) && m.mes === mes); 
    const at = mg?.val > 0 ? r.rec / mg.val : 0;
    const res = r.rec - r.cust - r.com;
    const compMensal = []; const h = new Date();
    for (let i = 5; i >= 0; i--) {
      const ms = new Date(h.getFullYear(), h.getMonth() - i, 1).toISOString().slice(0, 7);
      const lm = getLanc().filter(l => l.mes === ms).map(calc);
      compMensal.push({ m: ms.slice(5), rec: lm.filter(l => l.status === 'Recebido').reduce((x, l) => x + (+l.pago || 0), 0), prev: lm.filter(l => ['A Faturar', 'Faturado'].includes(l.status)).reduce((x, l) => x + l.tot, 0) });
    }

    return <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: t.txt, marginBottom: 4 }}>Olá, {user.nome.split(' ')[0]}! 👋</h1>
        <p style={{ color: t.txt2, fontSize: 15 }}>Aqui está o resumo de {mes}</p>
      </div>
      
      {notifs.length > 0 && <div style={{ ...s.card, padding: 16, borderLeft: `4px solid ${t.org}`, background: t.orgBg }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: t.org, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}><Bell size={16} /> {notifs.length} alertas precisam de atenção</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifs.slice(0, 3).map((n, i) => <div key={i} style={{ fontSize: 13, color: t.txt, display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 10, height: 10, borderRadius: 5, background: t[n.cor], flexShrink: 0 }} />{n.msg}</div>)}
        </div>
      </div>}
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
        {[{ l: 'A Receber', v: r.aRec, ic: Clock, c: t.txt, bg: t.alt }, { l: 'Recebido', v: r.rec, ic: CheckCircle, c: t.grn, bg: t.grnBg }, { l: 'Vencido', v: r.venc, ic: AlertCircle, c: t.red, bg: t.redBg }, { l: 'Resultado', v: res, ic: TrendingUp, c: res >= 0 ? t.grn : t.red, bg: res >= 0 ? t.grnBg : t.redBg, hl: 1 }].map((x, i) => 
          <div key={i} style={{ ...s.card, padding: 20, background: x.bg, border: x.hl ? `2px solid ${t.gold}` : s.card.border }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}><x.ic size={20} color={x.c} /><span style={{ fontSize: 12, color: t.txt2, fontWeight: 500 }}>{x.l}</span></div>
            <div style={{ fontSize: 24, fontWeight: 700, color: x.c }}>{fmt(x.v)}</div>
          </div>
        )}
      </div>
      
      {mg?.val > 0 && <div style={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div><div style={{ fontSize: 12, color: t.txt3, marginBottom: 4 }}>META DO MÊS</div><div style={{ fontSize: 28, fontWeight: 700, color: t.txt }}>{fmt(mg.val)}</div></div>
          <div style={{ textAlign: 'right' }}><div style={{ fontSize: 40, fontWeight: 700, color: at >= 1 ? t.grn : at >= 0.7 ? t.org : t.gold }}>{(at * 100).toFixed(0)}%</div><div style={{ fontSize: 12, color: t.txt3 }}>{fmt(r.rec)} recebido</div></div>
        </div>
        <div style={{ height: 16, background: t.alt, borderRadius: 8, overflow: 'hidden' }}><div style={{ height: '100%', width: `${Math.min(at * 100, 100)}%`, background: `linear-gradient(90deg, ${t.gold}, ${at >= 1 ? t.grn : t.org})`, borderRadius: 8, transition: 'width 0.5s' }} /></div>
      </div>}
      
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 20 }}>
        {recCli.length > 0 && <div style={s.card}>
          <h3 style={{ ...s.ttl, fontSize: 16 }}>🏆 Top 5 Clientes</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <ResponsiveContainer width="45%" height={160}>
              <PieChart><Pie data={recCli} dataKey="valor" nameKey="nome" cx="50%" cy="50%" outerRadius={60} innerRadius={35}>{recCli.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip formatter={v => fmt(v)} /></PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>{recCli.map((c, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: COLORS[i % COLORS.length] }} /><span style={{ flex: 1, color: t.txt2, fontSize: 13 }}>{c.nome}</span><span style={{ fontWeight: 600, color: t.txt, fontSize: 13 }}>{fmt(c.valor)}</span></div>)}</div>
          </div>
        </div>}
        
        <div style={s.card}>
          <h3 style={{ ...s.ttl, fontSize: 16 }}>📊 Comparativo Mensal</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={compMensal}><XAxis dataKey="m" fontSize={11} stroke={t.txt3} axisLine={false} tickLine={false} /><YAxis fontSize={11} stroke={t.txt3} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} width={35} /><Tooltip formatter={v => fmt(v)} contentStyle={{ background: t.card, border: `1px solid ${t.brd}`, borderRadius: 8, fontSize: 12 }} /><Bar dataKey="rec" name="Recebido" fill={t.grn} radius={[4, 4, 0, 0]} /><Bar dataKey="prev" name="Previsto" fill={t.gold} radius={[4, 4, 0, 0]} /></BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 12 }}><div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: t.grn }} /> Recebido</div><div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: t.gold }} /> Previsto</div></div>
        </div>
      </div>
    </div>;
  };

  const Dashboard = () => {
    const r = resumo(); const notifs = getNotificacoes(); const recCli = receitaPorCliente();
    const res = r.rec - r.cust - r.com;
    const mg = metas.find(m => m.cons === (canViewAll ? 'GERAL' : uCons) && m.mes === mes);
    const at = mg?.val > 0 ? r.rec / mg.val : 0;
    const compMensal = []; const h = new Date();
    for (let i = 5; i >= 0; i--) {
      const ms = new Date(h.getFullYear(), h.getMonth() - i, 1).toISOString().slice(0, 7);
      const lm = getLanc().filter(l => l.mes === ms).map(calc);
      compMensal.push({ m: ms.slice(5), rec: lm.filter(l => l.status === 'Recebido').reduce((x, l) => x + (+l.pago || 0), 0), prev: lm.filter(l => ['A Faturar', 'Faturado'].includes(l.status)).reduce((x, l) => x + l.tot, 0) });
    }

    return <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: t.txt, marginBottom: 4 }}>Olá, {user.nome.split(' ')[0]}!</h1>
        <p style={{ color: t.txt2, fontSize: 15 }}>Aqui está o resumo de {mes}</p>
      </div>
      
      {notifs.length > 0 && <div style={{ ...s.card, padding: 16, borderLeft: `4px solid ${t.org}`, background: t.orgBg, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: t.org, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}><Bell size={18} />{notifs.length} Alertas importantes</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {notifs.slice(0, 4).map((n, i) => <div key={i} style={{ fontSize: 13, color: t.txt, display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: 4, background: t[n.cor], flexShrink: 0 }} />{n.msg}</div>)}
        </div>
      </div>}
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[{ l: 'A Receber', v: r.aRec, ic: Clock, c: t.txt, bg: t.alt }, { l: 'Recebido', v: r.rec, ic: CheckCircle, c: t.grn, bg: t.grnBg }, { l: 'Vencido', v: r.venc, ic: AlertCircle, c: t.red, bg: t.redBg }, { l: 'Resultado', v: res, ic: TrendingUp, c: res >= 0 ? t.grn : t.red, bg: res >= 0 ? t.grnBg : t.redBg, hl: 1 }].map((x, i) => 
          <div key={i} style={{ ...s.card, padding: 20, background: x.bg, border: x.hl ? `2px solid ${t.gold}` : s.card.border }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><x.ic size={20} color={x.c} /><span style={{ fontSize: 13, color: t.txt2 }}>{x.l}</span></div>
            <div style={{ fontSize: 24, fontWeight: 700, color: x.c }}>{fmt(x.v)}</div>
          </div>
        )}
      </div>
      
      {mg?.val > 0 && <div style={{ ...s.card, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div><div style={{ fontSize: 13, color: t.txt3 }}>META DO MÊS</div><div style={{ fontSize: 28, fontWeight: 700, color: t.txt }}>{fmt(mg.val)}</div></div>
          <div style={{ textAlign: 'right' }}><div style={{ fontSize: 40, fontWeight: 700, color: at >= 1 ? t.grn : at >= 0.7 ? t.org : t.gold }}>{(at * 100).toFixed(0)}%</div><div style={{ fontSize: 13, color: t.txt3 }}>{fmt(r.rec)} recebido</div></div>
        </div>
        <div style={{ height: 16, background: t.alt, borderRadius: 8, overflow: 'hidden' }}><div style={{ height: '100%', width: `${Math.min(at * 100, 100)}%`, background: at >= 1 ? t.grn : at >= 0.7 ? t.org : t.gold, borderRadius: 8, transition: 'width 0.5s' }} /></div>
      </div>}
      
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>
        {recCli.length > 0 && <div style={s.card}>
          <h3 style={{ ...s.ttl, fontSize: 16 }}>Top 5 Clientes</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart><Pie data={recCli} dataKey="valor" nameKey="nome" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>{recCli.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip formatter={v => fmt(v)} /></PieChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 12 }}>{recCli.map((c, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: COLORS[i % COLORS.length] }} /><span style={{ flex: 1, fontSize: 13, color: t.txt2 }}>{c.nome}</span><span style={{ fontWeight: 600, color: t.txt }}>{fmt(c.valor)}</span></div>)}</div>
        </div>}
        
        <div style={s.card}>
          <h3 style={{ ...s.ttl, fontSize: 16 }}>Evolução Mensal</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={compMensal}><XAxis dataKey="m" fontSize={11} stroke={t.txt3} axisLine={false} tickLine={false} /><YAxis fontSize={11} stroke={t.txt3} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} width={40} /><Tooltip formatter={v => fmt(v)} contentStyle={{ background: t.card, border: `1px solid ${t.brd}`, borderRadius: 8, fontSize: 12 }} /><Bar dataKey="rec" name="Recebido" fill={t.grn} radius={[4, 4, 0, 0]} /><Bar dataKey="prev" name="Previsto" fill={t.gold} radius={[4, 4, 0, 0]} /></BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 12 }}><div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: t.grn }} />Recebido</div><div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: t.gold }} />Previsto</div></div>
        </div>
      </div>
    </div>;
  };

  const Consultores = () => {
    if (!canEditAll) return <div style={s.card}><p style={{ color: t.txt3, textAlign: 'center', padding: 40 }}>🔒 Acesso restrito</p></div>;
    const [f, setF] = useState({ nome: '', pctCom: 20, email: '', tel: '' }); const [ed, setEd] = useState(null);
    const salvar = async () => { if (!f.nome) return notify('Preencha o nome!'); const dados = { ...f, pctCom: (+f.pctCom || 0) / 100 }; if (ed) { await svCons(consultores.map(c => c.id === ed ? { ...dados, id: ed } : c)); setEd(null); } else await svCons([...consultores, { ...dados, id: Date.now() }]); setF({ nome: '', pctCom: 20, email: '', tel: '' }); };
    const del = async id => { if(!confirm('Excluir este consultor?')) return; await svCons(consultores.filter(x => x.id !== id)); };
    
    return <div style={{ display: 'grid', gap: 20 }}>
      <div style={s.card}>
        <h3 style={s.ttl}>{ed ? '✏️ Editar Consultor' : '➕ Novo Consultor'}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
          <div><label style={s.lbl}>Nome Completo *</label><input style={s.inp} value={f.nome} onChange={e => setF({ ...f, nome: e.target.value })} placeholder="Ex: João Silva" /></div>
          <div><label style={s.lbl}>% Comissão</label><input style={s.inp} type="number" value={f.pctCom} onChange={e => setF({ ...f, pctCom: +e.target.value || 0 })} /><span style={{ fontSize: 11, color: t.txt3 }}>Percentual sobre recebimentos</span></div>
          <div><label style={s.lbl}>E-mail</label><input style={s.inp} type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></div>
          <div><label style={s.lbl}>Telefone</label><input style={s.inp} value={f.tel} onChange={e => setF({ ...f, tel: e.target.value })} /></div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={salvar} disabled={saving} style={{ ...s.btn, background: t.gold, color: '#fff' }}><Save size={16} />{ed ? 'Salvar' : 'Cadastrar'}</button>
          {ed && <button onClick={() => { setEd(null); setF({ nome: '', pctCom: 20, email: '', tel: '' }); }} style={{ ...s.btn, background: t.alt, color: t.txt }}><X size={16} />Cancelar</button>}
        </div>
      </div>
      <div style={s.card}>
        <h3 style={s.ttl}>👥 Consultores ({consultores.length})</h3>
        {consultores.length === 0 ? <p style={{ color: t.txt3, textAlign: 'center', padding: 30 }}>Nenhum consultor cadastrado</p> : 
        <div style={{ display: 'grid', gap: 12 }}>{consultores.map(c => <div key={c.id} style={{ padding: 16, background: t.alt, borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><div style={{ fontWeight: 600, color: t.txt, fontSize: 15 }}>{c.nome}</div><div style={{ fontSize: 13, color: t.pur, marginTop: 4 }}>💰 {pct(c.pctCom)} • 👥 {clientes.filter(x => x.cons === c.nome).length} clientes</div></div>
          <div style={{ display: 'flex', gap: 8 }}><button onClick={() => { setF({ nome: c.nome, pctCom: (c.pctCom || 0.2) * 100, email: c.email || '', tel: c.tel || '' }); setEd(c.id); }} style={{ ...s.btn, padding: '8px 14px', fontSize: 13, background: t.goldBg, color: t.gold }}>✏️</button><button onClick={() => del(c.id)} style={{ ...s.btn, padding: '8px 14px', fontSize: 13, background: t.redBg, color: t.red }}>🗑️</button></div>
        </div>)}</div>}
      </div>
    </div>;
  };

  // Consultores
  const Consultores = () => {
    if (!canEditAll) return <div style={s.card}><p style={{ color: t.txt3, textAlign: 'center', padding: 40 }}>🔒 Acesso restrito a administradores</p></div>;
    const [f, setF] = useState({ nome: '', pctCom: 20, email: '', tel: '' }); const [ed, setEd] = useState(null);
    const salvar = async () => { if (!f.nome) return notify('Preencha o nome!'); const dados = { ...f, pctCom: (+f.pctCom || 0) / 100 }; if (ed) { await svCons(consultores.map(c => c.id === ed ? { ...dados, id: ed } : c)); setEd(null); } else await svCons([...consultores, { ...dados, id: Date.now() }]); setF({ nome: '', pctCom: 20, email: '', tel: '' }); };
    const del = async id => { if(!confirm('Tem certeza que deseja excluir este consultor?')) return; await svCons(consultores.filter(x => x.id !== id)); };
    const editar = c => { setF({ nome: c.nome, pctCom: (c.pctCom || 0.2) * 100, email: c.email || '', tel: c.tel || '' }); setEd(c.id); };
    
    return <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={s.card}>
        <h3 style={s.ttl}>{ed ? '✏️ Editar Consultor' : '➕ Novo Consultor'}</h3>
        <p style={{ color: t.txt3, fontSize: 13, marginBottom: 20, marginTop: -8 }}>Cadastre os consultores que gerenciam seus clientes</p>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 16 }}>
          <div><label style={s.lbl}>Nome Completo *</label><input style={s.inp} value={f.nome} onChange={e => setF({ ...f, nome: e.target.value })} placeholder="Ex: João Silva" /></div>
          <div><label style={s.lbl}>% Comissão</label><input style={s.inp} type="number" value={f.pctCom} onChange={e => setF({ ...f, pctCom: +e.target.value || 0 })} placeholder="20" /><Dica texto="Percentual sobre os recebimentos" /></div>
          <div><label style={s.lbl}>E-mail</label><input style={s.inp} type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} placeholder="joao@email.com" /></div>
          <div><label style={s.lbl}>Telefone</label><input style={s.inp} value={f.tel} onChange={e => setF({ ...f, tel: e.target.value })} placeholder="(11) 99999-9999" /></div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={salvar} disabled={saving} style={{ ...s.btn, background: t.gold, color: '#fff' }}><Save size={16} />{ed ? 'Salvar Alterações' : 'Cadastrar Consultor'}</button>
          {ed && <button onClick={() => { setEd(null); setF({ nome: '', pctCom: 20, email: '', tel: '' }); }} style={{ ...s.btn, background: t.alt, color: t.txt }}><X size={16} />Cancelar</button>}
        </div>
      </div>
      <div style={s.card}>
        <h3 style={s.ttl}>👥 Consultores Cadastrados ({consultores.length})</h3>
        {consultores.length === 0 ? <p style={{ color: t.txt3, textAlign: 'center', padding: 40 }}>Nenhum consultor cadastrado ainda</p> : 
        <div style={{ display: 'grid', gap: 12 }}>{consultores.map(c => <div key={c.id} style={{ padding: 16, background: t.alt, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><div style={{ fontWeight: 600, color: t.txt, fontSize: 15, marginBottom: 4 }}>{c.nome}</div><div style={{ fontSize: 13, color: t.pur }}>💰 {pct(c.pctCom)} comissão • 👥 {clientes.filter(x => x.cons === c.nome).length} clientes</div>{c.email && <div style={{ fontSize: 12, color: t.txt3, marginTop: 4 }}>📧 {c.email}</div>}</div>
          <div style={{ display: 'flex', gap: 8 }}><button onClick={() => editar(c)} style={{ ...s.btn, padding: '8px 14px', fontSize: 13, background: t.goldBg, color: t.gold }}>✏️ Editar</button><button onClick={() => del(c.id)} style={{ ...s.btn, padding: '8px 14px', fontSize: 13, background: t.redBg, color: t.red }}>🗑️</button></div>
        </div>)}</div>}
      </div>
    </div>;
  };

  // Clientes
  const Clientes = () => {
    const ef = { nome: '', pctFix: 0, valFix: 0, pctBonus: 0, valBonus: 0, metaFat: 0, dtPgtoFix: '', dtPgtoCom: '', fixCloser: 0, pctCloser: 0, fixSDR: 0, pctSDR: 0, fixSocial: 0, pctSocial: 0, cons: '', inicio: '', renov: '', prazo: 12, status: 'Ativo', nps: '', probRen: 100 };
    const [f, setF] = useState(ef); const [ed, setEd] = useState(null);
    const salvar = async () => { 
      if (!f.nome) return notify('Preencha o nome do cliente!'); 
      const dados = { ...f, pctFix: (+f.pctFix || 0) / 100, pctBonus: (+f.pctBonus || 0) / 100, pctCloser: (+f.pctCloser || 0) / 100, pctSDR: (+f.pctSDR || 0) / 100, pctSocial: (+f.pctSocial || 0) / 100, probRen: (+f.probRen || 100) / 100 }; 
      if (ed) { await svCli(clientes.map(c => c.id === ed ? { ...dados, id: ed } : c)); setEd(null); } 
      else { const novoCli = { ...dados, id: Date.now() }; await svCli([...clientes, novoCli]); if (dados.inicio && dados.prazo) { const novos = await gerarLancamentos(novoCli); if (novos.length > 0) await svLanc([...lancamentos, ...novos]); } }
      setF(ef); 
    };
    const del = async id => { if(!confirm('Excluir este cliente?')) return; await svCli(clientes.filter(x => x.id !== id)); };
    const editar = c => { setF({ ...c, pctFix: (c.pctFix || 0) * 100, pctBonus: (c.pctBonus || 0) * 100, pctCloser: (c.pctCloser || 0) * 100, pctSDR: (c.pctSDR || 0) * 100, pctSocial: (c.pctSocial || 0) * 100, probRen: (c.probRen || 1) * 100, metaFat: c.metaFat || 0, dtPgtoFix: c.dtPgtoFix || '', dtPgtoCom: c.dtPgtoCom || '', fixCloser: c.fixCloser || 0, fixSDR: c.fixSDR || 0, fixSocial: c.fixSocial || 0, valFix: c.valFix || 0, valBonus: c.valBonus || 0, cons: c.cons || '', status: c.status || 'Ativo', inicio: c.inicio || '', renov: c.renov || '', prazo: c.prazo || 12, nps: c.nps || '' }); setEd(c.id); };
    const fmtFixo = c => { const p = []; if (c.pctFix > 0) p.push(pct(c.pctFix)); if (c.valFix > 0) p.push(fmt(c.valFix)); return p.length ? p.join(' + ') : '-'; };
    const temTime = c => (c.fixCloser > 0 || c.pctCloser > 0 || c.fixSDR > 0 || c.pctSDR > 0 || c.fixSocial > 0 || c.pctSocial > 0);

    if (!canEditAll) return <div style={s.card}><h3 style={s.ttl}>{isCons ? 'Meus Clientes' : 'Clientes'}</h3>{getCli().length === 0 ? <p style={{ color: t.txt3, textAlign: 'center', padding: 40 }}>Nenhum cliente</p> : <div style={{ display: 'grid', gap: 12 }}>{getCli().map(c => { const sr = statR(c); return <div key={c.id} style={{ padding: 16, background: t.alt, borderRadius: 12 }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontWeight: 600, color: t.txt, fontSize: 15 }}>{c.nome}</span><Badge c={c.status === 'Ativo' ? 'green' : 'gray'}>{c.status}</Badge></div><div style={{ fontSize: 13, color: t.txt2 }}>Fixo: {fmtFixo(c)} • <Badge c={sr.cor}>Renova: {sr.l}</Badge></div></div>; })}</div>}</div>;

    return <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={s.card}>
        <h3 style={s.ttl}>{ed ? '✏️ Editar Cliente' : '➕ Novo Cliente'}</h3>
        
        <div style={{ background: t.alt, padding: 16, borderRadius: 12, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: t.gold, marginBottom: 4 }}>💰 SUA PARTICIPAÇÃO</div>
          <p style={{ fontSize: 12, color: t.txt3, marginBottom: 12 }}>Quanto você recebe deste cliente todo mês</p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 12 }}>
            <div><label style={s.lbl}>Nome do Cliente *</label><input style={s.inp} value={f.nome} onChange={e => setF({ ...f, nome: e.target.value })} placeholder="Ex: Empresa ABC" /></div>
            <div><label style={s.lbl}>Consultor Responsável</label><select style={s.inp} value={f.cons} onChange={e => setF({ ...f, cons: e.target.value })}><option value="">Selecione...</option>{consultores.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}</select></div>
            <div><label style={s.lbl}>% sobre Faturamento</label><input style={s.inp} type="number" value={f.pctFix} onChange={e => setF({ ...f, pctFix: +e.target.value || 0 })} placeholder="Ex: 10" /><Dica texto="Percentual fixo mensal" /></div>
            <div><label style={s.lbl}>Valor Fixo Mensal (R$)</label><input style={s.inp} type="number" value={f.valFix} onChange={e => setF({ ...f, valFix: +e.target.value || 0 })} placeholder="Ex: 3000" /><Dica texto="Valor garantido todo mês" /></div>
            <div><label style={s.lbl}>% Bônus (se bater meta)</label><input style={s.inp} type="number" value={f.pctBonus} onChange={e => setF({ ...f, pctBonus: +e.target.value || 0 })} placeholder="Ex: 5" /></div>
            <div><label style={s.lbl}>Meta de Faturamento (R$)</label><input style={s.inp} type="number" value={f.metaFat} onChange={e => setF({ ...f, metaFat: +e.target.value || 0 })} placeholder="Ex: 50000" /><Dica texto="Se faturar acima, ganha bônus" /></div>
          </div>
        </div>
        
        <div style={{ background: t.alt, padding: 16, borderRadius: 12, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: t.txt, marginBottom: 4 }}>📋 CONTRATO</div>
          <p style={{ fontSize: 12, color: t.txt3, marginBottom: 12 }}>Informações do contrato com o cliente</p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 12 }}>
            <div><label style={s.lbl}>Data de Início</label><input style={s.inp} type="date" value={f.inicio} onChange={e => { const novoInicio = e.target.value; if (novoInicio && f.prazo) { const d = new Date(novoInicio); d.setMonth(d.getMonth() + parseInt(f.prazo)); setF({ ...f, inicio: novoInicio, renov: d.toISOString().slice(0, 10) }); } else setF({ ...f, inicio: novoInicio }); }} /></div>
            <div><label style={s.lbl}>Duração (meses)</label><input style={s.inp} type="number" value={f.prazo} onChange={e => { const novoPrazo = +e.target.value || 12; if (f.inicio) { const d = new Date(f.inicio); d.setMonth(d.getMonth() + novoPrazo); setF({ ...f, prazo: novoPrazo, renov: d.toISOString().slice(0, 10) }); } else setF({ ...f, prazo: novoPrazo }); }} /></div>
            <div><label style={s.lbl}>Data de Renovação</label><input style={{ ...s.inp, background: t.card }} type="date" value={f.renov} readOnly /><Dica texto="Calculado automaticamente" /></div>
            <div><label style={s.lbl}>Status</label><select style={s.inp} value={f.status} onChange={e => setF({ ...f, status: e.target.value })}><option>Ativo</option><option>Inativo</option><option>Cancelado</option></select></div>
            <div><label style={s.lbl}>Dia Pgto Fixo (1-31)</label><input style={s.inp} type="number" min="1" max="31" value={f.dtPgtoFix} onChange={e => setF({ ...f, dtPgtoFix: +e.target.value || '' })} placeholder="Ex: 10" /></div>
            <div><label style={s.lbl}>NPS (0-10)</label><input style={s.inp} type="number" min="0" max="10" value={f.nps} onChange={e => setF({ ...f, nps: +e.target.value || '' })} placeholder="Ex: 9" /></div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={salvar} disabled={saving} style={{ ...s.btn, background: t.gold, color: '#fff' }}><Save size={16} />{ed ? 'Salvar Alterações' : 'Cadastrar Cliente'}</button>
          {ed && <button onClick={() => { setEd(null); setF(ef); }} style={{ ...s.btn, background: t.alt, color: t.txt }}><X size={16} />Cancelar</button>}
        </div>
      </div>
      
      <div style={{ ...s.card, background: t.goldBg, border: `1px solid ${t.gold}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><div style={{ fontSize: 15, fontWeight: 600, color: t.txt }}>📅 Gerar Lançamentos Automáticos</div><div style={{ fontSize: 13, color: t.txt2, marginTop: 2 }}>Cria os lançamentos mensais para todos os clientes ativos</div></div>
          <button onClick={gerarTodosLancamentos} disabled={saving} style={{ ...s.btn, background: t.gold, color: '#fff' }}><Calendar size={16} />Gerar Todos</button>
        </div>
      </div>
      
      <div style={s.card}>
        <h3 style={s.ttl}>📋 Clientes Cadastrados ({clientes.length})</h3>
        {clientes.length === 0 ? <p style={{ color: t.txt3, textAlign: 'center', padding: 40 }}>Nenhum cliente cadastrado ainda</p> : 
        <div style={{ display: 'grid', gap: 12 }}>{clientes.map(c => { const sr = statR(c); return <div key={c.id} style={{ padding: 16, background: t.alt, borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div><div style={{ fontWeight: 600, color: t.txt, fontSize: 15 }}>{c.nome}</div><div style={{ fontSize: 12, color: t.txt2, marginTop: 2 }}>{c.cons || 'Sem consultor'}{temTime(c) ? ' • 👥 Time comercial' : ''}</div></div>
            <div style={{ display: 'flex', gap: 8 }}><button onClick={() => editar(c)} style={{ ...s.btn, padding: '8px 14px', fontSize: 13, background: t.goldBg, color: t.gold }}>✏️</button><button onClick={() => del(c.id)} style={{ ...s.btn, padding: '8px 14px', fontSize: 13, background: t.redBg, color: t.red }}>🗑️</button></div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><Badge c={c.status === 'Ativo' ? 'green' : 'gray'}>{c.status}</Badge><Badge c={sr.cor}>Renova: {sr.l}</Badge>{c.valFix > 0 && <Badge c="blue">Fixo: {fmt(c.valFix)}</Badge>}</div>
        </div>; })}</div>}
      </div>
    </div>;
  };

  // Custos
  const Custos = () => {
    if (!canEditAll) return <div style={s.card}><p style={{ color: t.txt3, textAlign: 'center', padding: 40 }}>🔒 Acesso restrito</p></div>;
    const ef = { cli: '', tipo: 'Ferramenta', descricao: '', val: 0 }; const [f, setF] = useState(ef); const [ed, setEd] = useState(null);
    const salvar = async () => { if (!f.cli || !f.descricao) return notify('Preencha cliente e descrição!'); if (ed) { await svCust(custos.map(c => c.id === ed ? { ...f, id: ed } : c)); setEd(null); } else await svCust([...custos, { ...f, id: Date.now() }]); setF(ef); };
    const del = async id => { if(!confirm('Excluir este custo?')) return; await svCust(custos.filter(c => c.id !== id)); };
    
    return <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={s.card}>
        <h3 style={s.ttl}>{ed ? '✏️ Editar' : '➕ Novo'} Custo Operacional</h3>
        <p style={{ color: t.txt3, fontSize: 13, marginBottom: 20, marginTop: -8 }}>Ferramentas e serviços vinculados a cada cliente</p>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 16 }}>
          <div><label style={s.lbl}>Cliente *</label><select style={s.inp} value={f.cli} onChange={e => setF({ ...f, cli: e.target.value })}><option value="">Selecione...</option>{clientes.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}</select></div>
          <div><label style={s.lbl}>Tipo</label><select style={s.inp} value={f.tipo} onChange={e => setF({ ...f, tipo: e.target.value })}><option>Ferramenta</option><option>Terceirizado</option><option>Outro</option></select></div>
          <div><label style={s.lbl}>Descrição *</label><input style={s.inp} value={f.descricao} onChange={e => setF({ ...f, descricao: e.target.value })} placeholder="Ex: RD Station, CRM..." /></div>
          <div><label style={s.lbl}>Valor Mensal (R$)</label><input style={s.inp} type="number" value={f.val} onChange={e => setF({ ...f, val: +e.target.value || 0 })} placeholder="Ex: 500" /></div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={salvar} disabled={saving} style={{ ...s.btn, background: t.gold, color: '#fff' }}><Save size={16} />{ed ? 'Salvar' : 'Adicionar'}</button>
          {ed && <button onClick={() => { setEd(null); setF(ef); }} style={{ ...s.btn, background: t.alt, color: t.txt }}><X size={16} />Cancelar</button>}
        </div>
      </div>
      <div style={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ ...s.ttl, marginBottom: 0 }}>💰 Custos Cadastrados</h3>
          <div style={{ padding: '8px 16px', background: t.orgBg, borderRadius: 8 }}><span style={{ fontSize: 12, color: t.txt3 }}>Total: </span><span style={{ fontWeight: 700, color: t.org }}>{fmt(custos.reduce((x, c) => x + (+c.val || 0), 0))}/mês</span></div>
        </div>
        {custos.length === 0 ? <p style={{ color: t.txt3, textAlign: 'center', padding: 40 }}>Nenhum custo cadastrado</p> : 
        <div style={{ display: 'grid', gap: 12 }}>{custos.map(c => <div key={c.id} style={{ padding: 16, background: t.alt, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><div style={{ fontWeight: 600, color: t.txt, fontSize: 14 }}>{c.descricao || c.desc}</div><div style={{ fontSize: 12, color: t.txt2, marginTop: 2 }}>{c.cli} • {c.tipo}</div></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ fontWeight: 700, color: t.org, fontSize: 16 }}>{fmt(c.val)}</span><button onClick={() => { setF({ ...c, descricao: c.descricao || c.desc }); setEd(c.id); }} style={{ ...s.btn, padding: '8px 12px', fontSize: 12, background: t.goldBg, color: t.gold }}>✏️</button><button onClick={() => del(c.id)} style={{ ...s.btn, padding: '8px 12px', fontSize: 12, background: t.redBg, color: t.red }}>🗑️</button></div>
        </div>)}</div>}
      </div>
    </div>;
  };

  const Clientes = () => {
    const ef = { nome: '', pctFix: 0, valFix: 0, pctBonus: 0, valBonus: 0, metaFat: 0, dtPgtoFix: '', dtPgtoCom: '', fixCloser: 0, pctCloser: 0, fixSDR: 0, pctSDR: 0, fixSocial: 0, pctSocial: 0, cons: '', inicio: '', renov: '', prazo: 12, status: 'Ativo', nps: '', probRen: 100 };
    const [f, setF] = useState(ef); const [ed, setEd] = useState(null);
    const salvar = async () => { 
      if (!f.nome) return notify('Preencha o nome!'); 
      const dados = { ...f, pctFix: (+f.pctFix || 0) / 100, pctBonus: (+f.pctBonus || 0) / 100, pctCloser: (+f.pctCloser || 0) / 100, pctSDR: (+f.pctSDR || 0) / 100, pctSocial: (+f.pctSocial || 0) / 100, probRen: (+f.probRen || 100) / 100 }; 
      if (ed) { await svCli(clientes.map(c => c.id === ed ? { ...dados, id: ed } : c)); setEd(null); } 
      else { const novoCli = { ...dados, id: Date.now() }; await svCli([...clientes, novoCli]); if (dados.inicio && dados.prazo) { const novos = await gerarLancamentos(novoCli); if (novos.length > 0) await svLanc([...lancamentos, ...novos]); }} 
      setF(ef); 
    };
    const del = async id => { if(!confirm('Excluir este cliente?')) return; await svCli(clientes.filter(x => x.id !== id)); };
    const editar = c => { setF({ ...c, pctFix: (c.pctFix || 0) * 100, pctBonus: (c.pctBonus || 0) * 100, pctCloser: (c.pctCloser || 0) * 100, pctSDR: (c.pctSDR || 0) * 100, pctSocial: (c.pctSocial || 0) * 100, probRen: (c.probRen || 1) * 100, metaFat: c.metaFat || 0, dtPgtoFix: c.dtPgtoFix || '', dtPgtoCom: c.dtPgtoCom || '', fixCloser: c.fixCloser || 0, fixSDR: c.fixSDR || 0, fixSocial: c.fixSocial || 0, valFix: c.valFix || 0, valBonus: c.valBonus || 0, cons: c.cons || '', status: c.status || 'Ativo', inicio: c.inicio || '', renov: c.renov || '', prazo: c.prazo || 12, nps: c.nps || '' }); setEd(c.id); };
    const fmtFixo = c => { const p = []; if (c.pctFix > 0) p.push(pct(c.pctFix)); if (c.valFix > 0) p.push(fmt(c.valFix)); return p.length ? p.join(' + ') : '-'; };
    const Dica = ({ texto }) => <span style={{ fontSize: 11, color: t.txt3, display: 'block', marginTop: 4 }}>{texto}</span>;

    if (!canEditAll) return <div style={s.card}><h3 style={s.ttl}>{isCons ? 'Meus Clientes' : 'Clientes'}</h3>{getCli().length === 0 ? <p style={{ color: t.txt3, textAlign: 'center', padding: 30 }}>Nenhum cliente</p> : <div style={{ display: 'grid', gap: 12 }}>{getCli().map(c => { const sr = statR(c); return <div key={c.id} style={{ padding: 16, background: t.alt, borderRadius: 10 }}><div style={{ fontWeight: 600, color: t.txt, fontSize: 15 }}>{c.nome}</div><div style={{ display: 'flex', gap: 8, marginTop: 8 }}><Badge c={c.status === 'Ativo' ? 'green' : 'gray'}>{c.status}</Badge><Badge c={sr.cor}>{sr.l}</Badge></div></div>; })}</div>}</div>;

    return <div style={{ display: 'grid', gap: 20 }}>
      <div style={s.card}>
        <h3 style={s.ttl}>{ed ? '✏️ Editar Cliente' : '➕ Novo Cliente'}</h3>
        <div style={{ marginBottom: 20 }}><label style={s.lbl}>Nome do Cliente *</label><input style={s.inp} value={f.nome} onChange={e => setF({ ...f, nome: e.target.value })} placeholder="Ex: Empresa ABC Ltda" /></div>
        
        <div style={{ background: t.alt, padding: 16, borderRadius: 10, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: t.gold, marginBottom: 4 }}>💰 SUA PARTICIPAÇÃO</div>
          <div style={{ fontSize: 12, color: t.txt3, marginBottom: 12 }}>Quanto você recebe deste cliente</div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
            <div><label style={s.lbl}>% sobre Faturamento</label><input style={s.inp} type="number" value={f.pctFix} onChange={e => setF({ ...f, pctFix: +e.target.value || 0 })} /><Dica texto="Percentual fixo mensal" /></div>
            <div><label style={s.lbl}>Valor Fixo Mensal (R$)</label><input style={s.inp} type="number" value={f.valFix} onChange={e => setF({ ...f, valFix: +e.target.value || 0 })} /><Dica texto="Valor garantido todo mês" /></div>
            <div><label style={s.lbl}>% Bônus (se bater meta)</label><input style={s.inp} type="number" value={f.pctBonus} onChange={e => setF({ ...f, pctBonus: +e.target.value || 0 })} /></div>
            <div><label style={s.lbl}>Meta Faturamento (R$)</label><input style={s.inp} type="number" value={f.metaFat} onChange={e => setF({ ...f, metaFat: +e.target.value || 0 })} /><Dica texto="Se atingir, ganha bônus" /></div>
          </div>
        </div>
        
        <div style={{ background: t.alt, padding: 16, borderRadius: 10, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: t.txt, marginBottom: 4 }}>📅 DATAS DE PAGAMENTO</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={s.lbl}>Dia Pgto Fixo</label><input style={s.inp} type="number" min="1" max="31" value={f.dtPgtoFix} onChange={e => setF({ ...f, dtPgtoFix: +e.target.value || '' })} /></div>
            <div><label style={s.lbl}>Dia Pgto Comissão</label><input style={s.inp} type="number" min="1" max="31" value={f.dtPgtoCom} onChange={e => setF({ ...f, dtPgtoCom: +e.target.value || '' })} /></div>
          </div>
        </div>
        
        <div style={{ background: t.goldBg, padding: 16, borderRadius: 10, marginBottom: 16, border: `1px solid ${t.gold}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: t.gold, marginBottom: 4 }}>👥 TIME COMERCIAL (opcional)</div>
          <div style={{ fontSize: 12, color: t.txt3, marginBottom: 12 }}>Custos com terceirizados</div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
            <div><label style={s.lbl}>Closer - Fixo (R$)</label><input style={s.inp} type="number" value={f.fixCloser} onChange={e => setF({ ...f, fixCloser: +e.target.value || 0 })} /></div>
            <div><label style={s.lbl}>Closer - %</label><input style={s.inp} type="number" value={f.pctCloser} onChange={e => setF({ ...f, pctCloser: +e.target.value || 0 })} /></div>
            <div><label style={s.lbl}>SDR - Fixo (R$)</label><input style={s.inp} type="number" value={f.fixSDR} onChange={e => setF({ ...f, fixSDR: +e.target.value || 0 })} /></div>
            <div><label style={s.lbl}>SDR - %</label><input style={s.inp} type="number" value={f.pctSDR} onChange={e => setF({ ...f, pctSDR: +e.target.value || 0 })} /></div>
          </div>
        </div>
        
        <div style={{ background: t.alt, padding: 16, borderRadius: 10, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: t.txt, marginBottom: 12 }}>📋 CONTRATO</div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
            <div><label style={s.lbl}>Consultor</label><select style={s.inp} value={f.cons} onChange={e => setF({ ...f, cons: e.target.value })}><option value="">Selecione...</option>{consultores.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}</select></div>
            <div><label style={s.lbl}>Status</label><select style={s.inp} value={f.status} onChange={e => setF({ ...f, status: e.target.value })}><option>Ativo</option><option>Inativo</option><option>Cancelado</option></select></div>
            <div><label style={s.lbl}>Data Início</label><input style={s.inp} type="date" value={f.inicio} onChange={e => { const v = e.target.value; if (v && f.prazo) { const d = new Date(v); d.setMonth(d.getMonth() + +f.prazo); setF({ ...f, inicio: v, renov: d.toISOString().slice(0, 10) }); } else setF({ ...f, inicio: v }); }} /></div>
            <div><label style={s.lbl}>Duração (meses)</label><input style={s.inp} type="number" value={f.prazo} onChange={e => { const v = +e.target.value || 12; if (f.inicio && v) { const d = new Date(f.inicio); d.setMonth(d.getMonth() + v); setF({ ...f, prazo: v, renov: d.toISOString().slice(0, 10) }); } else setF({ ...f, prazo: v }); }} /></div>
            <div><label style={s.lbl}>Renovação</label><input style={{ ...s.inp, background: t.card }} type="date" value={f.renov} readOnly /><Dica texto="Calculado automaticamente" /></div>
            <div><label style={s.lbl}>NPS (0-10)</label><input style={s.inp} type="number" min="0" max="10" value={f.nps} onChange={e => setF({ ...f, nps: +e.target.value || '' })} /></div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={salvar} disabled={saving} style={{ ...s.btn, flex: 1, justifyContent: 'center', background: t.gold, color: '#fff' }}><Save size={16} />{ed ? 'Salvar Alterações' : 'Cadastrar Cliente'}</button>
          {ed && <button onClick={() => { setEd(null); setF(ef); }} style={{ ...s.btn, background: t.alt, color: t.txt }}><X size={16} />Cancelar</button>}
        </div>
      </div>
      
      <div style={{ ...s.card, background: t.goldBg, border: `1px solid ${t.gold}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><div style={{ fontSize: 15, fontWeight: 600, color: t.txt }}>📅 Gerar Lançamentos</div><div style={{ fontSize: 13, color: t.txt2 }}>Cria automaticamente para todos os clientes ativos</div></div>
          <button onClick={gerarTodosLancamentos} disabled={saving} style={{ ...s.btn, background: t.gold, color: '#fff' }}><Calendar size={16} />Gerar Todos</button>
        </div>
      </div>
      
      <div style={s.card}>
        <h3 style={s.ttl}>📋 Clientes ({clientes.length})</h3>
        {clientes.length === 0 ? <p style={{ color: t.txt3, textAlign: 'center', padding: 30 }}>Nenhum cliente cadastrado</p> : 
        <div style={{ display: 'grid', gap: 12 }}>{clientes.map(c => { const sr = statR(c); return <div key={c.id} style={{ padding: 16, background: t.alt, borderRadius: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div><div style={{ fontWeight: 600, color: t.txt, fontSize: 15 }}>{c.nome}</div><div style={{ fontSize: 13, color: t.txt2, marginTop: 4 }}>{c.cons || 'Sem consultor'} • Fixo: {fmtFixo(c)}</div></div>
            <div style={{ display: 'flex', gap: 8 }}><button onClick={() => editar(c)} style={{ ...s.btn, padding: '8px 14px', fontSize: 13, background: t.goldBg, color: t.gold }}>✏️</button><button onClick={() => del(c.id)} style={{ ...s.btn, padding: '8px 14px', fontSize: 13, background: t.redBg, color: t.red }}>🗑️</button></div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}><Badge c={c.status === 'Ativo' ? 'green' : 'gray'}>{c.status}</Badge><Badge c={sr.cor}>Renova: {sr.l}</Badge></div>
        </div>; })}</div>}
      </div>
    </div>;
  };

  const Custos = () => {
    if (!canEditAll) return <div style={s.card}><p style={{ color: t.txt3, textAlign: 'center', padding: 40 }}>🔒 Acesso restrito</p></div>;
    const [f, setF] = useState({ cli: '', tipo: 'Ferramenta', descricao: '', val: 0 }); const [ed, setEd] = useState(null);
    const salvar = async () => { if (!f.cli || !f.descricao) return notify('Preencha cliente e descrição!'); if (ed) { await svCust(custos.map(c => c.id === ed ? { ...f, id: ed } : c)); setEd(null); } else await svCust([...custos, { ...f, id: Date.now() }]); setF({ cli: '', tipo: 'Ferramenta', descricao: '', val: 0 }); };
    const del = async id => { if(!confirm('Excluir este custo?')) return; await svCust(custos.filter(c => c.id !== id)); };
    
    return <div style={{ display: 'grid', gap: 20 }}>
      <div style={s.card}>
        <h3 style={s.ttl}>{ed ? '✏️ Editar' : '➕ Novo'} Custo Operacional</h3>
        <div style={{ fontSize: 13, color: t.txt3, marginBottom: 16 }}>Ferramentas e serviços vinculados a cada cliente</div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
          <div><label style={s.lbl}>Cliente *</label><select style={s.inp} value={f.cli} onChange={e => setF({ ...f, cli: e.target.value })}><option value="">Selecione...</option>{clientes.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}</select></div>
          <div><label style={s.lbl}>Tipo</label><select style={s.inp} value={f.tipo} onChange={e => setF({ ...f, tipo: e.target.value })}><option>Ferramenta</option><option>Terceirizado</option><option>Outro</option></select></div>
          <div><label style={s.lbl}>Descrição *</label><input style={s.inp} value={f.descricao} onChange={e => setF({ ...f, descricao: e.target.value })} placeholder="Ex: RD Station" /></div>
          <div><label style={s.lbl}>Valor Mensal (R$)</label><input style={s.inp} type="number" value={f.val} onChange={e => setF({ ...f, val: +e.target.value || 0 })} /></div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={salvar} disabled={saving} style={{ ...s.btn, background: t.gold, color: '#fff' }}><Save size={16} />{ed ? 'Salvar' : 'Adicionar'}</button>
          {ed && <button onClick={() => { setEd(null); setF({ cli: '', tipo: 'Ferramenta', descricao: '', val: 0 }); }} style={{ ...s.btn, background: t.alt, color: t.txt }}><X size={16} />Cancelar</button>}
        </div>
      </div>
      <div style={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ ...s.ttl, marginBottom: 0 }}>💰 Custos</h3>
          <Badge c="orange">Total: {fmt(custos.reduce((x, c) => x + (+c.val || 0), 0))}/mês</Badge>
        </div>
        {custos.length === 0 ? <p style={{ color: t.txt3, textAlign: 'center', padding: 30 }}>Nenhum custo cadastrado</p> : 
        <div style={{ display: 'grid', gap: 10 }}>{custos.map(c => <div key={c.id} style={{ padding: 14, background: t.alt, borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><div style={{ fontWeight: 600, color: t.txt }}>{c.descricao || c.desc}</div><div style={{ fontSize: 12, color: t.txt3, marginTop: 2 }}>{c.cli} • {c.tipo}</div></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ fontWeight: 700, color: t.org }}>{fmt(c.val)}</span><button onClick={() => { setF({ ...c, descricao: c.descricao || c.desc }); setEd(c.id); }} style={{ ...s.btn, padding: '6px 10px', background: t.goldBg, color: t.gold }}>✏️</button><button onClick={() => del(c.id)} style={{ ...s.btn, padding: '6px 10px', background: t.redBg, color: t.red }}>🗑️</button></div>
        </div>)}</div>}
      </div>
    </div>;
  };

  const Ranking = () => { 
    const r = rank(); 
    return <div style={s.card}>
      <h3 style={s.ttl}>🏆 Ranking de Clientes</h3>
      {r.length === 0 ? <p style={{ color: t.txt3, textAlign: 'center', padding: 30 }}>Nenhum cliente</p> : 
      <div style={{ display: 'grid', gap: 10 }}>
        {r.map((c, i) => <div key={c.id} style={{ padding: 14, background: t.alt, borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontWeight: 700, color: i < 3 ? t.gold : t.txt3, fontSize: 20 }}>{i + 1}º</span>
            <div>
              <div style={{ fontWeight: 600, color: t.txt }}>{c.nome}</div>
              <Badge c={c.risco === 'Alto' ? 'red' : c.risco === 'Médio' ? 'orange' : 'green'}>{c.risco}</Badge>
            </div>
          </div>
          <div style={{ fontWeight: 700, color: t.txt, fontSize: 16 }}>{fmt(c.rec)}</div>
        </div>)}
      </div>}
    </div>; 
  };

  const Metas = () => { 
    const [f, setF] = useState({ cons: 'GERAL', mes, val: 0 }); 
    const salvar = async () => { const ex = metas.findIndex(m => m.cons === f.cons && m.mes === f.mes); if (ex >= 0) await svMet(metas.map((m, i) => i === ex ? { ...f, id: m.id } : m)); else await svMet([...metas, { ...f, id: Date.now() }]); setF({ cons: 'GERAL', mes, val: 0 }); };
    const mg = metas.find(m => m.cons === 'GERAL' && m.mes === mes);
    const r = resumo();
    const at = mg?.val > 0 ? r.rec / mg.val : 0;
    
    return <div style={{ display: 'grid', gap: 20 }}>
      <div style={s.card}>
        <h3 style={s.ttl}>🎯 Definir Meta</h3>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
          <div><label style={s.lbl}>Consultor</label><select style={s.inp} value={f.cons} onChange={e => setF({ ...f, cons: e.target.value })}><option value="GERAL">Geral (Empresa)</option>{consultores.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}</select></div>
          <div><label style={s.lbl}>Valor da Meta (R$)</label><input style={s.inp} type="number" value={f.val} onChange={e => setF({ ...f, val: +e.target.value || 0 })} /></div>
        </div>
        <button onClick={salvar} disabled={saving} style={{ ...s.btn, marginTop: 16, background: t.gold, color: '#fff' }}><Save size={16} />Salvar Meta</button>
      </div>
      <div style={s.card}>
        <h3 style={s.ttl}>📊 Meta vs Real</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
          {[{ l: 'Meta', v: fmt(mg?.val || 0) }, { l: 'Realizado', v: fmt(r.rec), c: t.grn }, { l: 'Atingimento', v: pct(at), c: at >= 1 ? t.grn : t.gold }].map((x, i) => <div key={i} style={{ textAlign: 'center', padding: 14, background: t.alt, borderRadius: 8 }}><div style={{ fontSize: 12, color: t.txt3 }}>{x.l}</div><div style={{ fontSize: 20, fontWeight: 700, color: x.c || t.txt }}>{x.v}</div></div>)}
        </div>
        {mg?.val > 0 && <div style={{ height: 12, background: t.alt, borderRadius: 6 }}><div style={{ height: '100%', width: `${Math.min(at * 100, 100)}%`, background: at >= 1 ? t.grn : t.gold, borderRadius: 6 }} /></div>}
      </div>
    </div>;
  };

  const Relatorio = () => { 
    const r = resumo(); const cm = comCons(); const res = r.rec - r.cust - r.com; 
    return <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ ...s.card, textAlign: 'center', marginBottom: 20 }}><Logo /><h2 style={{ fontSize: 20, fontWeight: 700, color: t.txt, marginTop: 16 }}>Relatório {mes}</h2></div>
      <div style={{ ...s.card, marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: t.txt, marginBottom: 12 }}>💰 Receitas</h3>
        {[['A Receber', r.aRec], ['Recebido', r.rec, t.grn], ['Vencido', r.venc, t.red]].map(([l, v, c]) => <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${t.brd}` }}><span style={{ color: t.txt2 }}>{l}</span><span style={{ fontWeight: 600, color: c || t.txt }}>{fmt(v)}</span></div>)}
      </div>
      <div style={{ ...s.card, marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: t.txt, marginBottom: 12 }}>👥 Comissões</h3>
        {cm.map(c => <div key={c.nome} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${t.brd}` }}><span style={{ color: t.txt2 }}>{c.nome}</span><span style={{ fontWeight: 600, color: t.pur }}>{fmt(c.com)}</span></div>)}
      </div>
      <div style={{ ...s.card, background: t.alt }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontWeight: 700, color: t.txt, fontSize: 16 }}>RESULTADO</span><span style={{ fontSize: 28, fontWeight: 700, color: res >= 0 ? t.grn : t.red }}>{fmt(res)}</span></div>
      </div>
      <button onClick={expCSV} style={{ ...s.btn, width: '100%', justifyContent: 'center', marginTop: 20 }}><Download size={16} />Exportar CSV</button>
    </div>;
  };

  const Usuarios = () => {
    if (!isAdm) return <div style={s.card}><p style={{ color: t.txt3, textAlign: 'center', padding: 40 }}>🔒 Acesso restrito</p></div>;
    const ef = { username: '', password: '', nome: '', tipo: 'consultor', consultor: '', ativo: true };
    const [f, setF] = useState(ef); const [ed, setEd] = useState(null);
    const salvar = async () => { if (!f.username || !f.password || !f.nome) return notify('Preencha todos os campos!'); if (ed) { await svUsers(users.map(u => u.id === ed ? { ...f, id: ed } : u)); setEd(null); } else await svUsers([...users, { ...f, id: Date.now() }]); setF(ef); };
    const del = async id => { if (id === 1) return notify('Não é possível excluir o master!'); if(!confirm('Excluir este usuário?')) return; await svUsers(users.filter(x => x.id !== id)); };
    
    return <div style={{ display: 'grid', gap: 20 }}>
      <div style={s.card}>
        <h3 style={s.ttl}>{ed ? '✏️ Editar' : '➕ Novo'} Usuário</h3>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
          <div><label style={s.lbl}>Login (e-mail) *</label><input style={s.inp} value={f.username} onChange={e => setF({ ...f, username: e.target.value })} /></div>
          <div><label style={s.lbl}>Senha *</label><input style={s.inp} type="password" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} /></div>
          <div><label style={s.lbl}>Nome *</label><input style={s.inp} value={f.nome} onChange={e => setF({ ...f, nome: e.target.value })} /></div>
          <div><label style={s.lbl}>Tipo</label><select style={s.inp} value={f.tipo} onChange={e => setF({ ...f, tipo: e.target.value })}><option value="admin">Administrador</option><option value="financeiro">Financeiro</option><option value="consultor">Consultor</option></select></div>
          <div><label style={s.lbl}>Consultor Vinculado</label><select style={s.inp} value={f.consultor} onChange={e => setF({ ...f, consultor: e.target.value })}><option value="">Nenhum</option>{consultores.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}</select></div>
          <div><label style={s.lbl}>Status</label><select style={s.inp} value={f.ativo ? 'sim' : 'nao'} onChange={e => setF({ ...f, ativo: e.target.value === 'sim' })}><option value="sim">Ativo</option><option value="nao">Inativo</option></select></div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={salvar} disabled={saving} style={{ ...s.btn, background: t.gold, color: '#fff' }}><Save size={16} />{ed ? 'Salvar' : 'Cadastrar'}</button>
          {ed && <button onClick={() => { setEd(null); setF(ef); }} style={{ ...s.btn, background: t.alt, color: t.txt }}><X size={16} />Cancelar</button>}
        </div>
      </div>
      <div style={s.card}>
        <h3 style={s.ttl}>👤 Usuários ({users.length})</h3>
        <div style={{ display: 'grid', gap: 10 }}>{users.map(u => <div key={u.id} style={{ padding: 14, background: t.alt, borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><div style={{ fontWeight: 600, color: t.txt }}>{u.nome}</div><div style={{ fontSize: 12, color: t.txt3 }}>{u.username}</div></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Badge c={u.tipo === 'admin' ? 'purple' : u.tipo === 'financeiro' ? 'blue' : 'gray'}>{u.tipo}</Badge>{u.id !== 1 && <><button onClick={() => { setF(u); setEd(u.id); }} style={{ ...s.btn, padding: '6px 10px', background: t.goldBg, color: t.gold }}>✏️</button><button onClick={() => del(u.id)} style={{ ...s.btn, padding: '6px 10px', background: t.redBg, color: t.red }}>🗑️</button></>}</div>
        </div>)}</div>
      </div>
    </div>;
  };

  if (loading) return <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}><Logo /><Loader size={28} color={t.gold} className="spin" /><span style={{ color: t.txt2 }}>Carregando...</span></div>;

  const C = { dashboard: Dashboard, consultores: Consultores, clientes: Clientes, custos: Custos, lancamentos: Lancamentos, comissoes: Comissoes, tarefas: Tarefas, cobranca: Cobranca, projecao: Projecao, performance: Performance, ranking: Ranking, metas: Metas, relatorio: Relatorio, usuarios: Usuarios }[tab] || Dashboard;

  return <div style={{ minHeight: '100vh', background: t.bg }}>
    <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <Toast />
    <Sidebar />
    {isMobile && sb && <div onClick={() => setSb(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 40 }} />}
    <header style={{ position: 'fixed', top: 0, left: sideW, right: 0, height: 60, background: t.card, borderBottom: `1px solid ${t.brd}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', zIndex: 30, transition: 'left .3s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => setSb(!sb)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}><Menu size={22} color={t.txt} /></button>
        {isMobile && <Logo />}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {!online && <Badge c="red"><CloudOff size={14} /> Offline</Badge>}
        {saving && <Loader size={18} color={t.gold} className="spin" />}
      </div>
    </header>
    <main style={{ marginLeft: sideW, paddingTop: 60, minHeight: '100vh', transition: 'margin-left .3s' }}>
      <div style={{ padding: isMobile ? 16 : 32, maxWidth: 1200, margin: '0 auto' }}><C /></div>
    </main>
  </div>;
}
