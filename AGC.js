(function() {
  'use strict';

  let state1 = true; // initial state is ON
  let intervalId;

  document.addEventListener('keydown', function(event) {
    if (event.code === 'KeyZ') {
      state1 = !state1; // toggle state
      if (state1) {
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
    Game.Notify(`Auto GC ON`,`Press Z to toggle`,[4,14],true);
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
    Game.Notify(`Auto GC OFF`,`Press Z to toggle`,[4,0],true);
    clearInterval(intervalId);
  }

  // Wait for the Game object to be defined, then start the auto-clicker
  const waitintervalId = setInterval(function() {
    if (typeof Game !== 'undefined') {
      clearInterval(waitintervalId);
      startAutoGC();
    }
  }, 1000);
})();
