// ============================================================
//  StudentFolio — app.js
//  Pure vanilla JS, localStorage, Chart.js
//  GitHub Pages ready (no backend needed)
// ============================================================

// ─── CONSTANTS ───────────────────────────────────────────────
const ASSET_TYPES = {
  equity: { label: 'Equity',          color: '#22c55e', badge: 'badge-equity' },
  mf:     { label: 'Mutual Fund',     color: '#3b82f6', badge: 'badge-mf'     },
  fd:     { label: 'Fixed Deposit',   color: '#f59e0b', badge: 'badge-fd'     },
  rd:     { label: 'Recurring Dep.',  color: '#a855f7', badge: 'badge-rd'     },
  chit:   { label: 'Chit Fund',       color: '#ec4899', badge: 'badge-chit'   },
  bond:   { label: 'Govt Bond/PPF',   color: '#06b6d4', badge: 'badge-bond'   },
  other:  { label: 'Other',           color: '#6b7280', badge: 'badge-other'  },
};

const BROKERS = ['Zerodha','Angel One','Upstox','Groww','Paytm Money',
                  'HDFC Securities','ICICI Direct','SBI Securities','Other'];

const PAGE_TITLES = {
  dashboard:'Dashboard', portfolio:'Portfolio', goals:'Goals',
  advisor:'Advisor', whyearly:'Why Start Early?', funds:'Fund Explorer', profile:'Profile'
};

// ─── TOP INDIAN MUTUAL FUNDS (static data for explorer) ───────
const MF_DATA = [
  { name:'Mirae Asset Large Cap Fund',          house:'Mirae Asset', category:'Large Cap',   ret1y:18.2, ret3y:14.5, ret5y:16.8, risk:'Moderate', minSIP:1000 },
  { name:'Parag Parikh Flexi Cap Fund',         house:'PPFAS',       category:'Flexi Cap',   ret1y:22.1, ret3y:19.3, ret5y:21.0, risk:'Moderate', minSIP:1000 },
  { name:'Axis Bluechip Fund',                  house:'Axis',        category:'Large Cap',   ret1y:15.6, ret3y:13.1, ret5y:14.9, risk:'Low',      minSIP:500  },
  { name:'SBI Small Cap Fund',                  house:'SBI',         category:'Small Cap',   ret1y:31.4, ret3y:25.6, ret5y:28.3, risk:'High',     minSIP:500  },
  { name:'HDFC Mid-Cap Opportunities',          house:'HDFC',        category:'Mid Cap',     ret1y:27.8, ret3y:21.4, ret5y:23.5, risk:'High',     minSIP:1000 },
  { name:'Nippon India Index Fund Nifty 50',    house:'Nippon',      category:'Index',       ret1y:16.4, ret3y:12.8, ret5y:14.2, risk:'Low',      minSIP:100  },
  { name:'Quant Active Fund',                   house:'Quant',       category:'Flexi Cap',   ret1y:35.2, ret3y:29.1, ret5y:31.4, risk:'Very High', minSIP:1000},
  { name:'Kotak Emerging Equity',               house:'Kotak',       category:'Mid Cap',     ret1y:25.3, ret3y:20.7, ret5y:22.1, risk:'High',     minSIP:500  },
  { name:'UTI Nifty 50 Index Fund',             house:'UTI',         category:'Index',       ret1y:16.1, ret3y:12.5, ret5y:14.0, risk:'Low',      minSIP:500  },
  { name:'DSP Midcap Fund',                     house:'DSP',         category:'Mid Cap',     ret1y:23.7, ret3y:18.9, ret5y:20.4, risk:'High',     minSIP:500  },
  { name:'Canara Robeco Bluechip Equity',       house:'Canara Rob.', category:'Large Cap',   ret1y:17.3, ret3y:13.8, ret5y:15.7, risk:'Moderate', minSIP:1000 },
  { name:'ICICI Pru Balanced Advantage',        house:'ICICI Pru',   category:'Hybrid',      ret1y:14.2, ret3y:12.1, ret5y:13.8, risk:'Low',      minSIP:1000 },
  { name:'Motilal Oswal Midcap Fund',           house:'Motilal',     category:'Mid Cap',     ret1y:28.4, ret3y:22.0, ret5y:24.1, risk:'High',     minSIP:500  },
  { name:'Tata Digital India Fund',             house:'Tata',        category:'Sectoral',    ret1y:20.5, ret3y:16.3, ret5y:18.7, risk:'Very High', minSIP:150  },
  { name:'Franklin India Prima Fund',           house:'Franklin',    category:'Mid Cap',     ret1y:24.6, ret3y:19.4, ret5y:21.2, risk:'High',     minSIP:500  },
  { name:'Edelweiss Nifty 50 Index Fund',       house:'Edelweiss',   category:'Index',       ret1y:16.3, ret3y:12.6, ret5y:14.1, risk:'Low',      minSIP:100  },
  { name:'Navi Nifty 50 Index Fund',            house:'Navi',        category:'Index',       ret1y:16.2, ret3y:12.4, ret5y:13.9, risk:'Low',      minSIP:10   },
  { name:'Groww Nifty Total Market Index',      house:'Groww',       category:'Index',       ret1y:17.1, ret3y:13.2, ret5y:15.0, risk:'Low',      minSIP:1    },
  { name:'SBI Nifty Index Fund',                house:'SBI',         category:'Index',       ret1y:16.0, ret3y:12.3, ret5y:13.8, risk:'Low',      minSIP:500  },
  { name:'Zerodha Nifty LargeMidcap 250',       house:'Zerodha',     category:'Index',       ret1y:19.5, ret3y:15.1, ret5y:17.0, risk:'Moderate', minSIP:100  },
];

// ─── STORAGE ──────────────────────────────────────────────────
const Store = {
  get(key, def) {
    try { const v = localStorage.getItem('sf_' + key); return v ? JSON.parse(v) : def; }
    catch { return def; }
  },
  set(key, val) { localStorage.setItem('sf_' + key, JSON.stringify(val)); },

  getHoldings() { return this.get('holdings', []); },
  saveHoldings(h) { this.set('holdings', h); },

  getGoals() { return this.get('goals', []); },
  saveGoals(g) { this.set('goals', g); },

  getProfile() {
    return this.get('profile', { name:'Student', age:20, income:0, risk:'moderate' });
  },
  saveProfile(p) { this.set('profile', p); },
};

// ─── UTILS ────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2,10);

