/*
 * Blorgen's - Alternate UI and Script
 * 
 * Version 1.9.1
 * 
 * moved the settings link to end of command buttons
 * scroll window down to top of mainScreen
 * 
 * Version 1.9
 * 
 * Fixed accidental doubling of exp/hr
 * 
 * auto-set rest directions will work, they are not all populated though so be careful,
 * please send me through updates as you come across them.
 * 
 * 
 * 
 * Version 1.8
 * 
 * Auto-get items, add exact item name in ui and click on item to remove 
 * rework paths script - bit easier to add things to. Need to work on #menu display
 * #set brief command - works with existing show room - leaves a gap but won't break if Vitoc changes anything
 * My own auto-attack (plain attack only) - Turn AI off - Scripting on  (set by default) - will not get coins
 * 
 * 
 * ***** IN PROGRESS *****
 * automated mapping / walking / running - maybe - not sure if doable.
 * auto-set rest directions
 * UI needs to be able to scroll
 * 
 * ***** KNOWN ISSUES ******
 * Auto-get does not work with coins - if enough of you want to get coins by choice I can work it in
 * At the moment the UI for get items will not stop, I have not continued adding items upon items. I usually clear what is not relevant to the area.
 * #menu does not auto-wrap at mainscreen boundaries (they all appear in the drop-down)
 * 
 * Version 1.7
 * 
 * Auto-get Items!! (Work on UI)
 * Heal while above % Mana
 * Rest below % Mana
 * 
 * BUG FIXES
 * Send button didn't send.
 * spells would first cast after interval instead of straight away
 * 
 * 
 * Version 1.6
 * 
 * changed some overrides so as to not mess with Vitoc's code
 * configure player at end of code;
 * 
 * 
 * Version 1.5
 * 
 * compatible with latest changes
 * 
 * Version 1.4
 *
 * Implemented version numbers.
 * auto minor/major magic heal if below % - if blank spell = no heal.
 * run and rest if below % - only one room at this time - modified Chupon's code
 * pick up items in room
 * Exp/hr - modified Cyrix's code
 * Paths drop down + paths - modified Chupon's code
 * Alternate chat "backscroll" - appears below main screen
 * List command uses denominations (not just copper)
 * added version line to UI
 * added multiple run rooms
 * added pre-rest post-rest commands
 * added buff spell & timer - in milliseconds (1000 = 1 sec; 1 sec is minimum )
 *
 *
 * BUG FIXES
 * &nbsp are gone from show room
 * spell status shows in list command
 * exp/hr was turned off (check if was causing lag)
 *
 *
 *
 * */
//version number
var version = 1.9.1;

//stores the exp details
var curEXP = 0;
var nextEXP = 0;
var EXPPercent = 100;
var hpPercent = 100;
var maPercent = 100;

//EXP per hour variabales
var EPH = 0;
var TimeElapsed = 0;
var ExpGained = 0;
var start = new Date().getTime();
var time = 0;
var elapsed = '0.0';
var ephInterval = 2000;

//room items
var roomItems = {};

//get items
var desired = [];

//for playerName
var playerName = "";

//brings stats into a separate window
var statWindow = false;
var statHTML = "";
var statsWindow;

//scripting
var scripting = false;
var observer = undefined;

//move/rest scripting
var scriptRunDirection = "s";
var oldRunDirection = "";
var RestMaxPercent = 100;
var RestMinPercent = 40;
var restBelowMAPercent = 30;
var restMaxMAPercent = 100;
var preRestCommand = "";
var postRestCommand = "";
var shouldSetRunDir = false;
var running = false;
var moveOnKill = false;
var macTimeout = 500;

//healing
var minorHealBelowPercent = 80;
var minorHealSelfSpell = "";
var majorHealBelowPercent = 50;
var majorHealSelfSpell = "";
var healManaAbove = 50;
var healInterval;
var minorHeal = false;
var majorHeal = false;
var restMana = false;

//buffing
var buff = undefined;
var buffInterval = 3000;
var buffSelfSpell = "";

//attacking related variables
var visibleMobs = undefined;
var attacking = false;

//mapping
var room = {};
var mapping = false;
var mapQueue = [];

//brief setting
var brief = false;

//Paths
var Paths = {};

//var mapNode = class{
//constructor() {
//this.data = {
//"Name":"",
//"Description":"",
//ObviousExits:"",
//HiddenExits:{}
//};
//this.children = {};
//this.parent = {};
//}
//}

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
	EXPPercent = Math.floor(curEXP * 100 / nextEXP);
	var exp =  $("#exp");
	$(exp).html(String(nextEXP-curEXP));
	if(EXPPercent > 100){
		$(exp).parent().css("width","100%");
	} else {
		$(exp).parent().css("width",String(EXPPercent) + "%");
	}
}

//sets the curEXP and nextEXP variables and updates the bar (slight modification to yours).
var wm_exp = window.exp;
window.exp = function(actionData){
	wm_exp(actionData);
	curEXP = actionData.Exp;
	nextEXP = actionData.TotalExpForNextLevel;
	updateEXPBar();
}

//added addition to get experience. update the expbar and add the exp earned to curEXP
//kap - inheritance
var wm_gainExperience = window.gainExperience;
window.gainExperience = function(actionData) {
	wm_gainExperience(actionData);
	ExpGained +=  +String(actionData.Experience);
	curEXP += actionData.Experience;
	updateEXPBar();
	if(moveOnKill === true){
		RunOut();
		setTimeout(RunIn,macTimeout);
	}
}

//TODO: update so click on name = telepath to person
function refreshPlayerList() {
	hub.server.getPlayersInRealm().done(function (result) {

		var items = [];
		$.each(result, function (id, name) {
			items.push('<li class="list-group-item" onclick="$("#message").val("/' + name + '")">' + name + '</li>');
		});
		$('#listPlayers').html(items.join(''));
	});
}

