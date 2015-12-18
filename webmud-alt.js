// hides the players (thinking of moving this to the top bar)
$("#divPlayers").toggle(false);
 
// enlarges the mainscreen
$('#divMainPanel').removeClass('col-lg-10').addClass('col-lg-12');
 
// resize the mainscreen to fit on my page (should adjust for different screens/resolutions due to using ems
$('#mainScreen').css("height", "33em").css("width","47.8em").css("resize","both");
 
// remove the existing input stuff
$('#message').parent().remove()
$('#chkEnableAI').parent().remove()
 
// add the new stuff
$('<div id="divControls" class="panel col-xs-6 col-sm-6 col-md-3 col-lg-3" style="float:left; height:34em; width:21em;"><div style="width:100%"><input type="checkbox" id="chkEnableAI" value="Enable AI" />Enable AI</div><div style="float:left;width:100%" class="input-group-sm"><input type="text" class="form-control" style="width:100%;max-width:750px;display:inline-block" id="message" autocomplete="false" autocorrect="false" /><input type="button" class="btn" style="width:80px;height:30px;padding:0;" id="sendmessage" value="Send" /></div><div id="commandBtns" style="width:100%; padding:3em 0 0 0; float:left;"><input type="button" class="btn" style="width:7em; height:2em; padding:0;" id="conversationsBtn" value="Conversations" onclick="openConversationsWindow()"/><input type="button" class="btn" style="width:5em; height:2em; padding:0;" id="statsBtn" value="Stats" onclick="sendMessageDirect(&quot;st&quot;)"/><input type="button" class="btn" style="width:5em; height:2em; padding:0;" id="mapButton" value="Map" onclick="openMapScreen()" /></div><div id="movement1" style="width:100%; float:left; padding:5em 0 0 3em"><input type="button" id="MoveNW" value="nw" onclick="MoveClick(value)" style="width:3em; height:3em; padding:0;" class="btn" /><input type="button" id="MoveN" value="n" onclick="MoveClick(value)" style="width:3em; height:3em; padding:0;" class="btn" /><input type="button" id="MoveNE" value="ne" onclick="MoveClick(value)" style="width:3em; height:3em; padding:0;" class="btn" /><div id="movement2" style="width:20%; float:right; padding:0 5em 0 0;"><input type="button" id="MoveUP" value="u" onclick="MoveClick(value)" style="width:3em; height:3em; padding:0;" class="btn" /><br><input type="button" id="MoveDOWN" value="d" onclick="MoveClick(value)" style="width:3em; height:3em; padding:0;" class="btn" /></div><br ><input type="button" id="MoveW" value="w" onclick="MoveClick(value)" style="width:3em; height:3em; padding:0;" class="btn" /><input type="button" id="MoveRest" value="Rest" onclick="MoveClick(value)" style="width:3em; height:3em; padding:0;" class="btn" /><input type="button" id="MoveE" value="e" onclick="MoveClick(value)" style="width:3em; height:3em; padding:0;" class="btn" /><br ><input type="button" id="MoveSW" value="sw" onclick="MoveClick(value)" style="width:3em; height:3em; padding:0;" class="btn" /><input type="button" id="MoveS" value="s" onclick="MoveClick(value)" style="width:3em; height:3em; padding:0;" class="btn" /><input type="button" id="MoveSE" value="se" onclick="MoveClick(value)" style="width:3em; height:3em; padding:0;" class="btn" /></div></div><div id="progressMonitors" style="float:left; width:21em;"><div id="hpContainer" style="width:100%; float:left; height:1.5em;"><div style="text-align:center;width:10%;font-weight:200; float:left;">HP:</div><div class="progress" style="width:90%"><div class="progress-bar progress-bar-danger" style="width:100%;"><span id="hp">100%</span></div></div></div><div id="maContainer" style="width:100%; float:left; height:1.5em;"><div style="text-align:center;width:10%;font-weight:200; float:left;">MA:</div><div class="progress" style="width:90%;"><div class="progress-bar progress-bar-info" style="width:100%;"><span id="ma">100%</span></div></div></div><div id="expContainer" style="width:100%;float:left; height:1.5em;"><div style="text-align:center;width:10%;font-weight:200; float:left;">EXP:</div><div class="progress" style="width:90%;"><div class="progress-bar progress-bar-success" style="width:0%;"><span id="exp">0%</span></div></div></div></div>').insertAfter("#mainScreen");
 
// checks the AI and enables
$('#chkEnableAI').prop( "checked", true );
sendMessageDirect("EnableAI");
 
// removes existing bars
$('.vertical').remove()