function inr(n, compact=false) {
  if (isNaN(n)) return '₹0';
  if (compact) {
    if (Math.abs(n) >= 1e7) return '₹' + (n/1e7).toFixed(2) + ' Cr';
    if (Math.abs(n) >= 1e5) return '₹' + (n/1e5).toFixed(2) + ' L';
    if (Math.abs(n) >= 1e3) return '₹' + (n/1e3).toFixed(1) + 'K';
  }
  return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function pct(n) {
  const c = n >= 0 ? 'pos' : 'neg';
  return `<span class="${c}">${n >= 0 ? '+' : ''}${n.toFixed(2)}%</span>`;
}

function calcCurrentValue(h) {
  if (h.type === 'equity') return (h.currentPrice || h.avgPrice) * h.quantity;
  if (h.type === 'mf')     return (h.currentNav || h.purchaseNav) * h.units;
  if (h.type === 'fd') {
    const years = (Date.now() - new Date(h.startDate)) / (365.25 * 86400000);
    return h.principal * Math.pow(1 + h.rate/100, years);
  }
  if (h.type === 'rd') {
    const months = Math.max(1, Math.round((Date.now() - new Date(h.startDate)) / (30.44 * 86400000)));
    const r = h.rate / 1200;
    return h.monthlyDeposit * ((Math.pow(1+r, months) - 1) / r) * (1+r);
  }
  return h.investedAmount || 0;
}

function calcInvested(h) {
  if (h.type === 'equity') return h.avgPrice * h.quantity;
  if (h.type === 'mf')     return h.purchaseNav * h.units;
  if (h.type === 'fd')     return h.principal;
  if (h.type === 'rd') {
    const months = Math.max(1, Math.round((Date.now() - new Date(h.startDate)) / (30.44 * 86400000)));
    return h.monthlyDeposit * months;
  }
  return h.investedAmount || 0;
}

function sipFutureValue(monthly, rate, years) {
  const r = rate / 1200;
  const n = years * 12;
  return monthly * ((Math.pow(1+r,n) - 1) / r) * (1+r);
}

function lumpFutureValue(principal, rate, years) {
  return principal * Math.pow(1 + rate/100, years);
}

// ─── PRICE SERVICE ────────────────────────────────────────────
const PriceService = {
  async fetchEquityPrice(symbol) {
    try {
      const proxy = 'https://api.allorigins.win/raw?url=';
      const yf    = encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.NS?interval=1d&range=1d`);
      const res   = await fetch(proxy + yf, { signal: AbortSignal.timeout(6000) });
      const data  = await res.json();
      const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
      return price ? parseFloat(price) : null;
    } catch { return null; }
  },

  async fetchMFNav(schemeCode) {
    try {
      const res  = await fetch(`https://api.mfapi.in/mf/${schemeCode}`, { signal: AbortSignal.timeout(6000) });
      const data = await res.json();
      return parseFloat(data?.data?.[0]?.nav) || null;
    } catch { return null; }
  },

  async refreshAll() {
    const holdings = Store.getHoldings();
    let updated = 0;
    for (const h of holdings) {
      if (h.type === 'equity' && h.symbol) {
        const price = await this.fetchEquityPrice(h.symbol);
        if (price) { h.currentPrice = price; updated++; }
      }
      if (h.type === 'mf' && h.schemeCode) {
        const nav = await this.fetchMFNav(h.schemeCode);
        if (nav) { h.currentNav = nav; updated++; }
      }
    }
    Store.saveHoldings(holdings);
    return updated;
  }
};

// ─── CHARTS REGISTRY (destroy before recreate) ────────────────
const Charts = {};
function destroyChart(id) { if (Charts[id]) { Charts[id].destroy(); delete Charts[id]; } }
function mkChart(id, config) { destroyChart(id); Charts[id] = new Chart(document.getElementById(id), config); }

// ─── TOAST ────────────────────────────────────────────────────
function showToast(msg, dur=2800) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), dur);
}

// ─── MODAL ────────────────────────────────────────────────────
function openModal(html) {
  document.getElementById('modalBox').innerHTML = html;
  document.getElementById('modalOverlay').classList.add('open');
}
function closeModal() { document.getElementById('modalOverlay').classList.remove('open'); }

// ─── ROUTER ──────────────────────────────────────────────────
let currentPage = 'dashboard';

function navigate(page) {
  currentPage = page;
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
  document.getElementById('topbarTitle').textContent = PAGE_TITLES[page] || page;
  renderPage(page);
  // close sidebar on mobile
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('mobOverlay').classList.remove('show');
}

function renderPage(page) {
  const pages = { dashboard, portfolio, goals, advisor, whyearly, funds, profile };
  const fn = pages[page];
  if (fn) document.getElementById('content').innerHTML = fn();
  afterRender(page);
}

// ─── PAGE: DASHBOARD ─────────────────────────────────────────
function dashboard() {
  const holdings = Store.getHoldings();
  let totalInvested = 0, totalCurrent = 0;
  const byType = {};

  holdings.forEach(h => {
    const inv = calcInvested(h);
    const cur = calcCurrentValue(h);
    totalInvested += inv;
    totalCurrent  += cur;
    byType[h.type] = (byType[h.type] || 0) + cur;
  });

  const gain = totalCurrent - totalInvested;
  const gainPct = totalInvested > 0 ? (gain/totalInvested)*100 : 0;

  const allocLabels = Object.keys(byType).map(k => ASSET_TYPES[k]?.label || k);
  const allocValues = Object.values(byType);
  const allocColors = Object.keys(byType).map(k => ASSET_TYPES[k]?.color || '#6b7280');

  return `
    <div class="sec-header">
      <div><div class="sec-title">Portfolio Overview</div>
      <div class="sec-sub">Your complete investment snapshot</div></div>
    </div>

    <div class="stat-grid">
      <div class="card">
        <div class="card-label">Total Portfolio Value</div>
        <div class="card-value">${inr(totalCurrent, true)}</div>
        <div class="card-sub">Invested: ${inr(totalInvested, true)}</div>
      </div>
      <div class="card">
        <div class="card-label">Total Returns</div>
        <div class="card-value ${gain >= 0 ? 'green' : 'red'}">${gain >= 0 ? '+' : ''}${inr(gain, true)}</div>
        <div class="card-sub">${pct(gainPct)} overall gain</div>
      </div>
      <div class="card">
        <div class="card-label">Investments</div>
        <div class="card-value">${holdings.length}</div>
        <div class="card-sub">${Object.keys(byType).length} asset types</div>
      </div>
      <div class="card">
        <div class="card-label">Best Performer</div>
        <div class="card-value gold">${getBestPerformer(holdings)}</div>
        <div class="card-sub">by % return</div>
      </div>
    </div>

    <div class="chart-grid">
      <div class="chart-card">
        <div class="chart-title">Asset Allocation</div>
        <div class="chart-wrap"><canvas id="allocChart"></canvas></div>
      </div>
      <div class="chart-card">
        <div class="chart-title">Holdings by Type</div>
        <div class="chart-wrap"><canvas id="barChart"></canvas></div>
      </div>
    </div>

    ${holdings.length === 0 ? `
      <div class="empty">
        <div class="empty-icon">📊</div>
        <div class="empty-title">No investments yet</div>
        <div style="margin-top:8px;font-size:13px;">Go to Portfolio → Add your first holding</div>
      </div>` : `
      <div class="card">
        <div class="chart-title" style="margin-bottom:16px">Recent Holdings</div>
        <div class="table-wrap">${holdingsTable(holdings.slice(-5).reverse(), false)}</div>
      </div>`
    }

    <div style="margin-top:20px" class="card">
      <div class="chart-title" style="margin-bottom:14px">📅 Quick Compounding Calculator</div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end">
        <div class="form-group">
          <label class="form-label">Monthly SIP (₹)</label>
          <input class="form-input" id="qSIP" type="number" value="5000" style="width:140px">
        </div>
        <div class="form-group">
          <label class="form-label">Duration (Years)</label>
          <input class="form-input" id="qYrs" type="number" value="10" style="width:100px">
        </div>
        <div class="form-group">
          <label class="form-label">Expected Return (%)</label>
          <input class="form-input" id="qRet" type="number" value="12" style="width:120px">
        </div>
        <button class="btn btn-primary btn-sm" onclick="calcQuick()">Calculate</button>
      </div>
      <div id="quickResult" style="margin-top:14px"></div>
    </div>
  `;
}

