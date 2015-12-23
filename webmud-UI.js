/*
 * Blorgen's - Alternate UI and Script
 * 
 * Version 1.2
 * 
 * Implemented version numbers.
 * auto minor/major magic heal if below % - if blank spell = no heal.
 * run and rest if below % - only one room at this time - modified Chupon's code
 * pick up items in room
 * Exp/hr - modified Cyrix's code
 * Paths drop down + paths - modified Chupon's code
 * Alternate chat "backscroll" - appears below main screen
 * List command uses denominations (not just copper)
 * 
 * BUG FIXES
 * &nbsp are gone from show room
 * spell status shows in list command
 * exp/hr was turned off (check if was causing lag)
 * 
 * 
 * 
 * */

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
}

//just wrote a check for percent being above 100%
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

//updates the EXP bar
function updateEXPBar() {
	var exp =  $("#exp");
	expPercent = Math.floor(curEXP * 100 / nextEXP);
	$(exp).html(String(nextEXP-curEXP));
	if(expPercent > 100){
		$(exp).parent().css("width","100%");
	} else {
		$(exp).parent().css("width",String(expPercent) + "%");
	}
}

//sets the curEXP and nextEXP variables and updates the bar (slight modification to yours).
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

//added addition to get experience. update the expbar and add the exp earned to curEXP
function gainExperience(actionData) {
	addMessageRaw(buildSpan(cga_light_grayHex, "You gain " + String(actionData.Experience) + " experience.") + "<br>", false, true);    
	ExpGained +=  +String(actionData.Experience);
	curEXP += actionData.Experience;
	updateEXPBar();	
}                        

function mobDropMoney(actionData) {
	var text = '';
	for (var k = 0; k < actionData.DroppedCoinRolls.length; k++) {
		text += buildSpan(cga_light_grayHex, String(actionData.DroppedCoinRolls[k].NumberCoins) + " " + (actionData.DroppedCoinRolls[k].NumberCoins > 1 ? pluralCoinName(actionData.DroppedCoinRolls[k].CoinTypeID) + " drop" : singleCoinName(actionData.DroppedCoinRolls[k].CoinTypeID) + " drops") + " to the ground.") + "<br>";
		console.log(String(actionData.DroppedCoinRolls[k].NumberCoins) + " + " + String(actionData.DroppedCoinRolls[k].CoinTypeID + pluralCoinName(actionData.DroppedCoinRolls[k].CoinTypeID)) );
	}
	addMessageRaw(text, false, true);

//	case 1:
//	return "copper farthings";
//	case 2:
//	return "silver nobles";
//	case 3:
//	return "gold crowns";
//	case 4:
//	return "platinum pieces";
//	case 5:
//	return "runic coins";
}

//TODO: update so click on name = telepath to person
function refreshPlayerList() {
	hub.server.getPlayersInRealm().done(function (result) {

		var items = [];
		$.each(result, function (id, name) {
			items.push('<li class="list-group-item">' + name + '</li>');
		});
		$('#listPlayers').html(items.join(''));
	});
}

//makes the direction buttons work
function MoveClick(moveValue){
	var movementValue = moveValue;
	sendMessageText(movementValue);
	$('#message').focus();
}

//beginning of map screen I believe this will have to occur back of house.
function openMapScreen() {
	if($("#mapScreen").length){
		$("#mapScreen").toggle();
	} else if($("#toolsDiv").length){
		$('<div id="mapScreen" style="float:left; width:100%;"><span style="display:block; text-align:center">Map</span><div>').insertAfter("#toolsDiv");
	} else {
		$('<div id="mapScreen" style="float:left; width:100%;"><span style="display:block; text-align:center">Map</span><div>').insertAfter("#progressMonitors");
	}

}

//this searches through the mainScreen and finds and adds gossip messages (needs to either run on a timer or watch mainScreen for changes). Telepaths etc to be added later. Currently in a refresh button.
//probably have to capture the current contents, with time of addition then somehow compare then update. Currently these all have the same current time added. 
function RefreshBackScroll(){
	checkGossips();
	checkTelepaths();
	checkSpeak();
	checkYell();
	checkBroadcast();

	backscrollToBottom();
}

//toggle display of the back scroll div
function BackScrollToggle(){
	$("#backScrollDiv").toggle($("#backScroll").checked);
}

function backscrollToBottom(){
	if($("#backscrollToBottom").is(":checked")){
		// 1E10 is just an arbitrary really large number
		$("#backScrollDiv").scrollTop(1E10);
	}
}

//check gossips
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
			if(contains === false && $(self).next().attr("style") == "color:#ff55ff" ) {
				$("#backScrollDiv").append(currentTime()).append($(self).clone()).append($(self).next().clone()).append("<br>");

			}
		} else if($(self).next().attr("style") == "color:#ff55ff" ) {
			$("#backScrollDiv").append(currentTime()).append($(self).clone()).append($(self).next().clone()).append("<br>");
		}
	});	
}

//for future implementation of checking for telepaths
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
			if(contains === false && $(self).next().attr("style") == "color:#aaaaaa" && $(self).attr("style") == "color:#00aa00" ) {
				$("#backScrollDiv").append(currentTime()).append($(self).clone()).append($(self).next().clone()).append("<br>");

			}
		} else if( $(self).attr("style") == "color:#00aa00" && $(self).next().attr("style") == "color:#aaaaaa" ) {
			$("#backScrollDiv").append(currentTime()).append($(self).clone()).append($(self).next().clone()).append("<br>");
		}
	});	
}

//for future implementation of checking for speaking in room
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
			if(contains === false && $(self).attr("style") == "color:#00aa00" ) {
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
			if(contains === false && $(self).attr("style") == "color:#00aa00" ) {
				$("#backScrollDiv").append(currentTime()).append($(self).clone()).append("<br>");

			}
		} else if( $(self).attr("style") == "color:#00aa00" ) {
			$("#backScrollDiv").append(currentTime()).append($(self).clone()).append("<br>");
		}
	});
}

//for future implementation of checking for yelling
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
			if(contains === false && $(self).attr("style") == "color:#00aa00" ) {
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
			if(contains === false && $(self).attr("style") == "color:#00aa00" ) {
				$("#backScrollDiv").append(currentTime()).append($(self).clone()).append("<br>");

			}
		} else if( $(self).attr("style") === "color:#00aa00" ) {
			$("#backScrollDiv").append(currentTime()).append($(self).clone()).append("<br>");
		}
	});
}

//for future implemementation of checking for broadcasts
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
			if(contains === false && $(self).attr("style") == "color:#FFFF00" ) {
				$("#backScrollDiv").append(currentTime()).append($(self).clone()).append("<br>");

			}
		} else if( $(self).attr("style") == "color:#FFFF00" ) {
			$("#backScrollDiv").append(currentTime()).append($(self).clone()).append("<br>");
		}
	});

};


//for future implementation of checking for telling
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

//should clear backscroll and continue
function ClearBackScroll(){
	$("#backScrollDiv").children().remove();
	//toggle visability off and on
	BackScrollToggle();
	BackScrollToggle();
};

//format current time for adding to front of gossips - set to dd/mm//yyyy
var currentTime = function(){
	var d = new Date();
	var myDate = d.getDate() + "/" + d.getMonth()+ "/" + d.getFullYear(); 
	var time = d.toLocaleTimeString().toLowerCase().replace(/([\d]+:[\d]+):[\d]+(\s\w+)/g, "$1$2");

	return ("<span><" + myDate + " - " + time + "> </span>");
};

function ResetExpPH(){
	ExpGained = 0;
	TimeElapsed = 0;
	EPH = 0;
	start = new Date().getTime();
	time = 0;
	elapsed = '0.0';
}

//stores the exp details
var curEXP = 0;
var nextEXP = 0;
var expPercent = 0;
var hpPercent = 100;
var maPercent = 100;

//EXP per hour variabales
var EPH = 0;
var TimeElapsed = 0;
var ExpGained = 0;
var start = new Date().getTime();
var time = 0;
var elapsed = '0.0';

//room items
var items = "";

//not sure if needed anymore
var playerName = "";

//brings stats into a separate window
var statWindow = false;
var statHTML = "";
var statsWindow;

//move/rest scripting
var scriptRunDirection = "s";
var RestMaxPercent = 100;
var RestMinPercent = 40;

//healing
var minorHealBelowPercent = 80;
var minorHealSelfSpell = "mend";
var majorHealBelowPercent = 50;
var majorHealSelfSpell = "";
var healInterval;
var minorHeal = false;
var majorHeal = false;