function stat(actionData) { 
	playerName = actionData.Name;  
    var text = buildSpan(cga_dark_green, "Name: ") + buildFormattedSpan(cga_dark_cyan, actionData.Name, 37, true) + buildSpan(cga_dark_green, "Lives/CP:") + buildFormattedSpan(cga_dark_cyan, String(actionData.Lives) + "/" + String(actionData.CP), 9, false) + "<br>";
    text += buildSpan(cga_dark_green, "Race: ") + buildFormattedSpan(cga_dark_cyan, actionData.Race, 16, true) + buildSpan(cga_dark_green, "Exp: ") + buildFormattedSpan(cga_dark_cyan, String(actionData.Exp), 16, true) + buildSpan(cga_dark_green, "Perception:") + buildFormattedSpan(cga_dark_cyan, String(actionData.Perception), 7, false) + "<br>";
    text += buildSpan(cga_dark_green, "Class: ") + buildFormattedSpan(cga_dark_cyan, actionData.Class, 15, true) + buildSpan(cga_dark_green, "Level: ") + buildFormattedSpan(cga_dark_cyan, String(actionData.Level), 14, true) + buildSpan(cga_dark_green, "Stealth:") + buildFormattedSpan(cga_dark_cyan, String(actionData.Stealth), 10, false) + "<br>";
    text += buildSpan(cga_dark_green, "Hits:") + buildFormattedSpan(cga_dark_cyan, String(actionData.HP), 8, false) + buildSpan(cga_dark_cyan, "/") + buildFormattedSpan(cga_dark_cyan, String(actionData.MaxHP), 8, true) + buildSpan(cga_dark_green, "Armour Class:") + buildFormattedSpan(cga_dark_cyan, String(actionData.AC), 4, false) + buildSpan(cga_dark_cyan, "/") + buildFormattedSpan(cga_dark_cyan, String(actionData.DR), 3, true) + buildSpan(cga_dark_green, "Thievery:") + buildFormattedSpan(cga_dark_cyan, String(actionData.Thievery), 9, false) + "<br>";
    if (actionData.MaxMA > 0) {
        text += buildSpan(cga_dark_green, "Mana:") + buildFormattedSpan(cga_dark_cyan, String(actionData.MA), 8, false) + buildSpan(cga_dark_cyan, "/") + buildFormattedSpan(cga_dark_cyan, String(actionData.MaxMA), 8, true) + buildSpan(cga_dark_green, "Spellcasting: ") + buildFormattedSpan(cga_dark_cyan, String(actionData.SC), 7, true);
    } else {
        text += buildFormattedSpan(cga_dark_green, "", 43, true);
    }
 
    text += buildSpan(cga_dark_green, "Traps:") + buildFormattedSpan(cga_dark_cyan, String(actionData.Traps), 12, false) + "<br>";
    text += buildFormattedSpan(cga_dark_green, "", 43, true) + buildSpan(cga_dark_green, "Picklocks:") + buildFormattedSpan(cga_dark_cyan, String(actionData.Picklocks), 8, false) + "<br>";
    text += buildSpan(cga_dark_green, "Strength:") + buildFormattedSpan(cga_dark_cyan, String(actionData.Strength), 9, true) + buildSpan(cga_dark_green, "Agility: ") + buildFormattedSpan(cga_dark_cyan, String(actionData.Agility), 14, true) + buildSpan(cga_dark_green, "Tracking:") + buildFormattedSpan(cga_dark_cyan, String(actionData.Tracking), 9, false) + "<br>";
    text += buildSpan(cga_dark_green, "Intellect: ") + buildFormattedSpan(cga_dark_cyan, String(actionData.Intellect), 9, true) + buildSpan(cga_dark_green, "Health:") + buildFormattedSpan(cga_dark_cyan, String(actionData.Health), 14, true) + buildSpan(cga_dark_green, "Martial Arts:") + buildFormattedSpan(cga_dark_cyan, String(actionData.MartialArts), 5, false) + "<br>";
    text += buildSpan(cga_dark_green, "Willpower: ") + buildFormattedSpan(cga_dark_cyan, String(actionData.Willpower), 9, true) + buildSpan(cga_dark_green, "Charm:") + buildFormattedSpan(cga_dark_cyan, String(actionData.Charm), 14, true) + buildSpan(cga_dark_green, "MagicRes:") + buildFormattedSpan(cga_dark_cyan, String(actionData.MagicRes), 9, false) + "<br>";
    addMessageRaw(text, false, true);
}
 
// stores the exp details
var curEXP = 0;
var nextEXP = 0;
var expPercent = 0;
var hpPercent = 0;
var maPercent = 0;
var playerName = "";

