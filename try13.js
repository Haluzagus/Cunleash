// 			Options

		// Automatic trading when true
		var stockerAutoTrading = true

		// Stock market is running when true
		var stockerMarketOn = false;

		// Minimum number of brokers required for automatic trading
		var stockerMinBrokers = 72				// Default of 72 results in 0.5% commission

		// Fraction of banked cookies allowed for automatic trading
		var stockerCookiesThreshold = 0.05;

		// Buy all necessary brokers as soon as we can afford them
		var stockerAutoBuyMinimumBrokers = true
		
		// Buy additional brokers as soon as we can afford them
		var stockerAutoBuyAdditionalBrokers = true
		
		// Increases number of warehouses in sync with the highest raw CPS during this session
		var stockerExponential = true;

		// The ratio of the highest raw CPS to the original raw CPS is raised to this power when Exponential Warehouses is on
		var stockerExponentialPower = 1.0;

		// Announce transactions in game notifications
		var stockerTransactionNotifications = true;

		// Make regular profit reports
		var stockerActivityReport = false
			// How often to make regular reports in ms (one hour by default)
			var stockerActivityReportFrequency = 1000 * 60 * 60

		// Make game notifications fade away on their own
		var stockerFastNotifications = false

		// Use console.log for more detailed info on prices and trends
		var stockerConsoleAnnouncements = false

		// Display warning message when broker numbers or bank cookies are insufficient to run automatic trading.
		var stockerResourcesWarning = true

		// Display more detailed trading info near the top of the stock market display
		var stockerAdditionalTradingStats = true

		// Logic loop frequency; do not touch it unless you are cheating
		var stockerLoopFrequency = 1000 * 30
		
		// The cheat itself. Rolls the cycle every time logic loop triggers
		var stockerForceLoopUpdates = false

		var stockerGreeting = 'click clack you will soon be in debt'



// ===================================================================================

const CS_TEN_YEARS = 86400 * 365.25 * 10;		// seconds
const CS_GASEOUS_PROFITS = 31536000;			// $31,536,000
const CS_PLASMIC_PROFITS = 100000000;			// $100,000,000
const CS_BOSE_EINSTEIN_PROFITS = 500000000;		// $500,000,000

if (typeof CCSE === 'undefined')
	Game.LoadMod('https://klattmose.github.io/CookieClicker/CCSE.js')

if (typeof CookiStocker === 'undefined') var CookiStocker = {};

CookiStocker.name = 'CookiStocker';
CookiStocker.version = '3.0.2';
CookiStocker.GameVersion = '2.053';
CookiStocker.build = 'Tuesday 2025-10-14 09:55:45 PM';

// One place to hold the interval handle + the current period (ms)
CookiStocker.reportTimer = 0;
CookiStocker._reportEveryMs = 0;
CookiStocker._cfgReady = false;		// set true at the end of CookiStocker.load()
CookiStocker._loopTimer	= 0;

CookiStocker.Bank = 0;

if (typeof CookiStocker.stockList === 'undefined') {
	CookiStocker.stockList = (typeof stockList === 'object' && stockList) || {};
}
var stockList = CookiStocker.stockList;

stockList = {
	Check: 'dump eet',
	Goods: [],
	Start: Date.now() + 500,
	lastTime: Date.now() + 500,
	startingProfits: 0,
	Profits: 0,
	netProfits: 0,
	grossProfits: 0,
	grossLosses: 0,
	totalStocks: 0,
	totalShares: 0,
	totalValue: 0,
	unrealizedProfits: 0,
	profitableStocks: 0,
	unprofitableStocks: 0,
	profitableTrades: 0,
	unprofitableTrades: 0,
	Purchases: 0,
	Sales: 0,
	Uptime: 0,
	hourlyProfits: 0,
	dailyProfits: 0,
	minCookies: Number.MAX_VALUE,
	maxCookies: 0,
	noModActions: false,
	origCookiesPsRawHighest: 0,
	Amount: 0,
	canBuy: true,
	shadowGone: false,
}