//makes the direction buttons work
function MoveClick(moveValue){
	var movementValue = moveValue;
	sendMessageText(movementValue);
//	$('#message').focus();
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

function MapRealm(){
	mapping = true;
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




var wm_combatOff = window.combatOff;

window.combatOff = function(){
	wm_combatOff();
	if(scripting){
		attacking = false;
		sendMessageDirect("");
	}
}

var wm_attack = window.attack;
window.attack = function(actionData){
	wm_attack(actionData);
	if (scripting && attacking === false && running === false && actionData.Result != -1 && actionData.Result != -2){
		attacking = true;
	} else if(scripting && attacking === true && (actionData.Result === -1 || actionData.Result === -2)){
		attacking = false;
	}
}

var wm_entersTheRoom = window.entersTheRoom;
window.entersTheRoom = function(actionData) {
	wm_entersTheRoom(actionData);
	if (scripting && attacking === false && running === false && actionData.EnteringFigureType != 0)  {
		sendMessageDirect("");
	}    
}

var wm_spellWearsOff = window.spellWearsOff;
window.spellWearsOff = function(actionData) {
	wm_spellWearsOff(actionData);
}

var wm_combatSwing = window.combatSwing;
window.combatSwing = function(actionData) {
	wm_combatSwing(actionData);
//	var total = 0;
//	var self = false;
//	if (actionData.AttackerID == playerID) {
//		self = true;
//		console.log("self = " + self);
//	}
//	if(self === true){
//		console.log(actionData);
//	}
}

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


//TODO: auto-drop copper and silver with total coins, not just random numbers
var wm_inventory = window.inventory;
window.inventory = function(actionData){
	wm_inventory(actionData);
}

var wm_spells = window.spells;
window.spells = function(actionData) {
	wm_spells(actionData);
	if (actionData.Result == -1) {
		return;
	}
	var text = buildSpan(cga_light_grayHex, 'You know the following spells:') + '<br>';
	text += buildSpan(cga_light_cyan, 'Level Mana Short Spell Name') + '<br>';
	for (var i = 0; i < actionData.Spells.length; i++) {
		text += buildFormattedSpan(cga_dark_cyan, String(actionData.Spells[i].Level), 3, false) + '&nbsp;&nbsp;&nbsp;' + buildFormattedSpan(cga_dark_cyan, String(actionData.Spells[i].Mana), 4, true) + ' ' + buildFormattedSpan(cga_dark_cyan, actionData.Spells[i].ShortCommand, 5, true) + ' ' + buildSpan(cga_dark_cyan, actionData.Spells[i].Name) + '<br>';
	}

	var spellsWindow = window.open("",playerName + " - Spells", "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, width=604, height=182, top="+(screen.height-400)+", left="+(screen.width-840));
	spellsWindow.document.body.style.backgroundColor = "black";
	spellsWindow.document.body.style.fontFamily = "'Courier New', Courier, monospace"
		spellsWindow.document.title = playerName + " - Stats";
	spellsWindow.document.body.style.border = "1px solid red";
	spellsWindow.document.body.innerHTML +="<script src='/bundles/jquery?v=gkWyJthHPtwkFjvHuNinBjchIfwLwc_KbE-H26J2kAI1'></script>"
		spellsWindow.document.body.innerHTML = text;

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
			} else if (actionData.ItemsForSale[i].Price % 100 === 0 && actionData.ItemsForSale[i].Price != 0) {
				text += buildFormattedSpan(cga_dark_green, actionData.ItemsForSale[i].ItemTypeName + " ", 30, true) + buildFormattedSpan(cga_dark_cyan, String(actionData.ItemsForSale[i].Count) + " ", 5, true) + buildFormattedSpan(cga_dark_cyan, String(actionData.ItemsForSale[i].Price / 100) + " ", 10, false) + buildSpan(cga_dark_cyan, "gold crowns" + canUseStatus) + "<br>";
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
	time += ephInterval;

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

var ephID = window.setInterval(instance, ephInterval);

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

function MapRealm(){
	var frontier = [];
	var exploredCount = 0;
	var explored = {};

	var current;

	var initial = new mapNode();


	frontier.push(initial)

	if(mapping){

		if(mapQueue.length === 0){
			var newNode = new mapNode();
			newNode.data.Description = room.Description;
			newNode.data.Name = room.Name;
			newNode.data.ObviousExits = room.ObviousExits;

			for (var i = 0; i < room.ObviousExits.length; i++) {
				if(newNode.children[room.ObviousExits[i]] === undefined){
					newNode.children[room.ObviousExits[i]] = new mapNode();
				}
			}

//			for (var i = 0; i < actionData.HiddenExits.length; i++) {
//			newNode.HiddenExits[actionData.HiddenExits[i]] = new mapNode();
//			}
			mapQueue.push(newNode);
		} else {
			var same = true;
			for(var i = 0; i < mapQueue.length; i++){
				if (room.Name === mapQueue[i].Name && room.Description === mapQueue[i].Description){
					for(exit in room.ObviousExits){
						console.log("exit = " + exit);
						for (otherExit in mapQueue[i].ObviousExits){
							console.log("otherExit = " + otherExit);
							if (!(exit === otherExit)){
								same = false;
							}
						}
					}
//					if(same){
//					for(exit in room.HiddenExits){
//					for (otherExit in mapQueue[i].HiddenExits){
//					if (!(exit === otherExit)){
//					same = false;
//					}
//					}
//					}
//					}
				}
			}
			if(same === false){
				var newNode = 
					mapQueue.push(newNode);
			}
		}
	}
}

var wm_showRoom = window.showRoom;

window.showRoom = function(actionData) {
	if(brief === true){actionData.Description = ""}
	wm_showRoom(actionData);
	
	//console.log(actionData);
	// logic to map each room
	if(mapping){
		room.Name = actionData.Name;
		room.Description = actionData.Description;
		room.ObviousExits = actionData.ObviousExits;
	}

	if(scripting && attacking === false && running === false && actionData.AlsoHereMobs.length > 0){
		sendMessageText("a " + actionData.AlsoHereMobs[0].Name);
		attacking = true;
		addMessageRaw(buildSpan(cga_light_green, "**BLORGEN'S AI ATTACK**") + "<br/>", false, true);
	} else if(scripting && attacking === true && actionData.AlsoHereMobs.length === 0){
		attacking = false;
	}

	if (actionData.VisibleItems && actionData.VisibleItems.length > 0) {
		for (var i = 0; i < actionData.VisibleItems.length; i++) {
			if(desired.indexOf(actionData.VisibleItems[i].Name) != -1){
				for(var k = 0; k < actionData.VisibleItems[i].Count; k++){
					sendMessageText("get " + actionData.VisibleItems[i].Name);
				}
			}
		}
	}
}


var wm_stat = window.stat;

window.stat = function(actionData) {
	wm_stat(actionData);
	statHTML = "";
	statHTML = buildSpan(cga_dark_green, "Name: ") + buildFormattedSpan(cga_dark_cyan, actionData.Name, 37, true) + buildSpan(cga_dark_green, "Lives/CP:") + buildFormattedSpan(cga_dark_cyan, String(actionData.Lives) + "/" + String(actionData.CP), 9, false) + "<br>";
	statHTML += buildSpan(cga_dark_green, "Race: ") + buildFormattedSpan(cga_dark_cyan, actionData.Race, 16, true) + buildSpan(cga_dark_green, "Exp: ") + buildFormattedSpan(cga_dark_cyan, String(actionData.Exp), 16, true) + buildSpan(cga_dark_green, "Perception:") + buildFormattedSpan(cga_dark_cyan, String(actionData.Perception), 7, false) + "<br>";
	statHTML += buildSpan(cga_dark_green, "Class: ") + buildFormattedSpan(cga_dark_cyan, actionData.Class, 15, true) + buildSpan(cga_dark_green, "Level: ") + buildFormattedSpan(cga_dark_cyan, String(actionData.Level), 14, true) + buildSpan(cga_dark_green, "Stealth:") + buildFormattedSpan(cga_dark_cyan, String(actionData.Stealth), 10, false) + "<br>";
	statHTML += buildSpan(cga_dark_green, "Hits:") + buildFormattedSpan(cga_dark_cyan, String(actionData.HP), 8, false) + buildSpan(cga_dark_cyan, "/") + buildFormattedSpan(cga_dark_cyan, String(actionData.MaxHP), 8, true) + buildSpan(cga_dark_green, "Armour Class:") + buildFormattedSpan(cga_dark_cyan, String(actionData.AC), 4, false) + buildSpan(cga_dark_cyan, "/") + buildFormattedSpan(cga_dark_cyan, String(actionData.DR), 3, true) + buildSpan(cga_dark_green, "Thievery:") + buildFormattedSpan(cga_dark_cyan, String(actionData.Thievery), 9, false) + "<br>";
	if (actionData.MaxMA > 0) {
		statHTML += buildSpan(cga_dark_green, "Mana:") + buildFormattedSpan(cga_dark_cyan, String(actionData.MA), 8, false) + buildSpan(cga_dark_cyan, "/") + buildFormattedSpan(cga_dark_cyan, String(actionData.MaxMA), 8, true) + buildSpan(cga_dark_green, "Spellcasting: ") + buildFormattedSpan(cga_dark_cyan, String(actionData.SC), 7, true);
	} else {
		statHTML += buildFormattedSpan(cga_dark_green, "", 43, true);
	}

	statHTML += buildSpan(cga_dark_green, "Traps:") + buildFormattedSpan(cga_dark_cyan, String(actionData.Traps), 12, false) + "<br>";
	statHTML += buildFormattedSpan(cga_dark_green, "", 43, true) + buildSpan(cga_dark_green, "Picklocks:") + buildFormattedSpan(cga_dark_cyan, String(actionData.Picklocks), 8, false) + "<br>";
	statHTML += buildSpan(cga_dark_green, "Strength:") + "&nbsp;&nbsp;" + buildFormattedSpan(cga_dark_cyan, String(actionData.Strength), 9, true) + buildSpan(cga_dark_green, "Agility: ") + buildFormattedSpan(cga_dark_cyan, String(actionData.Agility), 14, true) + buildSpan(cga_dark_green, "Tracking:") + buildFormattedSpan(cga_dark_cyan, String(actionData.Tracking), 9, false) + "<br>";
	statHTML += buildSpan(cga_dark_green, "Intellect: ") + buildFormattedSpan(cga_dark_cyan, String(actionData.Intellect), 9, true) + buildSpan(cga_dark_green, "Health:") + "&nbsp;&nbsp;" + buildFormattedSpan(cga_dark_cyan, String(actionData.Health), 14, true) + buildSpan(cga_dark_green, "Martial Arts:") + buildFormattedSpan(cga_dark_cyan, String(actionData.MartialArts), 5, false) + "<br>";
	statHTML += buildSpan(cga_dark_green, "Willpower: ") + buildFormattedSpan(cga_dark_cyan, String(actionData.Willpower), 9, true) + buildSpan(cga_dark_green, "Charm:") + "&nbsp;&nbsp;&nbsp;" + buildFormattedSpan(cga_dark_cyan, String(actionData.Charm), 14, true) + buildSpan(cga_dark_green, "MagicRes:") + buildFormattedSpan(cga_dark_cyan, String(actionData.MagicRes), 9, false) + "<br>";
	for (var i = 0; i < actionData.ActiveSpellDescriptions.length; i++) {
		statHTML += buildSpan(cga_light_grayHex, actionData.ActiveSpellDescriptions[i]) + '<br>';
	}
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
Paths["deepwood2brigands"] = {
		restRunDir : "",
		steps : "ne,ne,ne,e,se,e,e,ne,ne,ne,nw,nw,n,ne,ne,n,nw,n,nw,w,nw,n,ne,n,ne,e,se,ne,nw,ne,e,se,e,se,e,ne,e",
		run : function() {
			this.steps.split(",").forEach(function(direction){
				MoveClick(direction);
			});
		}
}

Paths["brigands2deepwood"] = {
		restRunDir : "",
		steps : "w,sw,w,nw,w,nw,w,sw,se,sw,nw,w,sw,s,sw,s,se,e,se,s,se,s,sw,sw,s,se,se,sw,sw,sw,w,w,nw,w,sw,sw,sw",
		run : function() {
			this.steps.split(",").forEach(function(direction){
				MoveClick(direction);
			});
		}
}

Paths["tanglewwod2deepwood"] = {
		restRunDir : "",
		steps : "s,se,ne,e,u,e,e,ne,ne,ne,e,ne,e,ne,e,se,e,ne,n,nw,n,ne,ne,ne,n,e,ne,ne,n,ne,ne,e,ne,se,se,e,se,se,sw,sw,sw",
		run : function() {
			this.steps.split(",").forEach(function(direction){
				MoveClick(direction);
			});
		}
}

Paths["deepwood2tanglewood"] = {
		restRunDir : "",
		steps : "ne,ne,ne,nw,nw,w,nw,nw,sw,w,sw,sw,s,sw,sw,w,s,sw,sw,sw,s,se,s,sw,w,nw,w,sw,w,sw,w,sw,sw,sw,w,w,d",
		run : function(){
			this.steps.split(",").forEach(function(direction){
				MoveClick(direction);
			});
		}
}

Paths["wolves2deepwood"] = {
		restRunDir : "",
		steps : "e,ne,e,se,e,se,s,sw,w,sw,s,sw,se,s,se,s,sw,se,s,sw,se,s,se,se,sw,sw,sw",
		run : function(){
			this.steps.split(",").forEach(function (direction){
				MoveClick(direction);
			});
		}
}

Paths["deepwood2wolves"] = {
		restRunDir : "",
		steps : "ne,ne,ne,nw,nw,n,nw,ne,n,nw,ne,n,nw,n,nw,ne,n,ne,e,ne,n,nw,w,nw,w,sw,w",
		run : function(){
			this.steps.split(",").forEach(function (direction){
				MoveClick(direction);
			});
		}
}

Paths["verdantbog2deepwood"] = {
		restRunDir : "",
		steps : "s,se,sw,s,sw,nw,n,n,nw,n,n,nw,n,n,n,nw,n,ne,n,ne,ne,n,n,ne,n,n,nw,w,nw,n,ne,n,n,n,n,ne,n,nw,w,nw,w,nw,w,n,nw,n,nw,n,nw,sw,n,nw,n,nw,ne,n,nw,n,n,n,nw,sw,sw,sw,w,w,nw,w,sw,sw,sw",
		run : function(){
			this.steps.split(",").forEach(function(direction){
				MoveClick(direction);
			});
		}
}

Paths["deepwood2verdantbog"] = {
		restRunDir : "",
		steps : Paths.verdantbog2deepwood.steps.split(',').reverse().toString(),
		run: function(){
			this.steps.split(',').forEach(function(direction){
				MoveClick(reverseDirection(direction));
			});
		}
}

Paths["southport2greenmarshes"] = {
		restRunDir : "",
		steps : "w,w,w,w,w,w,w,w,w,w,w,w,w,w,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,nw,nw,nw,n,w,w,nw,nw,n,n,n,n,ne,n,ne,n,d,nw,n,e,ne,d,ne,ne,n,n,ne,n,ne,n,ne,se,e",
		run : function(){this.steps.split(",").forEach(function(direction){
			MoveClick(direction);
		});
		}
}

Paths["greenmarshes2southport"] = {
		restRunDir : "",
		steps : Paths.southport2greenmarshes.steps.split(',').reverse().toString(),
		run : function(){this.steps.split(",").forEach(function(direction){
			MoveClick(reverseDirection(direction));
		});}
}

Paths["verdantbog2greenmarshes"] = {
		restRunDir : "",
		steps : "s,se,sw,s,sw,se,se,s,s,sw,sw,s,w,s,sw,w,sw,nw,w,sw,w,sw,w,nw,sw,w,nw,sw,w,nw,sw,s,sw,sw,s,sw,s,se,e",
		run : function(){
			this.steps.split(",").forEach(function(direction){
				MoveClick(direction);
			})}
}

Paths["greenmarshes2verdantbog"] = {
		restRunDir : "",
		steps  : Paths.verdantbog2greenmarshes.steps.split(',').reverse().toString(),
		run : function(){this.steps.split(",").forEach(function(direction){
			MoveClick(reverseDirection(direction));
		})}
}

Paths["greenmarshes2sivs"] = {
		restRunDir : "",
		steps : "se,e,n,e,ne,se,se,sw,s,sw,w,sw,s,w,nw,w,nw,",
		run : function(){this.steps.split(",").forEach(function(direction){
			MoveClick(direction);
		})}
}

Paths["sivs2greenmarshes"] = {
		restRunDir : "",
		steps : Paths.greenmarshes2sivs.steps.split(',').reverse().toString(),
		run : function(){
			this.steps.split(",").forEach(function(direction){
				MoveClick(reverseDirection(direction));
			})}
}

Paths["southport2sivs"] = {
		restRunDir : "",
		steps : "",
		run : function(){
			Paths.southport2greenmarshes.run();
			Paths.greenmarshes2sivs.run();
		}
}

Paths["sivs2southport"] = {
		restRunDir : "",
		steps : "",
		run : function(){
			Paths.sivs2greenmarshes.run();
			Paths.greenmarshes2southport.run();
		}
}

Paths["deepwood2sivs"] = {
		restRunDir : "",
		steps : "",
		run : function(){
			Paths.deepwood2verdantbog.run();
			Paths.verdantbog2greenmarshes.run();
			Paths.greenmarshes2sivs.run();
		}
}

Paths["deepwood2southport"] = {
		restRunDir : "",
		steps : "",
		run : function(){
			Paths.deepwood2verdantbog.run();
			Paths.verdantbog2greenmarshes.run();
			Paths.greenmarshes2southport.run();
		}
}

Paths["southport2deepwood"] = {
		restRunDir : "",
		steps : "",
		run : function(){ 
			Paths.southport2greenmarshes.run();
			Paths.greenmarshes2verdantbog.run();
			Paths.verdantbog2deepwood.run();
		}
}

Paths["verdantbog2ford"] = {
		restRunDir : "",
		steps : "s,se,sw,s,sw,se,se,s,s",
		run : function(){
			this.steps.split(",").forEach(function(direction){
				MoveClick(direction);
			})
		}
}

Paths["ford2treasuregolem"] = {
		restRunDir : "n",
		steps : "e,e,se,s,sw,s,s,sw,s,s,s,s,sw,s,se,se,e,se,e,se,se,e,se,ne,e,ne,n,se,e,ne,n,ne,n,ne,n,ne,n,d,e,se,se,d,e,e,e,e,e,n,e,n,d,se,e,e,d,n,w,s",
		run : function(){
			this.steps.split(",").forEach(function(direction){
				MoveClick(direction);
			})
		}
}

Paths["treasuregolem2ford"] = {
		restRunDir : "",
		steps : Paths.ford2treasuregolem.steps.split(',').reverse().toString(),
		run : function(){
			this.steps.split(",").forEach(function(direction){
				MoveClick(reverseDirection(direction));
			})
		}
}

Paths["ford2verdantbog"] = {
		restRunDir : "",
		steps : Paths.verdantbog2ford.steps.split(',').reverse().toString(),
		run : function(){
			this.steps.split(",").forEach(function(direction){
				MoveClick(reverseDirection(direction));
			})
		}
}

Paths["ford2southport"] = {
		restRunDir : "",
		steps : "s,s,se,s,s,sw,s,s,s,s,sw,s,s,s,se,se,s,s,se,s,s,s,sw,s,s,s,sw,s,se,s,s,s,s,sw,s,s,s,s,s,s,sw,sw,sw,s,s,s,s,s,s,s,s,s,s,s,s,s,s,w,u,w,w,w,n,n,u",
		run : function(){
			this.steps.split(",").forEach(function(direction){
				MoveClick(direction);
			})
		}
}

Paths["southport2ford"] = {
		restRunDir : "",
		steps : Paths.ford2southport.steps.split(",").reverse().toString(),
		run : function(){
			this.steps.split(",").forEach(function(direction){
				MoveClick(reverseDirection(direction));
			})
		}
}

Paths["bonemonstrosity2ford"] = {
		restRunDir : "",
		steps : "n,n,nw,s,s,s,sw,s,sw,s,ne,n,n,n,ne,n,n,n,nw,n,n,nw,nw,n,n,n,ne,n,n,n,n,ne,n,n,nw,n,n",
		run : function(){
			this.steps.split(",").forEach(function(direction){
				MoveClick(direction);
			})
		}
}

Paths["ford2bonemonstrosity"] = {
		restRunDir : "",
		steps : Paths.bonemonstrosity2ford.steps.split(",").reverse().toString(),
		run : function() {
			this.steps.split(",").forEach(function(direction){
				MoveClick(reverseDirection(direction));
			})
		}
}

Paths['ford2massivechuul'] = {
		restRunDir : "s",
		steps : "e,e,se,s,sw,s,s,sw,s,s,s,s,sw,s,se,se,e,se,s,se,se,se,e,se,e,ne,ne,se,ne,e,se,se,e,se,s,se,e,se,ne,nw,n",
		run : function(){
			this.steps.split(",").forEach(function(dir){
				MoveClick(dir);
			})
		}
}

Paths['massivechuul2ford'] = {
		restRunDir : "",
		steps : Paths['ford2massivechuul'].steps.split(',').reverse().toString(),
		run : function(){
			this.steps.split(",").forEach(function(dir){
				MoveClick(reverseDirection(dir));
			})
		}
}

Paths['ford2sunkenshrine'] = {
		restRunDir : "",
		steps : "e,e,se,s,sw,s,s,sw,s,s,s,s,sw,s,se,se,e,se,e,se,se,e,se,ne,e,ne,n,se,e,ne,n,ne,n,ne,n,ne,n,d",
		run : function(){
			this.steps.split(",").forEach(function(dir){
				MoveClick(dir);
			})
		}
}

Paths['sunkenshrine2ford'] = {
		restRunDir : "",
		steps : Paths['ford2sunkenshrine'].steps.split(",").reverse().toString(),
		run : function(){
			this.steps.split(",").forEach(function(dir){
				MoveClick(reverseDirection(dir));
			})
		}
}

Paths['sunkenshrine2magister'] = {
		restRunDir : "w,w,s",
		steps : "e,se,se,d,e,e,e,e,e,s,e,e",
		run : function(){
			this.steps.split(",").forEach(function(dir){
				MoveClick(dir);
			})
		}
}

Paths['magister2sunkenshrine'] = {
		restRunDir : "",
		steps : Paths['sunkenshrine2magister'].steps.split(",").reverse().toString(),
		run : function(){
			this.steps.split(",").forEach(function(dir){
				MoveClick(reverseDirection(dir));
			})
		}
}

Paths['sunkenshrine2prophet'] = {
		restRunDir : "e,e",
		steps : "e,ne,ne,d,e,e,e,e,e,s,s,w,u,w,w,w",
		run : function(){
			this.steps.split(",").forEach(function(dir){
				MoveClick(dir);
			})
		}
}

Paths['prophet2sunkenshrine'] = {
		restRunDir : "",
		steps : Paths['sunkenshrine2prophet'].steps.split(",").reverse().toString(),
		run : function(){
			this.steps.split(",").forEach(function(dir){
				MoveClick(reverseDirection(dir));
			})
		}
}

Paths['sunkenshrine2fallen'] = {
		restRunDir : "s",
		steps : "e,ne,ne,d,e,e,e,e,e,s,e,d,ne,e,n,n",
		run : function(){
			this.steps.split(",").forEach(function(dir){
				MoveClick(dir);
			})
		}
}

Paths['fallen2sunkenshrine'] = {
		restRunDir : "",
		steps : Paths['sunkenshrine2fallen'].steps.split(",").reverse().toString(),
		run : function(){
			this.steps.split(",").forEach(function(dir){
				MoveClick(reverseDirection(dir));
			})
		}
}

Paths['sunkenshrine2corpseslime'] = {
		restRunDir : "nw",
		steps : "e,se,se,d,e,e,e,e,e,n,e,n,d,se,e,s,se",
		run : function(){
			this.steps.split(",").forEach(function(dir){
				MoveClick(dir);
			})
		}
}

Paths['corpseslime2sunkenshrine'] = {
		restRunDir : "nw",
		steps : Paths['sunkenshrine2corpseslime'].steps.split(",").reverse().toString(),
		run : function(){
			this.steps.split(",").forEach(function(dir){
				MoveClick(reverseDirection(dir));
			})
		}
}

Paths['stonewood2trainer'] = {
		restRunDir : "",
		steps : "d,ne,ne,ne,e,se,ne,e,ne,ne,w,ne,n,e,ne,e,ne,n,ne,e,se,se,ne,e,ne,n,ne,nw,ne,se,e,s,e,ne,n,se,e,nw,ne,ne,se,e,se,ne,se,e,se,u,e,e,ne,ne,ne,e,ne,e,ne,e,se,e,ne,n,nw,n,ne,ne,ne,n,e,ne,ne,n,ne,ne,e,ne,se,se,e,se,se,sw,sw,sw,s",
		run : function(){
			this.steps.split(",").forEach(function(dir){
				MoveClick(dir);
			})
		}
}

Paths['trainer2stonewood'] = {
		restRunDir : "",
		steps : Paths['stonewood2trainer'].steps.split(",").reverse().toString(),
		run : function(){
			this.steps.split(",").forEach(function(dir){
				MoveClick(reverseDirection(dir));
			})
		}
}

Paths['dryad2trainer'] = {
		restRunDir : "",
		steps : "n,ne,n,ne,ne,n,ne,e,se,se,ne,e,ne,n,ne,nw,ne,se,e,s,e,ne,n,se,e,nw,ne,ne,se,e,se,ne,se,e,se,u,e,e,ne,ne,ne,e,ne,e,ne,e,se,e,ne,n,nw,n,ne,ne,ne,n,e,ne,ne,n,ne,ne,e,ne,se,se,e,se,se,sw,sw,sw,s",
		run : function(){
			this.steps.split(",").forEach(function(dir){
				MoveClick(dir);
			})
		}
}

Paths['trainer2dryad'] = {
		restRunDir : "",
		steps : Paths['dryad2trainer'].steps.split(",").reverse().toString(),
		run : function(){
			this.steps.split(",").forEach(function(dir){
				MoveClick(reverseDirection(dir));
			})
		}
}

Paths['stonewood2faunus'] = {
		restRunDir : "ne,n,se",
		steps : "sw,sw,s,se,e,s,sw,s,sw,s,se,s,se,s,s,se,sw,s,sw,w,nw,ne,nw,nw,s,se",
		run : function(){
			this.steps.split(",").forEach(function(dir){
				MoveClick(dir);
			})
		}
}

Paths['faunus2stonewood'] = {
		restRunDir : "",
		steps : Paths['stonewood2faunus'].steps.split(",").reverse().toString(),
		run : function(){
			this.steps.split(",").forEach(function(dir){
				MoveClick(reverseDirection(dir));
			})
		}
}

Paths['thelras2stonewood'] = {
		restRunDir : "",
		steps : "w,nw,d,w,sw,nw,d,n,nw,sw,w,nw,w,ne,ne",
		run : function(){
			this.steps.split(",").forEach(function(dir){
				MoveClick(dir);
			})
		}
}

Paths['stonewood2thelras'] = {
		restRunDir : "w",
		steps : Paths['thelras2stonewood'].steps.split(",").reverse().toString(),
		run : function(){
			this.steps.split(",").forEach(function(dir){
				MoveClick(reverseDirection(dir));
			})
		}
}

Paths['ford2sivwarchief'] = {
		restRunDir : "n,nw,w",
		steps : "e,e,se,e,ne,ne,ne,ne,e,ne,n,se,e,se,se,s,se,e,ne,ne,nw,n,n,w,w,w,n,ne,e,e,se,s",
		run : function(){
			this.steps.split(",").forEach(function(dir){
				MoveClick(dir);
			})
		}
}

Paths['sivwarchief2ford'] = {
		restRunDir : "",
		steps : Paths['ford2sivwarchief'].steps.split(",").reverse().toString(),
		run : function(){
			this.steps.split(",").forEach(function(dir){
				MoveClick(reverseDirection(dir));
			})
		}
}

Paths['stonewood2harpy'] = {
		restRunDir : "",
		steps : "sw,sw,s,se,e,se,e,se,se,se,e,se,e,ne,e,ne,e,se,u,se,s,s,nw,n",
		run : function(){
			this.steps.split(",").forEach(function(dir){
				MoveClick(dir);
			})
		}
}

Paths['harpy2stonewood'] = {
		restRunDir : "",
		steps : Paths['stonewood2harpy'].steps.split(",").reverse().toString(),
		run : function(){
			this.steps.split(",").forEach(function(dir){
				MoveClick(reverseDirection(dir));
			})
		}
}

Paths['stonewood2gnarledancient'] = {
		restRunDir : "",
		steps : "sw,sw,s,se,e,s,sw,s,sw,s,se,d,s,sw,w,sw,w,sw,s,sw,w,sw,s,sw,se,e,ne",
		run : function(){
			this.steps.split(",").forEach(function(dir){
				MoveClick(dir);
			})
		}
}

Paths['gnarledancient2stonewood'] = {
		restrunDir : "",
		steps : Paths['stonewood2gnarledancient'].steps.split(",").reverse().toString(),
		run : function(){
			this.steps.split(",").forEach(function(dir){
				MoveClick(reverseDirection(dir));
			})
		}
}

Paths['southporttrainer2deepwoodtrainer'] = {
		restRunDir : "",
		steps : "n,w,w,w,w,s,s,s,s,s,w,w,w,w,w,w,w,w,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,nw,nw,nw,n,w,w,nw,nw,n,n,n,n,ne,n,ne,n,d,nw,n,e,ne,d,ne,ne,n,n,ne,n,ne,n,ne,n,ne,n,ne,ne,n,ne,se,e,ne,se,se,e,ne,e,ne,e,se,ne,e,ne,n,e,n,ne,ne,nw,nw,nw,n,n,n,n,nw,n,n,nw,n,n,n,nw,n,ne,n,ne,ne,n,n,ne,n,n,nw,w,nw,n,ne,n,n,n,n,ne,ne,n,n,ne,ne,n,n,n,ne,n,ne,n,n,n,n,nw,n,nw,nw,n,n,n,ne,n,n,ne,n,w,w,nw,w,sw,w,sw,s,se,sw,w,sw,sw,nw,w,sw,w,sw,w,w,sw,sw,sw,se,s,sw,s,sw,ne,n,ne,n,nw,w,w,nw,w,sw,sw,sw,s",
		run : function(){
			this.steps.split(",").forEach(function(dir){
				MoveClick(dir);
			})
		}
}

Paths['deepwoodtrainer2southporttrainer'] = {
		restRunDir : "",
		steps : Paths['southporttrainer2deepwoodtrainer'].steps.split(",").reverse().toString(),
		run : function(){
			this.steps.split(",").forEach(function(dir){
				MoveClick(reverseDirection(dir));
			})
		}
}

Paths['deepwood2ruggedhighland'] = {
		restRunDir : "",
		steps : "ne,ne,ne,nw,nw,w,nw,nw,nw,w,nw,w,nw,w,sw,w,nw,nw,ne,nw,n,ne,ne,ne,e,ne,w,nw,nw,n,n,ne,ne,ne,e,ne,e,ne,e,se,e,e,ne,e,e,se,e,se,se,e,ne,ne,u,n,ne,e,ne,u,e,e,u,ne",
		run : function(){
			this.steps.split(",").forEach(function(dir){
				MoveClick(dir);
			})
		}
}

Paths['ruggedhighland2deepwood'] = {
		restRunDir : "",
		steps : Paths['deepwood2ruggedhighland'].steps.split(',').reverse().toString(),
		run : function(){
			this.steps.split(",").forEach(function(dir){
				MoveClick(reverseDirection(dir));
			})
		}
}

function setDesiredItems(items){
	if(items != ""){
		items.split(",").forEach(function(item){
			if(desired.indexOf(item) === -1){
				desired.push(item);
				$("#itemList").append("<li class='items' onclick='removeDesiredItem(&quot;" + escapeHtml(item) + "&quot;)'>" + item + "</li>")
			}
		});
	}
}

function removeDesiredItem(item){
	if (item != ""){
		if(desired.indexOf(item) > -1){
			desired.splice(desired.indexOf(item), 1);
			$(".items").filter(function() { return $(this).html() == item; } ).remove();
		}
	}
}


function UpdateRunRestDir() {
	var UnformattedDirection = ($("#RunDirection").val()); //Grabs Textbox Contents.

	preRestCommand = $("#preRestCommand").val();
	postRestCommand = $("#postRestCommand").val();
	RestMaxPercent = (parseInt($("#RestMax").val()));
	RestMinPercent = (parseInt($("#RestMin").val()));
	restBelowMAPercent = parseInt($("#restBelowMA").val());
	restMaxMAPercent = parseInt($("#restMaxMA").val())
	if (RestMaxPercent > 100) {RestMaxPercent=100}
	if (RestMaxPercent < 1) {RestMaxPercent=1}
	if (RestMinPercent < 1) {RestMinPercent=1}
	if (RestMinPercent > 100) {RestMinPercent=100}
	if (RestMinPercent > RestMaxPercent) {RestMinPercent = RestMaxPercent}
	if (restBelowMAPercent > 100) {restBelowMAPercent=100}
	if (restMaxMAPercent < 1) {restMaxMAPercent=1}
	if (restBelowMAPercent < 1) {restBelowMAPercent=1}
	if (restMaxMAPercent > 100) {restMaxMAPercent=100}
	if (restBelowMAPercent > restMaxMAPercent) {restBelowMAPercent = restMaxMAPercent}


	$('#RestMax').val(RestMaxPercent);
	$('#RestMin').val(RestMinPercent);
	$("#restBelowMA").val(restBelowMAPercent);
	$("#restMaxMA").val(restMaxMAPercent);

	scriptRunDirection = UnformattedDirection.toLowerCase(); //Converts the text to lowercase and stores it in the variable "PathTriggerCmd"
	$("#mainScreen").append("<span style='color: cyan'>You will now run: </span><span style='color: yellow'>" + scriptRunDirection + "," + "<span style='color: cyan'> before resting.</span><br />");
	$("#mainScreen").append("<span style='color: cyan'>You will now rest if below: </span><span style='color: red'>" + RestMinPercent + "% " + "<span style='color: cyan'>of your total HP.</span><br />");
	$("#mainScreen").append("<span style='color: cyan'>You will now rest until reaching: </span><span style='color: green'>" + RestMaxPercent + "% " + "<span style='color: cyan'>of your total HP.</span><br />");
	preRestCommand === "" ? "" : $("#mainScreen").append("<span style='color: cyan'>You will : </span><span style='color: yellow'>" + preRestCommand + "</span>" + "<span style='color: cyan'> before resting.</span><br />");
	postRestCommand === "" ? "" : $("#mainScreen").append("<span style='color: cyan'>You will : </span><span style='color: yellow'>" + postRestCommand + "</span>" + "<span style='color: cyan'> after resting.</span><br />");
	sendMessageDirect("");
}

function setRestMinMax(min,max){
	$('#RestMax').val(max);
	$('#RestMin').val(min);
}

function setRunDir(dir){
	$("#RunDirection").val(dir);
}

function setPrePostRest(pre,post){
	$("#preRestCommand").val(pre);
	$("#postRestCommand").val(post);
}

function UpdateHealBuffValues(){
	buffSelfSpell = $("#buffSelfSpell").val();
	buffInterval = parseInt($("#buffInterval").val());
	minorHealBelowPercent = parseInt($("#minorHealBelow").val());
	majorHealBelowPercent = parseInt($("#majorHealBelow").val());
	minorHealSelfSpell = $("#minorHealSpell").val();
	majorHealSelfSpell = $("#majorHealSpell").val();
	healManaAbove = parseInt($("#healManaAbove").val());

	if (buffInterval < 1000){buffInterval = 1000;}
	if (buff != undefined) {clearInterval(buff); buff = undefined;}
	if (scripting && buff == undefined && buffSelfSpell != undefined && buffSelfSpell != ""){
		buff = setInterval(function(){sendMessageText(buffSelfSpell); sendMessageDirect("");},buffInterval);
	}
	if (minorHealBelowPercent > 100) {minorHealBelowPercent=100}
	if (minorHealBelowPercent < 1) {minorHealBelowPercent=1}
	if (healManaAbove < 1) {healManaAbove = 1}
	if (healManaAbove > 100) {healManaAbove = 100}
	if (majorHealBelowPercent < 1) {majorHealBelowPercent=1}
	if (majorHealBelowPercent > 100) {majorHealBelowPercent=100}
	if (majorHealBelowPercent > minorHealBelowPercent) {majorHealBelowPercent = minorHealBelowPercent}

	$("#healManaAbove").val(healManaAbove);
	$("#minorHealSpell").val(minorHealSelfSpell);
	$("#majorHealSpell").val(majorHealSelfSpell);
	$("#minorHealBelow").val(minorHealBelowPercent);
	$("#majorHealBelow").val(majorHealBelowPercent);

	minorHealSelfSpell === "" ? "" : $("#mainScreen").append("<span style='color: cyan'>You will now cast <span style='color:yellow;'>" + minorHealSelfSpell + "</span> if below: </span><span style='color: red'>" + minorHealBelowPercent + "% " + "<span style='color: cyan'>of your total HP.</span><br />");
	majorHealSelfSpell === "" ? "" : $("#mainScreen").append("<span style='color: cyan'>You will now cast <span style='color:yellow;'>" + majorHealSelfSpell + "</span> if below: </span><span style='color: red'>" + majorHealBelowPercent + "% " + "<span style='color: cyan'>of your total HP.</span><br />");
	if (minorHealSelfSpell != "" || majorHealSelfSpell != "") {$("#mainScreen").append("<span style='color: cyan'>You will now heal if Mana is above: </span><span style='color: red'>" + healManaAbove + "% " + "<span style='color: cyan'>of your total MA.</span><br />");}
	buffSelfSpell === "" ? "" : $("#mainScreen").append("<span style='color: cyan'>You will now cast <span style='color:yellow;'>" + buffSelfSpell + "</span> every: </span><span style='color: red'>" + buffInterval/1000 + "<span style='color: cyan'> seconds.</span><br />");
	sendMessageDirect("");
}

function setBuff(interval,spell){
	$("#buffSelfSpell").val(spell);
	$("#buffInterval").val(interval);
}

function setMinorHeal(percent,spell){
	$("#minorHealSpell").val(spell);
	$("#minorHealBelow").val(percent);
}

function setMajorHeal(percent,spell){
	$("#majorHealSpell").val(spell);
	$("#majorHealBelow").val(percent);
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
	scripting = $("#EnableScripting").prop("checked");
	if (scripting)   {
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
	$("#divMainPanel").html($("#divMainPanel").children())
	$('#chkEnableAI').remove();

//	add the new stuff
	$('<div id="divControls" class="panel col-xs-6 col-sm-6 col-md-3 col-lg-3" style="float:left; height:32em; width:21em;"><div style="width:100%"><span>AI: <input type="checkbox" id="chkEnableAI" value="Enable AI"> | </span><span>Scripting: <input type="checkbox" id="EnableScripting" onclick="ScriptingToggle()"> | </span><span>Scroll to Bottom: <input id="scrollToBottom" type="checkbox" checked="true"></div><div style="float:left;width:100%" class="input-group-sm"><input type="text" class="form-control" style="width:100%;max-width:750px;display:inline-block" id="message" autocomplete="false" autocorrect="false"><input type="button" class="btn" style="width:80px;height:30px;padding:0;" id="sendmessage" value="Send" onclick="sendMessage();"></div><div id="commandBtns" style="width:100%; padding:1em 0 0 0; float:left;"><input type="button" class="btn" style="width:7em; height:2em; padding:0;" id="conversationsBtn" value="Conversations" onclick="openConvo()"><input type="button" class="btn" style="width:5em; height:2em; padding:0;" id="statsBtn" value="Stats" onclick="statsWindowOpen()"><input type="button" class="btn" style="width:5em; height:2em; padding:0;" id="mapButton" value="Map" onclick="openMapScreen()"><input type="button" class="btn" style="width:7em; height:2em; padding:0;" id="expButton" value="Reset Exp/h" onclick="ResetExpPH()"><input type="button" value="Tools" id="tools" style="width:5em; height:2em; padding:0;" class="btn" onclick="ToolsButton()"></div></div><div id="progressMonitors" style="float:left; width:21em;"><div style="float:left; width:100%; padding:0 0 0 1em;"><label id="ExpPerHour">0 Exp/h | Approx. Infinity hours to level</label></div><div id="hpContainer" style="width:100%; float:left; height:1.5em;"><div style="text-align:center;width:10%;font-weight:200; float:left;">HP:</div><div class="progress" style="width:90%"><div class="progress-bar" style="width: 100%; background-color: rgb(230, 46, 0);"><span id="hp">151 / 151</span></div></div></div><div id="maContainer" style="width:100%; float:left; height:1.5em;"><div style="text-align:center;width:10%;font-weight:200; float:left;">MA:</div><div class="progress" style="width:90%;"><div class="progress-bar" style="width:100%; background-color:#3366ff;"><span id="ma">3 / 3</span></div></div></div><div id="expContainer" style="width:100%;float:left; height:1.5em;"><div style="text-align:center;width:10%;font-weight:200; float:left;">EXP:</div><div class="progress" style="width:90%;"><div class="progress-bar" style="width: 83%; background-color: rgb(0, 179, 0);"><span id="exp">0</span></div></div></div></div>').insertAfter("#mainScreen");
	$("#commandBtns").prepend('<span id="version" style="width:100%; float:left; font-size:smaller;">Blorgen\'s script v' + version + '</span>')

//  move settings link to a button in command buttons
	$("a").filter(':contains("Settings")').html("<input type='button' value='AI Settings' class='btn' style='width:6em; height:2em; padding:0;'>").appendTo("#commandBtns");
	
//  scroll window to top of div
	$('html, body').animate({
        scrollTop: $('#mainScreen').offset().top - 52
    }, 'slow');
	
	$('<div style="width:100%;"> \
			<!-- Nav tabs --> \
			<ul class="nav nav-tabs" role="tablist"> \
			<li role="presentation" class="active"><a href="#home" aria-controls="home" role="tab" data-toggle="tab" style="padding:.2em .2em .2em .2em">Move</a></li> \
			<li role="presentation"><a href="#profile" aria-controls="profile" role="tab" data-toggle="tab" style="padding:.2em .2em .2em .2em">Rest</a></li> \
			<li role="presentation"><a href="#messages" aria-controls="messages" role="tab" data-toggle="tab" style="padding:.2em .2em .2em .2em">Heal/Buff</a></li> \
			<li role="presentation"><a href="#settings" aria-controls="settings" role="tab" data-toggle="tab" style="padding:.2em .2em .2em .2em">Items</a></li> \
			</ul> \
			\
			<!-- Tab panes --> \
			<div class="tab-content"> \
			<div role="tabpanel" class="tab-pane active" id="home"><select id="PathDropDown" style="width:100%" onchange="PathDropDownSelection()"><option selected="" value="base">Paths and Commands</option></select><div id="movement1" style="width:100%; float:left; padding:2em 0 0 3em"><input type="button" id="MoveNW" value="nw" onclick="MoveClick(value)" style="width:3em; height:3em; padding:0;" class="btn"><input type="button" id="MoveN" value="n" onclick="MoveClick(value)" style="width:3em; height:3em; padding:0;" class="btn"><input type="button" id="MoveNE" value="ne" onclick="MoveClick(value)" style="width:3em; height:3em; padding:0;" class="btn"><div id="movement2" style="width:20%; float:right; padding:0 5em 0 0;"><input type="button" id="MoveUP" value="u" onclick="MoveClick(value)" style="width:3em; height:3em; padding:0;" class="btn"><br><input type="button" id="MoveDOWN" value="d" onclick="MoveClick(value)" style="width:3em; height:3em; padding:0;" class="btn"></div><br><input type="button" id="MoveW" value="w" onclick="MoveClick(value)" style="width:3em; height:3em; padding:0;" class="btn"><input type="button" id="MoveRest" value="Rest" onclick="MoveClick(value)" style="width:3em; height:3em; padding:0;" class="btn"><input type="button" id="MoveE" value="e" onclick="MoveClick(value)" style="width:3em; height:3em; padding:0;" class="btn"><br><input type="button" id="MoveSW" value="sw" onclick="MoveClick(value)" style="width:3em; height:3em; padding:0;" class="btn"><input type="button" id="MoveS" value="s" onclick="MoveClick(value)" style="width:3em; height:3em; padding:0;" class="btn"><input type="button" id="MoveSE" value="se" onclick="MoveClick(value)" style="width:3em; height:3em; padding:0;" class="btn"></div> \
			</div> \
			<div role="tabpanel" class="tab-pane" id="profile"><div id="MoveRest" style="float:left; width:100%; padding:1em 0 0 0;"><span style="display:block;">Rest Below: <input type="number" size="1" id="RestMin" value=' + RestMinPercent + ' min="1" max="100" onchange="FixRestPercent()" style="text-align:center; width: 3em;">% HP</span><span>Max: <input type="number" size="1" id="RestMax" value=' + RestMaxPercent + ' min="1" max="100" onchange="FixRestPercent()" style="text-align:center; width: 3em;">% HP</span><span style="margin-left:2em;">Run Dir: <input type="text" size="7" id="RunDirection" value=' + scriptRunDirection +'></span><span style="display:block;">Rest Below: <input type="text" style="width: 3em;" id="restBelowMAPercent" value=' + restBelowMAPercent +'>% MA</span><span style="display:block;">Rest To: <input type="text" style="width: 3em;" id="restMaxMAPercent" value=' + restMaxMAPercent +'>% MA</span><span style="display:block;">Pre Rest: <input type="text" id="preRestCommand" value=' + preRestCommand +'></span><span style="display:block;">Post Rest: <input type="text" id="postRestCommand" value=' + postRestCommand +'></span><span><input type="submit" value="UPDATE" onclick="UpdateRunRestDir()" class="btn" style="height:2em; padding:0;"></span></div> \
			</div> \
			<div role="tabpanel" class="tab-pane" id="messages"><div id="HealBuff" style="float:left; width:100%; padding:1em 0 0 0;"><span style="display:block; ">Minor Heal Below: <input type="text" id="minorHealBelow" value="' + minorHealBelowPercent + '" style="width:3em;"></input>% HP</span><span style="display:block;">Minor Heal Self Spell: <input type="text" id="minorHealSpell" value="' + minorHealSelfSpell + '" style="width:5em;"></input></span><span style="display:block; ">Major Heal Below: <input type="text" id="majorHealBelow" value="' + majorHealBelowPercent + '" style="width:3em;"></input>% HP</span><span style="display:block; ">Major Heal Self Spell: <input type="text" id="majorHealSpell" value="' + majorHealSelfSpell + '" style="width:5em;"></input></span><span style="display:block; ">Heal while Mana above: <input type="text" id="healManaAbove" value="' + healManaAbove + '" style="width:4em;"></input>%</span><span style="display:block; ">Buff spell: <input type="text" id="buffSelfSpell" value="' + buffSelfSpell + '" style="width:5em;"></input></span><span style="display:block; ">Buff interval (msecs): <input type="text" id="buffInterval" value="' + buffInterval + '" style="width:5em;"></input></span></div><span><input type="submit" value="UPDATE" onclick="UpdateHealBuffValues()" class="btn" style="height:2em; padding:0;"></span></div> \
			<div role="tabpanel" class="tab-pane" id="settings"><div id="Items" style="float:left; width:100%; padding:1em 0 0 0;"><ul id="itemList"> </ul></div><div><input type="text" id="addItem" /><input type="button" onclick="setDesiredItems($(&quot;#addItem&quot;).val()); $(&quot;#addItem&quot;).val(&quot;&quot;)" value="Add" /></div></div> \
			</div> \
			\
	</div>').insertAfter("#commandBtns");

	$('<span style="display:block;">Move after combat?: <input type="checkbox" onclick="moveOnKill = !moveOnKill;"></span><span display:block;>MAC Timeout: <input type="number" style="width:5em" id="macTimeout" value="' + macTimeout + '" onchange="macTimeout = $(&quot;#macTimeout&quot;).val()"/></span>').insertBefore($("#RestMin").parent());
	$('<span style="float:left;">Set Run Dir?: <input type="checkbox" onclick="shouldSetRunDir = !shouldSetRunDir;"></span>').insertAfter($("#PathDropDown"));

	var thePaths = [];
	for (var key in Paths) {
		if (Paths.hasOwnProperty(key)) {
			thePaths.push("#"+key);
		}
	}

	$("#message").bind('input', function() {
		var UnformattedTrigger = ($("#message").val()); //Grabs Textbox Contents.
		var PathTriggerCmd = UnformattedTrigger.toLowerCase(); //Converts the text to lowercase and stores it in the variable "PathTriggerCmd"

		var inArrayVal = $.inArray(PathTriggerCmd, thePaths);


		if(inArrayVal != -1){
			$("#message").val("");
			running = true;
			var pathCmd = Paths[PathTriggerCmd.split("#")[1]];
			pathCmd.run();
			if(shouldSetRunDir){
				oldRunDirection = $("#RunDirection").val();
				setRunDir(pathCmd.restRunDir);
				scriptRunDirection = pathCmd.restRunDir;
				$("#mainScreen").append("<span style='color: cyan'>You will now run: </span><span style='color: yellow'>" + scriptRunDirection + "," + "<span style='color: cyan'> before resting.</span><br />");
			}
			running = false;
			sendMessageDirect("");
		} else if(PathTriggerCmd === "#menu"){
			$("#message").val("");
			$("#mainScreen").append("<br /><span style='color: orange'>******************************************************************************</span><br />");
			$("#mainScreen").append("<span style='color: #EDAFDE; >Available Commands:</span><br /><br /><span style='color: #EDC9AF'>" + thePaths + "<br /></span>");
			$("#mainScreen").append("<br /><span style='color: orange'>******************************************************************************</span><br /><br />");
			sendMessageDirect("");
		} else if(PathTriggerCmd === "#set brief"){
			$("#message").val("");
			brief = !brief;
		}
	});

	//DROP DOWN PATHS
	var select = document.getElementById("PathDropDown");

	for(var i = 0; i < thePaths.length; i++) {
		var opt = thePaths[i];
		var el = document.createElement("option");
		el.textContent = opt;
		el.value = opt;
		select.appendChild(el);
	}

//	removes existing bars
	$('.vertical').remove();

//	executes the backscroll refresh every second
	var tid = setInterval(RefreshBackScroll,1000);

//	if you click on the main screen will activate the input box
	$('#mainScreen').click(function() {
		$('#message').focus();
	});

	$("#mainScreen").hover(function(){
		$('body').css('overflow', 'hidden');
	},function(){
		$('body').css('overflow', 'scroll');
	});

//	didn't work as hoped
//	window.onfocus = function(){
//	$('#message').focus();
//	};


	// moved players list to top bar
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
			if($("#scrollToBottom").prop("checked")){
				var objDiv = document.getElementById("mainScreen");
				objDiv.scrollTop = objDiv.scrollHeight;
			}
		}
	}
} else if(window.location.pathname === "/Characters/Game"){
	playerName = $(document).attr('title').split(" ")[0];

//	watches the main screen and culls the DIV children when gets to 5000 (assuming not needing to scroll back too far)
//	also watches the HP attribute for changes and if the percent is < 20 or >= 100 moves and rests;
	var count = 1;
	var firstRun = true;
	ConfigureUI();
	ConfigureObserver();
}

function ConfigureObserver(){
	observer = new MutationObserver(function(mutations){

		if (firstRun){
			ConfigurePlayer();
//			this is the only way I have found to get exp sent from the server. This gets the exp bar going.
			sendMessageText("exp");

			// enables scripting
			$("#EnableScripting").click();
			firstRun = false;
		}
		// remove children entities from mud screen
//		if($("#mainScreen").children().length > 5000){
//		$("#mainScreen").children().remove(":lt(3000)");
//		}

		// healing logic - currently working on
		if(hpPercent >= minorHealBelowPercent || maPercent < healManaAbove){
			if(healInterval != undefined){
				clearInterval(healInterval);
			}
			minorHeal = false;
			majorHeal = false;
			healInterval = undefined;
		} else if(hpPercent < majorHealBelowPercent && majorHealSelfSpell != "" && maPercent > healManaAbove){
//			console.log("in Major heal");
			if(healInterval && majorHeal === false && minorHeal === true){
				clearInterval(healInterval);
				minorHeal = false;
				healInterval = undefined;
			} 
			if(healInterval === undefined && majorHeal != true && maPercent > healManaAbove){
				majorHeal = true;
				if(!attacking){
					healInterval = setInterval(function(){
						sendMessageText(majorHealSelfSpell);
						sendMessageDirect("");
					},4000);
				}
			}
		} else if(hpPercent < minorHealBelowPercent && minorHealSelfSpell != "" && maPercent > healManaAbove) {
//			console.log("in Minor heal");
			if(healInterval != undefined && minorHeal === false && majorHeal === true){
				majorHeal = false;
				clearInterval(healInterval);
				healInterval = undefined;
			}
			if(healInterval === undefined && minorHeal != true){
				minorHeal = true;
				healInterval = setInterval(function(){
					sendMessageText(minorHealSelfSpell);
					sendMessageDirect("");
				},4000);
			}
		}


		// resting logic
		if(hpPercent <= RestMinPercent || (maPercent < restBelowMAPercent ? restMana = true : restMana = false)){
			if(maPercent < restBelowMAPercent){
				restMana = true;
			}
			if(resting == false && count == 1 && (scripting)) {
				running = true;
				RunOut();
				if(preRestCommand != undefined && preRestCommand != ""){
					for(var i = 0; i < preRestCommand.split(",").length; i++){
						sendMessageText(preRestCommand.split(",")[i]);
					}
				}
				sendMessageText("rest");
				count -= 1;
			}

		} else if((hpPercent >= RestMaxPercent && restMana === false) || (maPercent >= restMaxMAPercent && restMana)){
			if(count == 0) {
				if(postRestCommand != undefined && postRestCommand != ""){
					for(var i = 0; i < postRestCommand.split(",").length; i++){
						sendMessageText(postRestCommand.split(",")[i]);
					}
				}
				RunIn();
				running = false;
				sendMessageDirect("");
				count += 1;
			}
		}
	});
	var options = {"childList":true};
	observer.observe($("#mainScreen")[0],options);
	options = {"attributes":true};
	observer.observe($("#hp").parent()[0],options);
}

//run methods
function RunIn(){
	var reverse = scriptRunDirection.split(",").reverse();
	for(var i = 0; i < reverse.length; i++){
		MoveClick(reverseDirection(reverse[i]));
	}
}

function RunOut(){
	for(var i = 0; i < scriptRunDirection.split(",").length; i++){
		MoveClick(scriptRunDirection.split(",")[i]);
	}
}


//sets up player/s upon starting game
function ConfigurePlayer(){
	switch (playerName){
	case "Blorgen": {
		//move & rest: comma separated, start room is fighting room
		setRunDir("w");
		setRestMinMax(40,100);
		setPrePostRest("wear coprolite, wear silver-runed, wear marshwood","wear polished onyx, wear heavy gold, wear serpent");

		//healing
		setMinorHeal(80,"mend");
//		setMajorHeal(percent,spell);

		// buffing
//		setBuff(interval,spell);

		//items to get
//		setDesiredItems("ornate falchion,bone dust");

		break;
	}
	case "Bjorgen": {
		//move & rest: comma separated, start room is fighting room
		setRunDir("w");
		setRestMinMax(40,100);
		setPrePostRest("wear marshwood","wear serpent");

		//healing
		setMinorHeal(80,"mahe");
//		setMajorHeal(percent,spell);

		// buffing
		setBuff(240000,"hshi");

		//items to get
//		setDesiredItems("bone dust,ornate falchion");

		break;
	}
	case "Charma": {
		setRunDir("s");
		setRestMinMax(40,97);
		setPrePostRest("wear coprolite","wear polished onyx")
		break;
	}
	}

	UpdateRunRestDir();
	UpdateHealBuffValues();
}