// just wrote a check for percent being above 100%
function updateHPMABars() {
        // altered this
    hpPercent = Math.floor(curHP * 100 / maxHP);
    $("#hp").html(String(curHP) + " / " + String(maxHP));
    if (maxMA > 0) {
        maPercent = Math.floor(curMA * 100 / maxMA);
        $("#ma").html(String(curMA) + " / " + String(maxMA));
    } else {
        $("#maContainer").hide();
    }
    $('.progress-bar span').each(function () {
        if($(this).attr("id") == "hp"){
            if(hpPercent > 100){
                $(this).parent().css("width","100%");
            } else {
                $(this).parent().css("width",String(hpPercent) + "%");
            }
        } else if ($(this).attr("id") == "ma"){
            if(maPercent > 100){
                $(this).parent().css("width","100%");
            } else {
                $(this).parent().css("width",String(maPercent) + "%");
            }
        }
    });
}
 
// updates the EXP bar
function updateEXPBar() {
    var exp =  $("#exp");
    expPercent = Math.floor(curEXP * 100 / nextEXP);
    $(exp).html(String(curEXP) + " / " + String(nextEXP));
    if(String($(exp).html()).split('%')[0] > 100){
        $(exp).parent().css("width","100%");
    } else {
        $(exp).parent().css("width",String(expPercent) + "%");
    }
}
 
// sets the curEXP and nextEXP variables and updates the bar (slight modification to yours).
function exp(actionData) {
        // altered this
        curEXP = actionData.Exp;
        nextEXP = actionData.TotalExpForNextLevel;
        updateEXPBar();
    var extraExpNeeded = nextEXP - curEXP;
    if (extraExpNeeded < 0) {
        extraExpNeeded = 0;
    }
    var text = buildSpan(cga_dark_green, "Exp: ") + buildSpan(cga_dark_cyan, String(actionData.Exp)) + buildSpan(cga_dark_green, " Level: ") + buildSpan(cga_dark_cyan, String(actionData.Level)) + buildSpan(cga_dark_green, " Exp needed for next level: ") + buildSpan(cga_dark_cyan, String(extraExpNeeded) + " (" + String(actionData.TotalExpForNextLevel) + ") [" + expPercent + "%]") + "<br>";
    addMessageRaw(text, false, true);
}
 