function getBestPerformer(holdings) {
  if (!holdings.length) return '—';
  let best = null, bestPct = -Infinity;
  holdings.forEach(h => {
    const inv = calcInvested(h);
    const cur = calcCurrentValue(h);
    if (inv > 0) {
      const p = ((cur-inv)/inv)*100;
      if (p > bestPct) { bestPct = p; best = h; }
    }
  });
  if (!best) return '—';
  return best.name.length > 12 ? best.name.slice(0,12)+'…' : best.name;
}

function afterRender(page) {
  if (page === 'dashboard') {
    const holdings = Store.getHoldings();
    const byType = {};
    holdings.forEach(h => {
      const cur = calcCurrentValue(h);
      byType[h.type] = (byType[h.type] || 0) + cur;
    });
    const labels = Object.keys(byType).map(k => ASSET_TYPES[k]?.label || k);
    const values = Object.values(byType);
    const colors = Object.keys(byType).map(k => ASSET_TYPES[k]?.color || '#6b7280');

    if (document.getElementById('allocChart')) {
      mkChart('allocChart', {
        type: 'doughnut',
        data: { labels, datasets: [{ data: values, backgroundColor: colors, borderColor: '#101b12', borderWidth: 3 }] },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { color: '#5a7a62', font:{size:12}, padding:12 } } },
          cutout: '65%'
        }
      });
    }
    if (document.getElementById('barChart')) {
      mkChart('barChart', {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Current Value',
            data: values,
            backgroundColor: colors.map(c => c + '99'),
            borderColor: colors, borderWidth: 1.5, borderRadius: 6
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          scales: {
            x: { grid:{color:'#1a2c1c'}, ticks:{color:'#5a7a62'} },
            y: { grid:{color:'#1a2c1c'}, ticks:{color:'#5a7a62', callback: v => '₹'+Number(v).toLocaleString('en-IN') } }
          },
          plugins: { legend:{display:false} }
        }
      });
    }
  }

  if (page === 'whyearly') renderWhyEarlyCharts();
  if (page === 'goals')    renderGoalCharts();
  if (page === 'funds')    setTimeout(() => window.renderFundCards?.(), 50);
}

