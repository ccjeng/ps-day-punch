// ==UserScript==
// @name           PeopleSoft Day Punch Helper
// @version        1.0.0
// @description    Help automate Weekly Punch Time entry in PeopleSoft.
// @match          https://*/ps*/ps/EMPLOYEE/HRMS/c/ROLE_EMPLOYEE.TL_*.GBL*
// @match          http://*/ps*/ps/EMPLOYEE/HRMS/c/ROLE_EMPLOYEE.TL_*.GBL*
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
 * I need this.
 */
function sleep(s) {
    GM_log("--> sleep()");

    var ms = s * 1000;
    window.setTimeout(function(){ GM_log("    Sleeping for " + ms + " milliseconds"); }, ms);
}

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
 * Locate and return the object which represents
 * the punch form.
 */
function getPunchForm() {
    GM_log("--> getPunchForm()");

    for (var i = 0; i < document.forms.length; i++) {
        var f = document.forms[i];
        if (f.name.indexOf("win0") == 0) {
            return f;
        }
    }

    return false;
}

/*
 * Save the currently displayed punches.
 */
function setPunches () {
    GM_log("--> setPunches()");

    var schedule = {};
    if (GM_getValue("schedule", false)) {
        if (!window.confirm("You aready have saved punches.\nDo you want to overwrite them?")) {
            GM_log("    Overwrite saved punches canceled");
            return false;
        }
    }

    var punchForm = getPunchForm();
    var punchElements = punchForm.elements;

    for (var i = 0; i < punchElements.length; i++) {
        var e = punchElements[i];
        if (e.name.indexOf("PUNCH_DATE") == 0) {
            var punchNum = e.name.substring(11);
            var punchDate = e.value;
            var punchTime = document.getElementById("DERIVED_TL_PNCH_PUNCH_TIME$" + punchNum).value;
            var punchType = document.getElementById("PUNCH_TYPE$" + punchNum).value;
            var dayOfWeek = new Date(punchDate).getDay();
            //GM_log(punchDate + " @ " + punchTime + " : " + punchType + " - " + dayOfWeek);
            if (!schedule[dayOfWeek]) schedule[dayOfWeek] = [];
            schedule[dayOfWeek][schedule[dayOfWeek].length] = {"time": punchTime, "type": punchType};
        }
    }

    var sched = JSON.stringify(schedule);
    //GM_log(sched);
    GM_setValue("schedule", sched);
    window.alert("Your typical punches have been saved");
}

/*
 * Display saved punches in dialog box.
 */
function showPunches() {
    GM_log("--> showPunches()");

    var sched = JSON.parse(GM_getValue("schedule", false));
    var schedule = "";

    if (sched) {
        for (var day_tmp in sched) {
            var day = parseInt(day_tmp);
            switch (day) {
            case 1:
                schedule += "Monday:\n";
                break;
            case 2:
                schedule += "Tuesday:\n";
                break;
            case 3:
                schedule += "Wednesday:\n";
                break;
            case 4:
                schedule += "Thursday:\n";
                break;
            case 5:
                schedule += "Friday:\n";
                break;
            default:
                GM_log("    Unknown day: " + day);
                break;
            }
            for (var i = 0; i < sched[day].length; i++) {
                var type = "";
                if (sched[day][i].type == 1) {
                    type = "In ";
                } else {
                    type = "Out ";
                }
                schedule += "  " + type + sched[day][i].time + "\n";
            }
        }
        window.alert(schedule);
    } else {
        window.alert("You have no saved punches to show.");
    }
}

/*
 * When does this week begin?
 */
function setStartDate() {
    GM_log("--> setStartDate()");

    var startDate = document.getElementById("DERIVED_TL_TRTM_START_DT");
    GM_setValue("startDate", startDate.value);
}

/*
 * When is the most recent date we have
 * punched time for?
 */
function setMostRecentDate() {
    GM_log("--> setMostRecentDate()");

    var tmpFirstPunchRow = document.getElementById("trTL_RPTD_PCHTIME$0_row1");

    if (typeof tmpFirstPunchRow != undefined) {
        var punchRowParent = tmpFirstPunchRow.parentNode;
        var someRandomWhitespaceApparently = punchRowParent.lastChild;
        var mostRecentPunchRow = someRandomWhitespaceApparently.previousSibling;
        var theId = mostRecentPunchRow.id;
        var theStart = theId.indexOf("row");
        var theNumber = theId.substring(theStart + 3);
        theNumber = theNumber - 1; // PUNCH_DATE$ fields start with 0
        var mostRecentDateElement = document.getElementById("PUNCH_DATE$" + theNumber);
        GM_setValue("mostRecentDate", mostRecentDateElement.value);
    } else {
        var mostRecentDate = GM_getValue("startDate");
        GM_setValue("mostRecentDate", mostRecentDate);
    }
}

