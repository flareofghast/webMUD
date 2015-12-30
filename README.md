# Blorgen's WebMUD UI and Script

Use webmud-UI.js. Will be the latest version of my code.
updated to incorporate Chupon's UI components.
Thanks to Cyrix and Chupon for their input to help create this.

------------------------------------
 * Blorgen's - Alternate UI and Script
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
 *
 * Version 1.7
 *
 * Auto-get Items!! (Working on UI)
 * fixed bug where Send button didn't send.
 *
 * Version 1.6
 *
 * changed some overrides so as to not mess with Vitoc's code
 * configure player at end of code;
 *
 * Version 1.5
 * 
 * compatible with latest changes
 *
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