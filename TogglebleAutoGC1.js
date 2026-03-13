(function() {
  'use strict';

  let state = true; // initial state is ON
  let intervalId;

  document.addEventListener('keydown', function(event) {
    if (event.code === 'KeyZ') {
      state = !state; // toggle state
      if (state) {
        // code to run when state is ON
        console.log('State is ON');
        startAutoGC();
      } else {
        // code to run when state is OFF
        console.log('State is OFF');
        stopAutoGC();
      }
    }
  });

  
  function startAutoGC() {
    console.log('Auto-GC started');
    Game.Notify(`Auto GC ON`,`Press Z to toggle`,[0,35],false);
    intervalId = setInterval(function() {
    Game.shimmers.forEach(function(shimmer)
    {
        if(shimmer.type == "golden" && shimmer.wrath == 0)
        {
            shimmer.pop()
        }
    })
}, 500);
  }

  function stopAutoGC() {
    console.log('Auto-GC stopped');
    Game.Notify(`Auto GC OFF`,`Press Z to toggle`,[0,35],false);
    clearInterval(intervalId);
  }

  // Wait for the Game object to be defined, then start the auto-clicker
  const waitIntervalId = setInterval(function() {
    if (typeof Game !== 'undefined') {
      clearInterval(waitIntervalId);
      startAutoGC();
    }
  }, 1000);
})();