/*
 * This just clicks "Add a Punch"
 */
function addRow() {
    GM_log("--> addRow()");

    var addPunch = document.getElementById("TL_LINK_WRK_TL_ADD_PB");
    addPunch.click();
    sleep(2);
}

/*
 * Punch in time for a single day.
 */
function dayPunch(days) {
    GM_log("--> dayPunch()");

    days = typeof days != undefined ? days : 1;

    for (var i = 0; i < days; i++) {
        for (var j = 0; j < 4; j++) {
            setStartDate();
            setMostRecentDate();
            addRow();
        }
    }

    /*if (GM_getValue("wp", false)) {
        window.alert("You already punched the entire week.");
        return false;
    }

    GM_setValue("dp", true);*/

}

/*
 * Punch in time for the entire week.
 */
function weekPunch() {
    GM_log("--> weekPunch()");

    dayPunch(5);

    /*if (GM_getValue("dp", false)) {
        window.alert("Finish out the week using the Day Punch button.");
        return false;
    }

    GM_setValue("wp", true);*/
}

/*
 * Add some buttons to the page.
 */
function addControls() {
    GM_log("--> addControls()");

    var dpButtonContainerStyle = "display: inline; margin: 0; border: 4px solid #ff4a00; padding: 4px; padding-top: 2px;";
        var setButtonStyle     = "display: inline; margin: 0; padding: 0;";
        var showButtonStyle    = "display: inline; margin: 0; padding: 0;";
        var dpButtonStyle      = "display: inline; margin: 0; padding: 0;";
        var wpButtonStyle      = "display: inline; margin: 0; padding: 0;";

    var buttonContainer = document.getElementById("win0divTL_LINK_WRK_TL_ADD_PB");

    var dpButtonContainer = document.createElement("div");
    dpButtonContainer.setAttribute("style", dpButtonContainerStyle);
        var setPunchButton = document.createElement("input");
        setPunchButton.setAttribute("style", setButtonStyle);
        setPunchButton.setAttribute("type", "button");
        setPunchButton.setAttribute("title", "Save currently displayed punches as typical work week");
        setPunchButton.setAttribute("value", "Set Punches");
        setPunchButton.addEventListener("click", setPunches, true);
        var showPunchButton = document.createElement("input");
        showPunchButton.setAttribute("style", showButtonStyle);
        showPunchButton.setAttribute("type", "button");
        showPunchButton.setAttribute("title", "Show saved punches");
        showPunchButton.setAttribute("value", "Show Punches");
        showPunchButton.addEventListener("click", showPunches, true);
        var dayPunchButton = document.createElement("input");
        dayPunchButton.setAttribute("style", dpButtonStyle);
        dayPunchButton.setAttribute("type", "button");
        dayPunchButton.setAttribute("title", "Punch in a single day");
        dayPunchButton.setAttribute("value", "Day Punch");
        dayPunchButton.addEventListener("click", dayPunch, true);
        var weekPunchButton = document.createElement("input");
        weekPunchButton.setAttribute("style", wpButtonStyle);
        weekPunchButton.setAttribute("type", "button");
        weekPunchButton.setAttribute("title", "Punch in an entire week");
        weekPunchButton.setAttribute("value", "Week Punch");
        weekPunchButton.addEventListener("click", weekPunch, true);

    buttonContainer.appendChild(dpButtonContainer);
        dpButtonContainer.appendChild(setPunchButton);
        dpButtonContainer.appendChild(showPunchButton);
        dpButtonContainer.appendChild(dayPunchButton);
        dpButtonContainer.appendChild(weekPunchButton);
}

try {
    GM_log("--> Main script execution try/catch block");
    if (isPunchPage()) {
        GM_log("    We're on the punch page");
        GM_setValue("dp", false);
        GM_setValue("wp", false);
        addControls();

        /*
         * We're using the new (as of 05/09/2012) Mutation
         * Observers functionality below to detect changes
         * to the page markup, which is how we'll decide
         * whether or not we need to re-add our controls;
         * previously, they would get blown out after an
         * XMLHttpRequest by the stock PeopleSoft JS,
         * initiated by "Add a Punch".
         * 
         * Also as of this writing, mutation observers are
         * not supported in Firefox, but are slated to be
         * in version 14.
         * 
         * Somehow I doubt I'll be finished before then.
         */
        var insertedNodes = [];
        var observer = new WebKitMutationObserver(function(mutations) {
         mutations.forEach(function(mutation) {
           for (var i = 0; i < mutation.addedNodes.length; i++) {
               if (mutation.addedNodes[i].id == "ACE_width") {
                   addControls();
                   break;
               }
           }
         });
        });
        observer.observe(document.body, { childList: true, subtree: true });

    }
} catch (e) {
    GM_log("Exception caught: " + e);
}