// added addition to get experience. update the expbar and add the exp earned to curEXP
function combatRound(actionData) {
    var text = "";
    var attackerName;
    var verbNumber;
    if (actionData.AttackerID != playerID) {
        if (actionData.AttackerTypeID == 0) {
            attackerName = actionData.AttackerName;
        } else {
            attackerName = "The " + actionData.AttackerName
        }
        isOrAre = ""
        verbNumber = 1;
    } else {
        attackerName = "You";
        verbNumber = 0;
    }
    var targetName;
    if (actionData.TargetID != playerID) {
        targetName = actionData.TargetName;
    } else {
        targetName = "you";
    }
    for (var i = 0; i < actionData.SwingInfos.length; i++) {
        switch (actionData.SwingInfos[i].SwingResult) {
            case 1: //hit
            case 2: //crit
                text += buildSpan(cga_light_red, attackerName + " " + (actionData.SwingInfos[i].SwingResult == 2 ? "critically " : "") + actionData.SwingInfos[i].Verbs[verbNumber] + " " + targetName + " for " + String(actionData.SwingInfos[i].Damage) + "!") + "<br>";
                if (actionData.SwingInfos[i].SwingConsequences && actionData.SwingInfos[i].SwingConsequences.length > 0) {
                    for (var j = 0; j < actionData.SwingInfos[i].SwingConsequences.length; j++) {
                        switch (actionData.SwingInfos[i].SwingConsequences[j].ConsequenceType) {
                            case 0: //drop to ground
                                var dropText = (actionData.TargetID != playerID ? "drops" : "drop");
                                text += buildSpan(cga_light_red, capitalizeFirstLetter(targetName) + " " + dropText + " to the ground!") + "<br>";
                                break;
                            case 1: //death
                                if (actionData.SwingInfos[i].SwingConsequences[j].RIPFigureType == 1) {
                                    text += buildSpan(cga_light_grayHex, actionData.SwingInfos[i].SwingConsequences[j].DeathMessage) + "<br>";
                                } else {
                                    var isOrAreText = (actionData.TargetID != playerID ? "is" : "are");
                                    text += buildSpan(cga_light_red, capitalizeFirstLetter(targetName) + " " + isOrAreText + " dead!") + "<br>";
                                }
                                break;
                            case 3: //gain experience
                                for (var k = 0; k < actionData.SwingInfos[i].SwingConsequences[j].KillerPlayerIDs.length; k++) {
                                    if (actionData.SwingInfos[i].SwingConsequences[j].KillerPlayerIDs[k] == playerID) {
                                        text += buildSpan(cga_light_grayHex, "You gain " + String(actionData.SwingInfos[i].SwingConsequences[j].ExpEach) + " experience.") + "<br>";
                                    }
                                }
                                // added this
                                curEXP += actionData.SwingInfos[i].SwingConsequences[j].ExpEach;
                                updateEXPBar();                        
                                break;
                            case 5: //cashDrop
                                for (var k = 0; k < actionData.SwingInfos[i].SwingConsequences[j].DroppedCoinRolls.length; k++) {
                                    text += buildSpan(cga_light_grayHex, String(actionData.SwingInfos[i].SwingConsequences[j].DroppedCoinRolls[k].NumberCoins) + " " + (actionData.SwingInfos[i].SwingConsequences[j].DroppedCoinRolls[k].NumberCoins > 1 ? pluralCoinName(actionData.SwingInfos[i].SwingConsequences[j].DroppedCoinRolls[k].CoinTypeID) + " drop" : singleCoinName(actionData.SwingInfos[i].SwingConsequences[j].DroppedCoinRolls[k].CoinTypeID) + " drops") + " to the ground.") + "<br>";
                                }
                                break;
                            default:
                                break;
                        }
                    }
                }
                break;
            case 0: //miss
                text += buildSpan(cga_dark_cyan, attackerName + " " + actionData.SwingInfos[i].Verbs[verbNumber] + " at " + targetName + "!") + "<br>";
                break;
            case 3: //dodge
                var dodgeText;
                if (targetName == "you") {
                    dodgeText = "you dodge";
                } else {
                    dodgeText = "they dodge";
                }
                text += buildSpan(cga_dark_cyan, attackerName + " " + actionData.SwingInfos[i].Verbs[verbNumber] + " at " + targetName + ", but " + dodgeText + " out of the way!") + "<br>";
                break;
            case 4: //glance
                text += buildSpan(cga_light_red, attackerName + " " + actionData.SwingInfos[i].Verbs[verbNumber] + " " + targetName + ", but the swing glances off!") + "<br>";
                break;
        }
    }
    addMessageRaw(text, false, true);
}
 
// this is the only way I have found to get exp sent from the server. This gets the exp bar going.
sendMessageDirect("exp");
sendMessageDirect("st");
 
// makes the direction buttons work
function MoveClick(moveValue){
    var movementValue = moveValue;
    sendMessageDirect(movementValue);
    addMessage(movementValue, cga_light_grayHex, true, false);
    $('#message').val('').focus();
};
 
// had to re-do this for some reason (possibly because I deleted the first one and created again)
// should be fine when running direct from html and not loading through jquery/javascript
$('#chkEnableAI').change(function () {
    if (this.checked) {
        sendMessageDirect("EnableAI");
    } else {
        sendMessageDirect("DisableAI");
    }
})
 
 
// if the window is open do not re-open, bring focus (do this because Telepaths get lost when re-opening)
// tested to work on Safari and Chrome on Mac OSX 10.11.1
function openConversationsWindow() {
        if(conversationWindow != null && !conversationWindow.closed){
            conversationWindow.blur();
            conversationWindow.focus();
        } else {
            conversationWindow = window.open(conversationsURL, 'conversation' + playerID, 'width=600, height=750');
        }
        window.onbeforeunload = function (e) {
            conversationWindow.close();
        };
        return false;
}
 
// beginning of map screen I believe this will have to occur back of house.
function openMapScreen() {
        if($("#mapScreen").length){
            $("#mapScreen").toggle();
        } else if($("#toolsDiv").length){
            $('<div id="mapScreen" style="float:left; width:100%;"><span style="display:block; text-align:center">Map</span><div>').insertAfter("#toolsDiv");
        } else {
            $('<div id="mapScreen" style="float:left; width:100%;"><span style="display:block; text-align:center">Map</span><div>').insertAfter("#progressMonitors");
        }
   
}
 
// get the elements to variables
var buttons = $("#commandBtns");
 
// add tools button
$(buttons).append($('<input type="button" value="Tools" ID="tools" style="width:5em; height:2em; padding:0;" class="btn" onclick="ToolsButton()"/>'));
 
