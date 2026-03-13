// ==UserScript==
// @name         CUnleash
// @namespace    http://tampermonkey.net/
// @version      7.2
// @description  Unleash your cookie potential.
// @author       petar105
// @match        https://orteil.dashnet.org/cookieclicker/
// @icon         https://www.google.com/s2/favicons?domain=dashnet.org
// @grant        none
// ==/UserScript==


// If editing the script, ignore any "Game is not defined" warnings
// Script is a mix of original code and other addons
(function() {
  'use strict';

  let state = true; // initial state is ON
  let intervalId;

  document.addEventListener('keydown', function(event) {
    if (event.code === 'KeyX') {
      state = !state; // toggle state
      if (state) {
        // code to run when state is ON
        console.log('State is ON');
        startAutoClicker();
      } else {
        // code to run when state is OFF
        console.log('State is OFF');
        stopAutoClicker();
      }
    }
  });

  document.addEventListener('keydown', function(event) {
    if (event.code === 'KeyZ') {
      state = !state; // toggle state
      if (state) {
        // code to run when state is ON
        console.log('State is ON');
        startAutoClicker();
      } else {
        // code to run when state is OFF
        console.log('State is OFF');
        stopAutoClicker();
      }
    }
  });
  
  function startAutoClicker() {
    console.log('Auto-clicker started');
    Game.Notify(`Auto clicker ON`,`Press X to toggle`,[0,35],false);
    intervalId = setInterval(function() { Game.ClickCookie(); }, 4);
  }

  function stopAutoClicker() {
    console.log('Auto-clicker stopped');
    Game.Notify(`Auto clicker OFF`,`Press X to toggle`,[0,35],false);
    clearInterval(intervalId);
  }

  // Wait for the Game object to be defined, then start the auto-clicker
  const waitIntervalId = setInterval(function() {
    if (typeof Game !== 'undefined') {
      clearInterval(waitIntervalId);
      startAutoClicker();
    }
  }, 1000);
})();


setInterval(function() {
    Game.shimmers.forEach(function(shimmer)
    {
        if(shimmer.type == "golden" && shimmer.wrath == 0)
        {
            shimmer.pop()
        }
    })
}, 500);

var autoReindeer = setInterval(function() { for (var h in Game.shimmers){if(Game.shimmers[h].type=="reindeer"){Game.shimmers[h].pop();}} }, 100);



var autoPopTwelveth = setInterval(function() {
    var wrinkCount = 0,
        wrinkEaten = 0,
        wrinkIndex = 10; // value for 10 shinies test

    for (var i in Game.wrinklers) {
        // count number of eating wrinks
        if (Game.wrinklers[i].sucked > 0) {
            wrinkCount += 1;
        }
        // find top wrink index, ignoring shiny wrinklers
        if (Game.wrinklers[i].sucked > wrinkEaten && Game.wrinklers[i].type == 0) {
            wrinkEaten = Game.wrinklers[i].sucked;
            wrinkIndex = i;
        }
    }
    // pop top wrinkler if 10 eating, unless all 12 are shiny
    if (wrinkCount == 10 && wrinkIndex != 10) {
        Game.wrinklers[wrinkIndex].hp = 0;
    }
}, 60000);

setTimeout(function() {
  Game.LoadMod("https://cookiemonsterteam.github.io/CookieMonster/dist/CookieMonster.js");
}, 200); // Don't load Cookie Monster parallel with the game, CM loads but the game gets stuck

setTimeout(function() {
  Game.LoadMod("https://rawgit.com/yannprada/cookie-garden-helper/master/cookie-garden-helper.js");
}, 400); // Same goes for Cookie Garden Helper