window.calcQuick = function() {
  const sip = parseFloat(document.getElementById('qSIP').value) || 5000;
  const yrs = parseFloat(document.getElementById('qYrs').value) || 10;
  const ret = parseFloat(document.getElementById('qRet').value) || 12;
  const invested = sip * yrs * 12;
  const total    = sipFutureValue(sip, ret, yrs);
  const returns  = total - invested;
  document.getElementById('quickResult').innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
      <div class="card" style="text-align:center;padding:14px">
        <div class="card-label">Invested</div>
        <div style="font-size:18px;font-weight:700;font-family:var(--fm)">${inr(invested,true)}</div>
      </div>
      <div class="card" style="text-align:center;padding:14px">
        <div class="card-label">Returns</div>
        <div style="font-size:18px;font-weight:700;font-family:var(--fm);color:var(--green)">${inr(returns,true)}</div>
      </div>
      <div class="card" style="text-align:center;padding:14px;background:var(--green-glow);border-color:rgba(34,197,94,0.2)">
        <div class="card-label">Total Value</div>
        <div style="font-size:18px;font-weight:700;font-family:var(--fm);color:var(--green)">${inr(total,true)}</div>
      </div>
    </div>`;
};

// ─── PAGE: PORTFOLIO ──────────────────────────────────────────
function portfolio() {
  return `
    <div class="sec-header">
      <div>
        <div class="sec-title">Portfolio</div>
        <div class="sec-sub">All your holdings in one place</div>
      </div>
      <button class="btn btn-primary" onclick="showAddHolding()">＋ Add Holding</button>
    </div>

    <div class="filter-bar" id="portfolioFilters">
      <button class="filter-btn active" data-filter="all" onclick="filterPortfolio('all',this)">All</button>
      ${Object.entries(ASSET_TYPES).map(([k,v]) =>
        `<button class="filter-btn" data-filter="${k}" onclick="filterPortfolio('${k}',this)">${v.label}</button>`
      ).join('')}
    </div>

    <div id="portfolioTableWrap">
      ${renderPortfolioTable('all')}
    </div>
  `;
}

function renderPortfolioTable(filter) {
  let holdings = Store.getHoldings();
  if (filter !== 'all') holdings = holdings.filter(h => h.type === filter);
  if (!holdings.length) return `
    <div class="empty">
      <div class="empty-icon">💼</div>
      <div class="empty-title">No holdings ${filter !== 'all' ? 'in this category' : 'yet'}</div>
      <div style="margin-top:8px;font-size:13px;">Click "Add Holding" to get started</div>
    </div>`;
  return `<div class="card"><div class="table-wrap">${holdingsTable(holdings, true)}</div></div>`;
}

function holdingsTable(holdings, showDelete) {
  return `<table>
    <thead>
      <tr>
        <th>Name</th><th>Type</th><th>Invested</th>
        <th>Current Value</th><th>Gain/Loss</th><th>Return %</th>
        ${showDelete ? '<th></th>' : ''}
      </tr>
    </thead>
    <tbody>
      ${holdings.map(h => {
        const inv  = calcInvested(h);
        const cur  = calcCurrentValue(h);
        const gain = cur - inv;
        const gpct = inv > 0 ? ((gain/inv)*100) : 0;
        return `<tr>
          <td>
            <div style="font-weight:600">${h.name}</div>
            <div style="font-size:11.5px;color:var(--muted)">${h.broker || h.symbol || ''}</div>
          </td>
          <td><span class="badge ${ASSET_TYPES[h.type]?.badge}">${ASSET_TYPES[h.type]?.label || h.type}</span></td>
          <td class="mono">${inr(inv)}</td>
          <td class="mono">${inr(cur)}</td>
          <td class="mono ${gain>=0?'pos':'neg'}">${gain>=0?'+':''}${inr(gain)}</td>
          <td>${pct(gpct)}</td>
          ${showDelete ? `<td><button class="btn btn-danger btn-sm" onclick="deleteHolding('${h.id}')">✕</button></td>` : ''}
        </tr>`;
      }).join('')}
    </tbody>
  </table>`;
}

window.filterPortfolio = function(filter, btn) {
  document.querySelectorAll('#portfolioFilters .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('portfolioTableWrap').innerHTML = renderPortfolioTable(filter);
};

window.deleteHolding = function(id) {
  const h = Store.getHoldings().filter(x => x.id !== id);
  Store.saveHoldings(h);
  filterPortfolio(document.querySelector('#portfolioFilters .filter-btn.active')?.dataset.filter || 'all',
    document.querySelector('#portfolioFilters .filter-btn.active') || document.querySelector('#portfolioFilters .filter-btn'));
  showToast('Holding deleted');
};

window.showAddHolding = function() {
  openModal(`
    <div class="modal-title">＋ Add Holding</div>
    <div class="form-grid">
      <div class="form-group full">
        <label class="form-label">Asset Type</label>
        <select class="form-input" id="ahType" onchange="updateHoldingForm()">
          ${Object.entries(ASSET_TYPES).map(([k,v]) => `<option value="${k}">${v.label}</option>`).join('')}
        </select>
      </div>
      <div class="form-group full">
        <label class="form-label">Name / Description</label>
        <input class="form-input" id="ahName" placeholder="e.g. Reliance Industries, SBI SIP">
      </div>
      <div id="ahDynamic" style="display:contents"></div>
      <div class="form-group">
        <label class="form-label">Broker / Platform</label>
        <select class="form-input" id="ahBroker">
          ${BROKERS.map(b => `<option>${b}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Date of Purchase / Start</label>
        <input class="form-input" id="ahDate" type="date" value="${new Date().toISOString().split('T')[0]}">
      </div>
      <div class="form-group full">
        <label class="form-label">Notes (optional)</label>
        <input class="form-input" id="ahNotes" placeholder="Any notes...">
      </div>
    </div>
    <div class="form-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveHolding()">Save Holding</button>
    </div>
  `);
  updateHoldingForm();
};

window.updateHoldingForm = function() {
  const type = document.getElementById('ahType').value;
  const wrap = document.getElementById('ahDynamic');

  const fields = {
    equity: `
      <div class="form-group"><label class="form-label">NSE Symbol</label>
        <input class="form-input" id="ahSymbol" placeholder="e.g. RELIANCE, TCS"></div>
      <div class="form-group"><label class="form-label">Quantity</label>
        <input class="form-input" id="ahQty" type="number" placeholder="No. of shares"></div>
      <div class="form-group"><label class="form-label">Avg Buy Price (₹)</label>
        <input class="form-input" id="ahAvgPrice" type="number" placeholder="Price per share"></div>
      <div class="form-group"><label class="form-label">Current Price (₹)</label>
        <input class="form-input" id="ahCurPrice" type="number" placeholder="Auto-fill via Refresh"></div>`,
    mf: `
      <div class="form-group"><label class="form-label">Scheme Code (mfapi.in)</label>
        <input class="form-input" id="ahScheme" placeholder="e.g. 100033 (optional)"></div>
      <div class="form-group"><label class="form-label">Units Held</label>
        <input class="form-input" id="ahUnits" type="number" placeholder="Number of units"></div>
      <div class="form-group"><label class="form-label">Purchase NAV (₹)</label>
        <input class="form-input" id="ahPurchaseNav" type="number" placeholder="NAV at purchase"></div>
      <div class="form-group"><label class="form-label">Current NAV (₹)</label>
        <input class="form-input" id="ahCurNav" type="number" placeholder="Latest NAV"></div>`,
    fd: `
      <div class="form-group"><label class="form-label">Principal (₹)</label>
        <input class="form-input" id="ahPrincipal" type="number" placeholder="FD amount"></div>
      <div class="form-group"><label class="form-label">Interest Rate (%/yr)</label>
        <input class="form-input" id="ahRate" type="number" placeholder="e.g. 6.5" step="0.1"></div>
      <div class="form-group"><label class="form-label">Tenure (Years)</label>
        <input class="form-input" id="ahTenure" type="number" placeholder="e.g. 3"></div>`,
    rd: `
      <div class="form-group"><label class="form-label">Monthly Deposit (₹)</label>
        <input class="form-input" id="ahMonthly" type="number" placeholder="e.g. 2000"></div>
      <div class="form-group"><label class="form-label">Interest Rate (%/yr)</label>
        <input class="form-input" id="ahRate" type="number" placeholder="e.g. 5.5" step="0.1"></div>
      <div class="form-group"><label class="form-label">Tenure (Months)</label>
        <input class="form-input" id="ahTenure" type="number" placeholder="e.g. 24"></div>`,
    chit: `
      <div class="form-group"><label class="form-label">Monthly Contribution (₹)</label>
        <input class="form-input" id="ahMonthly" type="number" placeholder="Chit monthly amount"></div>
      <div class="form-group"><label class="form-label">Chit Value (₹)</label>
        <input class="form-input" id="ahInvested" type="number" placeholder="Total chit value"></div>
      <div class="form-group"><label class="form-label">Months Paid</label>
        <input class="form-input" id="ahTenure" type="number" placeholder="Months completed"></div>`,
    bond: `
      <div class="form-group"><label class="form-label">Instrument</label>
        <select class="form-input" id="ahBondType">
          <option>PPF</option><option>NSC</option><option>SGBs</option>
          <option>Govt Bond</option><option>NPS</option><option>ELSS</option><option>Other</option>
        </select></div>
      <div class="form-group"><label class="form-label">Invested Amount (₹)</label>
        <input class="form-input" id="ahInvested" type="number" placeholder="Total invested"></div>
      <div class="form-group"><label class="form-label">Current Value (₹)</label>
        <input class="form-input" id="ahCurValue" type="number" placeholder="Current value"></div>`,
    other: `
      <div class="form-group"><label class="form-label">Invested Amount (₹)</label>
        <input class="form-input" id="ahInvested" type="number" placeholder="Amount invested"></div>
      <div class="form-group"><label class="form-label">Current Value (₹)</label>
        <input class="form-input" id="ahCurValue" type="number" placeholder="Current value"></div>`,
  };
  wrap.innerHTML = fields[type] || fields.other;
};

window.saveHolding = function() {
  const type = document.getElementById('ahType').value;
  const name = document.getElementById('ahName').value.trim();
  if (!name) { showToast('⚠️ Enter a name'); return; }

  const base = {
    id: uid(), type, name,
    broker: document.getElementById('ahBroker')?.value || '',
    startDate: document.getElementById('ahDate')?.value || new Date().toISOString().split('T')[0],
    notes: document.getElementById('ahNotes')?.value || '',
  };

  const extras = {
    equity: () => ({
      symbol: (document.getElementById('ahSymbol')?.value || '').toUpperCase(),
      quantity: parseFloat(document.getElementById('ahQty')?.value) || 0,
      avgPrice: parseFloat(document.getElementById('ahAvgPrice')?.value) || 0,
      currentPrice: parseFloat(document.getElementById('ahCurPrice')?.value) || 0,
    }),
    mf: () => ({
      schemeCode: document.getElementById('ahScheme')?.value || '',
      units: parseFloat(document.getElementById('ahUnits')?.value) || 0,
      purchaseNav: parseFloat(document.getElementById('ahPurchaseNav')?.value) || 0,
      currentNav: parseFloat(document.getElementById('ahCurNav')?.value) || 0,
    }),
    fd: () => ({
      principal: parseFloat(document.getElementById('ahPrincipal')?.value) || 0,
      rate: parseFloat(document.getElementById('ahRate')?.value) || 0,
      tenure: parseFloat(document.getElementById('ahTenure')?.value) || 0,
    }),
    rd: () => ({
      monthlyDeposit: parseFloat(document.getElementById('ahMonthly')?.value) || 0,
      rate: parseFloat(document.getElementById('ahRate')?.value) || 0,
      tenure: parseFloat(document.getElementById('ahTenure')?.value) || 0,
    }),
    chit: () => ({
      monthlyDeposit: parseFloat(document.getElementById('ahMonthly')?.value) || 0,
      investedAmount: parseFloat(document.getElementById('ahInvested')?.value) || 0,
      tenure: parseFloat(document.getElementById('ahTenure')?.value) || 0,
    }),
    bond: () => ({
      bondType: document.getElementById('ahBondType')?.value || 'Other',
      investedAmount: parseFloat(document.getElementById('ahInvested')?.value) || 0,
      currentValue: parseFloat(document.getElementById('ahCurValue')?.value) || 0,
    }),
    other: () => ({
      investedAmount: parseFloat(document.getElementById('ahInvested')?.value) || 0,
      currentValue: parseFloat(document.getElementById('ahCurValue')?.value) || 0,
    }),
  };

  const holding = { ...base, ...(extras[type] ? extras[type]() : {}) };
  const holdings = Store.getHoldings();
  holdings.push(holding);
  Store.saveHoldings(holdings);
  closeModal();
  navigate('portfolio');
  showToast('✅ Holding added!');
};

// ─── PAGE: GOALS ──────────────────────────────────────────────
function goals() {
  const goalList = Store.getGoals();
  return `
    <div class="sec-header">
      <div>
        <div class="sec-title">Financial Goals</div>
        <div class="sec-sub">Plan and track your saving goals</div>
      </div>
      <button class="btn btn-primary" onclick="showAddGoal()">＋ Add Goal</button>
    </div>

    ${goalList.length === 0 ? `
      <div class="empty">
        <div class="empty-icon">🎯</div>
        <div class="empty-title">No goals yet</div>
        <div style="margin-top:8px;font-size:13px;">Add goals like iPhone, Bike, College Fees, etc.</div>
      </div>` : `
      <div class="goals-grid">
        ${goalList.map(renderGoalCard).join('')}
      </div>
    `}

    <div style="margin-top:28px" class="chart-card">
      <div class="chart-title">📊 Goal SIP Planner — How much SIP do you need?</div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end;margin-bottom:16px">
        <div class="form-group">
          <label class="form-label">Target Amount (₹)</label>
          <input class="form-input" id="gTarget" type="number" value="100000" style="width:140px">
        </div>
        <div class="form-group">
          <label class="form-label">Time (Years)</label>
          <input class="form-input" id="gYrs" type="number" value="3" style="width:100px">
        </div>
        <div class="form-group">
          <label class="form-label">Return (% p.a.)</label>
          <input class="form-input" id="gRet" type="number" value="12" style="width:110px">
        </div>
        <button class="btn btn-gold btn-sm" onclick="calcGoalSIP()">Calculate SIP</button>
      </div>
      <div id="goalSIPResult"></div>
    </div>
  `;
}

function renderGoalCard(g) {
  const pct = Math.min(100, ((g.saved || 0) / g.target) * 100);
  const remaining = g.target - (g.saved || 0);
  const neededSIP = remaining > 0 && g.years > 0
    ? Math.ceil(remaining / ((Math.pow(1 + 0.12/12, g.years*12) - 1) / (0.12/12) * (1 + 0.12/12)))
    : 0;
  return `
    <div class="goal-card">
      <button class="goal-del" onclick="deleteGoal('${g.id}')">✕</button>
      <div class="goal-icon">${g.icon || '🎯'}</div>
      <div class="goal-name">${g.name}</div>
      <div class="goal-amount">Target: ${inr(g.target)} · ${g.years} yr${g.years !== 1 ? 's' : ''}</div>
      <div class="progress-bar">
        <div class="progress-fill" style="width:${pct}%"></div>
      </div>
      <div class="progress-text">
        <span>${inr(g.saved || 0)} saved</span>
        <span>${pct.toFixed(0)}%</span>
      </div>
      <div class="goal-sip">💡 Need ~${inr(neededSIP)} SIP/month at 12% to reach goal</div>
      <div style="margin-top:10px;display:flex;gap:8px">
        <input class="form-input" type="number" placeholder="Add savings (₹)"
          id="gsave_${g.id}" style="flex:1;font-size:13px;padding:6px 10px">
        <button class="btn btn-primary btn-sm" onclick="addGoalSavings('${g.id}')">Add</button>
      </div>
    </div>`;
}

window.addGoalSavings = function(id) {
  const amt = parseFloat(document.getElementById('gsave_'+id)?.value) || 0;
  if (!amt) return;
  const goals = Store.getGoals();
  const g = goals.find(x => x.id === id);
  if (g) { g.saved = (g.saved || 0) + amt; Store.saveGoals(goals); navigate('goals'); showToast('✅ Savings added!'); }
};

window.deleteGoal = function(id) {
  Store.saveGoals(Store.getGoals().filter(g => g.id !== id));
  navigate('goals');
};

function renderGoalCharts() {} // placeholder

window.calcGoalSIP = function() {
  const target = parseFloat(document.getElementById('gTarget').value) || 100000;
  const years  = parseFloat(document.getElementById('gYrs').value) || 3;
  const ret    = parseFloat(document.getElementById('gRet').value) || 12;
  const r = ret / 1200;
  const n = years * 12;
  const sip = Math.ceil(target * r / ((Math.pow(1+r, n) - 1) * (1+r)));
  document.getElementById('goalSIPResult').innerHTML = `
    <div class="advice-card good" style="margin:0">
      <div class="advice-icon">💡</div>
      <div>
        <div class="advice-title">You need a monthly SIP of <span style="color:var(--green)">${inr(sip)}</span></div>
        <div class="advice-text">To accumulate ${inr(target,true)} in ${years} year${years!==1?'s':''} at ${ret}% annual return.<br>
        Total invested: ${inr(sip*n,true)} → Returns: ${inr(target - sip*n, true)}</div>
      </div>
    </div>`;
};

window.showAddGoal = function() {
  openModal(`
    <div class="modal-title">🎯 Add New Goal</div>
    <div class="form-grid">
      <div class="form-group full">
        <label class="form-label">Goal Name</label>
        <input class="form-input" id="gName" placeholder="e.g. iPhone 16, Bike, Laptop, Europe Trip">
      </div>
      <div class="form-group">
        <label class="form-label">Icon (emoji)</label>
        <input class="form-input" id="gIcon" placeholder="📱 🏍️ 💻 ✈️" maxlength="4" value="🎯">
      </div>
      <div class="form-group">
        <label class="form-label">Target Amount (₹)</label>
        <input class="form-input" id="gTarget2" type="number" placeholder="e.g. 80000">
      </div>
      <div class="form-group">
        <label class="form-label">Time Horizon (Years)</label>
        <input class="form-input" id="gYears" type="number" placeholder="e.g. 2">
      </div>
      <div class="form-group">
        <label class="form-label">Already Saved (₹)</label>
        <input class="form-input" id="gSaved" type="number" placeholder="0" value="0">
      </div>
    </div>
    <div class="form-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-gold" onclick="saveGoal()">Add Goal</button>
    </div>
  `);
};

window.saveGoal = function() {
  const name = document.getElementById('gName').value.trim();
  if (!name) { showToast('⚠️ Enter goal name'); return; }
  const goal = {
    id: uid(),
    name,
    icon: document.getElementById('gIcon').value || '🎯',
    target: parseFloat(document.getElementById('gTarget2').value) || 0,
    years: parseFloat(document.getElementById('gYears').value) || 1,
    saved: parseFloat(document.getElementById('gSaved').value) || 0,
  };
  const goals = Store.getGoals();
  goals.push(goal);
  Store.saveGoals(goals);
  closeModal();
  navigate('goals');
  showToast('🎯 Goal added!');
};

// ─── PAGE: ADVISOR ────────────────────────────────────────────
function advisor() {
  const profile  = Store.getProfile();
  const holdings = Store.getHoldings();
  const tips     = generateAdvice(profile, holdings);

  return `
    <div class="advisor-wrap">
      <div class="advisor-header">
        <div class="advisor-avatar">🤖</div>
        <div class="advisor-name">FinBot — Your AI Advisor</div>
        <div class="advisor-tag">⚠️ Not SEBI registered. For educational & awareness purposes only. Always consult a certified financial advisor for real investments.</div>
      </div>
      ${tips.map(t => `
        <div class="advice-card ${t.type}">
          <div class="advice-icon">${t.icon}</div>
          <div>
            <div class="advice-title">${t.title}</div>
            <div class="advice-text">${t.text}</div>
          </div>
        </div>`).join('')}
    </div>
  `;
}

function generateAdvice(profile, holdings) {
  const tips = [];
  const age = parseInt(profile.age) || 20;
  const total = holdings.reduce((s, h) => s + calcCurrentValue(h), 0);
  const invested = holdings.reduce((s, h) => s + calcInvested(h), 0);

  const byType = {};
  holdings.forEach(h => { byType[h.type] = (byType[h.type] || 0) + calcCurrentValue(h); });
  const equityPct = total > 0 ? ((byType.equity || 0) + (byType.mf || 0)) / total * 100 : 0;
  const debtPct   = total > 0 ? ((byType.fd || 0) + (byType.rd || 0) + (byType.bond || 0) + (byType.chit || 0)) / total * 100 : 0;

  // Rule 1: Emergency Fund
  tips.push({
    type: 'warn', icon: '🛡️',
    title: 'Build Your Emergency Fund First',
    text: `Before investing aggressively, keep 3–6 months of expenses in a liquid savings account or liquid mutual fund. ${profile.income > 0 ? `For your income of ${inr(profile.income)}, target an emergency fund of ${inr(profile.income * 4)}.` : 'This protects you from redeeming investments in a crisis.'}`
  });

  // Rule 2: Age-based allocation
  const suggestedEquity = 100 - age;
  tips.push({
    type: equityPct < suggestedEquity - 15 ? 'warn' : 'good', icon: '⚖️',
    title: `Ideal Equity Allocation for Age ${age}: ~${suggestedEquity}%`,
    text: `The classic rule: 100 − Age = Equity %. At ${age}, target ~${suggestedEquity}% in equity (stocks + equity MFs). Your current equity allocation is ${equityPct.toFixed(1)}%. ${equityPct < suggestedEquity - 15 ? '📌 Consider increasing equity exposure gradually.' : '✅ Looks well-balanced!'}`
  });

  // Rule 3: SIP advice
  tips.push({
    type: 'info', icon: '📅',
    title: 'The Power of SIP — Start Small, Grow Big',
    text: `Even ₹500/month started at ${age} grows to ${inr(sipFutureValue(500, 12, 65-age), true)} by retirement (at 12% p.a.). Increase your SIP by 10% every year (step-up SIP) for exponential growth.`
  });

  // Rule 4: Diversification
  const numTypes = Object.keys(byType).length;
  tips.push({
    type: numTypes < 2 ? 'warn' : 'good', icon: '🌈',
    title: 'Diversify Across Asset Classes',
    text: numTypes === 0
      ? 'No holdings found. Start with a Nifty 50 Index Fund — low cost, automatically diversified, no fund-manager risk.'
      : numTypes < 2
        ? `You have investments in only ${numTypes} asset type. Diversify into equity, debt (FD/Bond), and gold/REITs.`
        : `Good job! You hold ${numTypes} asset types. Ideal mix: Equity MFs + Index + FD/RD + Bonds for different goals.`
  });

  // Rule 5: Tax efficiency
  tips.push({
    type: 'info', icon: '🏦',
    title: 'Tax-Saving Investment Tips (Section 80C)',
    text: `Invest up to ₹1.5 Lakh/year in ELSS Mutual Funds, PPF, or NPS to save up to ₹46,800 in tax (30% bracket). ELSS has the shortest lock-in (3 years) and best historical returns among 80C options.`
  });

  // Rule 6: Equity MF tip for students
  if (age <= 25) {
    tips.push({
      type: 'good', icon: '🚀',
      title: 'Student Advantage — Time is Your Biggest Asset!',
      text: `Starting at ${age} vs. 30 can mean 2–4x more corpus by retirement. Even ₹1,000/month for 10 years beats ₹2,000/month for 5 years. For beginners: start with a Nifty 50 Index Fund (expense ratio < 0.1%). No stock-picking needed.`
    });
  }

  // Rule 7: Debt trap
  tips.push({
    type: 'warn', icon: '🚫',
    title: 'Avoid Investing While in High-Interest Debt',
    text: `Credit card debt at 36–42% p.a. is impossible to beat through investments. Always pay off high-interest debt first. Student loans at 7–9% can coexist with investments that target 12%+ returns.`
  });

  // Rule 8: Index vs Active
  tips.push({
    type: 'info', icon: '📊',
    title: 'Index Funds vs. Active Funds — Know the Difference',
    text: `80% of active large-cap funds underperform their benchmark index over 10+ years. Index funds like Nifty 50 or Nifty Total Market have expense ratios < 0.1% vs. 1–2% for active funds. For beginners, index funds are the smart choice.`
  });

  return tips;
}

// ─── PAGE: WHY START EARLY ────────────────────────────────────
function whyearly() {
  const scenarios = [
    { age: 18, monthly: 2000, years: 47, rate: 12 },
    { age: 25, monthly: 2000, years: 40, rate: 12 },
    { age: 30, monthly: 2000, years: 35, rate: 12 },
  ];

  const calc = s => ({
    ...s,
    invested: s.monthly * s.years * 12,
    corpus: sipFutureValue(s.monthly, s.rate, s.years),
  });

  const results = scenarios.map(calc);

  return `
    <div class="whyearly-wrap">
      <div class="compound-hero">
        <div class="compound-title">Why Starting Early Matters 🚀</div>
        <div style="color:var(--muted);font-size:14px">
          Same ₹2,000/month SIP. Same 12% return. Huge difference in outcome.
        </div>
        <div class="scenario-grid" style="margin-top:20px">
          ${results.map((r, i) => `
            <div class="scenario-card ${i === 0 ? 'highlight' : ''}">
              <div style="font-size:12px;color:var(--muted);margin-bottom:4px">Start at</div>
              <div class="scenario-age" style="color:${i===0?'var(--green)':'var(--text)'}">${r.age}</div>
              <div style="font-size:12px;color:var(--muted)">for ${r.years} years</div>
              <div style="margin:12px 0;padding:10px;background:var(--card);border-radius:var(--rs)">
                <div style="font-size:11px;color:var(--muted)">Corpus at 65</div>
                <div class="scenario-corpus" style="color:${i===0?'var(--green)':'var(--text)'}">
                  ${inr(r.corpus, true)}
                </div>
              </div>
              <div class="scenario-note">Invested: ${inr(r.invested, true)}</div>
              <div class="scenario-note" style="color:var(--green)">Returns: ${inr(r.corpus - r.invested, true)}</div>
            </div>`).join('')}
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-title">Corpus Growth Over Time — Starting Age Comparison</div>
        <div class="chart-wrap" style="height:300px"><canvas id="earlyChart"></canvas></div>
      </div>

      <div class="early-insight">
        💡 <strong>The 7-year advantage:</strong> Starting at 18 vs 25 — with the SAME monthly SIP — can give you 
        <strong style="color:var(--green)">${inr(results[0].corpus - results[1].corpus, true)} extra</strong> at retirement. 
        That's the entire cost of a house, just from starting 7 years earlier.<br><br>
        🔑 <strong>Rule of 72:</strong> Money doubles every 72÷12 = <strong style="color:var(--gold)">6 years</strong> at 12% return. 
        Starting at 18 gives you 8 doublings. Starting at 30 gives you only 6. Each extra doubling = 2x your money!
      </div>

      <div class="chart-card" style="margin-top:20px">
        <div class="chart-title">📱 Custom Compounding Calculator</div>
        <div class="compound-controls">
          <div class="form-group">
            <label class="form-label">Monthly SIP (₹)</label>
            <input class="form-input" id="cSIP" type="number" value="3000" style="width:130px" oninput="updateCompound()">
          </div>
          <div class="form-group">
            <label class="form-label">Years</label>
            <input class="form-input" id="cYrs" type="number" value="20" style="width:90px" oninput="updateCompound()">
          </div>
          <div class="form-group">
            <label class="form-label">Annual Return (%)</label>
            <input class="form-input" id="cRet" type="number" value="12" step="0.5" style="width:110px" oninput="updateCompound()">
          </div>
        </div>
        <div class="compound-result" id="cResult">
          <div class="cr-item"><div class="cr-label">Invested</div><div class="cr-value" id="cInvested">—</div></div>
          <div class="cr-item"><div class="cr-label">Returns</div><div class="cr-value" id="cReturns" style="color:var(--green)">—</div></div>
          <div class="cr-item"><div class="cr-label">Total Corpus</div><div class="cr-value" id="cTotal" style="color:var(--gold)">—</div></div>
        </div>
        <div class="chart-wrap" style="height:220px;margin-top:16px"><canvas id="customChart"></canvas></div>
      </div>
    </div>
  `;
}

function renderWhyEarlyCharts() {
  // Early chart — 3 scenarios growing over time
  if (document.getElementById('earlyChart')) {
    const labels = Array.from({length:48}, (_,i) => `Yr ${i+1}`);
    const scenarios = [
      { startYr:0, color:'#22c55e', label:'Start at 18' },
      { startYr:7, color:'#f59e0b', label:'Start at 25' },
      { startYr:12, color:'#6b7280', label:'Start at 30' },
    ];
    const datasets = scenarios.map(s => ({
      label: s.label,
      data: labels.map((_,i) => i >= s.startYr ? sipFutureValue(2000, 12, i - s.startYr + 1) : null),
      borderColor: s.color, backgroundColor: s.color + '15',
      borderWidth: 2, fill: false, tension: 0.4, pointRadius: 0,
    }));
    mkChart('earlyChart', {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          x: { grid:{color:'#1a2c1c'}, ticks:{color:'#5a7a62', maxTicksLimit:12} },
          y: { grid:{color:'#1a2c1c'}, ticks:{color:'#5a7a62', callback:v => '₹'+Number(v).toLocaleString('en-IN')} }
        },
        plugins: { legend:{ labels:{color:'#5a7a62'} } }
      }
    });
  }

  updateCompound();
}