// register on click function that either toggles the display of the tools or adds the new divs and checkboxes etc
function ToolsButton(){
        if($("#toolsDiv").length){
                $("#toolsDiv").toggle();
        } else {
                 $('<br><div id="toolsDiv" style="float:left; width:100%;"><span style="display:block; text-align:center;">------------ Tools -----------</span><br><input type="checkbox" id="backScroll" value="backscroll" onclick="BackScrollToggle()" /><span> Chat Back-Scroll</span>&nbsp&nbsp<input type="button" id="clearBackScroll" value="Clear" onclick="ClearBackScroll()" style="width:5em; height:2em; padding:0;" class="btn" />&nbsp<input type="checkbox" value="backscrollToBottom" id="backscrollToBottom" /><span> Scroll to Bottom</span><br><div id="backScrollDiv" style="resize:both; font-family: Courier New, Courier, monospace; font-size: medium; float: left; width:800px; height: 200px; margin: 5px; background-color: black; color: white; overflow-y: scroll; display: none;"></div></div>').insertAfter("#progressMonitors");
        }
};
 
// toggle display of the back scroll div
function BackScrollToggle(){
        $("#backScrollDiv").toggle($("#backScroll").checked);
};
 
// executes the refresh every half second
var tid = setInterval(RefreshBackScroll,500);
 
// this searches through the mainScreen and finds and adds gossip messages (needs to either run on a timer or watch mainScreen for changes). Telepaths etc to be added later. Currently in a refresh button.
// probably have to capture the current contents, with time of addition then somehow compare then update. Currently these all have the same current time added.
function RefreshBackScroll(){
        checkGossips();
        checkTelepaths();
        checkSpeak();
        checkYell();
        checkBroadcast();
 
        backscrollToBottom();
};
 
function backscrollToBottom(){
        if($("#backscrollToBottom").is(":checked")){
                // 1E10 is just an arbitrary really large number
                $("#backScrollDiv").scrollTop(1E10);
        }
};
 
// check gossips
function checkGossips(){
        $("#mainScreen").find("span:contains('gossip')").each(function () {
                var self = this;
                var back = $("#backScrollDiv").find("span:contains('gossip')");
                var contains = false;
                if(back.length){
                        $(back).each(function () {
                                if(($(this).next().text() == $(self).next().text())){
                                        contains = true;       
                                }
                        });
                        if(contains == false && $(self).next().attr("style") == "color:#ff55ff" ) {
                                        $("#backScrollDiv").append(currentTime()).append($(self).clone()).append($(self).next().clone()).append("<br>");
 
                        }
                } else if($(self).next().attr("style") == "color:#ff55ff" ) {
                        $("#backScrollDiv").append(currentTime()).append($(self).clone()).append($(self).next().clone()).append("<br>");
                }
        });    
};
 
// for future implementation of checking for telepaths
function checkTelepaths(){
        // check for me telepathing others?
 
        // check for others telepathing me
        $("#mainScreen").find("span:contains('telepaths')").each(function () {
                var self = this;
                var back = $("#backScrollDiv").find("span:contains('telepaths')");
                var contains = false;
                if(back.length){
                        $(back).each(function () {
                                if( $(self).attr("style") == "color:#00aa00" && ($(this).next().text() == $(self).next().text()) && $(self).next().attr("style") == "color:#aaaaaa"){
                                        contains = true;       
                                }
                        });
                        if(contains == false && $(self).next().attr("style") == "color:#aaaaaa" && $(self).attr("style") == "color:#00aa00" ) {
                                        $("#backScrollDiv").append(currentTime()).append($(self).clone()).append($(self).next().clone()).append("<br>");
 
                        }
                } else if( $(self).attr("style") == "color:#00aa00" && $(self).next().attr("style") == "color:#aaaaaa" ) {
                        $("#backScrollDiv").append(currentTime()).append($(self).clone()).append($(self).next().clone()).append("<br>");
                }
        });    
};
 
// for future implementation of checking for speaking in room
function checkSpeak(){
        // check for me speaking
        $("#mainScreen").find("span:contains('You say')").each(function () {
                var self = this;
                var back = $("#backScrollDiv").find("span:contains('You say')");
                var contains = false;
                if(back.length){
                        $(back).each(function () {
                                if( $(self).attr("style") == "color:#00aa00" && $(self).text() == $(this).text()){
                                        contains = true;       
                                }
                        });
                        if(contains == false && $(self).attr("style") == "color:#00aa00" ) {
                                        $("#backScrollDiv").append(currentTime()).append($(self).clone()).append("<br>");
 
                        }
                } else if( $(self).attr("style") == "color:#00aa00" ) {
                        $("#backScrollDiv").append(currentTime()).append($(self).clone()).append("<br>");
                }
        });
       
        // check for other's speaking
                $("#mainScreen").find("span:contains(' says ')").each(function () {
                var self = this;
                var back = $("#backScrollDiv").find("span:contains(' says ')");
                var contains = false;
                if(back.length){
                        $(back).each(function () {
                                if( $(self).attr("style") == "color:#00aa00" && $(self).text() == $(this).text()){
                                        contains = true;       
                                }
                        });
                        if(contains == false && $(self).attr("style") == "color:#00aa00" ) {
                                        $("#backScrollDiv").append(currentTime()).append($(self).clone()).append("<br>");
 
                        }
                } else if( $(self).attr("style") == "color:#00aa00" ) {
                        $("#backScrollDiv").append(currentTime()).append($(self).clone()).append("<br>");
                }
        });
 
};
 
