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
 * Display saved punches to user.
 */
function showPunches() {
    GM_log("--> showPunches()");

    var sched = JSON.parse(GM_getValue("schedule", false));
    var schedule = "";

    if (sched) {
        for (var day in sched) {
            switch (parseInt(day)) {
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
            for (var i = 0; i < day.length; i++) {
                var punch = day[i];
                var type = "";
                if (punch.type == 1) {
                    type = "In";
                } else {
                    type = "Out";
                }
                schedule += punch.time + " " + type + "\n";
            }
        }
        window.alert(schedule);
    } else {
        window.alert("You have no saved punches to show.");
    }
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
        var weekPunchButton = document.createElement("input");
        weekPunchButton.setAttribute("style", wpButtonStyle);
        weekPunchButton.setAttribute("type", "button");
        weekPunchButton.setAttribute("title", "Punch in an entire week");
        weekPunchButton.setAttribute("value", "Week Punch");

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
        addControls();
    }
} catch (e) {
    GM_log("Exception caught: " + e);
}
