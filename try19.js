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
Game.registerMod('CookiStocker',{
	init: function () {
		Game.registerHook('reset', function (hard) {
			CookiStocker.reset(hard);
		});
//insert
CookiStocker.ReplaceGameMenu = function()
{
if (!Game.customOptionsMenu) Game.customOptionsMenu = []; // Safety check
Game.customOptionsMenu.push(function() {
    const content = document.createElement('div');
    content.innerHTML = CookiStocker.getMenuString();
    CCSE.AppendCollapsibleOptionsMenu(CookiStocker.name, content);
});
	
	Game.customStatsMenu.push(function() {
		CCSE.AppendStatsVersionNumber(CookiStocker.name, CookiStocker.version);
		if (!CookiStocker.Bank || !CookiStocker.Bank.goodsById) return;
		
		// example rollup; adjust to taste
		var p = CookiStocker.Bank.profit;
		var held = CookiStocker.Bank.goodsById.reduce((a,g)=>a+g.stock,0);
		var worth = CookiStocker.Bank.goodsById.reduce((a,g)=>a+g.stock * g.val * Game.cookiesPsRawHighest,0);
		
		CCSE.AppendStatsGeneral('<div class="listing"><b>Stock Market has earned you :</b><div class="price plain"> $' + Beautify(p) + ' (' + Game.tinyCookie() + Beautify(p * Game.cookiesPsRawHighest) + ' cookies)</div></div>');
/*		CCSE.AppendStatsGeneral(
			'<div class="listing"><b>CookiStocker</b></div>'
			+ '<div class="listing">Net profits: <b>$' + Beautify(p, 2) + '</b></div>'
			+ '<div class="listing">Total shares held: <b>' + Beautify(held) + '</b></div>'
			+ '<div class="listing">Portfolio (at current prices): <b>$' + Beautify(worth,2) + '</b></div>'
		);
*/	});
};
//

CookiStocker.TradingStats = function()
{
	if (typeof CookiStocker.Bank === 'undefined')
		return;

	let i, shares, cookies;
	let now = Date.now();
	let market = CookiStocker.Bank.goodsById;

	if (now > stockList.lastTime + stockerActivityReportFrequency + 500) {		// Were we sleeping?
		stockList.Start += now - stockList.lastTime - stockerActivityReportFrequency;
	}

	stockList.totalStocks = 0;
	stockList.totalShares = 0;
	stockList.totalValue = 0;
	stockList.unrealizedProfits = 0;
	for (i = 0; i < market.length; i++) {
		if (stockList.Goods[i].stock) {
			stockList.totalStocks++;
			stockList.totalShares += stockList.Goods[i].stock;
			stockList.totalValue += stockList.Goods[i].stock * stockList.Goods[i].currentPrice;
			stockList.unrealizedProfits += (market[i].val - market[i].prev) * stockList.Goods[i].stock;
		}
	}
	stockList.minCookies = Number.MAX_VALUE;
	stockList.maxCookies = 0;
	for (i = 0; i < market.length; i++) {
		shares = CookiStocker.Bank.getGoodMaxStock(market[i]) - market[i].stock;
		cookies = shares * Game.cookiesPsRawHighest * market[i].val / stockerCookiesThreshold;
		if (!stockList.minCookies || shares && cookies < stockList.minCookies)
			stockList.minCookies = cookies;
		if (shares && cookies > stockList.maxCookies)
			stockList.maxCookies = cookies;
	}
	CookiStocker.DataStats("Brokers", CookiStocker.Bank.brokers, 0);
	CookiStocker.DataStats("brokersNeeded", stockerMinBrokers, 0);
	CookiStocker.DataStats("bankedCookies", Game.cookies, 0);
	CookiStocker.DataStats("minCookies", stockList.minCookies, 0);
	CookiStocker.DataStats("maxCookies", stockList.maxCookies, 0);
	CookiStocker.DataStats("Profits", stockList.netProfits, 1);
	CookiStocker.DataStats("profitsHour", stockList.hourlyProfits, 1);
	CookiStocker.DataStats("profitsDay", stockList.dailyProfits, 1);
	CookiStocker.DataStats("grossProfits", stockList.grossProfits, 1);
	CookiStocker.DataStats("grossLosses", -stockList.grossLosses, 1);
	stockList.lastTime = now;
	stockList.Uptime = Math.floor((now - stockList.Start) / 1000) * 1000;
	stockList.Uptime -= stockList.Uptime % stockerLoopFrequency;
	let uptimeHours = Math.floor(stockList.Uptime / 3600000);
	let uptimeDays = Math.floor(uptimeHours / 24);
	if (uptimeDays >= 1) {
		uptimeDays += ':';
		uptimeHours %= 24;
		if (uptimeHours < 10)
			uptimeHours = '0' + uptimeHours;
	} else
		uptimeDays = '';
	let it = l("runTime");
	it.innerHTML = uptimeDays + uptimeHours + ':';
	if (stockerForceLoopUpdates) {
		it.innerHTML += new Date(stockList.Uptime).toLocaleTimeString([], {minute: '2-digit', second: '2-digit'});
	} else {
		let uptimeMinutes = (Math.floor(stockList.Uptime / 60000)) % 60;
		it.innerHTML += (uptimeMinutes < 10 ? '0' : '') + uptimeMinutes;
	}
	if (stockerAdditionalTradingStats) {
		CookiStocker.DataStats("netCookies", stockList.netProfits * Game.cookiesPsRawHighest, 0);
		CookiStocker.DataStats("cookiesHour", stockList.hourlyProfits * Game.cookiesPsRawHighest, 0);
		CookiStocker.DataStats("cookiesDay", stockList.dailyProfits * Game.cookiesPsRawHighest, 0);
		l("Purchases").innerHTML = stockList.Purchases;
		l("Sales").innerHTML = stockList.Sales;
		l("cpsMultiple").innerHTML = stockList.hourlyProfits >= 0 ? Beautify(stockList.hourlyProfits / 3600, 3) : -Beautify(-stockList.hourlyProfits / 3600, 3);
		l("stocksHeld").innerHTML = stockList.totalStocks;
		l("totalShares").innerHTML = Beautify(stockList.totalShares);
		CookiStocker.DataStats("totalValue", stockList.totalValue, 1); 
		CookiStocker.DataStats("unrealizedProfits", stockList.unrealizedProfits, 1);
		l("profitableStocks").innerHTML = stockList.profitableStocks;
		l("unprofitableStocks").innerHTML = stockList.unprofitableStocks
		l("profitableTrades").innerHTML = stockList.profitableTrades;
		l("unprofitableTrades").innerHTML = stockList.unprofitableTrades;
		CookiStocker.DataStats("averageProfit", stockList.profitableTrades ? stockList.grossProfits / stockList.profitableTrades : 0, 1);
		CookiStocker.DataStats("averageLoss", stockList.unprofitableTrades ? -stockList.grossLosses / stockList.unprofitableTrades : 0, 1);
	}
	if (it.innerHTML == '')			
		it.innerHTML = "0:00";
	CookiStocker.updateWarn();
}
	//end insert
		// Defer menu wiring until CCSE is available (prevents load-time crash)
		(function waitCCSE(tries) {
			if (typeof CCSE !== 'undefined'
				&& typeof CCSE.AppendCollapsibleOptionsMenu === 'function'
				&& typeof CCSE.AppendStatsVersionNumber === 'function') {
				try {
					CookiStocker.ReplaceGameMenu();
				} catch (e) {
					console.warn('[CookiStocker] ReplaceGameMenu failed; will retry shortly:', e);
					setTimeout(function(){ waitCCSE(tries - 1); }, 250);
					return;
				}
			} else if (tries > 0) {
				setTimeout(function(){ waitCCSE(tries - 1); }, 250);
			} else {
				console.warn('[CookiStocker] CCSE not detected; Options/Stats menu will not be installed.');
			}
		})(120);	// up to ~30s

		Game.Notify('CookiStocker is loaded', stockerGreeting, [1, 33], false);

		// Your loop bootstrap already self-defers until the Bank minigame is ready
		this.startStocking();
	},

	save: function () {
		return CookiStocker.save();
	},

	// The game will pass the string we returned from save() back into load(str).
	// We defer until the Bank minigame is present so CookiStocker.load can safely touch its state.
	load: function (str) {
		var tries = 0;
		(function tryLoad() {
			var bankReady =
				typeof Game === 'object' && Game.ready &&
				Game.Objects && Game.Objects['Bank'] &&
				Game.Objects['Bank'].minigame && stockList.Goods[0];

			if (bankReady) {
				try {
					// Ensure CookiStocker sees the Bank minigame
					if (typeof CookiStocker.Bank === 'undefined' || !CookiStocker.Bank) {
						CookiStocker.Bank = Game.Objects['Bank'].minigame;
					}
					CookiStocker.load(str || '');
				} catch (e) {
					console.warn('[CookiStocker] load failed:', e);
				}
			} else {
				// Try again a few times while the game finishes loading UI/minigames.
				if (tries++ < 120) setTimeout(tryLoad, 250); // up to ~30s
				else console.warn('[CookiStocker] load skipped (Bank minigame never became ready).');
			}
		})();
	},

	startStocking: function () {
		if (!(CookiStocker.Bank = Game.Objects['Bank'].minigame)) {
//			console.log('=====$$$=== Stock Market minigame has not initialised yet! Will try again in 500 ms.');
			setTimeout(() => {
				this.startStocking();
			}, 500);
			return
		}
		else {
			console.log('=====$$$=== CookiStocker logic loop initialised at ' + new Date());
			console.log('=====$$$=== With main options as follows:')
			console.log('=====$$$=== Logic loop frequency: ' + stockerTimeBeautifier(stockerLoopFrequency))
			console.log('=====$$$=== Report frequency: ' + stockerTimeBeautifier(stockerActivityReportFrequency))
			console.log('=====$$$=== Cheating: ' + stockerForceLoopUpdates)
			console.log(stockList.Check);
		}
		CookiStocker.Bank = Game.Objects['Bank'].minigame;
		CookiStocker.patchedMaxStock || (function(){ /* the override above */ })();
		if (!CookiStocker.patchedMaxStock) {
			var M = Game.Objects['Bank'].minigame;
			var oldGet = M.getGoodMaxStock;
			M.getGoodMaxStock = function(good){
				var base = oldGet.call(this, good);
				if (CookiStocker.Bank.officeLevel < 3 || stockList.Profits < CS_PLASMIC_PROFITS)
					return base;

				var mult = 1;

				if (!stockList.shadowGone && stockList.Profits >= CS_GASEOUS_PROFITS) {
					if (Game.Achievements['Gaseous assets'] && Game.Achievements['Gaseous assets'].won) {
						Game.Achievements['Gaseous assets'].pool = '';
						stockList.shadowGone = true;
					} else
						return;
				}
				if (Game.Objects['Bank'].level >= 12) {
					if (stockerExponential && stockList.origCookiesPsRawHighest)
						mult *= Game.cookiesPsRawHighest ** (stockerExponentialPower / stockList.origCookiesPsRawHighest);
					if (Game.Achievements['Plasmic assets'] && Game.Achievements['Plasmic assets'].won && stockList.Profits >= CS_PLASMIC_PROFITS * mult)
						mult *= 2;
					if (Game.Achievements['Bose-Einstein Condensed Assets'] && Game.Achievements['Bose-Einstein Condensed Assets'].won && stockList.Profits >= CS_BOSE_EINSTEIN_PROFITS * mult)
						mult *= 2;
				}
				return Math.ceil(base * mult);
			};
			CookiStocker.patchedMaxStock = true;
		}
		CookiStocker.installBankTickHook();
		
		let datStr = `
			<div class="stocker-stats">
				<span class="stat">Net profits: <span id="Profits">$0</span>.</span>
				<span class="stat">Profits per hour: <span id="profitsHour">$0</span>.</span>
				<span class="stat">Profits per day: <span id="profitsDay">$0</span>.</span>
				<span class="stat">Gross profits: <span id="grossProfits">$0</span>.</span>
				<span class="stat">Gross losses: <span id="grossLosses">$0</span>.</span>
				<span class="stat">Runtime: <span id="runTime">${stockerForceLoopUpdates ? "0:00:00" : "0:00"}</span></span>
			</div>
		`;

		let datStrWarn = `
			<div class="stocker-stats" id="stockerWarnLine" style="display:none;">
				<span class="stat" style="font-size:12px;color:#ff3b3b;font-weight:bold;">
				THERE ARE INSUFFICENT RESOURCES TO RUN AUTOMATIC TRADING. PLEASE SEE THE FOLLOWING LINE AND READ THE STEAM GUIDE.
				</span>
			</div>
		`;

		let datStrWarn2 = `
			<div class="stocker-stats" id="stockerWarnLine2" style="display:none;">
				<span class="stat" style="font-size:12px;color:#ff3b3b;font-weight:bold;">
				AUTO TRADING IS TURNED OFF IN THE OPTIONS.
				</span>
			</div>
		`;

		let datStrWarn3 = `
			<div class="stocker-stats" id="stockerWarnLine3" style="display:none;">
				<span class="stat" style="font-size:12px;color:#ff3b3b;font-weight:bold;">
				THE STOCK MARKET IS TURNED OFF IN THE OPTIONS.
				</span>
			</div>
		`;
		l('bankHeader').firstChild.insertAdjacentHTML('beforeend', datStr);

		let datStr1 = `
			<div class="stocker-stats">
				<span class="stat">Brokers: <span id="Brokers">0</span>.</span>
				<span class="stat">Brokers Needed: <span id="brokersNeeded">0</span>.</span>
				<span class="stat">Banked cookies: <span id="bankedCookies">0</span>.</span>
				<span class="stat">Required cookie minimum: <span id="minCookies">0</span>.</span>
				<span class="stat">Maximum: <span id="maxCookies">0</span>.</span>
			</div>
		`;

		l('bankHeader').firstChild.insertAdjacentHTML('beforeend', datStrWarn);
		l('bankHeader').firstChild.insertAdjacentHTML('beforeend', datStrWarn2);
		l('bankHeader').firstChild.insertAdjacentHTML('beforeend', datStrWarn3);
		l('bankHeader').firstChild.insertAdjacentHTML('beforeend', datStr1);
		// optional lines now live in a single container we control
		let extra = l(CookiStocker.extraStatsId);
		if (!extra){
			extra = document.createElement('div');
			extra.id = CookiStocker.extraStatsId;
			l('bankHeader').firstChild.appendChild(extra);
		}
		// initial visibility / content
		if (stockerAdditionalTradingStats) {
			extra.innerHTML = CookiStocker.buildExtraStatsHTML();
			extra.style.display = '';
		} else {
			extra.innerHTML = '';	// keep empty and hidden initially
			extra.style.display = 'none';
		}

		let market = CookiStocker.Bank.goodsById;	// read market
		console.log('Reading the market:');
		stockList.startingProfits = CookiStocker.Bank.profit;
		for (let i = 0; i < market.length; i++){
			stockList.Goods.push({
		 		name: market[i].name,
		 		stock: market[i].stock,
		 		currentPrice: market[i].val,
				mode: market[i].mode,
				lastMode: market[i].mode,
				lastDur: market[i].dur,
				unchangedDur: 0,
				dropCount: 0,
				riseCount: 0,
				profit: 0,
				someSold: false,
				someBought: false,
			});
			console.log('Stock: ' + market[i].name.replace('%1', Game.bakeryName) + ' Status: ' + modeDecoder[market[i].mode] + ' at $' + market[i].val + (market[i].stock ? ' (own)' : ''));
		}
		CookiStocker.ensureReportTimer();
		CookiStocker.TradingStats();
		// restart the loop cleanly
		if (CookiStocker._loopTimer) { clearInterval(CookiStocker._loopTimer); CookiStocker._loopTimer = 0; }
		CookiStocker._loopTimer = setInterval(function() {
			// Skip all actions during ascension countdown / reincarnation transition
			if (Game.OnAscend || (typeof Game.AscendTimer !== 'undefined' && Game.AscendTimer > 0) || l("Brokers") == null)
				return;
			if (stockerMarketOn) {
				if (stockList.noModActions) {
					stockList.noModActions = false;
					CookiStocker.TradingStats();
				}
				if (stockerForceLoopUpdates)
					CookiStocker.Bank.secondsPerTick = Math.max(0.001, stockerLoopFrequency / 1000);
				else
					CookiStocker.Bank.secondsPerTick = 60;
			} else {
				if (stockList.noModActions)
					return;
				CookiStocker.Bank.secondsPerTick = CS_TEN_YEARS;
			}

			let doUpdate = false;
			
			// setting stockerForceLoopUpdates to true will make the logic loop force the market to tick every time it triggers,
			// making this an obvious cheat, and i will personally resent you.  
			//
			// but
			// if you backup your save and set stockerLoopFrequency to like 10 milliseconds it looks very fun and effective.
			// yes, this is how i made the gif on the steam guide page.  [Comments by Gingerguy.]
			if (!stockerForceLoopUpdates && stockerMarketOn)
				stockerLoopFrequency = CookiStocker.Bank.secondsPerTick * 500;		// Keep up to date
			if (CookiStocker.Bank.profit >= 100000000 && !Game.Achievements['Plasmic assets'].won)
				Game.Win('Plasmic assets');
			if (CookiStocker.Bank.profit >= 500000000 && !Game.Achievements['Bose-Einstein Condensed Assets'].won)
				Game.Win('Bose-Einstein Condensed Assets');

			const smallDelta = 3;
			const largeDelta = 4;
			const alwaysBuyBelow = 2;
			const neverSellBelow = 11;
			let amount = 0;

			if (!Game.OnAscend && (stockerAutoBuyMinimumBrokers || stockerAutoBuyAdditionalBrokers)) {
				let buyBrokers, buyMoreBrokers;
				let tradingStats = false;
				let cost;

				buyBrokers = stockerMinBrokers - CookiStocker.Bank.brokers;
				if (stockerAutoBuyMinimumBrokers && buyBrokers > 0 && stockerMinBrokers <= CookiStocker.Bank.getMaxBrokers() && buyBrokers * CookiStocker.Bank.getBrokerPrice() < Game.cookies * 0.1) {
					Game.Spend(CookiStocker.Bank.getBrokerPrice() * buyBrokers);
					CookiStocker.Bank.brokers = stockerMinBrokers;
					tradingStats = true;
				}
				buyMoreBrokers = CookiStocker.Bank.getMaxBrokers() - CookiStocker.Bank.brokers;
				if (stockerAutoBuyAdditionalBrokers && buyMoreBrokers > 0 && (cost = CookiStocker.Bank.getBrokerPrice() * buyMoreBrokers) < Game.cookies * 0.1) {
					Game.Spend(cost);
					CookiStocker.Bank.brokers += buyMoreBrokers;
					tradingStats = true;
				}
				if (tradingStats)
					CookiStocker.TradingStats();
			}
			market = CookiStocker.Bank.goodsById;	// update market
			stockList.canBuy = stockerAutoTrading && CookiStocker.Bank.brokers >= stockerMinBrokers;
			for (let i = 0; i < market.length; i++) {
				if (stockList.canBuy && !((CookiStocker.Bank.getGoodMaxStock(market[i]) - market[i].stock) * Game.cookiesPsRawHighest * market[i].val < Game.cookies * stockerCookiesThreshold)) {
					let now = Date.now();
					let remainder;

					stockList.Start += now - stockList.lastTime;
					stockList.Uptime = Math.floor((now - stockList.Start) / 1000) * 1000;
					if (remainder = stockList.Uptime % stockerLoopFrequency) {
						stockList.Start += CookiStocker.Bank.secondsPerTick * 1000 + remainder;
						stockList.Uptime -= CookiStocker.Bank.secondsPerTick * 1000 + remainder;
					}
					stockList.lastTime = now;
					CookiStocker.TradingStats();
					stockList.canBuy = false;
					if (!stockerAutoTrading) {
						stockList.noModActions = true;
						if (CookiStocker.reportTimer) {
							clearInterval(CookiStocker.reportTimer);
							CookiStocker.reportTimer = null;
						}
					}
				}
				amount += Game.ObjectsById[i+2].amount;
			}
			if (!(stockList.Amount = amount))			// No stocks active
				return;
			CookiStocker.TradingStats();
			CookiStocker.ensureReportTimer();
			if (stockList.canBuy && !stockList.origCookiesPsRawHighest)
				stockList.origCookiesPsRawHighest = Game.cookiesPsRawHighest;
			for (let i = 0; i < market.length; i++) {
				
				let stockerNotificationTime = stockerFastNotifications * 6;
				let lastPrice = stockList.Goods[i].currentPrice;
				let currentPrice = market[i].val;

				// update stockList
				stockList.Goods[i].stock = market[i].stock;
				stockList.Goods[i].currentPrice = market[i].val;
				stockList.Goods[i].mode = market[i].mode;

				let md = stockList.Goods[i].mode;
				let lmd = stockList.Goods[i].lastMode;
				let lastStock = market[i].stock;
				let deltaPrice = largeDelta;
				let stockName = market[i].name.replace('%1', Game.bakeryName);
				
				// Our ceilingPrice is the maximum of the bank ceiling and the (deprecated but still useful) stock ceiling
				let ceilingPrice = Math.max(10*(i+1) + Game.Objects['Bank'].level + 49, 97 + Game.Objects['Bank'].level * 3);

				if (stockList.Goods[i].lastDur != market[i].dur || ++stockList.Goods[i].unchangedDur > 1) {
					stockList.Goods[i].unchangedDur = 0;
					doUpdate = true;
				}
				if (Game.ObjectsById[i+2].amount == 0 && stockerConsoleAnnouncements && doUpdate && stockList.canBuy) {
					console.log(`${stockName} stock is inactive`);
					continue;
				}
				if (lmd == md && (stockList.Goods[i].stock && (md == 2 || md == 4) ||	// Make selling into a downturn easier
				!stockList.Goods[i].stock && (md == 1 || md == 3)))			// Make buying into an upturn easier
					deltaPrice = smallDelta;
				if (md != lmd && (md == 3 && lmd != 1 || md == 4 && lmd != 2 || md == 1 && lmd != 3 || md == 2 && lmd != 4)) {
					stockList.Goods[i].dropCount = 0;
					stockList.Goods[i].riseCount = 0;
				} else if (currentPrice > lastPrice) {
					stockList.Goods[i].dropCount = 0;
					stockList.Goods[i].riseCount++;
				} else if (currentPrice < lastPrice) {
					stockList.Goods[i].riseCount = 0;
					stockList.Goods[i].dropCount++;
				}
				if (stockerConsoleAnnouncements && doUpdate && stockList.canBuy) {			// Tick tick
					if (md == lmd)
						console.log(`${stockName} mode is unchanged at ${lmd} [${modeDecoder[lmd]}] at $${Beautify(currentPrice, 2)}`);
					else
						console.log(`MODE CHANGE ${stockName} old mode was ${lmd} [${modeDecoder[lmd]}] and new mode is ${md} [${modeDecoder[md]}] at $${Beautify(currentPrice, 2)}`);
				}
				stockList.Goods[i].lastDur = market[i].dur;
				if (	// buy conditions
					(
						currentPrice < alwaysBuyBelow || md != 4 && ((currentPrice > lastPrice &&
						stockList.Goods[i].riseCount >= deltaPrice || (md == 1 || md == 3) && md != lmd || 
						md == 0 && !stockList.Goods[i].someSold && stockList.Goods[i].dropCount < deltaPrice &&
						currentPrice >= 10) && (currentPrice < ceilingPrice || md == 1 || md == 3))
					)
					&& stockList.canBuy && ((CookiStocker.Bank.getGoodMaxStock(market[i]) - market[i].stock) * Game.cookiesPsRawHighest * market[i].val < Game.cookies * stockerCookiesThreshold && CookiStocker.Bank.brokers >= stockerMinBrokers)
					&& CookiStocker.Bank.buyGood(i,10000) 	// actual buy attempt
				)
				{
					// buying
					let mode = (lmd != md) ? 'is no longer in ' + modeDecoder[lmd] + ' mode' : 'is ';
					let units = market[i].stock - lastStock;

					stockList.Goods[i].someBought = true;
					stockList.Goods[i].stock = market[i].stock;
					if (typeof market[i].prevBuyMode1 !== 'undefined')
					{
						market[i].prevBuyMode1 = lmd;
						market[i].prevBuyMode2 = md;
					}
					market[i].buyTime = Date.now();
					if (typeof StockAssistant !== 'undefined')
					{
						StockAssistant.stockData.goods[i].boughtVal = market[i].prev;
						StockAssistant.buyGood(i);
					}
					stockList.Purchases++;
					if (stockerTransactionNotifications)
						if (currentPrice >= 2) Game.Notify(`Buying ${stockName} ${new Date().toLocaleTimeString([], {hourCycle: 'h23', hour: '2-digit', minute: '2-digit'})}`,`Buying ${units} unit${(units > 1 ? 's' : '')}. The stock ${mode} at $${Beautify(market[i].prev, 2)} per unit (your buying price) and is in ${modeDecoder[md]} mode now.`,goodIcons[i],stockerNotificationTime);
						else Game.Notify(`Buying ${stockName} ${new Date().toLocaleTimeString([], {hourCycle: 'h23', hour: '2-digit', minute: '2-digit'})}`, `Buying ${units} unit${(units > 1 ? 's' : '')}. The price has dropped below $2 per unit, and your buying price is $${Beautify(market[i].prev, 2)}.`,goodIcons[i],stockerNotificationTime);
					if (stockerConsoleAnnouncements) console.log('=====$$$=== Buying '+ stockName + ' at $' + Beautify(market[i].prev, 2));
				} else if (	// sell conditions
					stockList.Goods[i].stock > 0 && (currentPrice < lastPrice &&
					stockList.Goods[i].dropCount >= deltaPrice ||
					(md == 2 || md == 4) && md != lmd) && currentPrice >= neverSellBelow	// not near the bottom
				)
				{
					let profit = 0;
					let strProfit = 'profit '
					let mode = (lmd != md) ? 'is no longer in ' + modeDecoder[lmd] + ' mode and ' : '';

					if (!CookiStocker.Bank.sellGood(i,stockList.Goods[i].stock)) {
						stockList.Goods[i].lastMode = stockList.Goods[i].mode;
						continue;
					}
					stockList.Goods[i].someSold = true;
					market[i].prevSale = market[i].val;
					market[i].prevSellMode1 = lmd;
					market[i].prevSellMode2 = md;
					market[i].sellTime = Date.now();
					if (typeof StockAssistant !== 'undefined')
						StockAssistant.sellGood(i);
					stockList.Sales++;
					profit = (market[i].val - market[i].prev) * stockList.Goods[i].stock;
					stockList.Goods[i].profit += profit;
					if (profit > 0) {
						stockList.grossProfits += profit;
						stockList.profitableTrades++;
					} else {
						stockList.grossLosses += -profit;
						stockList.unprofitableTrades++;
					}
					stockList.netProfits += profit;
					stockerModeProfits[lmd][md][0] += profit;
					stockerModeProfits[lmd][md][1] += profit;
					stockerModeProfits[lmd][md][2]++;
					if (profit < 0)
					{
						strProfit = 'loss ';
						profit = -profit;
					}
					if (stockerTransactionNotifications) Game.Notify(`Selling ${stockName} ${new Date().toLocaleTimeString([], {hourCycle: 'h23', hour: '2-digit', minute: '2-digit'})}`,`Selling ${stockList.Goods[i].stock} unit${(stockList.Goods[i].stock > 1 ? 's' : '')} at a price of $${Beautify(market[i].val, 2)} per unit for a ${strProfit} of $${Beautify(profit, 2)} and total revenue of $${Beautify(market[i].val*stockList.Goods[i].stock, 2)}, which is added to the total market profits. The stock ${mode} is in ${modeDecoder[md]} mode now. Bought at a price of $${Beautify(market[i].prev, 2)} per unit.`,goodIcons[i],stockerNotificationTime);
					if (stockerConsoleAnnouncements) console.log(`=====$$$=== Selling ${stockName} at $${Beautify(market[i].val, 2)} for a ${strProfit}of $${Beautify(profit, 2)} and total revenue of $${Beautify(market[i].val*stockList.Goods[i].stock, 2)}. Last bought at $${Beautify(market[i].prev, 2)}.`);
				}
				stockList.Profits = CookiStocker.Bank.profit - stockList.startingProfits;
				stockList.Goods[i].lastMode = stockList.Goods[i].mode;
			}
			stockList.profitableStocks = stockList.unprofitableStocks = 0;
			for (let i = 0; i < market.length; i++) {			// Must recalculate the whole list on every pass
				if (stockList.Goods[i].profit > 0)
					stockList.profitableStocks++;
				else if (stockList.Goods[i].profit < 0)
					stockList.unprofitableStocks++;
			}
			CookiStocker.TradingStats();
			if (!stockerMarketOn) {
				if (CookiStocker.reportTimer) { clearInterval(CookiStocker.reportTimer); CookiStocker.reportTimer = null; }
				CookiStocker.Reports();		// one last summary
				stockList.noModActions = true;	// freeze until ON
				return;
			}
		},stockerLoopFrequency);
	},
})
