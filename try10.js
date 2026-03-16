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