window.updateCompound = function() {
  const sip = parseFloat(document.getElementById('cSIP')?.value) || 3000;
  const yrs = parseFloat(document.getElementById('cYrs')?.value) || 20;
  const ret = parseFloat(document.getElementById('cRet')?.value) || 12;
  const invested = sip * yrs * 12;
  const total    = sipFutureValue(sip, ret, yrs);
  const returns  = total - invested;

  const el = id => document.getElementById(id);
  if (el('cInvested')) el('cInvested').textContent = inr(invested, true);
  if (el('cReturns'))  el('cReturns').textContent  = inr(returns, true);
  if (el('cTotal'))    el('cTotal').textContent    = inr(total, true);

  if (document.getElementById('customChart')) {
    const labels = Array.from({length:yrs}, (_,i) => `Yr ${i+1}`);
    mkChart('customChart', {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Total Value',
            data: labels.map((_,i) => sipFutureValue(sip, ret, i+1)),
            borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.08)',
            borderWidth: 2, fill: true, tension: 0.4, pointRadius: 0,
          },
          {
            label: 'Invested',
            data: labels.map((_,i) => sip * (i+1) * 12),
            borderColor: '#f59e0b', backgroundColor: 'transparent',
            borderWidth: 1.5, borderDash: [4,4], tension: 0, pointRadius: 0,
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          x: { grid:{color:'#1a2c1c'}, ticks:{color:'#5a7a62'} },
          y: { grid:{color:'#1a2c1c'}, ticks:{color:'#5a7a62', callback:v => '₹'+Number(v).toLocaleString('en-IN')} }
        },
        plugins: { legend:{ labels:{color:'#5a7a62'} } }
      }
    });
  }
};

