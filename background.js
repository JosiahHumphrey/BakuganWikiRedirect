// Simple extension to redirect all requests to Baku Wikia to Baku Wiki
(function(){
  'use strict';
  var isPluginDisabled = false;

  let storage = window.storage || chrome.storage;

  const BAKUWIKI_REGEX = /^(http|https):\/\/([^\.]+)\.(wikia|fandom)\.com(.*)$/i;

  const REDIRECTS = {
    "bakugan":"bakugan.wiki"
  };

  function splitURL(url){
    return BAKUWIKI_REGEX.exec(url);
  }

  chrome.webRequest.onBeforeRequest.addListener(
    function(info) {
      let splitUrl = splitURL(info.url);
      let newDomain = REDIRECTS[splitUrl[2]];
      // If domain isn't subdomain of wikia.com, ignore, also if it's not in the redirect filter
      if(splitUrl===null || newDomain===undefined) return;
      // Check if plugin is disabled, if so put a message logged
      if(isPluginDisabled) {
        console.log("BakuWikia intercepted, ignoring because plugin is disabled.");
        return;
      }
      // Generate new url
      let redirectUrl = "https://"+newDomain+splitUrl[4].replace(/^\/wiki\//i,"/w/");
      console.log("BakuWikia intercepted: " + info.url + "\nRedirecting to "+redirectUrl);
      // Redirect the old wikia request to new wiki	
      return {redirectUrl:redirectUrl};
    },
    // filters
    {
      urls: [
        "*://bakugan.wikia.com/*",
        "*://bakugan.fandom.com/*"
      ]
    },
    // extraInfoSpec
    ["blocking"]);

  function updateIcon(){
    chrome.browserAction.setIcon({  path: isPluginDisabled?"icon32_black.png":"icon32.png"  });
  }

  storage.local.get(['isDisabled'],(result)=>{
      if(result===undefined) {
        result={isDisabled:false};
      }
      isPluginDisabled=result.isDisabled;
      updateIcon();
  });

  storage.onChanged.addListener(
      function(changes, areaName) {
        // If isDisabled changed, update isPluginDisabled
        if(changes["isDisabled"]!==undefined && changes["isDisabled"].newValue!=changes["isDisabled"].oldValue) {
          console.log("Baku Wiki Redirector is now "+(changes["isDisabled"].newValue?"disabled":"enabled")+".");
          isPluginDisabled=changes["isDisabled"].newValue;
          updateIcon();
        }
      }
    );
})();
