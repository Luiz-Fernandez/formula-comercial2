import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Save, Download, Users, DollarSign, TrendingUp, AlertCircle, CheckCircle, Clock, Calendar, FileText, Bell, RefreshCw, Moon, Sun, Menu, Target, Star, ClipboardList, UserCheck, Award, ChevronRight, ChevronDown, LogOut, Lock, Eye, EyeOff, Loader, CloudOff, X, Home, Phone, Mail, BarChart3 } from 'lucide-react';

const API_URL = 'https://script.google.com/macros/s/AKfycbx-S-Aq_6M1BbJiaX-LH2Sgij1-zTlyGLV4G1sRi1RdN-Ij4EHJyx-u6xiZwLMDFuyz/exec';
const MASTER = { id: 1, username: 'luizfernandezf@gmail.com', password: 'Luiz3362@*', nome: 'Luiz Fernandez', tipo: 'admin', consultor: '', ativo: true };

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [lf, setLf] = useState({ u: '', p: '' });
  const [le, setLe] = useState('');
  const [showP, setShowP] = useState(false);
  const [tab, setTab] = useState('dashboard');
  const [clientes, setCli] = useState<any[]>([]);
  const [consultores, setCons] = useState<any[]>([]);
  const [custos, setCust] = useState<any[]>([]);
  const [lancamentos, setLanc] = useState<any[]>([]);
  const [tarefas, setTar] = useState<any[]>([]);
  const [metas, setMet] = useState<any[]>([]);
  const [faturamentos, setFat] = useState<any[]>([]);
  const [loading, setLoad] = useState(true);
  const [saving, setSaving] = useState(false);
  const [online, setOnline] = useState(true);
  const [mes, setMes] = useState(new Date().toISOString().slice(0,7));
  const [dark, setDark] = useState(false);
  const [sb, setSb] = useState(true);
  const [exp, setExp] = useState<any>({c:1,o:1,a:1,s:1});
  const [toast, setToast] = useState<string | null>(null);
  const [, setCliDetalhe] = useState<any>(null);
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
      setFat(data.faturamentos || []);
      let us = data.usuarios || [];
      if (!us.find((u: any) => u.id === 1)) { us = [MASTER, ...us]; await saveSheet('Usuarios', us); }
      setUsers(us);
      setOnline(true);
      const sess = typeof window !== 'undefined' ? localStorage.getItem('fc-session') : null;
      if (sess) { const s = JSON.parse(sess); const uu = us.find((x: any) => x.id === s.id && x.ativo); if (uu) setUser(uu); }
    } catch (e) { console.error(e); setOnline(false); }
    setLoad(false);
  };

  const saveSheet = async (sheet: string, data: any) => {
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

  const notify = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2500); };
  const svCli = async (d: any[]) => { setCli(d); const ok = await saveSheet('Clientes', d); notify(ok ? 'Salvo!' : 'Erro!'); };
  const svCons = async (d: any[]) => { setCons(d); const ok = await saveSheet('Consultores', d); notify(ok ? 'Salvo!' : 'Erro!'); };
  const svCust = async (d: any[]) => { setCust(d); const ok = await saveSheet('Custos', d); notify(ok ? 'Salvo!' : 'Erro!'); };
  const svLanc = async (d: any[]) => { setLanc(d); const ok = await saveSheet('Lancamentos', d); notify(ok ? 'Salvo!' : 'Erro!'); };
  const svTar = async (d: any[]) => { setTar(d); const ok = await saveSheet('Tarefas', d); notify(ok ? 'Salvo!' : 'Erro!'); };
  const svMet = async (d: any[]) => { setMet(d); const ok = await saveSheet('Metas', d); notify(ok ? 'Salvo!' : 'Erro!'); };
  const svFat = async (d: any[]) => { setFat(d); const ok = await saveSheet('Faturamentos', d); notify(ok ? 'Salvo!' : 'Erro!'); };
  const svUsers = async (d: any[]) => { setUsers(d); const ok = await saveSheet('Usuarios', d); notify(ok ? 'Salvo!' : 'Erro!'); };

  const login = () => {
    const u = users.find(x => x.username === lf.u && x.password === lf.p && x.ativo);
    if (u) { 
      setUser(u); 
      setLe(''); 
      if(typeof window !== 'undefined') localStorage.setItem('fc-session', JSON.stringify({ id: u.id })); 
      setTab('dashboard');
    }
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

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
  const pct = (v: number) => `${((v || 0) * 100).toFixed(1)}%`;
  const fmtD = (d: string) => d ? new Date(d).toLocaleDateString('pt-BR') : '-';
  const diasR = (d: string) => { if (!d) return null; const h = new Date(); h.setHours(0,0,0,0); return Math.ceil((new Date(d).getTime() - h.getTime()) / 86400000); };
  // Normaliza o mês para formato YYYY-MM (tanto de ISO string quanto de YYYY-MM)
  const normMes = (m: string) => m ? (m.length > 7 ? m.slice(0, 7) : m) : '';
  const mesMatch = (lancMes: string) => normMes(lancMes) === mes;
  const statR = (c: any) => { const d = diasR(c.renov); if (d === null) return { l: '-', cor: 'gray' }; if (d < 0) return { l: `${Math.abs(d)}d atraso`, cor: 'red' }; if (d <= 30) return { l: `${d}d`, cor: 'orange' }; return { l: `${d}d`, cor: 'green' }; };
  const getCusCli = (n: string) => custos.filter(c => c.cli === n).reduce((s, c) => s + (+c.val || 0), 0);
  const getC = (n: string) => consultores.find(c => c.nome === n);

  const calc = (l: any) => {
    const cl = clientes.find(c => c.nome === l.cli);
    const co = getC(cl?.cons);
    const bruto = +l.bruto || 0;
    const liq = bruto * (1 - (+l.taxa || 0));
    const part = liq * (+cl?.pctFix || 0) + (+cl?.valFix || 0);
    const metaFat = +cl?.metaFat || 0;
    // Verifica se tem faturamento registrado para o mês do lançamento
    const fatRegistrado = faturamentos.find(fat => fat.cli === l.cli && normMes(fat.mes) === normMes(l.mes));
    const atingiuMeta = metaFat > 0 
      ? (fatRegistrado ? +fatRegistrado.valor >= metaFat : bruto >= metaFat) 
      : l.meta;
    const bon = atingiuMeta ? liq * (+cl?.pctBonus || 0) + (+cl?.valBonus || 0) : 0;
    const tot = part + bon;
    const cusCloser = (+cl?.fixCloser || 0) + liq * (+cl?.pctCloser || 0);
    const cusSDR = (+cl?.fixSDR || 0) + liq * (+cl?.pctSDR || 0);
    const cusSocial = (+cl?.fixSocial || 0) + liq * (+cl?.pctSocial || 0);
    const cusTime = cusCloser + cusSDR + cusSocial;
    const cusOp = getCusCli(l.cli);
    const cusTot = cusOp + (l.status === 'Recebido' ? cusTime : 0);
    // Usa a comissão recebida registrada, se houver, senão calcula baseado no valor
    const comRecebida = +l.comRecebida || 0;
    const base = Math.max(0, comRecebida > 0 ? comRecebida - cusTot : (+l.pago || 0) - cusTot);
    const com = l.status === 'Recebido' ? base * (co?.pctCom || 0.2) : 0;
    return { ...l, liq, part, bon, tot, cusOp, cusTime, cusCloser, cusSDR, cusSocial, cusTot, base, com, comRecebida, cons: cl?.cons || '', atingiuMeta };
  };

  const resumo = () => {
    const lm = getLanc().filter(l => mesMatch(l.mes)).map(calc);
    return { aRec: lm.filter(l => ['A Faturar', 'Faturado'].includes(l.status)).reduce((s, l) => s + l.tot, 0), rec: lm.filter(l => l.status === 'Recebido').reduce((s, l) => s + (+l.pago || 0), 0), venc: lm.filter(l => l.status === 'Vencido').reduce((s, l) => s + l.tot, 0), cust: custos.reduce((s, c) => s + (+c.val || 0), 0), com: lm.reduce((s, l) => s + l.com, 0), lm };
  };

  const comCons = () => {
    const lm = getLanc().filter(l => mesMatch(l.mes)).map(calc);
    const pc: any = {};
    lm.forEach(l => { 
      if (l.cons) { 
        if (!pc[l.cons]) { 
          const c = getC(l.cons); 
          pc[l.cons] = { rec: 0, comRec: 0, com: 0, pend: 0, pct: c?.pctCom || 0.2 }; 
        } 
        if (l.status === 'Recebido') { 
          pc[l.cons].rec += +l.pago || 0; 
          pc[l.cons].comRec += +l.comRecebida || 0;
          pc[l.cons].com += l.com; 
        } else {
          pc[l.cons].pend += l.tot; 
        }
      } 
    });
    return Object.entries(pc).map(([n, d]: any) => ({ nome: n, ...d }));
  };

  const perf = () => (canViewAll ? consultores : consultores.filter(c => c.nome === uCons)).map(c => { const cl = clientes.filter(x => x.cons === c.nome); const at = cl.filter(x => x.status === 'Ativo').length; const lc = lancamentos.filter(l => clientes.find(x => x.nome === l.cli)?.cons === c.nome).map(calc); const rec = lc.filter(l => l.status === 'Recebido').reduce((s, l) => s + (+l.pago || 0), 0); const mt = metas.find(m => m.cons === c.nome && normMes(m.mes) === mes); return { ...c, at, rec, tk: at > 0 ? rec / at : 0, com: lc.reduce((s, l) => s + l.com, 0), metaV: mt?.val || 0, ating: mt?.val > 0 ? rec / mt.val : 0 }; });

  const proj = () => { const p: any[] = []; const h = new Date(); const cl = getCli(); for (let i = 0; i < 6; i++) { const ms = new Date(h.getFullYear(), h.getMonth() + i, 1).toISOString().slice(0, 7); let r = 0; cl.filter(c => c.status === 'Ativo').forEach(c => { const ul = lancamentos.filter(l => l.cli === c.nome).sort((a, b) => b.mes.localeCompare(a.mes))[0]; r += (ul ? calc(ul).tot : 0) * (c.probRen || 1); }); p.push({ mes: ms, val: r }); } return p; };

  const inad = () => getLanc().filter(l => l.status === 'Vencido' || (l.status === 'Faturado' && l.venc && new Date(l.venc) < new Date())).map(l => ({ ...calc(l), dias: Math.ceil((new Date().getTime() - new Date(l.venc).getTime()) / 86400000) })).sort((a, b) => b.dias - a.dias);

  const rank = () => getCli().map(c => { const lc = lancamentos.filter(l => l.cli === c.nome).map(calc); const rec = lc.filter(l => l.status === 'Recebido').reduce((s, l) => s + (+l.pago || 0), 0); const sr = statR(c); return { ...c, rec, mg: rec - getCusCli(c.nome) * lc.length, risco: sr.cor === 'red' ? 'Alto' : sr.cor === 'orange' ? 'Médio' : c.nps < 7 ? 'Médio' : 'Baixo' }; }).sort((a, b) => b.rec - a.rec);
  
  const getNotificacoes = () => {
    const notifs: any[] = [];
    getCli().filter(c => c.status === 'Ativo').forEach(c => {
      const d = diasR(c.renov);
      if (d !== null && d <= 30 && d >= 0) notifs.push({ tipo: 'renov', cli: c.nome, dias: d, cor: d <= 7 ? 'red' : 'orange', msg: `${c.nome} renova em ${d} dias` });
      else if (d !== null && d < 0) notifs.push({ tipo: 'renov', cli: c.nome, dias: d, cor: 'red', msg: `${c.nome} renovação atrasada ${Math.abs(d)} dias` });
    });
    inad().forEach(l => notifs.push({ tipo: 'venc', cli: l.cli, dias: l.dias, cor: 'red', msg: `${l.cli}: ${fmt(l.tot)} vencido há ${l.dias} dias` }));
    return notifs;
  };
  
  const receitaPorCliente = () => {
    const lm = getLanc().filter(l => mesMatch(l.mes) && l.status === 'Recebido');
    const porCli: any = {};
    lm.forEach(l => { if (!porCli[l.cli]) porCli[l.cli] = 0; porCli[l.cli] += +l.pago || 0; });
    return Object.entries(porCli).map(([nome, valor]) => ({ nome, valor })).sort((a: any, b: any) => b.valor - a.valor).slice(0, 5);
  };

  const gerarLancamentos = async (cliente: any) => {
    if (!cliente.inicio || !cliente.prazo) {
      notify(`⚠️ Cliente "${cliente.nome || 'sem nome'}" não possui data de início ou prazo definidos.`);
      return [];
    }
    const novoLancs: any[] = [];
    const dtInicio = new Date(cliente.inicio + 'T00:00:00');
    if (isNaN(dtInicio.getTime())) {
      notify(`❌ Cliente "${cliente.nome || 'sem nome'}" possui data de início inválida: "${cliente.inicio}"`);
      return [];
    }
    const prazoMeses = parseInt(cliente.prazo) || 12;
    const valorFixo = +cliente.valFix || 0;
    const diaPgto = +cliente.dtPgtoFix || 10;
    for (let i = 0; i < prazoMeses; i++) {
      const dtMes = new Date(dtInicio.getFullYear(), dtInicio.getMonth() + i, 1);
      const mesStr = dtMes.toISOString().slice(0, 7);
      const jaExiste = lancamentos.find(l => l.cli === cliente.nome && normMes(l.mes) === mesStr);
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
    let todosNovos: any[] = [];
    for (const cli of clientesAtivos) {
      const novos = await gerarLancamentos(cli);
      if (novos.length > 0) todosNovos = [...todosNovos, ...novos];
    }
    if (todosNovos.length > 0) { await svLanc([...lancamentos, ...todosNovos]); notify(`${todosNovos.length} lançamentos gerados!`); }
    else notify('Todos lançamentos já existem!');
  };

  const expCSV = () => { const r = resumo(); const csv = `\ufeffFÓRMULA COMERCIAL - ${mes}\n\nRecebido;${r.rec}\nCustos;${r.cust}\nComissões;${r.com}\nResultado;${r.rec - r.cust - r.com}`; const b = new Blob([csv], { type: 'text/csv;charset=utf-8;' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `fc_${mes}.csv`; a.click(); notify('Exportado!'); };

  const gold = dark ? '#d4af37' : '#996515';
  const COLORS = ['#996515', '#22c55e', '#3b82f6', '#a855f7', '#f59e0b'];
  const t = { bg: dark ? '#09090b' : '#f8f9fa', card: dark ? '#18181b' : '#fff', alt: dark ? '#27272a' : '#f4f4f5', txt: dark ? '#fafafa' : '#18181b', txt2: dark ? '#a1a1aa' : '#71717a', txt3: dark ? '#52525b' : '#a1a1aa', brd: dark ? '#27272a' : '#e4e4e7', gold, goldBg: dark ? 'rgba(212,175,55,.15)' : 'rgba(153,101,21,.08)', grn: '#22c55e', grnBg: dark ? 'rgba(34,197,94,.2)' : 'rgba(34,197,94,.1)', red: '#ef4444', redBg: dark ? 'rgba(239,68,68,.2)' : 'rgba(239,68,68,.1)', org: '#f59e0b', orgBg: dark ? 'rgba(245,158,11,.2)' : 'rgba(245,158,11,.1)', pur: '#a855f7', purBg: dark ? 'rgba(168,85,247,.2)' : 'rgba(168,85,247,.1)', blue: '#3b82f6', blueBg: dark ? 'rgba(59,130,246,.2)' : 'rgba(59,130,246,.1)' };
  
  const sideW = sb ? 260 : 0;
  
  const s = { 
    card: { background: t.card, border: `1px solid ${t.brd}`, borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,.05)' } as React.CSSProperties, 
    inp: { width: '100%', padding: '12px 14px', background: t.alt, border: `1px solid ${t.brd}`, borderRadius: 10, color: t.txt, fontSize: 14, outline: 'none' } as React.CSSProperties, 
    btn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', background: dark ? '#fff' : '#18181b', color: dark ? '#18181b' : '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all .2s' } as React.CSSProperties, 
    lbl: { display: 'block', fontSize: 11, fontWeight: 600, color: t.txt2, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: 0.5 } as React.CSSProperties, 
    ttl: { fontSize: 18, fontWeight: 700, color: t.txt, marginBottom: 16 } as React.CSSProperties
  };
  
  const Badge = ({ children, c = 'gray' }: { children: React.ReactNode; c?: string }) => { const x: any = { gray: { bg: t.alt, txt: t.txt2 }, green: { bg: t.grnBg, txt: t.grn }, red: { bg: t.redBg, txt: t.red }, orange: { bg: t.orgBg, txt: t.org }, purple: { bg: t.purBg, txt: t.pur }, blue: { bg: t.blueBg, txt: t.blue } }[c]; return <span style={{ padding: '5px 10px', background: x?.bg, color: x?.txt, borderRadius: 8, fontSize: 12, fontWeight: 600 }}>{children}</span>; };
  const Logo = () => <svg viewBox="0 0 200 55" style={{ width: 130 }}><text x="100" y="22" textAnchor="middle" style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 300, letterSpacing: 4 }} fill={t.txt}>FÓRMULA</text><text x="100" y="44" textAnchor="middle" style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, letterSpacing: 2 }} fill={t.txt}>COMERCIAL</text><line x1="70" y1="52" x2="130" y2="52" stroke={t.gold} strokeWidth="2" /></svg>;
  const Toast = () => toast && <div style={{ position: 'fixed', bottom: 24, right: 24, padding: '14px 24px', background: toast.includes('Erro') ? t.red : t.grn, color: '#fff', borderRadius: 12, fontWeight: 600, zIndex: 999, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(0,0,0,.15)' }}>{saving && <Loader size={16} className="spin" />}{toast}</div>;
  const Dica = ({ texto }: { texto: string }) => <span style={{ fontSize: 10, color: t.txt3, fontWeight: 400, display: 'block', marginTop: 4 }}>{texto}</span>;

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

  const Sidebar = () => {
    const tipoLabel: any = { admin: 'Administrador', financeiro: 'Financeiro', consultor: 'Consultor' }[user.tipo];
    const tipoColor: any = { admin: 'purple', financeiro: 'orange', consultor: 'gray' }[user.tipo];
    const menuCad = canEditAll ? [{ id: 'consultores', l: 'Consultores', ic: UserCheck }, { id: 'clientes', l: 'Clientes', ic: Users }, { id: 'custos', l: 'Custos', ic: DollarSign }] : [{ id: 'clientes', l: isCons ? 'Meus Clientes' : 'Clientes', ic: Users }];
    const menuPrincipal = canViewAll ? [{ id: 'dashboard', l: 'Dashboard', ic: Home }] : [{ id: 'dashboard', l: 'Meu Resumo', ic: Home }];
    const menu = [{ sc: 'm', it: menuPrincipal }, { sc: 'c', l: 'Cadastros', it: menuCad }, { sc: 'o', l: 'Operacional', it: [{ id: 'lancamentos', l: 'Lançamentos', ic: Calendar }, { id: 'faturamento', l: 'Faturamento', ic: BarChart3 }, { id: 'comissoes', l: 'Comissões', ic: Award }, { id: 'tarefas', l: 'Tarefas', ic: ClipboardList }, { id: 'cobranca', l: 'Cobrança', ic: AlertCircle }] }, { sc: 'a', l: 'Análise', it: [{ id: 'projecao', l: 'Projeção', ic: TrendingUp }, { id: 'performance', l: 'Performance', ic: Target }, { id: 'ranking', l: 'Ranking', ic: Star }, { id: 'metas', l: 'Metas', ic: Target }, { id: 'relatorio', l: 'Relatório', ic: FileText }] }, ...(isAdm ? [{ sc: 's', l: 'Sistema', it: [{ id: 'usuarios', l: 'Usuários', ic: Users }] }] : [])];
    const navTo = (id: string) => { setTab(id); setCliDetalhe(null); if (isMobile) setSb(false); };
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
        {notifs.slice(0, 4).map((n, i) => <div key={i} style={{ fontSize: 11, color: t.txt2, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 4, background: (t as any)[n.cor], flexShrink: 0 }} />{n.msg}</div>)}
      </div>}
      <nav style={{ flex: 1, padding: 12, overflowY: 'auto' }}>{menu.map(g => <div key={g.sc} style={{ marginBottom: 8 }}>{g.l && <button onClick={() => setExp({ ...exp, [g.sc]: !exp[g.sc] })} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'none', border: 'none', color: t.txt3, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer', letterSpacing: 0.5 }}>{g.l}{exp[g.sc] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</button>}{(g.sc === 'm' || exp[g.sc]) && g.it.map(i => <button key={i.id} onClick={() => navTo(i.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: tab === i.id ? t.goldBg : 'transparent', border: 'none', borderRadius: 8, color: tab === i.id ? t.gold : t.txt2, fontSize: 13, fontWeight: tab === i.id ? 600 : 400, cursor: 'pointer', marginBottom: 4, transition: 'all .2s' }}><i.ic size={16} />{i.l}</button>)}</div>)}</nav>
      <div style={{ padding: 8, borderTop: `1px solid ${t.brd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: online ? t.grnBg : t.redBg }}>
        {online ? <CheckCircle size={14} color={t.grn} /> : <CloudOff size={14} color={t.red} />}
        <span style={{ fontSize: 11, fontWeight: 600, color: online ? t.grn : t.red }}>{online ? 'Conectado ao Google Sheets' : 'Offline - Sem conexão'}</span>
      </div>
      <div style={{ padding: 12, borderTop: `1px solid ${t.brd}`, display: 'flex', gap: 6 }}>
        <button onClick={() => setDark(!dark)} style={{ padding: 10, background: t.alt, border: 'none', borderRadius: 8, cursor: 'pointer', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{dark ? <Sun size={16} color={t.txt} /> : <Moon size={16} color={t.txt} />}</button>
        <button onClick={loadData} style={{ padding: 10, background: t.alt, border: 'none', borderRadius: 8, cursor: 'pointer' }}><RefreshCw size={16} color={t.txt} /></button>
        <button onClick={expCSV} style={{ padding: 10, background: t.alt, border: 'none', borderRadius: 8, cursor: 'pointer' }}><Download size={16} color={t.txt} /></button>
        <button onClick={logout} style={{ padding: 10, background: t.redBg, border: 'none', borderRadius: 8, cursor: 'pointer' }}><LogOut size={16} color={t.red} /></button>
      </div>
    </aside>;
  };

  const DashboardConsultor = () => {
    const meusClientes = getCli();
    const minhasTarefas = tarefas.filter(t => {
      const cli = clientes.find(c => c.nome === t.cli);
      return cli?.cons === uCons && t.status !== 'Concluída';
    });
    const meusLanc = getLanc().filter(l => mesMatch(l.mes)).map(calc);
    const totalReceber = meusLanc.filter(l => ['A Faturar', 'Faturado'].includes(l.status)).reduce((s, l) => s + l.tot, 0);
    const totalRecebido = meusLanc.filter(l => l.status === 'Recebido').reduce((s, l) => s + (+l.pago || 0), 0);

    return <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div><h1 style={{ fontSize: 28, fontWeight: 700, color: t.txt, marginBottom: 4 }}>Olá, {user.nome.split(' ')[0]}!</h1><p style={{ color: t.txt2, fontSize: 15 }}>Aqui está seu resumo de {mes}</p></div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
        <div style={{ ...s.card, padding: 20, background: t.goldBg }}><div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}><Users size={20} color={t.gold} /><span style={{ fontSize: 12, color: t.txt2 }}>Meus Clientes</span></div><div style={{ fontSize: 28, fontWeight: 700, color: t.gold }}>{meusClientes.length}</div></div>
        <div style={{ ...s.card, padding: 20, background: t.orgBg }}><div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}><ClipboardList size={20} color={t.org} /><span style={{ fontSize: 12, color: t.txt2 }}>Tarefas Pendentes</span></div><div style={{ fontSize: 28, fontWeight: 700, color: t.org }}>{minhasTarefas.length}</div></div>
        <div style={{ ...s.card, padding: 20, background: t.blueBg }}><div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}><Clock size={20} color={t.blue} /><span style={{ fontSize: 12, color: t.txt2 }}>A Receber</span></div><div style={{ fontSize: 20, fontWeight: 700, color: t.blue }}>{fmt(totalReceber)}</div></div>
        <div style={{ ...s.card, padding: 20, background: t.grnBg }}><div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}><CheckCircle size={20} color={t.grn} /><span style={{ fontSize: 12, color: t.txt2 }}>Recebido</span></div><div style={{ fontSize: 20, fontWeight: 700, color: t.grn }}>{fmt(totalRecebido)}</div></div>
      </div>

      {minhasTarefas.length > 0 && <div style={s.card}>
        <h3 style={{ ...s.ttl, fontSize: 16 }}>Tarefas Pendentes</h3>
        <div style={{ display: 'grid', gap: 10 }}>
          {minhasTarefas.slice(0, 5).map(tar => {
            const prioColor: any = { alta: t.red, media: t.org, baixa: t.grn }[tar.prio] || t.txt3;
            return <div key={tar.id} style={{ padding: 12, background: t.alt, borderRadius: 8, borderLeft: `4px solid ${prioColor}` }}>
              <div style={{ fontWeight: 600, color: t.txt, fontSize: 14 }}>{tar.titulo}</div>
              <div style={{ fontSize: 12, color: t.txt3, marginTop: 4 }}>{tar.cli} • {tar.tipo} • {fmtD(tar.prazo)}</div>
            </div>;
          })}
          {minhasTarefas.length > 5 && <div style={{ fontSize: 12, color: t.txt3, textAlign: 'center' }}>+{minhasTarefas.length - 5} tarefas...</div>}
        </div>
      </div>}

      <div style={s.card}>
        <h3 style={{ ...s.ttl, fontSize: 16 }}>Meus Clientes ({meusClientes.length})</h3>
        {meusClientes.length === 0 ? <p style={{ color: t.txt3, textAlign: 'center', padding: 20 }}>Nenhum cliente vinculado</p> : 
        <div style={{ display: 'grid', gap: 10 }}>
          {meusClientes.map(c => {
            const sr = statR(c);
            return <div key={c.id} style={{ padding: 12, background: t.alt, borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><div style={{ fontWeight: 600, color: t.txt, fontSize: 14 }}>{c.nome}</div><div style={{ fontSize: 12, color: t.txt3, marginTop: 2 }}>Renovação: {sr.l}</div></div>
              <Badge c={c.status === 'Ativo' ? 'green' : 'gray'}>{c.status}</Badge>
            </div>;
          })}
        </div>}
      </div>
    </div>;
  };

  const Dashboard = () => {
    if (isCons) return <DashboardConsultor />;
    const r = resumo(); const notifs = getNotificacoes(); const recCli = receitaPorCliente();
    const mg = metas.find(m => m.cons === (canViewAll ? 'GERAL' : uCons) && normMes(m.mes) === mes);
    const at = mg?.val > 0 ? r.rec / mg.val : 0;
    const res = r.rec - r.cust - r.com;
    const compMensal: any[] = []; const h = new Date();
    for (let i = 5; i >= 0; i--) {
      const ms = new Date(h.getFullYear(), h.getMonth() - i, 1).toISOString().slice(0, 7);
      const lm = getLanc().filter(l => normMes(l.mes) === ms).map(calc);
      compMensal.push({ m: ms.slice(5), rec: lm.filter(l => l.status === 'Recebido').reduce((x, l) => x + (+l.pago || 0), 0), prev: lm.filter(l => ['A Faturar', 'Faturado'].includes(l.status)).reduce((x, l) => x + l.tot, 0) });
    }

    return <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div><h1 style={{ fontSize: 28, fontWeight: 700, color: t.txt, marginBottom: 4 }}>Olá, {user.nome.split(' ')[0]}!</h1><p style={{ color: t.txt2, fontSize: 15 }}>Aqui está o resumo de {mes}</p></div>
      {notifs.length > 0 && <div style={{ ...s.card, padding: 16, borderLeft: `4px solid ${t.org}`, background: t.orgBg }}><div style={{ fontSize: 13, fontWeight: 700, color: t.org, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}><Bell size={16} /> {notifs.length} alertas precisam de atenção</div><div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{notifs.slice(0, 3).map((n, i) => <div key={i} style={{ fontSize: 13, color: t.txt, display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 10, height: 10, borderRadius: 5, background: (t as any)[n.cor], flexShrink: 0 }} />{n.msg}</div>)}</div></div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>{[{ l: 'A Receber', v: r.aRec, ic: Clock, c: t.txt, bg: t.alt }, { l: 'Recebido', v: r.rec, ic: CheckCircle, c: t.grn, bg: t.grnBg }, { l: 'Vencido', v: r.venc, ic: AlertCircle, c: t.red, bg: t.redBg }, { l: 'Resultado', v: res, ic: TrendingUp, c: res >= 0 ? t.grn : t.red, bg: res >= 0 ? t.grnBg : t.redBg, hl: 1 }].map((x, i) => <div key={i} style={{ ...s.card, padding: 20, background: x.bg, border: x.hl ? `2px solid ${t.gold}` : s.card.border }}><div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}><x.ic size={20} color={x.c} /><span style={{ fontSize: 12, color: t.txt2, fontWeight: 500 }}>{x.l}</span></div><div style={{ fontSize: 24, fontWeight: 700, color: x.c }}>{fmt(x.v)}</div></div>)}</div>
      {mg?.val > 0 && <div style={s.card}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}><div><div style={{ fontSize: 12, color: t.txt3, marginBottom: 4 }}>META DO MÊS</div><div style={{ fontSize: 28, fontWeight: 700, color: t.txt }}>{fmt(mg.val)}</div></div><div style={{ textAlign: 'right' }}><div style={{ fontSize: 40, fontWeight: 700, color: at >= 1 ? t.grn : at >= 0.7 ? t.org : t.gold }}>{(at * 100).toFixed(0)}%</div><div style={{ fontSize: 12, color: t.txt3 }}>{fmt(r.rec)} recebido</div></div></div><div style={{ height: 16, background: t.alt, borderRadius: 8, overflow: 'hidden' }}><div style={{ height: '100%', width: `${Math.min(at * 100, 100)}%`, background: `linear-gradient(90deg, ${t.gold}, ${at >= 1 ? t.grn : t.org})`, borderRadius: 8, transition: 'width 0.5s' }} /></div></div>}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 20 }}>
        {recCli.length > 0 && <div style={s.card}><h3 style={{ ...s.ttl, fontSize: 16 }}>Top 5 Clientes</h3><div style={{ display: 'flex', alignItems: 'center', gap: 16 }}><ResponsiveContainer width="45%" height={160}><PieChart><Pie data={recCli} dataKey="valor" nameKey="nome" cx="50%" cy="50%" outerRadius={60} innerRadius={35}>{recCli.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip formatter={v => fmt(v as number)} /></PieChart></ResponsiveContainer><div style={{ flex: 1 }}>{recCli.map((c: any, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: COLORS[i % COLORS.length] }} /><span style={{ flex: 1, color: t.txt2, fontSize: 13 }}>{c.nome}</span><span style={{ fontWeight: 600, color: t.txt, fontSize: 13 }}>{fmt(c.valor)}</span></div>)}</div></div></div>}
        <div style={s.card}><h3 style={{ ...s.ttl, fontSize: 16 }}>Comparativo Mensal</h3><ResponsiveContainer width="100%" height={160}><BarChart data={compMensal}><XAxis dataKey="m" fontSize={11} stroke={t.txt3} axisLine={false} tickLine={false} /><YAxis fontSize={11} stroke={t.txt3} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} width={35} /><Tooltip formatter={v => fmt(v as number)} contentStyle={{ background: t.card, border: `1px solid ${t.brd}`, borderRadius: 8, fontSize: 12 }} /><Bar dataKey="rec" name="Recebido" fill={t.grn} radius={[4, 4, 0, 0]} /><Bar dataKey="prev" name="Previsto" fill={t.gold} radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer><div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 12 }}><div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: t.grn }} /> Recebido</div><div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: t.gold }} /> Previsto</div></div></div>
      </div>
    </div>;
  };

  const Consultores = () => {
    if (!canEditAll) return <div style={s.card}><p style={{ color: t.txt3, textAlign: 'center', padding: 40 }}>Acesso restrito a administradores</p></div>;
    const [f, setF] = useState({ nome: '', pctCom: 20, email: '', tel: '' }); const [ed, setEd] = useState<any>(null);
    const salvar = async () => { if (!f.nome) return notify('Preencha o nome!'); const dados = { ...f, pctCom: (+f.pctCom || 0) / 100 }; if (ed) { await svCons(consultores.map(c => c.id === ed ? { ...dados, id: ed } : c)); setEd(null); } else await svCons([...consultores, { ...dados, id: Date.now() }]); setF({ nome: '', pctCom: 20, email: '', tel: '' }); };
    const del = async (id: any) => { if(!confirm('Tem certeza que deseja excluir este consultor?')) return; await svCons(consultores.filter(x => x.id !== id)); };
    const editar = (c: any) => { setF({ nome: c.nome, pctCom: (c.pctCom || 0.2) * 100, email: c.email || '', tel: c.tel || '' }); setEd(c.id); };
    
    return <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={s.card}><h3 style={s.ttl}>{ed ? 'Editar Consultor' : 'Novo Consultor'}</h3><p style={{ color: t.txt3, fontSize: 13, marginBottom: 20, marginTop: -8 }}>Cadastre os consultores que gerenciam seus clientes</p><div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 16 }}><div><label style={s.lbl}>Nome Completo *</label><input style={s.inp} value={f.nome} onChange={e => setF({ ...f, nome: e.target.value })} placeholder="Ex: João Silva" /></div><div><label style={s.lbl}>% Comissão</label><input style={s.inp} type="number" value={f.pctCom} onChange={e => setF({ ...f, pctCom: +e.target.value || 0 })} placeholder="20" /><Dica texto="Percentual sobre os recebimentos" /></div><div><label style={s.lbl}>E-mail</label><input style={s.inp} type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} placeholder="joao@email.com" /></div><div><label style={s.lbl}>Telefone</label><input style={s.inp} value={f.tel} onChange={e => setF({ ...f, tel: e.target.value })} placeholder="(11) 99999-9999" /></div></div><div style={{ display: 'flex', gap: 10, marginTop: 20 }}><button onClick={salvar} disabled={saving} style={{ ...s.btn, background: t.gold, color: '#fff' }}><Save size={16} />{ed ? 'Salvar Alterações' : 'Cadastrar Consultor'}</button>{ed && <button onClick={() => { setEd(null); setF({ nome: '', pctCom: 20, email: '', tel: '' }); }} style={{ ...s.btn, background: t.alt, color: t.txt }}><X size={16} />Cancelar</button>}</div></div>
      <div style={s.card}><h3 style={s.ttl}>Consultores Cadastrados ({consultores.length})</h3>{consultores.length === 0 ? <p style={{ color: t.txt3, textAlign: 'center', padding: 40 }}>Nenhum consultor cadastrado ainda</p> : <div style={{ display: 'grid', gap: 12 }}>{consultores.map(c => <div key={c.id} style={{ padding: 16, background: t.alt, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><div style={{ fontWeight: 600, color: t.txt, fontSize: 15, marginBottom: 4 }}>{c.nome}</div><div style={{ fontSize: 13, color: t.pur }}>{pct(c.pctCom)} comissão - {clientes.filter(x => x.cons === c.nome).length} clientes</div>{c.email && <div style={{ fontSize: 12, color: t.txt3, marginTop: 4 }}>{c.email}</div>}</div><div style={{ display: 'flex', gap: 8 }}><button onClick={() => editar(c)} style={{ ...s.btn, padding: '8px 14px', fontSize: 13, background: t.goldBg, color: t.gold }}>Editar</button><button onClick={() => del(c.id)} style={{ ...s.btn, padding: '8px 14px', fontSize: 13, background: t.redBg, color: t.red }}>Excluir</button></div></div>)}</div>}</div>
    </div>;
  };

  const Clientes = () => {
    const ef = { nome: '', pctFix: 0, valFix: 0, pctBonus: 0, valBonus: 0, metaFat: 0, dtPgtoFix: '', dtPgtoCom: '', fixCloser: 0, pctCloser: 0, fixSDR: 0, pctSDR: 0, fixSocial: 0, pctSocial: 0, cons: '', inicio: '', renov: '', prazo: 12, status: 'Ativo', nps: '', probRen: 100 };
    const [f, setF] = useState<any>(ef); const [ed, setEd] = useState<any>(null);
    const salvar = async () => { if (!f.nome) return notify('Preencha o nome!'); const dados = { ...f, pctFix: (+f.pctFix || 0) / 100, pctBonus: (+f.pctBonus || 0) / 100, pctCloser: (+f.pctCloser || 0) / 100, pctSDR: (+f.pctSDR || 0) / 100, pctSocial: (+f.pctSocial || 0) / 100, probRen: (+f.probRen || 100) / 100 }; if (ed) { await svCli(clientes.map(c => c.id === ed ? { ...dados, id: ed } : c)); setEd(null); } else { const novoCli = { ...dados, id: Date.now() }; await svCli([...clientes, novoCli]); if (dados.inicio && dados.prazo) { const novos = await gerarLancamentos(novoCli); if (novos.length > 0) await svLanc([...lancamentos, ...novos]); }} setF(ef); };
    const del = async (id: any) => { if(!confirm('Excluir este cliente?')) return; await svCli(clientes.filter(x => x.id !== id)); };
    const editar = (c: any) => { setF({ ...c, pctFix: (c.pctFix || 0) * 100, pctBonus: (c.pctBonus || 0) * 100, pctCloser: (c.pctCloser || 0) * 100, pctSDR: (c.pctSDR || 0) * 100, pctSocial: (c.pctSocial || 0) * 100, probRen: (c.probRen || 1) * 100, metaFat: c.metaFat || 0, dtPgtoFix: c.dtPgtoFix || '', dtPgtoCom: c.dtPgtoCom || '', fixCloser: c.fixCloser || 0, fixSDR: c.fixSDR || 0, fixSocial: c.fixSocial || 0, valFix: c.valFix || 0, valBonus: c.valBonus || 0, cons: c.cons || '', status: c.status || 'Ativo', inicio: c.inicio || '', renov: c.renov || '', prazo: c.prazo || 12, nps: c.nps || '' }); setEd(c.id); };
    const fmtFixo = (c: any) => { const p: string[] = []; if (c.pctFix > 0) p.push(pct(c.pctFix)); if (c.valFix > 0) p.push(fmt(c.valFix)); return p.length ? p.join(' + ') : '-'; };

    if (!canEditAll) return <div style={s.card}><h3 style={s.ttl}>{isCons ? 'Meus Clientes' : 'Clientes'}</h3>{getCli().length === 0 ? <p style={{ color: t.txt3, textAlign: 'center', padding: 30 }}>Nenhum cliente</p> : <div style={{ display: 'grid', gap: 12 }}>{getCli().map(c => { const sr = statR(c); return <div key={c.id} style={{ padding: 16, background: t.alt, borderRadius: 10 }}><div style={{ fontWeight: 600, color: t.txt, fontSize: 15 }}>{c.nome}</div><div style={{ display: 'flex', gap: 8, marginTop: 8 }}><Badge c={c.status === 'Ativo' ? 'green' : 'gray'}>{c.status}</Badge><Badge c={sr.cor}>{sr.l}</Badge></div></div>; })}</div>}</div>;

    return <div style={{ display: 'grid', gap: 20 }}>
      <div style={s.card}><h3 style={s.ttl}>{ed ? 'Editar Cliente' : 'Novo Cliente'}</h3><div style={{ marginBottom: 20 }}><label style={s.lbl}>Nome do Cliente *</label><input style={s.inp} value={f.nome} onChange={e => setF({ ...f, nome: e.target.value })} placeholder="Ex: Empresa ABC Ltda" /></div><div style={{ background: t.alt, padding: 16, borderRadius: 10, marginBottom: 16 }}><div style={{ fontSize: 13, fontWeight: 700, color: t.gold, marginBottom: 4 }}>SUA PARTICIPAÇÃO</div><div style={{ fontSize: 12, color: t.txt3, marginBottom: 12 }}>Quanto você recebe deste cliente</div><div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}><div><label style={s.lbl}>% sobre Faturamento</label><input style={s.inp} type="number" value={f.pctFix} onChange={e => setF({ ...f, pctFix: +e.target.value || 0 })} /><Dica texto="Percentual fixo mensal" /></div><div><label style={s.lbl}>Valor Fixo Mensal (R$)</label><input style={s.inp} type="number" value={f.valFix} onChange={e => setF({ ...f, valFix: +e.target.value || 0 })} /><Dica texto="Valor garantido todo mês" /></div><div><label style={s.lbl}>% Bônus (se bater meta)</label><input style={s.inp} type="number" value={f.pctBonus} onChange={e => setF({ ...f, pctBonus: +e.target.value || 0 })} /></div><div><label style={s.lbl}>Meta Faturamento (R$)</label><input style={s.inp} type="number" value={f.metaFat} onChange={e => setF({ ...f, metaFat: +e.target.value || 0 })} /><Dica texto="Se atingir, ganha bônus" /></div></div></div><div style={{ background: t.alt, padding: 16, borderRadius: 10, marginBottom: 16 }}><div style={{ fontSize: 13, fontWeight: 700, color: t.txt, marginBottom: 12 }}>CONTRATO</div><div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}><div><label style={s.lbl}>Consultor</label><select style={s.inp} value={f.cons} onChange={e => setF({ ...f, cons: e.target.value })}><option value="">Selecione...</option>{consultores.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}</select></div><div><label style={s.lbl}>Status</label><select style={s.inp} value={f.status} onChange={e => setF({ ...f, status: e.target.value })}><option>Ativo</option><option>Inativo</option><option>Cancelado</option></select></div><div><label style={s.lbl}>Data Início</label><input style={s.inp} type="date" value={f.inicio} onChange={e => { const v = e.target.value; if (v && f.prazo) { const d = new Date(v); d.setMonth(d.getMonth() + +f.prazo); setF({ ...f, inicio: v, renov: d.toISOString().slice(0, 10) }); } else setF({ ...f, inicio: v }); }} /></div><div><label style={s.lbl}>Duração (meses)</label><input style={s.inp} type="number" value={f.prazo} onChange={e => { const v = +e.target.value || 12; if (f.inicio && v) { const d = new Date(f.inicio); d.setMonth(d.getMonth() + v); setF({ ...f, prazo: v, renov: d.toISOString().slice(0, 10) }); } else setF({ ...f, prazo: v }); }} /></div><div><label style={s.lbl}>Renovação</label><input style={{ ...s.inp, background: t.card }} type="date" value={f.renov} readOnly /><Dica texto="Calculado automaticamente" /></div><div><label style={s.lbl}>NPS (0-10)</label><input style={s.inp} type="number" min="0" max="10" value={f.nps} onChange={e => setF({ ...f, nps: +e.target.value || '' })} /></div></div></div><div style={{ display: 'flex', gap: 10 }}><button onClick={salvar} disabled={saving} style={{ ...s.btn, flex: 1, justifyContent: 'center', background: t.gold, color: '#fff' }}><Save size={16} />{ed ? 'Salvar Alterações' : 'Cadastrar Cliente'}</button>{ed && <button onClick={() => { setEd(null); setF(ef); }} style={{ ...s.btn, background: t.alt, color: t.txt }}><X size={16} />Cancelar</button>}</div></div>
      <div style={{ ...s.card, background: t.goldBg, border: `1px solid ${t.gold}` }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><div style={{ fontSize: 15, fontWeight: 600, color: t.txt }}>Gerar Lançamentos</div><div style={{ fontSize: 13, color: t.txt2 }}>Cria automaticamente para todos os clientes ativos</div></div><button onClick={gerarTodosLancamentos} disabled={saving} style={{ ...s.btn, background: t.gold, color: '#fff' }}><Calendar size={16} />Gerar Todos</button></div></div>
      <div style={s.card}><h3 style={s.ttl}>Clientes ({clientes.length})</h3>{clientes.length === 0 ? <p style={{ color: t.txt3, textAlign: 'center', padding: 30 }}>Nenhum cliente cadastrado</p> : <div style={{ display: 'grid', gap: 12 }}>{clientes.map(c => { const sr = statR(c); return <div key={c.id} style={{ padding: 16, background: t.alt, borderRadius: 10 }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}><div><div style={{ fontWeight: 600, color: t.txt, fontSize: 15 }}>{c.nome}</div><div style={{ fontSize: 13, color: t.txt2, marginTop: 4 }}>{c.cons || 'Sem consultor'} - Fixo: {fmtFixo(c)}</div></div><div style={{ display: 'flex', gap: 8 }}><button onClick={() => editar(c)} style={{ ...s.btn, padding: '8px 14px', fontSize: 13, background: t.goldBg, color: t.gold }}>Editar</button><button onClick={() => del(c.id)} style={{ ...s.btn, padding: '8px 14px', fontSize: 13, background: t.redBg, color: t.red }}>Excluir</button></div></div><div style={{ display: 'flex', gap: 8, marginTop: 10 }}><Badge c={c.status === 'Ativo' ? 'green' : 'gray'}>{c.status}</Badge><Badge c={sr.cor}>Renova: {sr.l}</Badge></div></div>; })}</div>}</div>
    </div>;
  };

  const Custos = () => {
    if (!canEditAll) return <div style={s.card}><p style={{ color: t.txt3, textAlign: 'center', padding: 40 }}>Acesso restrito</p></div>;
    const [f, setF] = useState({ cli: '', tipo: 'Ferramenta', descricao: '', val: 0 }); const [ed, setEd] = useState<any>(null);
    const salvar = async () => { if (!f.cli || !f.descricao) return notify('Preencha cliente e descrição!'); if (ed) { await svCust(custos.map(c => c.id === ed ? { ...f, id: ed } : c)); setEd(null); } else await svCust([...custos, { ...f, id: Date.now() }]); setF({ cli: '', tipo: 'Ferramenta', descricao: '', val: 0 }); };
    const del = async (id: any) => { if(!confirm('Excluir este custo?')) return; await svCust(custos.filter(c => c.id !== id)); };
    
    return <div style={{ display: 'grid', gap: 20 }}>
      <div style={s.card}><h3 style={s.ttl}>{ed ? 'Editar' : 'Novo'} Custo Operacional</h3><div style={{ fontSize: 13, color: t.txt3, marginBottom: 16 }}>Ferramentas e serviços vinculados a cada cliente</div><div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}><div><label style={s.lbl}>Cliente *</label><select style={s.inp} value={f.cli} onChange={e => setF({ ...f, cli: e.target.value })}><option value="">Selecione...</option>{clientes.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}</select></div><div><label style={s.lbl}>Tipo</label><select style={s.inp} value={f.tipo} onChange={e => setF({ ...f, tipo: e.target.value })}><option>Ferramenta</option><option>Terceirizado</option><option>Outro</option></select></div><div><label style={s.lbl}>Descrição *</label><input style={s.inp} value={f.descricao} onChange={e => setF({ ...f, descricao: e.target.value })} placeholder="Ex: RD Station" /></div><div><label style={s.lbl}>Valor Mensal (R$)</label><input style={s.inp} type="number" value={f.val} onChange={e => setF({ ...f, val: +e.target.value || 0 })} /></div></div><div style={{ display: 'flex', gap: 10, marginTop: 20 }}><button onClick={salvar} disabled={saving} style={{ ...s.btn, background: t.gold, color: '#fff' }}><Save size={16} />{ed ? 'Salvar' : 'Adicionar'}</button>{ed && <button onClick={() => { setEd(null); setF({ cli: '', tipo: 'Ferramenta', descricao: '', val: 0 }); }} style={{ ...s.btn, background: t.alt, color: t.txt }}><X size={16} />Cancelar</button>}</div></div>
      <div style={s.card}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}><h3 style={{ ...s.ttl, marginBottom: 0 }}>Custos</h3><Badge c="orange">Total: {fmt(custos.reduce((x, c) => x + (+c.val || 0), 0))}/mês</Badge></div>{custos.length === 0 ? <p style={{ color: t.txt3, textAlign: 'center', padding: 30 }}>Nenhum custo cadastrado</p> : <div style={{ display: 'grid', gap: 10 }}>{custos.map(c => <div key={c.id} style={{ padding: 14, background: t.alt, borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><div style={{ fontWeight: 600, color: t.txt }}>{c.descricao || c.desc}</div><div style={{ fontSize: 12, color: t.txt3, marginTop: 2 }}>{c.cli} - {c.tipo}</div></div><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ fontWeight: 700, color: t.org }}>{fmt(c.val)}</span><button onClick={() => { setF({ ...c, descricao: c.descricao || c.desc }); setEd(c.id); }} style={{ ...s.btn, padding: '6px 10px', background: t.goldBg, color: t.gold }}>Editar</button><button onClick={() => del(c.id)} style={{ ...s.btn, padding: '6px 10px', background: t.redBg, color: t.red }}>Excluir</button></div></div>)}</div>}</div>
    </div>;
  };

  const Lancamentos = () => {
    const ef = { mes: mes, cli: '', bruto: 0, taxa: 5, meta: false, venc: '', status: 'A Faturar', pago: 0, comRecebida: 0 };
    const [f, setF] = useState<any>(ef); const [ed, setEd] = useState<any>(null); const [filtro, setFiltro] = useState('');
    const lm = getLanc().filter(l => mesMatch(l.mes)).map(calc).filter(l => !filtro || l.cli.toLowerCase().includes(filtro.toLowerCase()));
    const salvar = async () => { if (!f.cli) return notify('Selecione o cliente!'); const dados = { ...f, taxa: (+f.taxa || 0) / 100, comRecebida: +f.comRecebida || 0 }; if (ed) { await svLanc(lancamentos.map(l => l.id === ed ? { ...dados, id: ed } : l)); setEd(null); } else await svLanc([...lancamentos, { ...dados, id: Date.now() }]); setF(ef); };
    const del = async (id: any) => { if(!confirm('Excluir este lançamento?')) return; await svLanc(lancamentos.filter(l => l.id !== id)); };
    const editar = (l: any) => { setF({ ...l, taxa: (l.taxa || 0) * 100, comRecebida: l.comRecebida || 0 }); setEd(l.id); };
    const totais = { bruto: lm.reduce((s, l) => s + (+l.bruto || 0), 0), part: lm.reduce((s, l) => s + l.tot, 0), rec: lm.filter(l => l.status === 'Recebido').reduce((s, l) => s + (+l.pago || 0), 0), comRec: lm.filter(l => l.status === 'Recebido').reduce((s, l) => s + (+l.comRecebida || 0), 0) };
    
    return <div style={{ display: 'grid', gap: 20 }}>
      <div style={s.card}>
        <h3 style={s.ttl}>{ed ? 'Editar' : 'Novo'} Lançamento</h3>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 12 }}>
          <div><label style={s.lbl}>Mês *</label><input style={s.inp} type="month" value={f.mes} onChange={e => setF({ ...f, mes: e.target.value })} /></div>
          <div><label style={s.lbl}>Cliente *</label><select style={s.inp} value={f.cli} onChange={e => setF({ ...f, cli: e.target.value })}><option value="">Selecione...</option>{getCli().map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}</select></div>
          <div><label style={s.lbl}>Valor Bruto (R$)</label><input style={s.inp} type="number" value={f.bruto} onChange={e => setF({ ...f, bruto: +e.target.value || 0 })} /><Dica texto="Valor total faturado para o cliente" /></div>
          <div><label style={s.lbl}>Taxa (%)</label><input style={s.inp} type="number" value={f.taxa} onChange={e => setF({ ...f, taxa: +e.target.value || 0 })} /></div>
          <div><label style={s.lbl}>Vencimento</label><input style={s.inp} type="date" value={f.venc} onChange={e => setF({ ...f, venc: e.target.value })} /></div>
          <div><label style={s.lbl}>Status</label><select style={s.inp} value={f.status} onChange={e => setF({ ...f, status: e.target.value })}><option>A Faturar</option><option>Faturado</option><option>Recebido</option><option>Vencido</option></select></div>
          {f.status === 'Recebido' && (
            <>
              <div><label style={s.lbl}>Valor Pago (R$)</label><input style={s.inp} type="number" value={f.pago} onChange={e => setF({ ...f, pago: +e.target.value || 0 })} /><Dica texto="Valor total recebido" /></div>
              <div><label style={s.lbl}>Comissão Recebida (R$)</label><input type="number" value={f.comRecebida} onChange={e => setF({ ...f, comRecebida: +e.target.value || 0 })} style={{ ...s.inp, borderColor: t.gold }} /><Dica texto="Valor da sua comissão recebida" /></div>
            </>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20 }}><input type="checkbox" checked={f.meta} onChange={e => setF({ ...f, meta: e.target.checked })} /><span style={{ fontSize: 13, color: t.txt }}>Bateu meta?</span></div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={salvar} disabled={saving} style={{ ...s.btn, background: t.gold, color: '#fff' }}><Save size={16} />{ed ? 'Salvar' : 'Adicionar'}</button>
          {ed && <button onClick={() => { setEd(null); setF(ef); }} style={{ ...s.btn, background: t.alt, color: t.txt }}><X size={16} />Cancelar</button>}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        {[
          { l: 'Faturamento', v: totais.bruto, c: t.txt },
          { l: 'Sua Participação', v: totais.part, c: t.gold },
          { l: 'Recebido', v: totais.rec, c: t.grn },
          { l: 'Comissão Recebida', v: totais.comRec, c: t.pur }
        ].map((x, i) => (
          <div key={i} style={{ ...s.card, padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: t.txt3, marginBottom: 4 }}>{x.l}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: x.c }}>{fmt(x.v)}</div>
          </div>
        ))}
      </div>
      <div style={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <h3 style={{ ...s.ttl, marginBottom: 0 }}>Lançamentos de {mes} ({lm.length})</h3>
          <input style={{ ...s.inp, width: 200 }} placeholder="Buscar cliente..." value={filtro} onChange={e => setFiltro(e.target.value)} />
        </div>
        {lm.length === 0 ? (
          <p style={{ color: t.txt3, textAlign: 'center', padding: 30 }}>Nenhum lançamento neste mês</p>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {lm.map(l => {
              const taxaAtual = (l.taxa || 0) * 100;
              const inputId = `taxa-${l.id}`;
              const salvarTaxa = async () => {
                const input = document.getElementById(inputId) as HTMLInputElement;
                const novaTaxa = +input?.value || 0;
                if (novaTaxa !== taxaAtual) {
                  await svLanc(lancamentos.map(x => x.id === l.id ? { ...x, taxa: novaTaxa / 100 } : x));
                }
              };
              return (
                <div key={l.id} style={{ padding: 14, background: t.alt, borderRadius: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600, color: t.txt }}>{l.cli}</div>
                      <div style={{ fontSize: 12, color: t.txt3, marginTop: 2 }}>
                        Bruto: {fmt(l.bruto)} 
                        <span style={{ marginLeft: 8, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          (<input 
                            id={inputId}
                            type="number" 
                            defaultValue={taxaAtual} 
                            style={{ width: 40, padding: '2px 4px', border: `1px solid ${t.brd}`, borderRadius: 4, fontSize: 12, textAlign: 'center', background: t.card }}
                          />% taxa
                          <button 
                            onClick={salvarTaxa} 
                            disabled={saving}
                            style={{ padding: '2px 6px', background: t.grn, color: '#fff', border: 'none', borderRadius: 4, fontSize: 10, cursor: 'pointer' }}
                          >✓</button>)
                        </span>
                        → {fmt(l.tot)}{l.atingiuMeta && ' ★'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Badge c={l.status === 'Recebido' ? 'green' : l.status === 'Vencido' ? 'red' : l.status === 'Faturado' ? 'blue' : 'gray'}>{l.status}</Badge>
                      <button onClick={() => editar(l)} style={{ ...s.btn, padding: '6px 10px', background: t.goldBg, color: t.gold }}>Editar</button>
                      <button onClick={() => del(l.id)} style={{ ...s.btn, padding: '6px 10px', background: t.redBg, color: t.red }}>Excluir</button>
                    </div>
                  </div>
                  {l.status === 'Recebido' && (
                    <div style={{ marginTop: 8, display: 'flex', gap: 16, fontSize: 13 }}>
                      <span style={{ color: t.grn }}>Pago: {fmt(l.pago)}</span>
                      <span style={{ color: t.pur, fontWeight: 600 }}>Comissão: {fmt(l.comRecebida || 0)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>;
  };

  const Comissoes = () => {
    const cm = comCons();
    const totalComRec = cm.reduce((s: any, c: any) => s + c.comRec, 0);
    const totalComCalc = cm.reduce((s: any, c: any) => s + c.com, 0);
    
    return <div style={{ display: 'grid', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        <div style={{ ...s.card, background: t.goldBg, border: `1px solid ${t.gold}` }}>
          <div style={{ fontSize: 12, color: t.txt3, marginBottom: 4 }}>COMISSÃO RECEBIDA</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: t.gold }}>{fmt(totalComRec)}</div>
          <div style={{ fontSize: 12, color: t.txt3, marginTop: 4 }}>{mes}</div>
        </div>
        <div style={{ ...s.card, background: t.purBg, border: `1px solid ${t.pur}` }}>
          <div style={{ fontSize: 12, color: t.txt3, marginBottom: 4 }}>COMISSÃO CONSULTORES</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: t.pur }}>{fmt(totalComCalc)}</div>
          <div style={{ fontSize: 12, color: t.txt3, marginTop: 4 }}>a pagar</div>
        </div>
        <div style={s.card}>
          <div style={{ fontSize: 12, color: t.txt3, marginBottom: 4 }}>LUCRO COMISSÕES</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: totalComRec - totalComCalc >= 0 ? t.grn : t.red }}>{fmt(totalComRec - totalComCalc)}</div>
          <div style={{ fontSize: 12, color: t.txt3, marginTop: 4 }}>após repasse</div>
        </div>
      </div>
      
      <div style={s.card}>
        <h3 style={s.ttl}>Comissões por Consultor</h3>
        {cm.length === 0 ? (
          <p style={{ color: t.txt3, textAlign: 'center', padding: 30 }}>Nenhuma comissão neste mês</p>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {cm.map((c: any, i: number) => (
              <div key={i} style={{ padding: 16, background: t.alt, borderRadius: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600, color: t.txt, fontSize: 16 }}>{c.nome}</div>
                    <div style={{ fontSize: 12, color: t.txt3 }}>{pct(c.pct)} de comissão</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: t.pur }}>{fmt(c.com)}</div>
                    <div style={{ fontSize: 11, color: t.txt3 }}>a receber</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div style={{ padding: 10, background: t.goldBg, borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: t.txt3 }}>Com. Recebida</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: t.gold }}>{fmt(c.comRec)}</div>
                  </div>
                  <div style={{ padding: 10, background: t.grnBg, borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: t.txt3 }}>Valor Pago</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: t.grn }}>{fmt(c.rec)}</div>
                  </div>
                  <div style={{ padding: 10, background: t.orgBg, borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: t.txt3 }}>Pendente</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: t.org }}>{fmt(c.pend)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>;
  };

  const Tarefas = () => {
    const ef = { cli: '', titulo: '', descricao: '', prazo: '', status: 'Pendente', prioridade: 'Normal' };
    const [f, setF] = useState<any>(ef); const [ed, setEd] = useState<any>(null); const [filtroStatus, setFiltroStatus] = useState('');
    const tf = tarefas.filter(tar => !filtroStatus || tar.status === filtroStatus);
    const salvar = async () => { if (!f.titulo) return notify('Preencha o título!'); if (ed) { await svTar(tarefas.map(tar => tar.id === ed ? { ...f, id: ed } : tar)); setEd(null); } else await svTar([...tarefas, { ...f, id: Date.now(), criado: new Date().toISOString() }]); setF(ef); };
    const del = async (id: any) => { if(!confirm('Excluir esta tarefa?')) return; await svTar(tarefas.filter(tar => tar.id !== id)); };
    const toggleStatus = async (tar: any) => { const novoStatus = tar.status === 'Pendente' ? 'Em Andamento' : tar.status === 'Em Andamento' ? 'Concluída' : 'Pendente'; await svTar(tarefas.map(x => x.id === tar.id ? { ...x, status: novoStatus } : x)); };
    const pendentes = tarefas.filter(tar => tar.status === 'Pendente').length;
    const andamento = tarefas.filter(tar => tar.status === 'Em Andamento').length;
    const concluidas = tarefas.filter(tar => tar.status === 'Concluída').length;
    
    return <div style={{ display: 'grid', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>{[{ l: 'Pendentes', v: pendentes, c: t.org, bg: t.orgBg }, { l: 'Em Andamento', v: andamento, c: t.blue, bg: t.blueBg }, { l: 'Concluídas', v: concluidas, c: t.grn, bg: t.grnBg }].map((x, i) => <div key={i} style={{ ...s.card, padding: 16, background: x.bg, textAlign: 'center' }}><div style={{ fontSize: 28, fontWeight: 700, color: x.c }}>{x.v}</div><div style={{ fontSize: 12, color: t.txt3 }}>{x.l}</div></div>)}</div>
      <div style={s.card}><h3 style={s.ttl}>{ed ? 'Editar' : 'Nova'} Tarefa</h3><div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 12 }}><div><label style={s.lbl}>Título *</label><input style={s.inp} value={f.titulo} onChange={e => setF({ ...f, titulo: e.target.value })} placeholder="Ex: Enviar proposta" /></div><div><label style={s.lbl}>Cliente</label><select style={s.inp} value={f.cli} onChange={e => setF({ ...f, cli: e.target.value })}><option value="">Geral</option>{getCli().map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}</select></div><div><label style={s.lbl}>Prazo</label><input style={s.inp} type="date" value={f.prazo} onChange={e => setF({ ...f, prazo: e.target.value })} /></div><div><label style={s.lbl}>Prioridade</label><select style={s.inp} value={f.prioridade} onChange={e => setF({ ...f, prioridade: e.target.value })}><option>Baixa</option><option>Normal</option><option>Alta</option><option>Urgente</option></select></div><div style={{ gridColumn: isMobile ? '1' : '1 / -1' }}><label style={s.lbl}>Descrição</label><textarea style={{ ...s.inp, minHeight: 60, resize: 'vertical' }} value={f.descricao} onChange={e => setF({ ...f, descricao: e.target.value })} placeholder="Detalhes da tarefa..." /></div></div><div style={{ display: 'flex', gap: 10, marginTop: 20 }}><button onClick={salvar} disabled={saving} style={{ ...s.btn, background: t.gold, color: '#fff' }}><Save size={16} />{ed ? 'Salvar' : 'Criar Tarefa'}</button>{ed && <button onClick={() => { setEd(null); setF(ef); }} style={{ ...s.btn, background: t.alt, color: t.txt }}><X size={16} />Cancelar</button>}</div></div>
      <div style={s.card}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}><h3 style={{ ...s.ttl, marginBottom: 0 }}>Tarefas ({tf.length})</h3><select style={{ ...s.inp, width: 'auto' }} value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}><option value="">Todas</option><option>Pendente</option><option>Em Andamento</option><option>Concluída</option></select></div>{tf.length === 0 ? <p style={{ color: t.txt3, textAlign: 'center', padding: 30 }}>Nenhuma tarefa</p> : <div style={{ display: 'grid', gap: 10 }}>{tf.map(tar => <div key={tar.id} style={{ padding: 14, background: t.alt, borderRadius: 10, opacity: tar.status === 'Concluída' ? 0.7 : 1 }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}><div style={{ flex: 1 }}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><button onClick={() => toggleStatus(tar)} style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${tar.status === 'Concluída' ? t.grn : tar.status === 'Em Andamento' ? t.blue : t.brd}`, background: tar.status === 'Concluída' ? t.grn : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{tar.status === 'Concluída' && <CheckCircle size={12} color="#fff" />}</button><span style={{ fontWeight: 600, color: t.txt, textDecoration: tar.status === 'Concluída' ? 'line-through' : 'none' }}>{tar.titulo}</span></div>{tar.cli && <div style={{ fontSize: 12, color: t.txt3, marginTop: 4 }}>{tar.cli}</div>}{tar.descricao && <div style={{ fontSize: 12, color: t.txt2, marginTop: 4 }}>{tar.descricao}</div>}</div><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Badge c={tar.prioridade === 'Urgente' ? 'red' : tar.prioridade === 'Alta' ? 'orange' : 'gray'}>{tar.prioridade}</Badge><button onClick={() => { setF(tar); setEd(tar.id); }} style={{ ...s.btn, padding: '6px 10px', background: t.goldBg, color: t.gold }}>Editar</button><button onClick={() => del(tar.id)} style={{ ...s.btn, padding: '6px 10px', background: t.redBg, color: t.red }}>Excluir</button></div></div>{tar.prazo && <div style={{ fontSize: 11, color: diasR(tar.prazo)! < 0 ? t.red : diasR(tar.prazo)! <= 3 ? t.org : t.txt3, marginTop: 8 }}>{fmtD(tar.prazo)}</div>}</div>)}</div>}</div>
    </div>;
  };

  const Cobranca = () => {
    const inadimplentes = inad();
    const totalVencido = inadimplentes.reduce((s, l) => s + l.tot, 0);
    const marcarRecebido = async (l: any) => { const pago = prompt(`Valor recebido de ${l.cli}:`, l.tot.toFixed(2)); if (pago === null) return; await svLanc(lancamentos.map(x => x.id === l.id ? { ...x, status: 'Recebido', pago: +pago || l.tot } : x)); notify('Marcado como recebido!'); };
    
    return <div style={{ display: 'grid', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}><div style={{ ...s.card, background: t.redBg, border: `1px solid ${t.red}` }}><div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><AlertCircle size={20} color={t.red} /><span style={{ fontSize: 12, color: t.txt3 }}>TOTAL VENCIDO</span></div><div style={{ fontSize: 32, fontWeight: 700, color: t.red }}>{fmt(totalVencido)}</div></div><div style={s.card}><div style={{ fontSize: 12, color: t.txt3, marginBottom: 8 }}>CLIENTES INADIMPLENTES</div><div style={{ fontSize: 32, fontWeight: 700, color: t.txt }}>{inadimplentes.length}</div></div></div>
      <div style={s.card}><h3 style={s.ttl}>Cobranças Pendentes</h3>{inadimplentes.length === 0 ? <p style={{ color: t.grn, textAlign: 'center', padding: 30 }}>Nenhuma cobrança pendente! Parabéns!</p> : <div style={{ display: 'grid', gap: 12 }}>{inadimplentes.map(l => { const cli = clientes.find(c => c.nome === l.cli); return <div key={l.id} style={{ padding: 16, background: t.alt, borderRadius: 12, borderLeft: `4px solid ${l.dias > 30 ? t.red : t.org}` }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}><div><div style={{ fontWeight: 600, color: t.txt, fontSize: 16 }}>{l.cli}</div><div style={{ fontSize: 13, color: t.txt3, marginTop: 4 }}>Vencido há {l.dias} dias - {l.mes}</div><div style={{ fontSize: 24, fontWeight: 700, color: t.red, marginTop: 8 }}>{fmt(l.tot)}</div></div><div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><button onClick={() => marcarRecebido(l)} style={{ ...s.btn, padding: '10px 16px', background: t.grn, color: '#fff' }}><CheckCircle size={16} />Recebido</button>{cli?.email && <a href={`mailto:${cli.email}?subject=Cobrança - ${l.mes}`} style={{ ...s.btn, padding: '10px 16px', background: t.blueBg, color: t.blue, textDecoration: 'none' }}><Mail size={16} />Email</a>}{cli?.tel && <a href={`tel:${cli.tel}`} style={{ ...s.btn, padding: '10px 16px', background: t.grnBg, color: t.grn, textDecoration: 'none' }}><Phone size={16} />Ligar</a>}</div></div></div>; })}</div>}</div>
    </div>;
  };

  const Projecao = () => {
    const projData = proj();
    const totalProj = projData.reduce((s, p) => s + p.val, 0);
    const mediaProj = projData.length > 0 ? totalProj / projData.length : 0;
    
    return <div style={{ display: 'grid', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}><div style={{ ...s.card, background: t.goldBg, border: `1px solid ${t.gold}` }}><div style={{ fontSize: 12, color: t.txt3, marginBottom: 4 }}>PROJEÇÃO TOTAL (6 MESES)</div><div style={{ fontSize: 32, fontWeight: 700, color: t.gold }}>{fmt(totalProj)}</div></div><div style={s.card}><div style={{ fontSize: 12, color: t.txt3, marginBottom: 4 }}>MÉDIA MENSAL</div><div style={{ fontSize: 32, fontWeight: 700, color: t.txt }}>{fmt(mediaProj)}</div></div></div>
      <div style={s.card}><h3 style={s.ttl}>Projeção de Receita</h3><ResponsiveContainer width="100%" height={300}><AreaChart data={projData}><XAxis dataKey="mes" fontSize={11} stroke={t.txt3} axisLine={false} tickLine={false} /><YAxis fontSize={11} stroke={t.txt3} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} /><Tooltip formatter={v => fmt(v as number)} contentStyle={{ background: t.card, border: `1px solid ${t.brd}`, borderRadius: 8, fontSize: 12 }} /><Area type="monotone" dataKey="val" name="Projeção" stroke={t.gold} fill={t.goldBg} strokeWidth={2} /></AreaChart></ResponsiveContainer></div>
      <div style={s.card}><h3 style={s.ttl}>Detalhamento Mensal</h3><div style={{ display: 'grid', gap: 10 }}>{projData.map((p, i) => <div key={i} style={{ padding: 14, background: t.alt, borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div style={{ fontWeight: 600, color: t.txt }}>{p.mes}</div><div style={{ fontSize: 18, fontWeight: 700, color: t.gold }}>{fmt(p.val)}</div></div>)}</div></div>
    </div>;
  };

  const Performance = () => {
    const perfData = perf();
    return <div style={{ display: 'grid', gap: 20 }}>
      <div style={s.card}><h3 style={s.ttl}>Performance dos Consultores</h3>{perfData.length === 0 ? <p style={{ color: t.txt3, textAlign: 'center', padding: 30 }}>Nenhum consultor cadastrado</p> : <div style={{ display: 'grid', gap: 16 }}>{perfData.map((c: any, i) => <div key={i} style={{ padding: 20, background: t.alt, borderRadius: 12 }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}><div><div style={{ fontWeight: 700, color: t.txt, fontSize: 18 }}>{c.nome}</div><div style={{ fontSize: 13, color: t.txt3, marginTop: 4 }}>{c.at} clientes ativos</div></div>{c.metaV > 0 && <div style={{ textAlign: 'right' }}><div style={{ fontSize: 28, fontWeight: 700, color: c.ating >= 1 ? t.grn : c.ating >= 0.7 ? t.org : t.txt }}>{(c.ating * 100).toFixed(0)}%</div><div style={{ fontSize: 11, color: t.txt3 }}>da meta</div></div>}</div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}><div style={{ padding: 12, background: t.grnBg, borderRadius: 8, textAlign: 'center' }}><div style={{ fontSize: 11, color: t.txt3 }}>Recebido</div><div style={{ fontSize: 18, fontWeight: 700, color: t.grn }}>{fmt(c.rec)}</div></div><div style={{ padding: 12, background: t.purBg, borderRadius: 8, textAlign: 'center' }}><div style={{ fontSize: 11, color: t.txt3 }}>Comissão</div><div style={{ fontSize: 18, fontWeight: 700, color: t.pur }}>{fmt(c.com)}</div></div><div style={{ padding: 12, background: t.blueBg, borderRadius: 8, textAlign: 'center' }}><div style={{ fontSize: 11, color: t.txt3 }}>Ticket Médio</div><div style={{ fontSize: 18, fontWeight: 700, color: t.blue }}>{fmt(c.tk)}</div></div></div>{c.metaV > 0 && <div style={{ marginTop: 16 }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: t.txt3, marginBottom: 6 }}><span>Meta: {fmt(c.metaV)}</span><span>{fmt(c.rec)} / {fmt(c.metaV)}</span></div><div style={{ height: 8, background: t.card, borderRadius: 4, overflow: 'hidden' }}><div style={{ height: '100%', width: `${Math.min(c.ating * 100, 100)}%`, background: c.ating >= 1 ? t.grn : t.gold, borderRadius: 4, transition: 'width 0.5s' }} /></div></div>}</div>)}</div>}</div>
    </div>;
  };

  const Ranking = () => {
    const rankData = rank();
    return <div style={{ display: 'grid', gap: 20 }}>
      <div style={s.card}><h3 style={s.ttl}>Ranking de Clientes</h3><p style={{ color: t.txt3, fontSize: 13, marginBottom: 20, marginTop: -8 }}>Ordenado por receita total gerada</p>{rankData.length === 0 ? <p style={{ color: t.txt3, textAlign: 'center', padding: 30 }}>Nenhum cliente cadastrado</p> : <div style={{ display: 'grid', gap: 12 }}>{rankData.map((c: any, i) => <div key={c.id} style={{ padding: 16, background: i < 3 ? t.goldBg : t.alt, borderRadius: 12, border: i < 3 ? `1px solid ${t.gold}` : 'none' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 36, height: 36, borderRadius: 8, background: i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : t.alt, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: i < 3 ? '#fff' : t.txt }}>{i + 1}</div><div><div style={{ fontWeight: 600, color: t.txt }}>{c.nome}</div><div style={{ fontSize: 12, color: t.txt3, marginTop: 2 }}>{c.cons || 'Sem consultor'}</div></div></div><div style={{ textAlign: 'right' }}><div style={{ fontSize: 20, fontWeight: 700, color: t.gold }}>{fmt(c.rec)}</div><Badge c={c.risco === 'Alto' ? 'red' : c.risco === 'Médio' ? 'orange' : 'green'}>{c.risco}</Badge></div></div></div>)}</div>}</div>
    </div>;
  };

  const Faturamento = () => {
    const ef = { mes: mes, cli: '', valor: 0 };
    const [f, setF] = useState<any>(ef);
    const [ed, setEd] = useState<any>(null);
    const [filtro, setFiltro] = useState('');
    
    const fm = faturamentos.filter(fat => normMes(fat.mes) === mes).filter(fat => !filtro || fat.cli.toLowerCase().includes(filtro.toLowerCase()));
    const totalFat = fm.reduce((s, fat) => s + (+fat.valor || 0), 0);
    const clientesComFat = [...new Set(faturamentos.filter(fat => normMes(fat.mes) === mes).map(fat => fat.cli))].length;
    
    const getMetaCliente = (cliNome: string) => {
      const cli = clientes.find(c => c.nome === cliNome);
      return +(cli?.metaFat || 0);
    };
    
    const atingiuMeta = (fat: any) => {
      const meta = getMetaCliente(fat.cli);
      return meta > 0 && (+fat.valor || 0) >= meta;
    };
    
    const salvar = async () => {
      if (!f.cli) return notify('Selecione o cliente!');
      if (+f.valor <= 0) return notify('Informe o valor do faturamento!');
      
      const dados = { ...f, valor: +f.valor || 0 };
      
      if (ed) {
        await svFat(faturamentos.map(fat => fat.id === ed ? { ...dados, id: ed } : fat));
        setEd(null);
      } else {
        // Verifica se já existe faturamento para este cliente/mês
        const existe = faturamentos.find(fat => fat.cli === f.cli && normMes(fat.mes) === normMes(f.mes));
        if (existe) {
          if (!confirm(`Já existe faturamento para ${f.cli} em ${f.mes}. Deseja substituir?`)) return;
          await svFat(faturamentos.map(fat => fat.id === existe.id ? { ...dados, id: existe.id } : fat));
        } else {
          await svFat([...faturamentos, { ...dados, id: Date.now() }]);
        }
      }
      setF(ef);
    };
    
    const del = async (id: any) => {
      if (!confirm('Excluir este faturamento?')) return;
      await svFat(faturamentos.filter(fat => fat.id !== id));
    };
    
    const editar = (fat: any) => {
      setF({ ...fat });
      setEd(fat.id);
    };
    
    // Calcula total sob gestão (últimos 12 meses)
    const calcTotalGestao = () => {
      const hoje = new Date();
      let total = 0;
      for (let i = 0; i < 12; i++) {
        const ms = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1).toISOString().slice(0, 7);
        const fatMes = faturamentos.filter(fat => normMes(fat.mes) === ms);
        total += fatMes.reduce((s, fat) => s + (+fat.valor || 0), 0);
      }
      return total;
    };
    
    // Clientes que bateram meta no mês
    const clientesMeta = fm.filter(fat => atingiuMeta(fat)).length;
    
    // Evolução mensal dos últimos 6 meses
    const evolucaoMensal = () => {
      const dados: any[] = [];
      const hoje = new Date();
      for (let i = 5; i >= 0; i--) {
        const ms = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1).toISOString().slice(0, 7);
        const fatMes = faturamentos.filter(fat => normMes(fat.mes) === ms);
        const total = fatMes.reduce((s, fat) => s + (+fat.valor || 0), 0);
        const qtdMeta = fatMes.filter(fat => atingiuMeta(fat)).length;
        dados.push({ mes: ms.slice(5), total, qtdMeta, qtdClientes: fatMes.length });
      }
      return dados;
    };
    
    // Top 5 clientes por faturamento no mês
    const topClientes = () => {
      return [...fm]
        .sort((a, b) => (+b.valor || 0) - (+a.valor || 0))
        .slice(0, 5)
        .map(fat => ({ nome: fat.cli, valor: +fat.valor || 0 }));
    };
    
    // Média mensal
    const mediaMensal = () => {
      const evo = evolucaoMensal();
      const mesesComDados = evo.filter(e => e.total > 0);
      if (mesesComDados.length === 0) return 0;
      return mesesComDados.reduce((s, e) => s + e.total, 0) / mesesComDados.length;
    };
    
    const evData = evolucaoMensal();
    const topData = topClientes();
    
    return <div style={{ display: 'grid', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
        <div style={{ ...s.card, background: t.goldBg, border: `1px solid ${t.gold}` }}>
          <div style={{ fontSize: 12, color: t.txt3, marginBottom: 4 }}>FATURAMENTO {mes}</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: t.gold }}>{fmt(totalFat)}</div>
          <div style={{ fontSize: 12, color: t.txt3, marginTop: 4 }}>{clientesComFat} clientes</div>
        </div>
        <div style={{ ...s.card, background: t.grnBg, border: `1px solid ${t.grn}` }}>
          <div style={{ fontSize: 12, color: t.txt3, marginBottom: 4 }}>BATERAM META</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: t.grn }}>{clientesMeta}</div>
          <div style={{ fontSize: 12, color: t.txt3, marginTop: 4 }}>clientes com bônus</div>
        </div>
        <div style={s.card}>
          <div style={{ fontSize: 12, color: t.txt3, marginBottom: 4 }}>MÉDIA MENSAL</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: t.txt }}>{fmt(mediaMensal())}</div>
          <div style={{ fontSize: 12, color: t.txt3, marginTop: 4 }}>últimos 6 meses</div>
        </div>
        <div style={s.card}>
          <div style={{ fontSize: 12, color: t.txt3, marginBottom: 4 }}>TOTAL SOB GESTÃO</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: t.txt }}>{fmt(calcTotalGestao())}</div>
          <div style={{ fontSize: 12, color: t.txt3, marginTop: 4 }}>últimos 12 meses</div>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 20 }}>
        <div style={s.card}>
          <h3 style={s.ttl}>Evolução Mensal</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={evData}>
              <XAxis dataKey="mes" fontSize={11} stroke={t.txt3} axisLine={false} tickLine={false} />
              <YAxis fontSize={11} stroke={t.txt3} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
              <Tooltip formatter={v => fmt(v as number)} contentStyle={{ background: t.card, border: `1px solid ${t.brd}`, borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="total" name="Faturamento" stroke={t.gold} fill={t.goldBg} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {topData.length > 0 && (
          <div style={s.card}>
            <h3 style={s.ttl}>Top Clientes ({mes})</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <ResponsiveContainer width="45%" height={160}>
                <PieChart>
                  <Pie data={topData} dataKey="valor" nameKey="nome" cx="50%" cy="50%" outerRadius={60} innerRadius={35}>
                    {topData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => fmt(v as number)} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {topData.map((c: any, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ width: 12, height: 12, borderRadius: 3, background: COLORS[i % COLORS.length] }} />
                    <span style={{ flex: 1, color: t.txt2, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.nome}</span>
                    <span style={{ fontWeight: 600, color: t.txt, fontSize: 13 }}>{fmt(c.valor)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div style={s.card}>
        <h3 style={s.ttl}>Comparativo Mensal</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={evData}>
            <XAxis dataKey="mes" fontSize={11} stroke={t.txt3} axisLine={false} tickLine={false} />
            <YAxis fontSize={11} stroke={t.txt3} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} width={40} />
            <Tooltip formatter={v => fmt(v as number)} contentStyle={{ background: t.card, border: `1px solid ${t.brd}`, borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="total" name="Faturamento" fill={t.gold} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: t.gold }} /> Faturamento Total
          </div>
        </div>
      </div>
      
      <div style={s.card}>
        <h3 style={s.ttl}>{ed ? 'Editar' : 'Registrar'} Faturamento</h3>
        <p style={{ color: t.txt3, fontSize: 13, marginBottom: 16, marginTop: -8 }}>
          Informe o faturamento que o cliente teve sob sua gestão
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 12 }}>
          <div>
            <label style={s.lbl}>Mês *</label>
            <input style={s.inp} type="month" value={f.mes} onChange={e => setF({ ...f, mes: e.target.value })} />
          </div>
          <div>
            <label style={s.lbl}>Cliente *</label>
            <select style={s.inp} value={f.cli} onChange={e => setF({ ...f, cli: e.target.value })}>
              <option value="">Selecione...</option>
              {getCli().map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
            </select>
          </div>
          <div>
            <label style={s.lbl}>Faturamento do Cliente (R$) *</label>
            <input style={s.inp} type="number" value={f.valor} onChange={e => setF({ ...f, valor: +e.target.value || 0 })} placeholder="0.00" />
            {f.cli && getMetaCliente(f.cli) > 0 && (
              <Dica texto={`Meta: ${fmt(getMetaCliente(f.cli))}`} />
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={salvar} disabled={saving} style={{ ...s.btn, background: t.gold, color: '#fff' }}>
            <Save size={16} />{ed ? 'Salvar' : 'Registrar'}
          </button>
          {ed && (
            <button onClick={() => { setEd(null); setF(ef); }} style={{ ...s.btn, background: t.alt, color: t.txt }}>
              <X size={16} />Cancelar
            </button>
          )}
        </div>
      </div>
      
      <div style={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <h3 style={{ ...s.ttl, marginBottom: 0 }}>Faturamentos de {mes} ({fm.length})</h3>
          <input style={{ ...s.inp, width: 200 }} placeholder="Buscar cliente..." value={filtro} onChange={e => setFiltro(e.target.value)} />
        </div>
        {fm.length === 0 ? (
          <p style={{ color: t.txt3, textAlign: 'center', padding: 30 }}>Nenhum faturamento registrado neste mês</p>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {fm.map(fat => {
              const meta = getMetaCliente(fat.cli);
              const bateuMeta = atingiuMeta(fat);
              const pctMeta = meta > 0 ? (+fat.valor / meta) * 100 : 0;
              
              return (
                <div key={fat.id} style={{ padding: 14, background: t.alt, borderRadius: 10, borderLeft: `4px solid ${bateuMeta ? t.grn : meta > 0 ? t.org : t.brd}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600, color: t.txt, display: 'flex', alignItems: 'center', gap: 8 }}>
                        {fat.cli}
                        {bateuMeta && <Badge c="green">META ✓</Badge>}
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: t.gold, marginTop: 4 }}>
                        {fmt(fat.valor)}
                      </div>
                      {meta > 0 && (
                        <div style={{ fontSize: 12, color: t.txt3, marginTop: 4 }}>
                          Meta: {fmt(meta)} ({pctMeta.toFixed(0)}%)
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => editar(fat)} style={{ ...s.btn, padding: '6px 10px', background: t.goldBg, color: t.gold }}>Editar</button>
                      <button onClick={() => del(fat.id)} style={{ ...s.btn, padding: '6px 10px', background: t.redBg, color: t.red }}>Excluir</button>
                    </div>
                  </div>
                  {meta > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ height: 6, background: t.card, borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(pctMeta, 100)}%`, background: bateuMeta ? t.grn : t.org, borderRadius: 3 }} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>;
  };

  const Metas = () => {
    const [f, setF] = useState({ cons: 'GERAL', mes, val: 0 }); 
    const salvar = async () => { const ex = metas.findIndex(m => m.cons === f.cons && normMes(m.mes) === normMes(f.mes)); if (ex >= 0) await svMet(metas.map((m, i) => i === ex ? { ...f, id: m.id } : m)); else await svMet([...metas, { ...f, id: Date.now() }]); setF({ cons: 'GERAL', mes, val: 0 }); };
    const mg = metas.find(m => m.cons === 'GERAL' && normMes(m.mes) === mes);
    const r = resumo();
    const at = mg?.val > 0 ? r.rec / mg.val : 0;
    
    return <div style={{ display: 'grid', gap: 20 }}>
      <div style={s.card}><h3 style={s.ttl}>Definir Meta</h3><div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}><div><label style={s.lbl}>Consultor</label><select style={s.inp} value={f.cons} onChange={e => setF({ ...f, cons: e.target.value })}><option value="GERAL">Geral (Empresa)</option>{consultores.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}</select></div><div><label style={s.lbl}>Valor da Meta (R$)</label><input style={s.inp} type="number" value={f.val} onChange={e => setF({ ...f, val: +e.target.value || 0 })} /></div></div><button onClick={salvar} disabled={saving} style={{ ...s.btn, marginTop: 16, background: t.gold, color: '#fff' }}><Save size={16} />Salvar Meta</button></div>
      <div style={s.card}><h3 style={s.ttl}>Meta vs Real</h3><div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>{[{ l: 'Meta', v: fmt(mg?.val || 0) }, { l: 'Realizado', v: fmt(r.rec), c: t.grn }, { l: 'Atingimento', v: pct(at), c: at >= 1 ? t.grn : t.gold }].map((x, i) => <div key={i} style={{ textAlign: 'center', padding: 14, background: t.alt, borderRadius: 8 }}><div style={{ fontSize: 12, color: t.txt3 }}>{x.l}</div><div style={{ fontSize: 20, fontWeight: 700, color: x.c || t.txt }}>{x.v}</div></div>)}</div>{mg?.val > 0 && <div style={{ height: 12, background: t.alt, borderRadius: 6 }}><div style={{ height: '100%', width: `${Math.min(at * 100, 100)}%`, background: at >= 1 ? t.grn : t.gold, borderRadius: 6 }} /></div>}</div>
    </div>;
  };

  const Relatorio = () => { 
    const r = resumo(); const cm = comCons(); const res = r.rec - r.cust - r.com; 
    return <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ ...s.card, textAlign: 'center', marginBottom: 20 }}><Logo /><h2 style={{ fontSize: 20, fontWeight: 700, color: t.txt, marginTop: 16 }}>Relatório {mes}</h2></div>
      <div style={{ ...s.card, marginBottom: 20 }}><h3 style={{ fontSize: 15, fontWeight: 600, color: t.txt, marginBottom: 12 }}>Receitas</h3>{[['A Receber', r.aRec], ['Recebido', r.rec, t.grn], ['Vencido', r.venc, t.red]].map(([l, v, c]) => <div key={l as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${t.brd}` }}><span style={{ color: t.txt2 }}>{l}</span><span style={{ fontWeight: 600, color: (c as string) || t.txt }}>{fmt(v as number)}</span></div>)}</div>
      <div style={{ ...s.card, marginBottom: 20 }}><h3 style={{ fontSize: 15, fontWeight: 600, color: t.txt, marginBottom: 12 }}>Comissões</h3>{cm.map((c: any) => <div key={c.nome} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${t.brd}` }}><span style={{ color: t.txt2 }}>{c.nome}</span><span style={{ fontWeight: 600, color: t.pur }}>{fmt(c.com)}</span></div>)}</div>
      <div style={{ ...s.card, background: t.alt }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontWeight: 700, color: t.txt, fontSize: 16 }}>RESULTADO</span><span style={{ fontSize: 28, fontWeight: 700, color: res >= 0 ? t.grn : t.red }}>{fmt(res)}</span></div></div>
      <button onClick={expCSV} style={{ ...s.btn, width: '100%', justifyContent: 'center', marginTop: 20 }}><Download size={16} />Exportar CSV</button>
    </div>;
  };

  const Usuarios = () => {
    if (!isAdm) return <div style={s.card}><p style={{ color: t.txt3, textAlign: 'center', padding: 40 }}>Acesso restrito</p></div>;
    const ef = { username: '', password: '', nome: '', tipo: 'consultor', consultor: '', ativo: true };
    const [f, setF] = useState<any>(ef); const [ed, setEd] = useState<any>(null);
    const salvar = async () => { if (!f.username || !f.password || !f.nome) return notify('Preencha todos os campos!'); if (ed) { await svUsers(users.map(u => u.id === ed ? { ...f, id: ed } : u)); setEd(null); } else await svUsers([...users, { ...f, id: Date.now() }]); setF(ef); };
    const del = async (id: any) => { if (id === 1) return notify('Não é possível excluir o master!'); if(!confirm('Excluir este usuário?')) return; await svUsers(users.filter(x => x.id !== id)); };
    
    const importarConsultor = (consultor: any) => {
      if (!consultor) return;
      setF({ ...f, username: consultor.email || '', nome: consultor.nome || '', tipo: 'consultor', consultor: consultor.nome || '' });
    };
    
    return <div style={{ display: 'grid', gap: 20 }}>
      <div style={s.card}><h3 style={s.ttl}>{ed ? 'Editar' : 'Novo'} Usuário</h3>
        {!ed && <div style={{ marginBottom: 16, padding: 12, background: t.goldBg, borderRadius: 8 }}>
          <label style={{ ...s.lbl, color: t.gold }}>Importar dados de consultor</label>
          <select style={s.inp} onChange={e => { const c = consultores.find(x => x.id === +e.target.value); importarConsultor(c); }} defaultValue="">
            <option value="">Selecione um consultor...</option>
            {consultores.map(c => <option key={c.id} value={c.id}>{c.nome} {c.email ? `(${c.email})` : ''}</option>)}
          </select>
        </div>}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}><div><label style={s.lbl}>Login (e-mail) *</label><input style={s.inp} value={f.username} onChange={e => setF({ ...f, username: e.target.value })} /></div><div><label style={s.lbl}>Senha *</label><input style={s.inp} type="password" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} /></div><div><label style={s.lbl}>Nome *</label><input style={s.inp} value={f.nome} onChange={e => setF({ ...f, nome: e.target.value })} /></div><div><label style={s.lbl}>Tipo</label><select style={s.inp} value={f.tipo} onChange={e => setF({ ...f, tipo: e.target.value })}><option value="admin">Administrador</option><option value="financeiro">Financeiro</option><option value="consultor">Consultor</option></select></div><div><label style={s.lbl}>Consultor Vinculado</label><select style={s.inp} value={f.consultor} onChange={e => setF({ ...f, consultor: e.target.value })}><option value="">Nenhum</option>{consultores.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}</select></div><div><label style={s.lbl}>Status</label><select style={s.inp} value={f.ativo ? 'sim' : 'nao'} onChange={e => setF({ ...f, ativo: e.target.value === 'sim' })}><option value="sim">Ativo</option><option value="nao">Inativo</option></select></div></div><div style={{ display: 'flex', gap: 10, marginTop: 20 }}><button onClick={salvar} disabled={saving} style={{ ...s.btn, background: t.gold, color: '#fff' }}><Save size={16} />{ed ? 'Salvar' : 'Cadastrar'}</button>{ed && <button onClick={() => { setEd(null); setF(ef); }} style={{ ...s.btn, background: t.alt, color: t.txt }}><X size={16} />Cancelar</button>}</div></div>
      <div style={s.card}><h3 style={s.ttl}>Usuários ({users.length})</h3><div style={{ display: 'grid', gap: 10 }}>{users.map(u => <div key={u.id} style={{ padding: 14, background: t.alt, borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><div style={{ fontWeight: 600, color: t.txt }}>{u.nome}</div><div style={{ fontSize: 12, color: t.txt3 }}>{u.username}</div></div><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Badge c={u.tipo === 'admin' ? 'purple' : u.tipo === 'financeiro' ? 'blue' : 'gray'}>{u.tipo}</Badge>{u.id !== 1 && <><button onClick={() => { setF(u); setEd(u.id); }} style={{ ...s.btn, padding: '6px 10px', background: t.goldBg, color: t.gold }}>Editar</button><button onClick={() => del(u.id)} style={{ ...s.btn, padding: '6px 10px', background: t.redBg, color: t.red }}>Excluir</button></>}</div></div>)}</div></div>
    </div>;
  };

  if (loading) return <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}><Logo /><Loader size={28} color={t.gold} className="spin" /><span style={{ color: t.txt2 }}>Carregando...</span></div>;

  const C: any = { dashboard: Dashboard, consultores: Consultores, clientes: Clientes, custos: Custos, lancamentos: Lancamentos, faturamento: Faturamento, comissoes: Comissoes, tarefas: Tarefas, cobranca: Cobranca, projecao: Projecao, performance: Performance, ranking: Ranking, metas: Metas, relatorio: Relatorio, usuarios: Usuarios }[tab] || Dashboard;

  return <div style={{ minHeight: '100vh', background: t.bg }}>
    <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <Toast />
    <Sidebar />
    {isMobile && sb && <div onClick={() => setSb(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 40 }} />}
    <header style={{ position: 'fixed', top: 0, left: sideW, right: 0, height: 60, background: t.card, borderBottom: `1px solid ${t.brd}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', zIndex: 30, transition: 'left .3s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><button onClick={() => setSb(!sb)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}><Menu size={22} color={t.txt} /></button>{isMobile && <Logo />}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>{!online && <Badge c="red"><CloudOff size={14} /> Offline</Badge>}{saving && <Loader size={18} color={t.gold} className="spin" />}</div>
    </header>
    <main style={{ marginLeft: sideW, paddingTop: 60, minHeight: '100vh', transition: 'margin-left .3s' }}><div style={{ padding: isMobile ? 16 : 32, maxWidth: 1200, margin: '0 auto' }}><C /></div></main>
  </div>;
}