// for future implementation of checking for yelling
function checkYell(){
        // check for me yelling
        $("#mainScreen").find("span:contains('You yell ')").each(function () {
                var self = this;
                var back = $("#backScrollDiv").find("span:contains('You yell ')");
                var contains = false;
                if(back.length){
                        $(back).each(function () {
                                if( $(self).attr("style") == "color:#00aa00" && $(self).text() == $(this).text()){
                                        contains = true;       
                                }
                        });
                        if(contains == false && $(self).attr("style") == "color:#00aa00" ) {
                                        $("#backScrollDiv").append(currentTime()).append($(self).clone()).append("<br>");
 
                        }
                } else if( $(self).attr("style") == "color:#00aa00" ) {
                        $("#backScrollDiv").append(currentTime()).append($(self).clone()).append("<br>");
                }
        });
       
        // check for other's yelling
                $("#mainScreen").find("span:contains('Someone yells')").each(function () {
                var self = this;
                var back = $("#backScrollDiv").find("span:contains('Someone yells')");
                var contains = false;
                if(back.length){
                        $(back).each(function () {
                                if( $(self).attr("style") == "color:#00aa00" && $(self).text() == $(this).text()){
                                        contains = true;       
                                }
                        });
                        if(contains == false && $(self).attr("style") == "color:#00aa00" ) {
                                        $("#backScrollDiv").append(currentTime()).append($(self).clone()).append("<br>");
 
                        }
                } else if( $(self).attr("style") == "color:#00aa00" ) {
                        $("#backScrollDiv").append(currentTime()).append($(self).clone()).append("<br>");
                }
        });
};
 
// for future implemementation of checking for broadcasts
function checkBroadcast(){
        $("#mainScreen").find("span:contains('Broadcast from')").each(function () {
                var self = this;
                var back = $("#backScrollDiv").find("span:contains('Broadcast from')");
                var contains = false;
                if(back.length){
                        $(back).each(function () {
                                if( $(self).attr("style") == "color:#FFFF00" && $(self).text() == $(this).text()){
                                        contains = true;       
                                }
                        });
                        if(contains == false && $(self).attr("style") == "color:#FFFF00" ) {
                                        $("#backScrollDiv").append(currentTime()).append($(self).clone()).append("<br>");
 
                        }
                } else if( $(self).attr("style") == "color:#FFFF00" ) {
                        $("#backScrollDiv").append(currentTime()).append($(self).clone()).append("<br>");
                }
        });
       
};
 
 
// for future implementation of checking for telling
function checkTelling(){
        // check for me telling
       
        // check for other's telling
        $("#mainScreen").find("span:contains('says (to')").each(function () {
                var self = this;
                var back = $("#backScrollDiv").find("span:contains('says (to')");
                var contains = false;
                if(back.length){
                        $(back).each(function () {
                                if( $(self).attr("style") == "color:#00aa00" && $(self).text() == $(this).text()){
                                        contains = true;       
                                }
                        });
                        if(contains == false && $(self).attr("style") == "color:#00aa00" ) {
                                        $("#backScrollDiv").append(currentTime()).append($(self).clone()).append("<br>");
 
                        }
                } else if( $(self).attr("style") == "color:#00aa00" ) {
                        $("#backScrollDiv").append(currentTime()).append($(self).clone()).append("<br>");
                }
        });
 
}
 
// should clear backscroll and continue
function ClearBackScroll(){
        $("#backScrollDiv").children().remove();
        //toggle visability off and on
        BackScrollToggle();
        BackScrollToggle();
};
 
// format current time for adding to front of gossips - set to dd/mm//yyyy
var currentTime = function(){
        var d = new Date();
        var myDate = d.getDate() + "/" + d.getMonth()+ "/" + d.getFullYear();
        var time = d.toLocaleTimeString().toLowerCase().replace(/([\d]+:[\d]+):[\d]+(\s\w+)/g, "$1$2");
 
        return ("<span><" + myDate + " - " + time + "> </span>");
};
 
 
 
