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

