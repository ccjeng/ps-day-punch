// ==UserScript==
// @name           PeopleSoft Day Punch Helper
// @version        1.0.0
// @description    Help automate Weekly Punch Time entry in PeopleSoft.
// @match          https://*/ps*/ps*/EMPLOYEE/HRMS/c/ROLE_EMPLOYEE.TL_*.GBL*
// @copyright      2012 Thomas Gordon
// @license        cc-by-3.0; http://creativecommons.org/licenses/by/3.0/
// ==/UserScript==

/*
 * This code borrows to a significant degree from
 * William A. McArthur Jr.'s original Day Punch script.
 * While I could not find a version hosted on
 * Mr. McArthur's site (http://sandy.mcarthur.org),
 * I did locate a copy at the following address:
 * http://mrclay.org/js/user/
 * And have included that copy in the doc/
 * directory of this project.
 */


/*
 * There's a lot of AJAX in PeopleSoft, therefore
 * URLs are not dependable. This checks for an element
 * only present on the day punch page.
 */
function isPunchPage() {
    GM_log("--> isPunchPage()");
    return document.getElementById("PUNCH_DATE$0") ? true : false;
}

/*
 * Add some buttons to the page.
 */
function addControls() {
    GM_log("--> addControls()");

    var buttonContainer = document.getElementById("win0divTL_LINK_WRK_TL_ADD_PB");

    var dayPunchButton = document.createElement("input");
    dayPunchButton.setAttribute("type", "button");
    dayPunchButton.setAttribute("value", "Day Punch");

    buttonContainer.appendChild(dayPunchButton);
}

try {
    GM_log("--> Main script execution try/catch block");
    if (isPunchPage()) {
        GM_log("We've hit the punch page, do stuff:");
        addControls();
    }
} catch (e) {
    GM_log("Exception caught: " + e);
}