// if you click on the main screen will activate the input box
$('#mainScreen').click(function() {
    $('#message').focus();
});
 
//window.onfocus = function(){
//    $('#message').focus();
//};
 
// Run to places
function RunToBrigandFromTown(){
    var toBrigand = "ne,ne,ne,e,se,e,e,ne,ne,ne,nw,nw,n,ne,ne,n,nw,n,nw,w,nw,n,ne,n,ne,e,se,ne,nw,ne,e,se,e,se,e,ne,e";  
    $('#chkEnableAI').prop( "checked", false );
    sendMessageDirect("DisableAI");
   
    toBrigand.split(",").forEach(function(direction){
        MoveClick(direction);
    });
    $('#chkEnableAI').prop( "checked", true );
    sendMessageDirect("EnableAI");
};
 
function RunToTownFromBrigand(){
 var toTown = "w,sw,w,nw,w,nw,w,sw,se,sw,nw,w,sw,s,sw,s,se,e,se,s,se,s,sw,sw,s,se,se,sw,sw,sw,w,w,nw,w,sw,sw,sw";
    $('#chkEnableAI').prop( "checked", false );
    sendMessageDirect("DisableAI");
 
    toTown.split(",").forEach(function(direction){
        MoveClick(direction);
    });
    $('#chkEnableAI').prop( "checked", true );
    sendMessageDirect("EnableAI");
 
};
 
function RunToTownFromTanglewood(){
    var toTown = "s,se,ne,e,u,e,e,ne,ne,ne,e,ne,e,ne,e,se,e,ne,n,nw,n,ne,ne,ne,n,e,ne,ne,n,ne,ne,e,ne,se,se,e,se,se,sw,sw,sw";
 
    $('#chkEnableAI').prop( "checked", false );
    sendMessageDirect("DisableAI");
 
    toTown.split(",").forEach(function(direction){
        MoveClick(direction);
    });
    $('#chkEnableAI').prop( "checked", true );
    sendMessageDirect("EnableAI");
 
};
 
function RunToTanglewoodFromTown(){
    var toTanglewood = "ne,ne,ne,nw,nw,w,nw,nw,sw,w,sw,sw,s,sw,sw,w,s,sw,sw,sw,s,se,s,sw,w,nw,w,sw,w,sw,w,sw,sw,sw,w,w,d";
   
    $('#chkEnableAI').prop( "checked", false );
    sendMessageDirect("DisableAI");
 
    toTanglewood.split(",").forEach(function(direction){
        MoveClick(direction);
    });
    $('#chkEnableAI').prop( "checked", true );
    sendMessageDirect("EnableAI");
 
};
 
function RunToTownFromWolves(){
    $('#chkEnableAI').prop( "checked", false );
    sendMessageDirect("DisableAI");
 
    var toTown = "e,ne,e,se,e,se,s,sw,w,sw,s,sw,se,s,se,s,sw,se,s,sw,se,s,se,se,sw,sw,sw";
    toTown.split(",").forEach(function (direction){
        MoveClick(direction);
    });
 
    $('#chkEnableAI').prop( "checked", true );
    sendMessageDirect("EnableAI");
};
 
function RunToWolvesFromTown(){
    $('#chkEnableAI').prop( "checked", false );
    sendMessageDirect("DisableAI");
 
    var toWolves = "ne,ne,ne,nw,nw,n,nw,ne,n,nw,ne,n,nw,n,nw,ne,n,ne,e,ne,n,nw,w,nw,w,sw,w";
    toWolves.split(",").forEach(function (direction){
        MoveClick(direction);
    });
 
    $('#chkEnableAI').prop( "checked", true );
    sendMessageDirect("EnableAI");
 
};
 
$('<ul class="nav navbar-nav" id="playersDropdown"><li class="dropdown"><a class="dropdown-toggle" data-toggle="dropdown">Players<span class="caret"></span></a></button><ul class="dropdown-menu"><li><a href="#" onclick="inGameTopPlayers()" id="topPlayers">Top Players</a></li><li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown" id="inRealm">Currently Playing<span class="caret"></span></a></li></li></ul>').insertBefore($("#logoutForm"));
 
function inGameTopPlayers(){
    var match,
    pl = /\+/g,  // Regex for replacing addition symbol with a space
    search = /([^&=]+)=?([^&]*)/g,
    decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
    query = window.location.search.substring(1);
 
    urlParams = {};
    while (match = search.exec(query))
        urlParams[decode(match[1])] = decode(match[2]);
    var url = '/Realms/TopPlayers?RealmID=' + urlParams.realmID;
    window.open(url, 'newwindow', 'width=500, height=750');
};
 