// ─── PAGE: FUND EXPLORER ──────────────────────────────────────
let fundFilter = 'All';

function funds() {
  const categories = ['All', ...new Set(MF_DATA.map(f => f.category))];
  const risks = ['All Risk', ...new Set(MF_DATA.map(f => f.risk))];

  return `
    <div class="sec-header">
      <div>
        <div class="sec-title">Fund Explorer</div>
        <div class="sec-sub">Top Indian Mutual Funds — Data for awareness only. Verify on AMFI/Morningstar.</div>
      </div>
    </div>

    <div class="fund-search-bar">
      <input class="form-input fund-search" id="fundSearch" placeholder="🔍 Search fund name or house..." oninput="renderFundCards()">
      <select class="form-input" id="fundCat" onchange="renderFundCards()" style="width:160px">
        ${categories.map(c => `<option>${c}</option>`).join('')}
      </select>
      <select class="form-input" id="fundRisk" onchange="renderFundCards()" style="width:150px">
        ${risks.map(r => `<option>${r}</option>`).join('')}
      </select>
      <select class="form-input" id="fundSort" onchange="renderFundCards()" style="width:160px">
        <option value="ret1y">Sort: 1Y Return</option>
        <option value="ret3y">Sort: 3Y Return</option>
        <option value="ret5y">Sort: 5Y Return</option>
        <option value="minSIP">Sort: Min SIP</option>
      </select>
    </div>

    <div class="funds-grid" id="fundsGrid"></div>
  `;
}