setTimeout(function() {


        // Announce transactions in game notifications
        const stockerTransactionNotifications = true

        // Make regular profit reports
        const stockerActivityReport = true
            // How often to make regular reports in ms (one hour by default)
            const stockerActivityReportFrequency = 1000 * 60 * 60

        // Make game notifications fade away on their own
        const stockerFastNotifications = false

        // Use console.log for more detailed info on trends
        const stockerConsoleAnnouncements = true

        // Logic loop frequency; do not touch it unless you are cheating.
        const stockerLoopFrequency = 1000 * 30

        // The cheat itself. Rolls the cycle every time logic loop triggers
        const stockerForceLoopUpdates = false

        const stockerGreeting = 'click clack you are now in debt'

// ===================================================================================



if (!stockList) {
    var stockList = {
        check: 'dump eet',
        goods: [],
        sessionStart: new Date(),
        sessionProfits: 0,
        sessionPurchases: 0,
        sessionSales: 0,
        stocksRising: 0
    }
}

var modeDecoder = ['stable','slowly rising','slowly falling','rapidly rising','rapidly falling','fluctuating'] // meanings of each market trend (good.mode)
var goodIcons = [[2,33],[3,33],[4,33],[15,33],[16,33],[17,33],[5,33],[6,33],[7,33],[8,33],[13,33],[14,33],[19,33],[20,33],[32,33],[33,33],[34,33]];

function stockerTimeBeautifier(duration) {
    var milliseconds = Math.floor((duration % 1000) / 100),
      //seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60),
      hours = Math.floor((duration / (1000 * 60 * 60))); //% 24),
      //days = Math.floor((duration / (1000 * 60 * 60 * 24)));

    if (hours > 0) {
        if (hours == 1) {
            hours = hours + ' hour'
        }
        else hours = hours + ' hours'
    }
    else hours = -1;

    if (minutes >= 1) {
        minutes = (minutes == 1) ? minutes + ' minute' : minutes + ' minutes';
    }
    else minutes = -1;

    if ((hours != -1) && (minutes != -1)) { return hours + ' and ' + minutes;   }
    else if ((hours == -1) && (minutes != -1)) {    return minutes; }
    else if ((hours != -1) && (minutes == -1)) {    return hours;   }
    else if ((hours == -1) && (minutes == -1)) {    return 'not that long actually';    }
}


setTimeout(function waitForGame() {
    if (typeof Game === 'object' && Game.ready) {


Game.registerMod("gincookistocker",{
    init:function(){

        this.startStocking();
    },
    startStocking:function(){
        if (!Game.ObjectsById[5].minigame) {
            console.log('=====$$$== Stock Market minigame has not initialised yet! Will try again in 500ms.');
            setTimeout(() => {
                this.startStocking();
            },500);
            return
        }
        else {
            console.log('=====$$$== CookiStocker logic loop initialised at ' + new Date());
            console.log('=====$$$== With main options as follows:')
            console.log('=====$$$== Logic loop frequency: ' + stockerTimeBeautifier(stockerLoopFrequency))
            console.log('=====$$$== Report frequency: ' + stockerTimeBeautifier(stockerActivityReportFrequency))
            console.log('=====$$$== Cheating: ' + stockerForceLoopUpdates)
            Game.Notify(`CookiStocker is ready`,stockerGreeting,[1,33],false);
            console.log(stockList.check);
        }

        var market = Game.ObjectsById[5].minigame.goodsById;    // read market
        console.log('Reading the market:');
        stockList.startingProfits = Game.ObjectsById[5].minigame.profit;
        for (let i = 0; i < market.length; i++){
            stockList.goods.push({
                name: market[i].name,
                stock: market[i].stock,
                restingPrice: 10*(i+1) + Game.ObjectsById[i].level - 1,
                currentPrice: market[i].val,
                mode: market[i].mode,
                lastMode: market[i].mode,
                priceBought: -1,
            });
            console.log('Stock: ' + market[i].name + ' Status: ' + modeDecoder[market[i].mode]);
        }

        if (stockerActivityReport) {
            var stockerReportInterval = setInterval(function() {
                var stockerUptime = new Date() - stockList.sessionStart;
                if ((stockList.sessionPurchases + stockList.sessionSales) == 0) {
                    Game.Notify(
                        'CookiStocker report',
                        'This session has been running for ' + stockerTimeBeautifier(stockerUptime) +
                        ', but no good investment opportunities were detected! Luck is not on our side, yet.'
                        ,[26,7],stockerFastNotifications
                    );
                } else {
                    Game.Notify(
                        'CookiStocker report',
                        'This session has been running for ' + stockerTimeBeautifier(stockerUptime) +
                        ', and has made ' + stockList.sessionProfits.toFixed(0) +
                        '$ in ' + stockList.sessionPurchases + ' purchases and ' + stockList.sessionSales + ' sales.'
                        ,[26,7],stockerFastNotifications
                    );
                }
            },stockerActivityReportFrequency);
        }

        var stockerLoop = setInterval(function() {

            if (stockerForceLoopUpdates) Game.ObjectsById[5].minigame.tick();
                // setting stockerForceLoopUpdates to true will make the logic loop force the market to tick every time it triggers,
                // making this an obvious cheat, and i will personally resent you.

                // but
                // if you backup your save and set stockerLoopFrequency to like 10 milliseconds it looks very fun and effective.
                // yes, this is how i made the gif on the steam guide page.


            stockList.stocksRising = 0;

            market = Game.ObjectsById[5].minigame.goodsById;    // update market
            for (let i = 0; i < market.length; i++){
                //let i = 3;

                // update stockList
                stockList.goods[i].stock = market[i].stock;
                stockList.goods[i].currentPrice = market[i].val;
                stockList.goods[i].mode = market[i].mode;

                let md = stockList.goods[i].mode;
                let lmd = stockList.goods[i].lastMode;

                if (
                    (md != lmd) && (Game.ObjectsById[i+2].amount > 0)   // new trend detected in a stock that is active
                )
                {
                    if (stockerConsoleAnnouncements) {
                        console.log(stockList.goods[i].name + ' has changed the mode from [' + modeDecoder[lmd] + '] to [' + modeDecoder[md] + ']');
                    }

                    if (lmd != 5 && md == 5) {  // ignore unstable stocks
                        if (stockerTransactionNotifications) Game.Notify(stockList.goods[i].name + ' went unstable','Ignoring the stock for a time',[1,33],stockerFastNotifications);
                    }

                    if (    // buy conditions
                        (
                            (lmd == 2) && ((md !=4) && (md!=5)) ||  // slow fall stopped
                            (lmd == 4) && ((md !=2) && (md!=5)) ||  // fast fall stopped
                            (lmd == 5) && ((md !=2) && (md!=4))     // chaotic stopped
                        )
                        &&
                        (stockList.goods[i].currentPrice < stockList.goods[i].restingPrice) // only if the price is lower than resting price
                    )
                    {
                        // buying
                        stockList.goods[i].priceBought = stockList.goods[i].currentPrice;
                        Game.ObjectsById[5].minigame.buyGood(i,10000);
                        stockList.sessionPurchases++;
                        if (stockerTransactionNotifications) Game.Notify('Buying ' + stockList.goods[i].name,'The price has stopped ' + modeDecoder[stockList.goods[i].lastMode] + ' at ' + Math.floor(stockList.goods[i].priceBought) + '$ per unit, and is ' + modeDecoder[stockList.goods[i].mode] + ' now.',goodIcons[i],stockerFastNotifications);
                        if (stockerConsoleAnnouncements) console.log('=====$$$== Buying '+ stockList.goods[i].name);
                    }

                    if (    // sell conditions
                        (stockList.goods[i].stock > 0)  // only if the stock is present
                        &&
                        (
                            (lmd == 1) && ((md !=3) && (md!=5)) ||  // slow rise stopped
                            (lmd == 3) && ((md !=1) && (md!=5)) ||  // fast rise stopped
                            (lmd == 5) && ((md !=1) && (md!=3))     // chaotic stopped
                        )
                        && (stockList.goods[i].currentPrice > stockList.goods[i].priceBought)   // only if the price is higher than the price it was bought at
                    )
                    {
                        // selling
                        stockList.goods[i].priceBought = -1;
                        Game.ObjectsById[5].minigame.sellGood(i,10000);
                        stockList.sessionSales++;
                        if (stockerTransactionNotifications) Game.Notify('Selling ' + stockList.goods[i].name,'At a profit of ' + Math.floor(stockList.goods[i].currentPrice - stockList.goods[i].priceBought) + '$ per unit (total ' + Math.floor(stockList.goods[i].currentPrice - stockList.goods[i].priceBought)*stockList.goods[i].stock + '$ profit), and is ' + modeDecoder[stockList.goods[i].mode] + ' now.',goodIcons[i],stockerFastNotifications);
                        if (stockerConsoleAnnouncements) ('=====$$$== Selling '+ stockList.goods[i].name +' at a profit of ' + (stockList.goods[i].currentPrice - stockList.goods[i].priceBought).toFixed(2));

                    }

                    stockList.sessionProfits = Game.ObjectsById[5].minigame.profit - stockList.startingProfits;
                    stockList.goods[i].lastMode = stockList.goods[i].mode   // update last mode
                }
            }
        },stockerLoopFrequency);
    },
});

}
else setTimeout(waitForGame,100)
})

}, 700);