//register on click function that either toggles the display of the tools or adds the new divs and checkboxes etc
function ToolsButton(){
	if($("#toolsDiv").length){
		$("#toolsDiv").toggle();
	} else {
		$('<br><div id="toolsDiv" style="float:left; width:100%;"><span style="display:block; text-align:center;">------------ Tools -----------</span><br><input type="checkbox" id="backScroll" value="backscroll" onclick="BackScrollToggle()" /><span> Chat Back-Scroll</span>&nbsp&nbsp<input type="button" id="clearBackScroll" value="Clear" onclick="ClearBackScroll()" style="width:5em; height:2em; padding:0;" class="btn" />&nbsp<input type="checkbox" value="backscrollToBottom" id="backscrollToBottom" /><span> Scroll to Bottom</span><br><div id="backScrollDiv" style="resize:both; font-family: Courier New, Courier, monospace; font-size: medium; float: left; width:800px; height: 200px; margin: 5px; background-color: black; color: white; overflow-y: scroll; display: none;"></div></div>').insertAfter("#progressMonitors");
	}
}

//if the window is open do not re-open, bring focus (do this because Telepaths get lost when re-opening)
//tested to work on Safari and Chrome on Mac OSX 10.11.1
var openConvo = function() {
	if(conversationWindow !== null && !conversationWindow.closed){
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

function reverseDirection(dir){
	var newDir = "";
	for(var i = 0; i < dir.length; i++){
		switch(dir[i]){
		case "n":
			newDir += "s";
			break;
		case "s":
			newDir += "n";
			break;
		case "e":
			newDir += "w";
			break;
		case "w":
			newDir += "e";
			break;
		case "d":
			newDir += "u";
			break;
		case "u":
			newDir += "d";
			break;
		}
	}
	return newDir;
}



function listCommand(actionData) {
    if (actionData.InShop == false) {
        var text = buildSpan(cga_light_red, "You cannot LIST if you are not in a shop!") + "<br>";
        addMessageRaw(text, false, true);
        return;
    }
    var text = buildSpan(cga_light_grayHex, "The following items are for sale here:") + "<br><br>";
    text += buildFormattedSpan(cga_dark_green, "Item", 30, true) + buildFormattedSpan(cga_dark_cyan, "Quantity", 12, true) + buildSpan(cga_dark_cyan, "Price") + "<br>";
    text += buildSpan(cga_dark_cyan, "------------------------------------------------------") + "<br>";
    var canUseStatus = '';
    if (actionData.ItemsForSale && actionData.ItemsForSale.length > 0) {
        
        for (var i = 0; i < actionData.ItemsForSale.length; i++) {
            switch (actionData.ItemsForSale[i].CanUseStatus) {
                case 2: //can't use
                    canUseStatus = ' (You can\'t use)';
                    break;
                case 3: //too powerful
                    canUseStatus = ' (Too powerful)';
                    break;
                default:
                case 1: //can use
                    canUseStatus = '';
                    break;

            }
            if (actionData.ItemsForSale[i].Price % 1000000 === 0 && actionData.ItemsForSale[i].Price != 0){
				text += buildFormattedSpan(cga_dark_green, actionData.ItemsForSale[i].ItemTypeName + " ", 30, true) + buildFormattedSpan(cga_dark_cyan, String(actionData.ItemsForSale[i].Count) + " ", 5, true) + buildFormattedSpan(cga_dark_cyan, String(actionData.ItemsForSale[i].Price / 1000000) + " ", 10, false) + buildSpan(cga_dark_cyan, "runic coins" + canUseStatus) + "<br>";
			} else if (actionData.ItemsForSale[i].Price % 10000 === 0 && actionData.ItemsForSale[i].Price != 0){
				text += buildFormattedSpan(cga_dark_green, actionData.ItemsForSale[i].ItemTypeName + " ", 30, true) + buildFormattedSpan(cga_dark_cyan, String(actionData.ItemsForSale[i].Count) + " ", 5, true) + buildFormattedSpan(cga_dark_cyan, String(actionData.ItemsForSale[i].Price / 10000) + " ", 10, false) + buildSpan(cga_dark_cyan, "platinum pieces" + canUseStatus) + "<br>";
			} else if (actionData.ItemsForSale[i].Price % 1000 === 0 && actionData.ItemsForSale[i].Price != 0) {
				text += buildFormattedSpan(cga_dark_green, actionData.ItemsForSale[i].ItemTypeName + " ", 30, true) + buildFormattedSpan(cga_dark_cyan, String(actionData.ItemsForSale[i].Count) + " ", 5, true) + buildFormattedSpan(cga_dark_cyan, String(actionData.ItemsForSale[i].Price / 1000) + " ", 10, false) + buildSpan(cga_dark_cyan, "gold crowns" + canUseStatus) + "<br>";
			} else if(actionData.ItemsForSale[i].Price % 10 === 0 && actionData.ItemsForSale[i].Price != 0) {
				text += buildFormattedSpan(cga_dark_green, actionData.ItemsForSale[i].ItemTypeName + " ", 30, true) + buildFormattedSpan(cga_dark_cyan, String(actionData.ItemsForSale[i].Count) + " ", 5, true) + buildFormattedSpan(cga_dark_cyan, String(actionData.ItemsForSale[i].Price / 10) + " ", 10, false) + buildSpan(cga_dark_cyan, "silver nobles" + canUseStatus) + "<br>";
			} else {
				text += buildFormattedSpan(cga_dark_green, actionData.ItemsForSale[i].ItemTypeName + " ", 30, true) + buildFormattedSpan(cga_dark_cyan, String(actionData.ItemsForSale[i].Count) + " ", 5, true) + buildFormattedSpan(cga_dark_cyan, String(actionData.ItemsForSale[i].Price) + " ", 10, false) + buildSpan(cga_dark_cyan, "copper farthings" + canUseStatus) + "<br>";
			}
        }
    }
    addMessageRaw(text, false, true);
}


var returnTimer = setInterval(function(){
var val = $("#message").val();
sendMessageDirect("");
$("#message").val(val);
},20000);

function instance()
{
	time += 1000;

	elapsed = Math.floor(time / 100) / 10;
	if(Math.round(elapsed) == elapsed) { elapsed += '.0'; }	

	TimeElapsed = elapsed / 60;
	var hoursTilLevel = nextEXP - curEXP;

	if(TimeElapsed >= .01){
		// var calculateEXP = curEXP - ExpGained;
		var hours = TimeElapsed / 60;
		EPH = ExpGained / hours;
		var round = Math.round;		
		var result = round((round(EPH) / 1000));
		if(result > 0){
			$("#ExpPerHour").text(result + "k Exp/h | Approx. " + round((hoursTilLevel / (result * 1000)))  + " hours to level")
		}
		else{
			$("#ExpPerHour").text(round(EPH) + " Exp/h | Approx. " + round((hoursTilLevel / EPH))  + " hours to level")
		}
	}
}

var ephID = window.setInterval(instance, 2000);

//Numpad control of movement
//numlock must be off
//$(document).keydown(function(e) {  
//switch(e.which) {
//case 35:
//sendMessageDirect("sw");
//addMessage("sw", cga_light_grayHex, true, false);
//e.preventDefault();
//break;
//case 40:
//sendMessageDirect("s");
//addMessage("s", cga_light_grayHex, true, false);
//e.preventDefault();
//break;
//case 34:
//sendMessageDirect("se");
//addMessage("se", cga_light_grayHex, true, false);
//e.preventDefault();
//break;
//case 37:
//sendMessageDirect("w");
//addMessage("w", cga_light_grayHex, true, false);
//e.preventDefault();
//break;
//case 12:
//sendMessageDirect("rest");
//addMessage("rest", cga_light_grayHex, true, false);
//e.preventDefault();
//break;
//case 39:
//sendMessageDirect("e");
//addMessage("e", cga_light_grayHex, true, false);
//e.preventDefault();
//break;
//case 36:
//sendMessageDirect("nw");
//addMessage("nw", cga_light_grayHex, true, false);
//e.preventDefault();
//break;
//case 38:
//sendMessageDirect("n");
//addMessage("n", cga_light_grayHex, true, false);
//e.preventDefault();
//break;
//case 33:
//sendMessageDirect("ne");
//addMessage("ne", cga_light_grayHex, true, false);
//e.preventDefault();
//break;        
//}      
//});

function showRoom(actionData) {
    var mainText = buildSpan(cga_light_cyan, actionData.Name) + "<br>";
    mainText +=  "&nbsp;&nbsp;&nbsp;&nbsp;" + buildSpan(cga_light_grayHex, actionData.Description) + "<br>";
    items = "";
    if (actionData.VisibleCoinRolls && actionData.VisibleCoinRolls.length > 0) {
        for (var i = 0; i < actionData.VisibleCoinRolls.length; i++) {
            if (actionData.VisibleCoinRolls[i].Count > 0) {
                if (items != "") {
                    items += ", ";
                }
                items += String(actionData.VisibleCoinRolls[i].Count) + " ";
                if (actionData.VisibleCoinRolls[i].Count > 1) {
                    items += pluralCoinName(actionData.VisibleCoinRolls[i].CoinTypeID);
                } else {
                    items += singleCoinName(actionData.VisibleCoinRolls[i].CoinTypeID);
                }
            }
        }
    }
    if (actionData.VisibleItems && actionData.VisibleItems.length > 0) {
        
        for (var i = 0; i < actionData.VisibleItems.length; i++) {
            if (items != "") {
                items += ", ";
            }
            items += fixStackName(actionData.VisibleItems[i].Count, actionData.VisibleItems[i].Name);
        }
        
    }
    if (items != "") {
        var youNoticeText = "You notice " + items + " here.";
        mainText += buildSpan(cga_dark_cyan, youNoticeText) + "<br>";
    }
    if (actionData.AlsoHerePlayers.length > 0 || actionData.AlsoHereMobs.length > 0) {
        var alsoHereText = "Also here: ";
        var first = true;
        for (var i = 0; i < actionData.AlsoHerePlayers.length; i++) {
            if (i > 0) {
                alsoHereText += ", ";
            }
            alsoHereText += actionData.AlsoHerePlayers[i].FirstName;
            first = false;
        }
        for (var i = 0; i < actionData.AlsoHereMobs.length; i++) {
            if (i > 0 || !first) {
                alsoHereText += ", ";
            }
            alsoHereText += actionData.AlsoHereMobs[i].Name;
        }
        alsoHereText += ".";
        mainText += buildSpan(cga_light_magenta, alsoHereText) + "<br>";
    }
    var obviousExits = "Obvious exits: ";
    if (actionData.ObviousExits && actionData.ObviousExits.length > 0) {
        for (var i = 0; i < actionData.ObviousExits.length; i++) {
            if (i > 0) {
                obviousExits += ", ";
            }
            obviousExits += actionData.ObviousExits[i];
        }
    } else {
        obviousExits += "None!";
    }
    mainText += buildSpan(cga_dark_green, obviousExits) + "<br>";
    addMessageRaw(mainText, false, true);
}

function stat(actionData) {
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
	text += buildSpan(cga_dark_green, "Strength:") + "&nbsp;&nbsp;" + buildFormattedSpan(cga_dark_cyan, String(actionData.Strength), 9, true) + buildSpan(cga_dark_green, "Agility: ") + buildFormattedSpan(cga_dark_cyan, String(actionData.Agility), 14, true) + buildSpan(cga_dark_green, "Tracking:") + buildFormattedSpan(cga_dark_cyan, String(actionData.Tracking), 9, false) + "<br>";
	text += buildSpan(cga_dark_green, "Intellect: ") + buildFormattedSpan(cga_dark_cyan, String(actionData.Intellect), 9, true) + buildSpan(cga_dark_green, "Health:") + "&nbsp;&nbsp;" + buildFormattedSpan(cga_dark_cyan, String(actionData.Health), 14, true) + buildSpan(cga_dark_green, "Martial Arts:") + buildFormattedSpan(cga_dark_cyan, String(actionData.MartialArts), 5, false) + "<br>";
	text += buildSpan(cga_dark_green, "Willpower: ") + buildFormattedSpan(cga_dark_cyan, String(actionData.Willpower), 9, true) + buildSpan(cga_dark_green, "Charm:") + "&nbsp;&nbsp;&nbsp;" + buildFormattedSpan(cga_dark_cyan, String(actionData.Charm), 14, true) + buildSpan(cga_dark_green, "MagicRes:") + buildFormattedSpan(cga_dark_cyan, String(actionData.MagicRes), 9, false) + "<br>";
	addMessageRaw(text, false, true);
	statHTML = text;
}

function statsWindowOpen(){
	if(statHTML === ""){
		statWindow=true;
		sendMessageText("st");

		setTimeout(function(){if(statHTML != ""){openStatsWindow();} else {statsWindowOpen();}},1500)
	} else {
		openStatsWindow();
	}
}

function openStatsWindow(){
	if(statsWindow !== null && statsWindow !== undefined && !statsWindow.closed){
		statsWindow.blur();
		statsWindow.focus();
	} else {
		statsWindow = window.open("",playerName + " - Stats", "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, width=604, height=182, top="+(screen.height-400)+", left="+(screen.width-840));
		statsWindow.document.body.style.backgroundColor = "black";
		statsWindow.document.body.style.fontFamily = "'Courier New', Courier, monospace"
			statsWindow.document.title = playerName + " - Stats";
		statsWindow.document.body.style.border = "1px solid red";
		statsWindow.document.body.innerHTML +="<script src='/bundles/jquery?v=gkWyJthHPtwkFjvHuNinBjchIfwLwc_KbE-H26J2kAI1'></script>"
			statsWindow.document.body.innerHTML = statHTML;
	}
}

//Run to places
function RunToBrigandFromTown(){
	var toBrigand = "ne,ne,ne,e,se,e,e,ne,ne,ne,nw,nw,n,ne,ne,n,nw,n,nw,w,nw,n,ne,n,ne,e,se,ne,nw,ne,e,se,e,se,e,ne,e";  
	$('#chkEnableAI').prop( "checked", false );
	sendMessageDirect("DisableAI");

	toBrigand.split(",").forEach(function(direction){
		MoveClick(direction);
	});
	$('#chkEnableAI').prop( "checked", true );
	sendMessageDirect("EnableAI");
}

function RunToTownFromBrigand(){
	var toTown = "w,sw,w,nw,w,nw,w,sw,se,sw,nw,w,sw,s,sw,s,se,e,se,s,se,s,sw,sw,s,se,se,sw,sw,sw,w,w,nw,w,sw,sw,sw";
	$('#chkEnableAI').prop( "checked", false );
	sendMessageDirect("DisableAI");

	toTown.split(",").forEach(function(direction){
		MoveClick(direction);
	});
	$('#chkEnableAI').prop( "checked", true );
	sendMessageDirect("EnableAI");

}

function RunToTownFromTanglewood(){
	var toTown = "s,se,ne,e,u,e,e,ne,ne,ne,e,ne,e,ne,e,se,e,ne,n,nw,n,ne,ne,ne,n,e,ne,ne,n,ne,ne,e,ne,se,se,e,se,se,sw,sw,sw";

	$('#chkEnableAI').prop( "checked", false );
	sendMessageDirect("DisableAI");

	toTown.split(",").forEach(function(direction){
		MoveClick(direction);
	});
	$('#chkEnableAI').prop( "checked", true );
	sendMessageDirect("EnableAI");

}

function RunToTanglewoodFromTown(){
	var toTanglewood = "ne,ne,ne,nw,nw,w,nw,nw,sw,w,sw,sw,s,sw,sw,w,s,sw,sw,sw,s,se,s,sw,w,nw,w,sw,w,sw,w,sw,sw,sw,w,w,d";

	$('#chkEnableAI').prop( "checked", false );
	sendMessageDirect("DisableAI");

	toTanglewood.split(",").forEach(function(direction){
		MoveClick(direction);
	});
	$('#chkEnableAI').prop( "checked", true );
	sendMessageDirect("EnableAI");

}

function RunToTownFromWolves(){
	$('#chkEnableAI').prop( "checked", false );
	sendMessageDirect("DisableAI");

	var toTown = "e,ne,e,se,e,se,s,sw,w,sw,s,sw,se,s,se,s,sw,se,s,sw,se,s,se,se,sw,sw,sw";
	toTown.split(",").forEach(function (direction){
		MoveClick(direction);
	});

	$('#chkEnableAI').prop( "checked", true );
	sendMessageDirect("EnableAI");
}

function RunToWolvesFromTown(){
	$('#chkEnableAI').prop( "checked", false );
	sendMessageDirect("DisableAI");

	var toWolves = "ne,ne,ne,nw,nw,n,nw,ne,n,nw,ne,n,nw,n,nw,ne,n,ne,e,ne,n,nw,w,nw,w,sw,w";
	toWolves.split(",").forEach(function (direction){
		MoveClick(direction);
	});

	$('#chkEnableAI').prop( "checked", true );
	sendMessageDirect("EnableAI");

}

function RunToTownFromVerdantBog(){
	$('#chkEnableAI').prop( "checked", false );
	sendMessageDirect("DisableAI");

	var toTown = "s,se,sw,s,sw,nw,n,n,nw,n,n,nw,n,n,n,nw,n,ne,n,ne,ne,n,n,ne,n,n,nw,w,nw,n,ne,n,n,n,n,ne,n,nw,w,nw,w,nw,w,n,nw,n,nw,n,nw,sw,n,nw,n,nw,ne,n,nw,n,n,n,nw,sw,sw,sw,w,w,nw,w,sw,sw,sw";
	toTown.split(",").forEach(function(direction){
		MoveClick(direction);
	});

	$('#chkEnableAI').prop( "checked", true );
	sendMessageDirect("EnableAI");
}

function RunToVerdantBogFromTown(){
	$('#chkEnableAI').prop( "checked", false );
	sendMessageDirect("DisableAI");

	var toTown = "s,se,sw,s,sw,nw,n,n,nw,n,n,nw,n,n,n,nw,n,ne,n,ne,ne,n,n,ne,n,n,nw,w,nw,n,ne,n,n,n,n,ne,n,nw,w,nw,w,nw,w,n,nw,n,nw,n,nw,sw,n,nw,n,nw,ne,n,nw,n,n,n,nw,sw,sw,sw,w,w,nw,w,sw,sw,sw";
	toTown.split(",").reverse().forEach(function(direction){
		MoveClick(reverseDirection(direction));
	});

	$('#chkEnableAI').prop( "checked", true );
	sendMessageDirect("EnableAI");
}

function RunToGreenmarshesFromSouthport(){
	$('#chkEnableAI').prop( "checked", false );
	sendMessageDirect("DisableAI");

	var toGreenmarshes = "w,w,w,w,w,w,w,w,w,w,w,w,w,w,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,nw,nw,nw,n,w,w,nw,nw,n,n,n,n,ne,n,ne,n,d,nw,n,e,ne,d,ne,ne,n,n,ne,n,ne,n,ne,se,e";
	toGreenmarshes.split(",").forEach(function(direction){
		MoveClick(direction);
	});

	$('#chkEnableAI').prop( "checked", true );
	sendMessageDirect("EnableAI");
}

function RunToSouthportFromGreenmarshes(){
	$('#chkEnableAI').prop( "checked", false );
	sendMessageDirect("DisableAI");

	var toGreenmarshes = "w,w,w,w,w,w,w,w,w,w,w,w,w,w,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,nw,nw,nw,n,w,w,nw,nw,n,n,n,n,ne,n,ne,n,d,nw,n,e,ne,d,ne,ne,n,n,ne,n,ne,n,ne,se,e";
	toGreenmarshes.split(",").reverse().forEach(function(direction){
		MoveClick(reverseDirection(direction));
	});

	$('#chkEnableAI').prop( "checked", true );
	sendMessageDirect("EnableAI");
}

function RunToGreenmarshesFromVerdantBog(){
	$('#chkEnableAI').prop( "checked", false );
	sendMessageDirect("DisableAI");

	var toGreenmarshes = "s,se,sw,s,sw,se,se,s,s,sw,sw,s,w,s,sw,w,sw,nw,w,sw,w,sw,w,nw,sw,w,nw,sw,w,nw,sw,s,sw,sw,s,sw,s,se,e";
	toGreenmarshes.split(",").forEach(function(direction){
		MoveClick(direction);
	});

	$('#chkEnableAI').prop( "checked", true );
	sendMessageDirect("EnableAI");	
}

function RunToVerdantBogFromGreenmarshes(){
	$('#chkEnableAI').prop( "checked", false );
	sendMessageDirect("DisableAI");

	var toGreenmarshes = "s,se,sw,s,sw,se,se,s,s,sw,sw,s,w,s,sw,w,sw,nw,w,sw,w,sw,w,nw,sw,w,nw,sw,w,nw,sw,s,sw,sw,s,sw,s,se,e";
	toGreenmarshes.split(",").reverse().forEach(function(direction){
		MoveClick(reverseDirection(direction));
	});

	$('#chkEnableAI').prop( "checked", true );
	sendMessageDirect("EnableAI");
}

function RunToSivsFromGreenmarshes(){
	$('#chkEnableAI').prop( "checked", false );
	sendMessageDirect("DisableAI");

	var toSivs = "se,e,n,e,ne,se,se,sw,s,sw,w,sw,s,w,nw,w,nw,";
	toSivs.split(",").forEach(function(direction){
		MoveClick(direction);
	});

	$('#chkEnableAI').prop( "checked", true );
	sendMessageDirect("EnableAI");
}

function RunToGreenmarshesFromSivs(){
	$('#chkEnableAI').prop( "checked", false );
	sendMessageDirect("DisableAI");

	var toSivs = "se,e,n,e,ne,se,se,sw,s,sw,w,sw,s,w,nw,w,nw,";
	toSivs.split(",").reverse().forEach(function(direction){
		MoveClick(reverseDirection(direction));
	});

	$('#chkEnableAI').prop( "checked", true );
	sendMessageDirect("EnableAI");
}

function RunToSivsFromSouthport(){
	$('#chkEnableAI').prop( "checked", false );
	sendMessageDirect("DisableAI");

	RunToGreenmarshesFromSouthport();
	RunToSivsFromGreenmarshes();

	$('#chkEnableAI').prop( "checked", true );
	sendMessageDirect("EnableAI");
}

function RunToSouthportFromSivs(){
	$('#chkEnableAI').prop( "checked", false );
	sendMessageDirect("DisableAI");

	RunToGreenmarshesFromSivs();
	RunToSouthportFromGreenmarshes();

	$('#chkEnableAI').prop( "checked", true );
	sendMessageDirect("EnableAI");	
}

function RunToSivsFromTown(){
	$('#chkEnableAI').prop( "checked", false );
	sendMessageDirect("DisableAI");

	RunToVerdantBogFromTown();
	RunToGreenmarshesFromVerdantBog();
	RunToSivsFromGreenmarshes();

	$('#chkEnableAI').prop( "checked", true );
	sendMessageDirect("EnableAI");
}

function RunToSouthportFromTown(){
	$('#chkEnableAI').prop( "checked", false );
	sendMessageDirect("DisableAI");

	RunToVerdantBogFromTown();
	RunToGreenmarshesFromVerdantBog();
	RunToSouthportFromGreenmarshes();

	$('#chkEnableAI').prop( "checked", true );
	sendMessageDirect("EnableAI");
}

function RunToTownFromSouthport(){
	$('#chkEnableAI').prop( "checked", false );
	sendMessageDirect("DisableAI");

	RunToGreenmarshesFromSouthport();
	RunToVerdantBogFromGreenmarshes();
	RunToTownFromVerdantBog();

	$('#chkEnableAI').prop( "checked", true );
	sendMessageDirect("EnableAI");
}

function RunToFordCrossingFromVerdantBog(){
	$('#chkEnableAI').prop( "checked", false );
	sendMessageDirect("DisableAI");

	var toCrossroads = "s,se,sw,s,sw,se,se,s,s"; 
	toCrossroads.split(",").forEach(function(direction){
		MoveClick(direction);
	});

	$('#chkEnableAI').prop( "checked", true );
	sendMessageDirect("EnableAI");
}

function RunToTreasureFromFordCrossing(){
	$('#chkEnableAI').prop( "checked", false );
	sendMessageDirect("DisableAI");

	var toTreasure = "e,e,se,s,sw,s,s,sw,s,s,s,s,sw,s,se,se,e,se,e,se,se,e,se,ne,e,ne,n,se,e,ne,n,ne,n,ne,n,ne,n,d,e,se,se,d,e,e,e,e,e,n,e,n,d,se,e,e,d,n,w,s"; 
	toTreasure.split(",").forEach(function(direction){
		MoveClick(direction);
	});

	$('#chkEnableAI').prop( "checked", true );
	sendMessageDirect("EnableAI");
}

function RunToFordCrossingFromTreasure(){
	$('#chkEnableAI').prop( "checked", false );
	sendMessageDirect("DisableAI");

	var toTreasure = "e,e,se,s,sw,s,s,sw,s,s,s,s,sw,s,se,se,e,se,e,se,se,e,se,ne,e,ne,n,se,e,ne,n,ne,n,ne,n,ne,n,d,e,se,se,d,e,e,e,e,e,n,e,n,d,se,e,e,d,n,w,s"; 
	toTreasure.split(",").reverse().forEach(function(direction){
		MoveClick(reverseDirection(direction));
	});

	$('#chkEnableAI').prop( "checked", true );
	sendMessageDirect("EnableAI");
}

function RunToVerdantBogFromFordCrossing(){
	$('#chkEnableAI').prop( "checked", false );
	sendMessageDirect("DisableAI");

	var toCrossroads = "s,se,sw,s,sw,se,se,s,s"; 
	toCrossroads.split(",").reverse().forEach(function(direction){
		MoveClick(reverseDirection(direction));
	});

	$('#chkEnableAI').prop( "checked", true );
	sendMessageDirect("EnableAI");
}

function RunToCenterOfSouthportFromFordCrossing(){
	var toDocks = "s,s,se,s,s,sw,s,s,s,s,sw,s,s,s,se,se,s,s,se,s,s,s,sw,s,s,s,sw,s,se,s,s,s,s,sw,s,s,s,s,s,s,sw,sw,sw,s,s,s,s,s,s,s,s,s,s,s,s,s,s,w,u,w,w,w,n,n,u";  
	$('#chkEnableAI').prop( "checked", false );
	sendMessageDirect("DisableAI");

	toDocks.split(",").forEach(function(direction){
		MoveClick(direction);
	});
	$('#chkEnableAI').prop( "checked", true );
	sendMessageDirect("EnableAI");
}

function RunToFordCrossingFromCenterOfSouthport(){
	var toDocks = "s,s,se,s,s,sw,s,s,s,s,sw,s,s,s,se,se,s,s,se,s,s,s,sw,s,s,s,sw,s,se,s,s,s,s,sw,s,s,s,s,s,s,sw,sw,sw,s,s,s,s,s,s,s,s,s,s,s,s,s,s,w,u,w,w,w,n,n,u";  
	$('#chkEnableAI').prop( "checked", false );
	sendMessageDirect("DisableAI");

	toDocks.split(",").reverse().forEach(function(direction){
		MoveClick(reverseDirection(direction));
	});
	$('#chkEnableAI').prop( "checked", true );
	sendMessageDirect("EnableAI");
}

function UpdateRunRestDir() {
	var UnformattedDirection = ($("#RunDirection").val()); //Grabs Textbox Contents.
	minorHealBelowPercent = parseInt($("#minorHealBelow").val());
	majorHealBelowPercent = parseInt($("#majorHealBelow").val());

	RestMaxPercent = (parseInt($("#RestMax").val()));
	RestMinPercent = (parseInt($("#RestMin").val()));
	if (RestMaxPercent > 100) {RestMaxPercent=100}
	if (RestMaxPercent < 1) {RestMaxPercent=1}
	if (RestMinPercent < 1) {RestMinPercent=1}
	if (RestMinPercent > 100) {RestMinPercent=100}
	if (RestMinPercent > RestMaxPercent) {RestMinPercent = RestMaxPercent}

	minorHealSelfSpell = $("#minorHealSpell").val();
	majorHealSelfSpell = $("#majorHealSpell").val();
	if (minorHealBelowPercent > 100) {minorHealBelowPercent=100}
	if (minorHealBelowPercent < 1) {minorHealBelowPercent=1}
	if (majorHealBelowPercent < 1) {majorHealBelowPercent=1}
	if (majorHealBelowPercent > 100) {majorHealBelowPercent=100}
	if (majorHealBelowPercent > minorHealBelowPercent) {majorHealBelowPercent = minorHealBelowPercent}

	$('#RestMax').val(RestMaxPercent); 
	$('#RestMin').val(RestMinPercent);
	$("#minorHealSpell").val(minorHealSelfSpell);
	$("#majorHealSpell").val(majorHealSelfSpell);
	$("#minorHealBelow").val(minorHealBelowPercent);
	$("#majorHealBelow").val(majorHealBelowPercent);
	scriptRunDirection = UnformattedDirection.toLowerCase(); //Converts the text to lowercase and stores it in the variable "PathTriggerCmd"
	$("#mainScreen").append("<span style='color: cyan'>You will now run: </span><span style='color: yellow'>" + scriptRunDirection + "," + "<span style='color: cyan'> before resting.</span><br />");
	$("#mainScreen").append("<span style='color: cyan'>You will now rest if below: </span><span style='color: red'>" + RestMinPercent + "% " + "<span style='color: cyan'>of your total HP.</span><br />");
	$("#mainScreen").append("<span style='color: cyan'>You will now rest until reaching: </span><span style='color: green'>" + RestMaxPercent + "% " + "<span style='color: cyan'>of your total HP.</span><br />");
	minorHealSelfSpell === "" ? "" : $("#mainScreen").append("<span style='color: cyan'>You will now cast <span style='color:yellow;'>" + minorHealSelfSpell + "</span> if below: </span><span style='color: red'>" + minorHealBelowPercent + "% " + "<span style='color: cyan'>of your total HP.</span><br />");
	majorHealSelfSpell === "" ? "" : $("#mainScreen").append("<span style='color: cyan'>You will now cast <span style='color:yellow;'>" + majorHealSelfSpell + "</span> if below: </span><span style='color: red'>" + majorHealBelowPercent + "% " + "<span style='color: cyan'>of your total HP.</span><br />");
	sendMessageDirect("");
}

function FixRestPercent(){
	RestMaxPercent = (parseInt($("#RestMax").val()));
	RestMinPercent = (parseInt($("#RestMin").val()));
	if (RestMaxPercent > 100) {RestMaxPercent=100}
	if (RestMaxPercent < 1) {RestMaxPercent=1}
	if (RestMinPercent < 1) {RestMinPercent=1}
	if (RestMinPercent > 100) {RestMinPercent=100}
	if (RestMinPercent > RestMaxPercent) {RestMinPercent = RestMaxPercent}
	$('#RestMax').val(RestMaxPercent); 
	$('#RestMin').val(RestMinPercent); 
}


function ScriptingToggle(){
	var IsScriptingEnabled = document.getElementById('EnableScripting');
	if (IsScriptingEnabled.checked)   {
		$("#mainScreen").append("<span style='color: green'>** Scripting Enabled **</span><br />");
		sendMessageDirect("");
	} else {
		$("#mainScreen").append("<span style='color: red'>** Scripting Disabled **</span><br />");
		sendMessageDirect("");	
	}
}

function PathDropDownSelection(){
	var DDSelection = "";
	DDSelection = document.getElementById("PathDropDown").value;
	DDSelection.toLowerCase(); //Converts the text to lowercase and stores it in the variable "PathTriggerCmd"
	$('#message').val(DDSelection); 
	document.getElementById("PathDropDown").selectedIndex = 0;
	$("#message").trigger('input');
}
//DROP DOWN PATH BLOCKS END

function ConfigureUI(){
	//		hides the players (thinking of moving this to the top bar)
	$("#divPlayers").toggle(false);

//	enlarges the mainscreen
	$('#divMainPanel').removeClass('col-lg-10').addClass('col-lg-12');

//	resize the mainscreen to fit on my page (should adjust for different screens/resolutions due to using ems
	$('#mainScreen').css("height", "33em").css("width","47.8em").css("resize","both");

//	remove the existing input stuff
	$('#message').parent().remove();
	$('#chkEnableAI').parent().remove();

//	add the new stuff
	$('<div id="divControls" class="panel col-xs-6 col-sm-6 col-md-3 col-lg-3" style="float:left; height:32em; width:21em;"><div style="width:100%"><span>Enable AI: <input type="checkbox" id="chkEnableAI" value="Enable AI"> | </span><span>Enable Scripting: <input type="checkbox" id="EnableScripting" onclick="ScriptingToggle()"></span></div><div style="float:left;width:100%" class="input-group-sm"><input type="text" class="form-control" style="width:100%;max-width:750px;display:inline-block" id="message" autocomplete="false" autocorrect="false"><input type="button" class="btn" style="width:80px;height:30px;padding:0;" id="sendmessage" value="Send"></div><div id="commandBtns" style="width:100%; padding:2em 0 0 0; float:left;"><input type="button" class="btn" style="width:7em; height:2em; padding:0;" id="conversationsBtn" value="Conversations" onclick="openConvo()"><input type="button" class="btn" style="width:5em; height:2em; padding:0;" id="statsBtn" value="Stats" onclick="statsWindowOpen()"><input type="button" class="btn" style="width:5em; height:2em; padding:0;" id="mapButton" value="Map" onclick="openMapScreen()"><input type="button" class="btn" style="width:7em; height:2em; padding:0;" id="expButton" value="Reset Exp/h" onclick="ResetExpPH()"><input type="button" value="Tools" id="tools" style="width:5em; height:2em; padding:0;" class="btn" onclick="ToolsButton()"></div></div><div id="progressMonitors" style="float:left; width:21em;"><div style="float:left; width:100%; padding:0 0 0 1em;"><label id="ExpPerHour">0 Exp/h | Approx. Infinity hours to level</label></div><div id="hpContainer" style="width:100%; float:left; height:1.5em;"><div style="text-align:center;width:10%;font-weight:200; float:left;">HP:</div><div class="progress" style="width:90%"><div class="progress-bar" style="width: 100%; background-color: rgb(230, 46, 0);"><span id="hp">151 / 151</span></div></div></div><div id="maContainer" style="width:100%; float:left; height:1.5em;"><div style="text-align:center;width:10%;font-weight:200; float:left;">MA:</div><div class="progress" style="width:90%;"><div class="progress-bar" style="width:100%; background-color:#3366ff;"><span id="ma">3 / 3</span></div></div></div><div id="expContainer" style="width:100%;float:left; height:1.5em;"><div style="text-align:center;width:10%;font-weight:200; float:left;">EXP:</div><div class="progress" style="width:90%;"><div class="progress-bar" style="width: 83%; background-color: rgb(0, 179, 0);"><span id="exp">0</span></div></div></div></div>').insertAfter("#mainScreen");


	$('<div style="width:100%;"> \
			<!-- Nav tabs --> \
			<ul class="nav nav-tabs" role="tablist"> \
			<li role="presentation" class="active"><a href="#home" aria-controls="home" role="tab" data-toggle="tab">Move</a></li> \
			<li role="presentation"><a href="#profile" aria-controls="profile" role="tab" data-toggle="tab">Heal/Rest</a></li> \
			<!-- <li role="presentation"><a href="#messages" aria-controls="messages" role="tab" data-toggle="tab">Messages</a></li> \
			<li role="presentation"><a href="#settings" aria-controls="settings" role="tab" data-toggle="tab">Settings</a></li> --> \
			</ul> \
			\
			<!-- Tab panes --> \
			<div class="tab-content"> \
			<div role="tabpanel" class="tab-pane active" id="home"><select id="PathDropDown" style="width:100%" onchange="PathDropDownSelection()"><option selected="" value="base">Paths and Commands</option></select><div id="movement1" style="width:100%; float:left; padding:2em 0 0 3em"><input type="button" id="MoveNW" value="nw" onclick="MoveClick(value)" style="width:3em; height:3em; padding:0;" class="btn"><input type="button" id="MoveN" value="n" onclick="MoveClick(value)" style="width:3em; height:3em; padding:0;" class="btn"><input type="button" id="MoveNE" value="ne" onclick="MoveClick(value)" style="width:3em; height:3em; padding:0;" class="btn"><div id="movement2" style="width:20%; float:right; padding:0 5em 0 0;"><input type="button" id="MoveUP" value="u" onclick="MoveClick(value)" style="width:3em; height:3em; padding:0;" class="btn"><br><input type="button" id="MoveDOWN" value="d" onclick="MoveClick(value)" style="width:3em; height:3em; padding:0;" class="btn"></div><br><input type="button" id="MoveW" value="w" onclick="MoveClick(value)" style="width:3em; height:3em; padding:0;" class="btn"><input type="button" id="MoveRest" value="Rest" onclick="MoveClick(value)" style="width:3em; height:3em; padding:0;" class="btn"><input type="button" id="MoveE" value="e" onclick="MoveClick(value)" style="width:3em; height:3em; padding:0;" class="btn"><br><input type="button" id="MoveSW" value="sw" onclick="MoveClick(value)" style="width:3em; height:3em; padding:0;" class="btn"><input type="button" id="MoveS" value="s" onclick="MoveClick(value)" style="width:3em; height:3em; padding:0;" class="btn"><input type="button" id="MoveSE" value="se" onclick="MoveClick(value)" style="width:3em; height:3em; padding:0;" class="btn"></div> \
			</div> \
			<div role="tabpanel" class="tab-pane" id="profile"><div id="moveRestHeal" style="float:left; width:100%; padding:1em 0 0 0; height:9em;"><span>Rest Below: <input type="number" size="1" id="RestMin" value=' + RestMinPercent + ' min="1" max="100" onchange="FixRestPercent()" style="text-align:center; width: 3em;">% HP</span><br><span>Max: <input type="number" size="1" id="RestMax" value=' + RestMaxPercent + ' min="1" max="100" onchange="FixRestPercent()" style="text-align:center; width: 3em;">% HP</span><span style="margin-left:2em;">Run Dir: <input type="text" size="7" id="RunDirection" value=' + scriptRunDirection +'></span><div id="magic"><span style="display:block; ">Minor Heal Below: <input type="text" id="minorHealBelow" value="' + minorHealBelowPercent + '" style="width:3em;"></input>% HP</span><span style="display:block;">Minor Heal Self Spell: <input type="text" id="minorHealSpell" value="' + minorHealSelfSpell + '" style="width:5em;"></input></span><span style="display:block; ">Major Heal Below: <input type="text" id="majorHealBelow" value="' + majorHealBelowPercent + '" style="width:3em;"></input>% HP</span><span style="display:block; ">Major Heal Self Spell: <input type="text" id="majorHealSpell" value="' + majorHealSelfSpell + '" style="width:5em;"></input></span></div><span><input type="submit" value="UPDATE" onclick="UpdateRunRestDir()" class="btn" style="height:2em; padding:0;"></span></div> \
			</div> \
			<div role="tabpanel" class="tab-pane" id="messages">...</div> \
			<div role="tabpanel" class="tab-pane" id="settings">...</div> \
			</div> \
			\
	</div>').insertAfter("#commandBtns");

	$("#message").bind('input', function() {
		var UnformattedTrigger = ($("#message").val()); //Grabs Textbox Contents.
		var PathTriggerCmd = UnformattedTrigger.toLowerCase(); //Converts the text to lowercase and stores it in the variable "PathTriggerCmd"

		switch (PathTriggerCmd) { //Main Switch. This is where you will add the paths or other commands you can define by #triggers below.

		case '#menu': //Displays the list of commands in the main mud screen.

			$('#message').val(""); //This clears the text box after your command is recognized.


			$("#mainScreen").append("<br /><span style='color: orange'>******************************************************************************</span><br />");
			$("#mainScreen").append("<span style='color: #EDAFDE'>Available Commands:</span><br /><br /><span style='color: #EDC9AF'>#Ford2Southport, #Southport2ford, #DeepwoodTrainer2SouthportTrainer, #SouthportTrainer2DeepwoodTrainer, #Trainer2Graveyard, #Graveyard2Trainer, #Trainer2Smithy, #Smithy2Trainer, #Trainer2Pit, #Pit2Trainer, #Tangle2Trainer, #Trainer2Tangle, #Dryad2Trainer, #Ford2SouthTrainer, #SouthTrainer2Ford, #Graveyard2Ford, #Ford2Graveyard, #SivRaiderLair2Ford, #Ford2SivRaiderLair, #Dice<br /></span>");
			$("#mainScreen").append("<br /><span style='color: orange'>******************************************************************************</span><br /><br />");
			sendMessageDirect("");			

			break; // End Of Menu Block


		case '#resetscript':

			$('#message').val(""); //This clears the text box after your command is recognized.	
			$('#hp').html('1%'); // Changes HP bar to 1% health to trigger refresh.
			count = 1;
			$("#mainScreen").append("<br /><br /><span style='color: yellow'>** RESETTING HEALTHBARS TO FIX AUTO COMBAT SCRIPT **</span><br />");
			sendMessageDirect("rest");	

			break;

//			case '#items': 
//			Item Counter Currently Disabled (For Future Use)	
//			$("#mainScreen").append("<br /><br /><br /><span style='color: white'>******************************************************************************</span><br />");
//			$("#mainScreen").append("<span style='color: #EDAFDE'>Collected a total of </span>" + NumItemsCollected + "<span> items.</span><br />");
//			$("#mainScreen").append("<br /><span style='color: white'>******************************************************************************</span><br /><br />");
//			sendMessageDirect("");		
//			break;

		case '#resetexpmeter':
			$('#ExpPerHour').trigger('dblclick'); //triggers exp reset doubleclick
			break;
		case '#town2wolves': 
			$('#message').val("");
			RunToWolvesFromTown();
			break;
		case '#wolves2town': 
			$('#message').val("");
			RunToTownFromWolves();
			break;
		case '#town2verdantbog': 
			$('#message').val("");
			RunToVerdantBogFromTown();
			break;
		case '#verdantbog2town': 
			$('#message').val("");
			RunToTownFromVerdantBog();
			break;
		case '#ford2southport': 
			$('#message').val("");
			RunToCenterOfSouthportFromFordCrossing();
			break;
		case '#southport2ford': 
			$('#message').val("");
			RunToFordCrossingFromCenterOfSouthport();
			break;	

		case '#trainer2smithy':  //Start this from the starting town trainer room

			$('#message').val(""); //This clears the text box after your command is recognized.
			sendMessageDirect("n");
			sendMessageDirect("w");

			break;

		case '#smithy2trainer':  //Start this from the smithy shop

			$('#message').val(""); //This clears the text box after your command is recognized.
			sendMessageDirect("e");
			sendMessageDirect("s");

			break;		

		case '#pit2trainer': //Start this from the first room with monsters in the fighting pits 

			$('#message').val(""); //This clears the text box after your command is recognized.
			sendMessageDirect("u");
			sendMessageDirect("s");
			sendMessageDirect("s");			

			break;

		case '#ford2sivraiderlair': //Start from ford crossing		
			$('#message').val(""); //This clears the text box after your command is recognized.			
			sendMessageDirect("sw");
			sendMessageDirect("sw");
			sendMessageDirect("s");
			sendMessageDirect("w");
			sendMessageDirect("s");
			sendMessageDirect("sw");
			sendMessageDirect("e");
			sendMessageDirect("se");
			sendMessageDirect("se");
			sendMessageDirect("s");
			sendMessageDirect("sw");
			sendMessageDirect("s");
			sendMessageDirect("sw");
			sendMessageDirect("sw");
			sendMessageDirect("w");


			break;

		case '#sivraiderlair2ford': //Starts in the siv raider room.

			$('#message').val(""); //This clears the text box after your command is recognized.	
			sendMessageDirect("e");
			sendMessageDirect("ne");
			sendMessageDirect("ne");
			sendMessageDirect("n");
			sendMessageDirect("ne");
			sendMessageDirect("n");
			sendMessageDirect("nw");
			sendMessageDirect("nw");
			sendMessageDirect("w");
			sendMessageDirect("ne");
			sendMessageDirect("n");
			sendMessageDirect("e");
			sendMessageDirect("n");
			sendMessageDirect("ne");
			sendMessageDirect("ne");	

			break;


		case '#trainer2pit': //Start this from the starting town trainer room

			$('#message').val(""); //This clears the text box after your command is recognized.
			sendMessageDirect("n");
			sendMessageDirect("n");
			sendMessageDirect("d");	

			break;

		case '#tangle2trainer': //Start this from the lair room with a south exit in the tanglewood area.

			$('#message').val(""); //This clears the text box after your command is recognized.

			$("#chkEnableAI").click();

			var trainer2tangle = "n,ne,ne,ne,nw,nw,w,nw,nw,sw,w,sw,sw,s,sw,sw,w,s,sw,sw,sw,s,se,s,sw,w,nw,w,sw,w,sw,w,sw,sw,sw,w,w,d,w,sw,nw,n";
			trainer2tangle.split(",").reverse().forEach(function(dir){
				MoveClick(reverseDirection(dir));
			});

			$("#chkEnableAI").click();

			break;

		case '#trainer2tangle': //Start this from the starting town trainer room

			$('#message').val(""); //This clears the text box after your command is recognized.

			$("#chkEnableAI").click();

			var trainer2tangle = "n,ne,ne,ne,nw,nw,w,nw,nw,sw,w,sw,sw,s,sw,sw,w,s,sw,sw,sw,s,se,s,sw,w,nw,w,sw,w,sw,w,sw,sw,sw,w,w,d,w,sw,nw,n";
			trainer2tangle.split(",").forEach(function(dir){
				MoveClick(dir);
			});

			$("#chkEnableAI").click();

			break;			


		case '#trainer2graveyard': //Start this from the starting town trainer room

			$('#message').val(""); //This clears the text box after your command is recognized.

			$("#chkEnableAI").click();

			var graveyard2trainer = "ne,n,ne,n,nw,w,w,nw,w,sw,sw,sw,s";
			graveyard2trainer.split(",").reverse().forEach(function(dir){
				MoveClick(reverseDirection(dir));
			});

			$("#chkEnableAI").click();

			break;

		case '#graveyard2trainer': //Start In The first room of the Overgrown Graveyard

			$('#message').val(""); //This clears the text box after your command is recognized.

			$("#chkEnableAI").click();

			var graveyard2trainer = "ne,n,ne,n,nw,w,w,nw,w,sw,sw,sw,s";
			graveyard2trainer.split(",").forEach(function(dir){
				MoveClick(dir);
			});

			$("#chkEnableAI").click();

			break;

		case '#dice':
			$('#message').val(""); //This clears the text box after your command is recognized.

			var DiceRoll = Math.floor(Math.random() * 100) + 1;

			sendMessageDirect("Big Money!, then quickly pulls a 100-sided die out of his pocket, and rolls a "+DiceRoll+".");

			break;



		case '#dryad2trainer': //Start from dark dryad boss room in Tanglewood

			$('#message').val(""); //This clears the text box after your command is recognized.

			$("#chkEnableAI").click();
			var dryad2trainer = "n,ne,n,ne,ne,n,ne,e,se,se,ne,e,ne,n,ne,nw,ne,se,e,s,e,ne,n,se,e,nw,ne,ne,se,e,se,ne,se,e,se,u,e,e,ne,ne,ne,e,ne,e,ne,e,se,e,ne,n,nw,n,ne,ne,ne,n,e,ne,ne,n,ne,ne,e,ne,se,se,e,se,se,sw,sw,sw,s";
			dryad2trainer.split(",").forEach(function(dir){
				MoveClick(dir);
			});
			$("#chkEnableAI").click();

			break;

		case '#ford2southtrainer': //Start this from the natural ford crossing.

			$('#message').val(""); //This clears the text box after your command is recognized.

			$("#chkEnableAI").click();

			var southtrainer2ford = "n,w,w,w,w,s,s,s,s,s,w,w,w,w,w,w,w,w,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,nw,nw,nw,n,w,w,nw,nw,n,n,n,n,ne,n,ne,n,d,nw,n,e,ne,d,ne,ne,n,n,ne,n,ne,n,ne,n,ne,n,ne,ne,n,ne,se,e,ne,se,se,e,ne,e,ne,e,se,ne,e,ne,n,e,n,ne,ne";
			southtrainer2ford.split(",").reverse().forEach(function(dir){
				MoveClick(reverseDirection(dir));
			});

			$("#chkEnableAI").click();

			break;


		case '#southtrainer2ford': //Start this from the Southport trainer.

			$('#message').val(""); //This clears the text box after your command is recognized.

			$("#chkEnableAI").click();

			var southtrainer2ford = "n,w,w,w,w,s,s,s,s,s,w,w,w,w,w,w,w,w,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,nw,nw,nw,n,w,w,nw,nw,n,n,n,n,ne,n,ne,n,d,nw,n,e,ne,d,ne,ne,n,n,ne,n,ne,n,ne,n,ne,n,ne,ne,n,ne,se,e,ne,se,se,e,ne,e,ne,e,se,ne,e,ne,n,e,n,ne,ne";
			southtrainer2ford.split(",").forEach(function(dir){
				MoveClick(dir);
			});

			$("#chkEnableAI").click();

			break;

		case '#ford2graveyard': //Start this from the Natural Ford Crossing in the river.

			$('#message').val(""); //This clears the text box after your command is recognized.

			$("#chkEnableAI").click();

			var graveyard2ford = "ne,n,ne,n,nw,ne,ne,ne,e,e,ne,e,ne,e,se,ne,ne,e,ne,nw,n,ne,e,ne,e,se,e,e,s,sw,s,s,sw,s,s,s,se,se,s,se,s,s,s,s,sw,s,sw,s,s,s,sw,sw,s,s,sw,sw,s,s,s,s,sw,s,se,e,se,s,s,sw,s,s,sw,sw,s,sw,s,se,s,s,s,se,s,s,se,s,s,s,s,se,se,se";
			graveyard2ford.split(",").reverse().forEach(function(dir){
				MoveClick(reverseDirection(dir));
			});

			$("#chkEnableAI").click();			

			break;

		case '#graveyard2ford': //Start this from the Overgrown Graveyard Entrance Room

			$('#message').val(""); //This clears the text box after your command is recognized.

			$("#chkEnableAI").click();

			var graveyard2ford = "ne,n,ne,n,nw,ne,ne,ne,e,e,ne,e,ne,e,se,ne,ne,e,ne,nw,n,ne,e,ne,e,se,e,e,s,sw,s,s,sw,s,s,s,se,se,s,se,s,s,s,s,sw,s,sw,s,s,s,sw,sw,s,s,sw,sw,s,s,s,s,sw,s,se,e,se,s,s,sw,s,s,sw,sw,s,sw,s,se,s,s,s,se,s,s,se,s,s,s,s,se,se,se";
			graveyard2ford.split(",").forEach(function(dir){
				MoveClick(dir);
			});

			$("#chkEnableAI").click();

			break;


		case '#deepwoodtrainer2southporttrainer': //Start this from the starting town trainer room FULL RUN TO SouthportTrainer

			$('#message').val(""); //This clears the text box after your command is recognized.

			$("#chkEnableAI").click();

			var southporttrainer2deepwoodtrainer = "n,w,w,w,w,s,s,s,s,s,w,w,w,w,w,w,w,w,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,nw,nw,nw,n,w,w,nw,nw,n,n,n,n,ne,n,ne,n,d,nw,n,e,ne,d,ne,ne,n,n,ne,n,ne,n,ne,n,ne,n,ne,ne,n,ne,se,e,ne,se,se,e,ne,e,ne,e,se,ne,e,ne,n,e,n,ne,ne,nw,nw,nw,n,n,n,n,nw,n,n,nw,n,n,n,nw,n,ne,n,ne,ne,n,n,ne,n,n,nw,w,nw,n,ne,n,n,n,n,ne,ne,n,n,ne,ne,n,n,n,ne,n,ne,n,n,n,n,nw,n,nw,nw,n,n,n,ne,n,n,ne,n,w,w,nw,w,sw,w,sw,s,se,sw,w,sw,sw,nw,w,sw,w,sw,w,w,sw,sw,sw,se,s,sw,s,sw,ne,n,ne,n,nw,w,w,nw,w,sw,sw,sw,s";
			southporttrainer2deepwoodtrainer.split(",").reverse().forEach(function(dir){
				MoveClick(reverseDirection(dir));
			});

			$("#chkEnableAI").click();

			break;		

		case '#southporttrainer2deepwoodtrainer': //Start this from the Southport trainer. LONG RUN

			$('#message').val(""); //This clears the text box after your command is recognized.

			$("#chkEnableAI").click();

			var southporttrainer2deepwoodtrainer = "n,w,w,w,w,s,s,s,s,s,w,w,w,w,w,w,w,w,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,nw,nw,nw,n,w,w,nw,nw,n,n,n,n,ne,n,ne,n,d,nw,n,e,ne,d,ne,ne,n,n,ne,n,ne,n,ne,n,ne,n,ne,ne,n,ne,se,e,ne,se,se,e,ne,e,ne,e,se,ne,e,ne,n,e,n,ne,ne,nw,nw,nw,n,n,n,n,nw,n,n,nw,n,n,n,nw,n,ne,n,ne,ne,n,n,ne,n,n,nw,w,nw,n,ne,n,n,n,n,ne,ne,n,n,ne,ne,n,n,n,ne,n,ne,n,n,n,n,nw,n,nw,nw,n,n,n,ne,n,n,ne,n,w,w,nw,w,sw,w,sw,s,se,sw,w,sw,sw,nw,w,sw,w,sw,w,w,sw,sw,sw,se,s,sw,s,sw,ne,n,ne,n,nw,w,w,nw,w,sw,sw,sw,s";
			southporttrainer2deepwoodtrainer.split(",").forEach(function(dir){
				MoveClick(dir);
			});

			$("#chkEnableAI").click();

			break;
		}
	});


	//DROP DOWN PATHS
	var select = document.getElementById("PathDropDown");
	var PathArray=["#ResetExpMeter", "#Ford2Southport", "#Southport2Ford", "#DeepwoodTrainer2SouthportTrainer", "#SouthportTrainer2DeepwoodTrainer", 
	               "#Trainer2Graveyard", "#Graveyard2Trainer", "#Trainer2Smithy", "#Smithy2Trainer", "#Trainer2Pit", "#Pit2Trainer", "#Tangle2Trainer",
	               "#Trainer2Tangle", "#Dryad2Trainer", "#Ford2SouthTrainer", "#SouthTrainer2Ford", "#Graveyard2Ford", "#Ford2Graveyard", "#SivRaiderLair2Ford",
	               "#Ford2SivRaiderLair", "#Dice"];

	for(var i = 0; i < PathArray.length; i++) {
		var opt = PathArray[i];
		var el = document.createElement("option");
		el.textContent = opt;
		el.value = opt;
		select.appendChild(el);
	}


//	checks the AI and enables
	$('#chkEnableAI').prop( "checked", true );
	sendMessageDirect("EnableAI");

	// enables Chupon's scripting
	$("#EnableScripting").click();

//	removes existing bars
	$('.vertical').remove();

//	this is the only way I have found to get exp sent from the server. This gets the exp bar going.
	sendMessageText("exp");

//	had to re-do this for some reason (possibly because I deleted the first one and created again)
//	should be fine when running direct from html and not loading through jquery/javascript
	$('#chkEnableAI').change(function () {
		if (this.checked) {
			sendMessageDirect("EnableAI");
		} else {
			sendMessageDirect("DisableAI");
		}
	});

//	executes the refresh every half second
	var tid = setInterval(RefreshBackScroll,500);

//	if you click on the main screen will activate the input box
	$('#mainScreen').click(function() {
		$('#message').focus(); 
	});

	$("#mainScreen").hover(function(){
		$('body').css('overflow', 'hidden');
	},function(){
		$('body').css('overflow', 'scroll');
	});

//	window.onfocus = function(){ 
//	$('#message').focus(); 
//	};

	$('<ul class="nav navbar-nav" id="playersDropdown"><li class="dropdown"><a class="dropdown-toggle" data-toggle="dropdown">Players<span class="caret"></span></a></button><ul class="dropdown-menu"><li><a href="#" onclick="inGameTopPlayers()" id="topPlayers">Top Players</a></li><li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown" id="inRealm">Currently Playing<span class="caret"></span></a></li></li></ul>').insertBefore($("#logoutForm"));

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

}

if (window.location.pathname === "/Characters/Conversations"){
	$('<input id="chkScrollToBottom" type="checkbox"><span>scroll to bottom?</span></input>').insertAfter("#divConversations");
	$("#chkScrollToBottom").click();

	function scrollToBottom() {
		if (window.location.pathname === "/Characters/Conversations"){
			if($("#chkScrollToBottom").prop("checked")){
				var objDiv = document.getElementById("divConversations");
				objDiv.scrollTop = objDiv.scrollHeight;
			}
		} else if(window.location.pathname === "/Characters/Game"){
			var objDiv = document.getElementById("mainScreen");
			objDiv.scrollTop = objDiv.scrollHeight;
		}
	}
} else if(window.location.pathname === "/Characters/Game"){
	playerName = $(document).attr('title').split(" ")[0];

//	watches the main screen and culls the DIV children when gets to 5000 (assuming not needing to scroll back too far)
//	also watches the HP attribute for changes and if the percent is < 20 or >= 100 moves and rests;
	var count = 1;
	var firstRun = true;
	var observer = new MutationObserver(function(mutations){

		if(firstRun === true){
			ConfigureUI();
			firstRun = false;
		} else {

			// remove children entities from mud screen
			if($("#mainScreen").children().length > 5000){
				$("#mainScreen").children().remove(":lt(3000)");
			}

			// type your desired item here and this will pick it up if it's in the room, 
			// will repeat until there are no more of that item.
			var desired = ["acid gland", "coprolite necklace"];
			for(var i = 0; i < desired.length; i++){
				if(items.indexOf(desired[i]) > -1){
					sendMessageDirect("get " + desired[i]);
					sendMessageDirect("");
				}
			}

//			if(statWindow === true){
//			for(var i = 0; i < mutations.length; i++){
//			if(mutations[i].addedNodes.length === 67){
//			for(var k = 0; k < 67; k++){
//			if(mutations[i].addedNodes[k].outerHTML != undefined){
//			statHTML += mutations[i].addedNodes[k].outerHTML;
//			}
//			}
//			}
//			}

//			if(statHTML != ""){
//			openStatsWindow();
//			statWindow = false;
//			}
//			}

			// hp check, move and rest
			// move/rest based on playerName must start with case "name": and end with break; if there is no break; code will fall through to next case!
//			switch (playerName){
//			case "Blorgen":
//			if(hpPercent <= 40){
//			if(resting == false && count == 1){
//			var val = $("#message").val();
//			MoveClick("s");
//			sendMessageDirect("rest");
//			$("#message").val(val);
//			count -= 1;
//			}
//			} else if (hpPercent >= 100){
//			if(count == 0){
//			var val = $("#message").val();
//			MoveClick("n");
//			$("#message").val(val);
//			count += 1;
//			}
//			}
//			break;
//			case "Bjorgen":
//			if(hpPercent <= 40){
//			if(resting == false && count == 1){
//			var val = $("#message").val();
//			MoveClick("s");
//			sendMessageDirect("rest");
//			$("#message").val(val);
//			count -= 1;
//			}
//			} else if (hpPercent >= 100){
//			if(count == 0){
//			var val = $("#message").val();
//			MoveClick("n");
//			$("#message").val(val);
//			count += 1;
//			}
//			}
//			break;
//			default:
//			// if name is not either of the last specified
//			if(hpPercent <= 40){
//			if(resting == false && count == 1){
//			var val = $("#message").val();
//			MoveClick("s");
//			sendMessageDirect("rest");
//			$("#message").val(val);
//			count -= 1;
//			}
//			} else if (hpPercent >= 100){
//			if(count == 0){
//			var val = $("#message").val();
//			MoveClick("n");
//			$("#message").val(val);
//			count += 1;
//			}
//			}
//			}	

			// healing logic - currently working on
			if(hpPercent < majorHealBelowPercent && majorHealSelfSpell != ""){
//				console.log("in Major heal");	
				if(healInterval && majorHeal === false && minorHeal === true){
					clearInterval(healInterval);
					minorHeal = false;
					healInterval = undefined;
				}
				if(healInterval === undefined && majorHeal != true){
					healInterval = setInterval(function(){
						majorHeal = true;
						sendMessageText(majorHealSelfSpell);
						sendMessageDirect("");
					},3500);
				}
			} else if(hpPercent < minorHealBelowPercent && minorHealSelfSpell != "") {
//				console.log("in Minor heal");
				if(healInterval != undefined && minorHeal === false && majorHeal === true){
					majorHeal = false;
					clearInterval(healInterval);
					healInterval = undefined;
				} 
				if(healInterval === undefined && minorHeal != true){
					healInterval = setInterval(function(){
						minorHeal = true;
						sendMessageText(minorHealSelfSpell);
						sendMessageDirect("");
					},3500);
				}
			} else if(hpPercent >= minorHealBelowPercent){
				if(healInterval && (minorHeal === true || majorHeal === true)){
					clearInterval(healInterval);
				}
				minorHeal = false;
				majorHeal = false;
				healInterval = undefined;
			}


			if(hpPercent <= RestMinPercent){
				var IsScriptingEnabled = document.getElementById('EnableScripting');
				if(resting == false && count == 1 && (IsScriptingEnabled.checked)) {  
					MoveClick(scriptRunDirection);
					sendMessageDirect("rest");
					count -= 1;
				}

			}
			else if(hpPercent >= RestMaxPercent){
				var IsScriptingEnabled = document.getElementById('EnableScripting');
				if(count == 0 && (IsScriptingEnabled.checked)) {
					MoveClick(reverseDirection(scriptRunDirection));
					count += 1;
				}
			}
		}
	});
	var options = {"childList":true};
	observer.observe($("#mainScreen")[0],options);
	options = {"attributes":true};
	observer.observe($("#hp").parent()[0],options);

}