window.renderFundCards = function() {
  const q    = (document.getElementById('fundSearch')?.value || '').toLowerCase();
  const cat  = document.getElementById('fundCat')?.value  || 'All';
  const risk = document.getElementById('fundRisk')?.value || 'All Risk';
  const sort = document.getElementById('fundSort')?.value || 'ret1y';

  let list = MF_DATA.filter(f =>
    (cat === 'All' || f.category === cat) &&
    (risk === 'All Risk' || f.risk === risk) &&
    (!q || f.name.toLowerCase().includes(q) || f.house.toLowerCase().includes(q))
  );

  list = list.sort((a, b) => sort === 'minSIP' ? a.minSIP - b.minSIP : b[sort] - a[sort]);

  const riskColor = { Low:'var(--green)', Moderate:'var(--gold)', High:'var(--red)', 'Very High':'var(--purple)' };

  const grid = document.getElementById('fundsGrid');
  if (!grid) return;
  if (!list.length) { grid.innerHTML = `<div class="empty" style="grid-column:1/-1"><div class="empty-icon">🔍</div><div class="empty-title">No funds match</div></div>`; return; }

  grid.innerHTML = list.map(f => `
    <div class="fund-card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px">
        <div class="fund-name">${f.name}</div>
        <span style="font-size:10.5px;padding:2px 8px;border-radius:20px;background:rgba(255,255,255,0.04);color:${riskColor[f.risk]||'var(--muted)'};white-space:nowrap;margin-left:8px">${f.risk}</span>
      </div>
      <div class="fund-house">${f.house} · ${f.category}</div>
      <div class="fund-stats">
        <div><div class="fund-stat-label">1Y Return</div><div class="fund-stat-val pos">+${f.ret1y}%</div></div>
        <div><div class="fund-stat-label">3Y Return</div><div class="fund-stat-val pos">+${f.ret3y}%</div></div>
        <div><div class="fund-stat-label">5Y Return</div><div class="fund-stat-val pos">+${f.ret5y}%</div></div>
      </div>
      <div style="margin-top:12px;padding-top:10px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
        <div style="font-size:12px;color:var(--muted)">Min SIP: <strong style="color:var(--text)">${inr(f.minSIP)}</strong></div>
        <span class="badge badge-mf">${f.category}</span>
      </div>
    </div>`).join('');
};