$("#listPlayers").css("height","24em").addClass("dropdown-menu").addClass("dropdown-menu-right").css("overflow-y","scroll").css("display","").css("margin", "0 0 1em").insertAfter(("#inRealm")).children().click(function(){
    $("#message").val("/" + $(this).text() + " ");
    $("#message").focus();
});
 
$("#inRealm").parent().hover(function(){
    $('body').css('overflow', 'hidden');
    $("#listPlayers").css("display","block");
},function(){
    $('body').css('overflow', 'scroll');
    $("#listPlayers").css("display","");
});
 
$("#listPlayers").parent().hover(function(){
    $('body').css('overflow', 'hidden');
    $("#listPlayers").css("display","block");
},function(){
    $('body').css('overflow', 'scroll');
    $("#listPlayers").css("display","");
});
 
$("#playersDropdown").hover(function(){
    $("#playersDropdown li ul").css("display","block");
}, function() {
    $("#playersDropdown li ul").css("display", "");    
});
 
// watches the main screen and culls the DIV children when gets to 5000 (assuming not needing to scroll back too far)
// also watches the HP attribute for changes and if the percent is < 20 or >= 100 moves and rests;
var count = 1;
var observer = new MutationObserver(function(mutations){
        mutations.forEach(function(mutation){
                var target = mutation.target;					
                if($(target).attr("id") == "mainScreen"){
                        if($("#mainScreen").children().length > 5000){
                                $("#mainScreen").children().remove(":lt(3000)");
                        }
                        // hp check, move and rest
                } 
				// move/rest based on playerName must start with case "name": and end with break; if there is no break; code will fall through to next case!
				switch (playerName){
				case "Grimlock Doe":
						if(hpPercent <= 30){
								if(resting == false && count == 1){
										MoveClick("s");
										sendMessageDirect("rest");										
										count -= 1;
								}
						} else if (hpPercent >= 100){
								if(count == 0){
										MoveClick("n");
										count += 1;
								}
						}
						break;
				case "Exavier Doe":
						if(hpPercent <= 30){
								if(resting == false && count == 1){
										MoveClick("s");
										sendMessageDirect("rest");
										count -= 1;
								}
						} else if (hpPercent >= 100){
								if(count == 0){
										MoveClick("n");
										count += 1;
								}
						}
						break;
				case "Cyrix Doe":
						if(hpPercent <= 30){
								if(resting == false && count == 1){
										MoveClick("s");
										sendMessageDirect("rest");										
										count -= 1;
								}
						} else if (hpPercent >= 100){
								if(count == 0){
										MoveClick("n");
										count += 1;
								}
						}
						break;
				case "Hammerhead Doe":
						if(hpPercent <= 30){
								if(resting == false && count == 1){
										MoveClick("s");
										sendMessageDirect("rest");										
										count -= 1;
								}
						} else if (hpPercent >= 100){
								if(count == 0){
										MoveClick("n");
										count += 1;
								}
						}
						break;
				case "Romeria Doe":
						if(hpPercent <= 30){
								if(resting == false && count == 1){
										MoveClick("s");
										sendMessageDirect("rest");										
										count -= 1;
								}
						} else if (hpPercent >= 100){
								if(count == 0){
										MoveClick("n");
										count += 1;
								}
						}
						break;
				default:
						// if name is not either of the last specified
						if(hpPercent <= 30){
								if(resting == false && count == 1){
										MoveClick("s");
										sendMessageDirect("rest");										
										count -= 1;
								}
						} else if (hpPercent >= 100){
								if(count == 0){
										MoveClick("n");
										count += 1;
								}
						}
				}                       
                
        });
});

var options = {"childList":true};
observer.observe($("#mainScreen")[0],options);
options = {"attributes":true};
observer.observe($(".progress-bar-danger")[0],options);



var ExpGained = 0;

var start = new Date().getTime(),
    time = 0,
    elapsed = '0.0';

function instance()
{
    time += 100;

    elapsed = Math.floor(time / 100) / 10;
    if(Math.round(elapsed) == elapsed) { elapsed += '.0'; }	
	
	
	
	if(elapsed >= 100 && elapsed <= 101){
		var calculateEXP = curEXP - ExpGained;
		var hours = elapsed / 60;
		EPH = calculateEXP / hours;
		var round = Math.round;
		sendMessageDirect(round(EPH) + " Exp/h");
	}
	

    var diff = (new Date().getTime() - start) - time;
    window.setTimeout(instance, (100 - diff));
}

window.setTimeout(instance, 100);