let stockerModeProfits = [
	[[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
	[[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
	[[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
	[[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
	[[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
	[[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]]
];

var modeDecoder = ['stable','slowly rising','slowly falling','rapidly rising','rapidly falling','chaotic'] // meanings of each market trend (good.mode)
var goodIcons = [[2,33],[3,33],[4,33],[15,33],[16,33],[17,33],[5,33],[6,33],[7,33],[8,33],[13,33],[14,33],[19,33],[20,33],[32,33],[33,33],[34,33],[35,33]];

CookiStocker.launch = function() {
	try {
		if (Game && Game.Objects && Game.Objects['Bank'] && Game.Objects['Bank'].minigame) {
			CookiStocker.Bank = Game.Objects['Bank'].minigame;
			// If we re-entered after Ascension, ensure no stale cycle is queued
			if (CookiStocker._tickTimeout)   { clearTimeout(CookiStocker._tickTimeout);   CookiStocker._tickTimeout = 0; }
			if (CookiStocker._reportTimeout) { clearTimeout(CookiStocker._reportTimeout); CookiStocker._reportTimeout = 0; }
			this.isLoaded = 1;
		}
	} catch (e) {}
};

if (!CookiStocker.isLoaded) {
	// If CCSE exists, ask it to call us later; do NOT create a fake CCSE.
	if (typeof CCSE !== 'undefined' && CCSE) {
		if (!CCSE.postLoadHooks) CCSE.postLoadHooks = [];
		CCSE.postLoadHooks.push(function() {
			try { CookiStocker.launch(); } catch (e) {}
		});
	}
}

function ensureStockerStyles() {
	if (document.getElementById('stocker-styles')) return; // avoid duplicates
	const css = `
		.stocker-stats{
			display:flex;
			flex-wrap:wrap;		/* allow wrapping onto a new line */
			justify-content:center;	/* center each line */
			align-items:baseline;
			gap:0 3px;		/* horizontal spacing between fields */
			white-space:normal;	/* permit wrapping */
		}
		.stocker-stats .stat{
			white-space:nowrap;	/* keep each field intact */
			font-size:10px;
			color:rgba(255,255,255,0.8);
			padding:1px 3px;
		}
		/* Force a manual break after a chosen field on narrow panes */
		.stocker-stats .break{ flex-basis:100%; height:0; }
		@media (min-width: 950px){ .stocker-stats .break{ display:none; } }
	`;
	const style = document.createElement('style');
	style.id = 'stocker-styles';
	style.textContent = css;
	document.head.appendChild(style);
}
ensureStockerStyles();

// Optional stats container id
CookiStocker.extraStatsId = 'stockerExtra';

// Rebuilds the 2nd/3rd/4th lines exactly as before
CookiStocker.buildExtraStatsHTML = function(){
	// These are the same strings you already use (datStr2/datStr3/datStr4)
	// Keeping markup identical; wrapped by our container.
	let html = '';
	html += `
		<div class="stocker-stats">
			<span class="stat">Net cookies won: <span id="netCookies">0</span>.</span>
			<span class="stat">Cookies per hour: <span id="cookiesHour">0</span>.</span>
			<span class="stat">Cookies per day: <span id="cookiesDay">0</span>.</span>
			<span class="stat">Purchases: <span id="Purchases">0</span>.</span>
			<span class="stat">Sales: <span id="Sales">0</span>.</span>
		</div>
	`;
	html += `
		<div class="stocker-stats">
			<span class="stat">CPS multiple: <span id="cpsMultiple">0</span>.</span>
			<span class="stat">Stocks held: <span id="stocksHeld">${stockList.totalStocks}</span>.</span>
			<span class="stat">Total shares: <span id="totalShares">${Beautify(stockList.totalShares, 0)}</span>.</span>
			<span class="stat">Total value: <span id="totalValue">${Beautify(stockList.totalValue, 2)}</span>.</span>
			<span class="stat">Unrealized profits: <span id="unrealizedProfits">${Beautify(stockList.unrealizedProfits, 0)}</span>.</span>
		</div>
	`;
	html += `
		<div class="stocker-stats">
			<span class="stat">Profitable stocks: <span id="profitableStocks">0</span>.</span>
			<span class="stat">Unprofitable stocks: <span id="unprofitableStocks">0</span>.</span>
			<span class="stat">Profitable trades: <span id="profitableTrades">0</span>.</span>
			<span class="stat">Unprofitable trades: <span id="unprofitableTrades">0</span>.</span>
			<span class="break"></span>
			<span class="stat">Average profit per trade: <span id="averageProfit">$0</span>.</span>
			<span class="stat">Average loss per trade: <span id="averageLoss">$0</span>.</span>
		</div>
	`;
	return html;
};
// Shows or hides the optional block immediately when the option changes.
// If enabling and the container doesn't exist yet, we create and populate it.
CookiStocker.updateAdditionalStatsVisibility = function(){
	const header = l('bankHeader');
	const host = header && header.firstChild ? header.firstChild : null;
	if (!host) return;

	let extra = l(CookiStocker.extraStatsId);

	if (stockerAdditionalTradingStats){
		// Ensure container exists and is visible
		if (!extra){
			extra = document.createElement('div');
			extra.id = CookiStocker.extraStatsId;
			extra.innerHTML = CookiStocker.buildExtraStatsHTML();
			host.appendChild(extra);
		}
		extra.style.display = '';
	} else {
		// Hide; we could also removeChild if you prefer to tear it down
		if (extra){
			extra.style.display = 'none';
		}
	}
};


function stockerTimeBeautifier(duration) {
	var milliseconds = Math.floor(duration % 1000),
	  seconds = Math.floor((duration / 1000) % 60),
	  minutes = Math.floor((duration / (1000 * 60)) % 60),
	  hours = Math.floor((duration / (1000 * 60 * 60)) % 24),
	  days = Math.floor(duration / (1000 * 60 * 60 * 24));
	if (seconds && (minutes || hours || days) && !stockerForceLoopUpdates)
		seconds = 0;						// Don't display
	var strSeconds = seconds + ' second' + (seconds != 1 ? 's' : '');
	var strMinutes = minutes ? minutes + ' minute' + (minutes != 1 ? 's' : '') + (seconds ? (hours || days ? ', and ' : ' and ') : '') : '';
	var strHours = hours ? hours + ' hour' + (hours != 1 ? 's' : '') + (minutes && seconds ? ', ' : ((minutes ? !seconds : seconds) ? ' and ' : '')) : '';
	var strDays = days ? days + ' day' + (days != 1 ? 's' : '') + (hours && minutes || hours && seconds || minutes && seconds ? ', ' : (((hours ? !minutes : minutes) ? !seconds : seconds) ? ' and ' : '')) : '';
	var strTime = strDays + strHours + strMinutes;
	if (stockerForceLoopUpdates && seconds)
		strTime += strSeconds; 
	if (minutes || hours || days) {
		return (strTime);
	} else
		return (strSeconds);
}

// --- Anchored scheduling on each market tick ------------------------------
CookiStocker._tickHookInstalled	= 0;
CookiStocker._tickTimeout = 0;
CookiStocker._reportTimeout = 0;

CookiStocker._onMarketTick = function() {
	if (Game.OnAscend) return;
	if (CookiStocker._tickTimeout) { clearTimeout(CookiStocker._tickTimeout); CookiStocker._tickTimeout = 0; }
	if (CookiStocker._reportTimeout) { clearTimeout(CookiStocker._reportTimeout); CookiStocker._reportTimeout = 0; }

	CookiStocker._tickTimeout = setTimeout(function() {
		try {
			if (typeof stockerLoop === 'function') stockerLoop();
			else if (CookiStocker && typeof CookiStocker.stockerLoop === 'function') CookiStocker.stockerLoop();
		} catch (e) {}

		var delay = stockerForceLoopUpdates ? 0 : 30000;	// 0 ms when forcing; else 30 s
		CookiStocker._reportTimeout = setTimeout(function() {
			try { CookiStocker.Reports(); } catch (e) {}
		}, delay);
	}, 500);	// let the minigame finish its own recompute
};
CookiStocker.installBankTickHook = function() {
	if (CookiStocker._tickHookInstalled) return;

	var M = Game && Game.Objects && Game.Objects['Bank'] && Game.Objects['Bank'].minigame;
	if (!M || typeof M.tick !== 'function') return;

	CookiStocker._tickHookInstalled = 1;
	var _origTick = M.tick;
	M.tick = function() {
		var ret = _origTick.apply(this, arguments);
		if (typeof stockerMarketOn === 'undefined' || stockerMarketOn) {
			CookiStocker._onMarketTick();
		}
		return ret;
	};
};

// One place to hold the interval handle + the current period (ms)
CookiStocker.reportTimer = 0;
CookiStocker._reportEveryMs = 0;

// Arm/disarm the periodic reporter so there is exactly one timer when needed
CookiStocker.ensureReportTimer = function() {
	if (Game.OnAscend || CookiStocker.reportTimer) {
		clearInterval(CookiStocker.reportTimer);
		CookiStocker.reportTimer = 0;
	}

	// Do we need a periodic timer at all right now?
	const need = stockerMarketOn && (stockerActivityReport || stockerConsoleAnnouncements);
	const next = need ? Math.max(1000, (+stockerActivityReportFrequency || 3600000)) : 0;

	// If we don't need it, tear down anything that exists and reset bookkeeping
	if (!need) {
		if(CookiStocker.reportTimer) {
			clearInterval(CookiStocker.reportTimer);
			CookiStocker.reportTimer = 0;
		}
		CookiStocker._reportEveryMs = 0;
		return;
	}

	// If we need it and the period hasn't changed and it's already running, do nothing
	if (CookiStocker.reportTimer && CookiStocker._reportEveryMs === next) return;

	// (Re)arm with the new period
	if (CookiStocker.reportTimer) {
		clearInterval(CookiStocker.reportTimer);
		CookiStocker.reportTimer = 0;
	}
	CookiStocker._reportEveryMs = next;
	CookiStocker.reportTimer = setInterval(function(){ CookiStocker.Reports(); }, next);
};