// ─── PAGE: PROFILE ────────────────────────────────────────────
function profile() {
  const p = Store.getProfile();
  return `
    <div class="profile-wrap">
      <div class="sec-header">
        <div class="sec-title">Your Profile</div>
      </div>
      <div class="profile-card">
        <div class="profile-avatar">👤</div>
        <div class="form-grid">
          <div class="form-group full">
            <label class="form-label">Your Name</label>
            <input class="form-input" id="pName" value="${p.name}" placeholder="Your name">
          </div>
          <div class="form-group">
            <label class="form-label">Age</label>
            <input class="form-input" id="pAge" type="number" value="${p.age}">
          </div>
          <div class="form-group">
            <label class="form-label">Monthly Income / Allowance (₹)</label>
            <input class="form-input" id="pIncome" type="number" value="${p.income || 0}">
          </div>
          <div class="form-group full">
            <label class="form-label">Risk Profile</label>
            <select class="form-input" id="pRisk">
              <option value="conservative" ${p.risk==='conservative'?'selected':''}>Conservative — Safety first, FD/Bond heavy</option>
              <option value="moderate"     ${p.risk==='moderate'?'selected':''}>Moderate — Balanced equity + debt</option>
              <option value="aggressive"   ${p.risk==='aggressive'?'selected':''}>Aggressive — High equity, long horizon</option>
            </select>
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-primary" onclick="saveProfile()">💾 Save Profile</button>
        </div>
      </div>

      <div class="card" style="margin-top:18px">
        <div class="card-label">Data & Privacy</div>
        <div style="font-size:13.5px;color:var(--muted);margin:8px 0 16px">
          All your data is stored locally on your device (localStorage). Nothing is sent to any server.
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn btn-ghost btn-sm" onclick="exportData()">📤 Export Data (JSON)</button>
          <button class="btn btn-danger btn-sm" onclick="clearAll()">🗑️ Clear All Data</button>
        </div>
      </div>
    </div>
  `;
}

window.saveProfile = function() {
  Store.saveProfile({
    name:   document.getElementById('pName').value || 'Student',
    age:    parseInt(document.getElementById('pAge').value) || 20,
    income: parseFloat(document.getElementById('pIncome').value) || 0,
    risk:   document.getElementById('pRisk').value,
  });
  showToast('✅ Profile saved!');
};

window.exportData = function() {
  const data = {
    holdings: Store.getHoldings(),
    goals: Store.getGoals(),
    profile: Store.getProfile(),
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'studentfolio-backup.json'; a.click();
  URL.revokeObjectURL(url);
  showToast('📤 Data exported!');
};

window.clearAll = function() {
  if (!confirm('⚠️ Delete ALL data? This cannot be undone.')) return;
  ['holdings','goals','profile'].forEach(k => localStorage.removeItem('sf_'+k));
  navigate('dashboard');
  showToast('🗑️ All data cleared.');
};

// ─── REFRESH PRICES ──────────────────────────────────────────
async function refreshPrices() {
  const btn = document.getElementById('btnRefresh');
  btn.classList.add('loading');
  btn.textContent = '⟳ Fetching...';
  document.getElementById('priceBadge').textContent = '🔄 Updating...';
  try {
    const updated = await PriceService.refreshAll();
    const badge = document.getElementById('priceBadge');
    if (updated > 0) {
      badge.textContent = `🟢 ${updated} prices live`;
      badge.className = 'price-badge live';
      showToast(`✅ Updated ${updated} prices`);
    } else {
      badge.textContent = '🟡 No live prices';
      badge.className = 'price-badge';
      showToast('⚠️ Live prices unavailable — prices may be delayed or API limit reached');
    }
    if (currentPage === 'dashboard' || currentPage === 'portfolio') renderPage(currentPage);
  } catch {
    showToast('⚠️ Could not fetch prices');
  } finally {
    btn.classList.remove('loading');
    btn.textContent = '⟳ Refresh Prices';
  }
}

// ─── INIT ────────────────────────────────────────────────────
function init() {
  // Nav clicks
  document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.page));
  });

  // Mobile sidebar
  document.getElementById('menuBtn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('mobOverlay').classList.toggle('show');
  });
  document.getElementById('mobOverlay').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('mobOverlay').classList.remove('show');
  });

  // Modal close on outside click
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });

  // Refresh button
  document.getElementById('btnRefresh').addEventListener('click', refreshPrices);

  // Initial render
  navigate('dashboard');

  // Demo data for first-time users
  if (!Store.getHoldings().length) {
    const demo = [
      { id:uid(), type:'equity',  name:'Reliance Industries', symbol:'RELIANCE', quantity:10, avgPrice:2450, currentPrice:2610, broker:'Zerodha', startDate:'2024-01-15', notes:'' },
      { id:uid(), type:'mf',      name:'Parag Parikh Flexi Cap', schemeCode:'122639', units:85.5, purchaseNav:58.2, currentNav:65.8, broker:'Groww', startDate:'2024-03-01', notes:'' },
      { id:uid(), type:'fd',      name:'SBI Fixed Deposit', principal:50000, rate:6.8, tenure:2, broker:'SBI', startDate:'2023-10-01', notes:'Tax saver FD' },
      { id:uid(), type:'rd',      name:'Post Office RD', monthlyDeposit:2000, rate:6.7, tenure:24, broker:'Post Office', startDate:'2024-01-01', notes:'' },
    ];
    Store.saveHoldings(demo);
    Store.saveGoals([
      { id:uid(), name:'iPhone 16 Pro', icon:'📱', target:130000, years:1.5, saved:22000 },
      { id:uid(), name:'Royal Enfield Bike', icon:'🏍️', target:200000, years:3, saved:15000 },
    ]);
    Store.saveProfile({ name:'Student', age:20, income:15000, risk:'moderate' });
    navigate('dashboard');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  init();
  // Trigger fund render after page load
  setTimeout(() => {
    if (currentPage === 'funds') window.renderFundCards?.();
  }, 100);
});
