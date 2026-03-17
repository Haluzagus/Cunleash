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
