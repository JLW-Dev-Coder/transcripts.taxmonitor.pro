/**

data_sdk.js (shim)

Purpose: prevent 404s for pages referencing /_sdk/data_sdk.js

Site uses https://api.taxmonitor.pro
 (no local Worker here).
*/
(function () {
window.tmData = window.tmData || {};
})();
