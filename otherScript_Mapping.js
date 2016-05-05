/*global $:true playerID:true sendMessageDirect:true resting:true
         meditating:true
*/


'use strict';

/*****************************************************************************\
| Form injection code, uses jquery                                            |
\*****************************************************************************/

//Add some elements so the user can select paths and options
$("<div id='pathAndLoop' class='panel col-xs-12 col-lg-8' style='padding:10px;float:left;margin-bottom:10px'>\
    <div class='panel col-xs-12 col-lg-6' style='padding:10px;float:left;margin-bottom:10px'>\
      <div id='roomSelect' class='panel col-xs-12 col-lg-12' style='padding:10px;float:left;margin-bottom:10px'>\
        <p>Pathing and Looping - Old style: Select a starting and ending room then choose Walk or Run</p>\
        <p>Starting Room / Loop</p>\
        Group: <select id='startGroupSelect' onchange=\"groupSelected('startGroupSelect','startPathSelect')\" style='width:250px;'></select>\
        <br />Room: <select id='startPathSelect' onchange='displayPath()' style='width:250px;'></select>\
        <br /><br /><p>Ending Room (n/a for loops)</p>\
        Group: <select id='endGroupSelect' onchange=\"groupSelected('endGroupSelect','endPathSelect')\" style='width:250px;'></select>\
        <br />Room: <select id='endPathSelect' onchange='displayPath()' style='width:250px;'></select>\
      </div>\
      <div id='pathControls' class='panel col-xs-12 col-lg-12' style='padding:10px;clear:left;margin-bottom:10px'>\
        <button id='pathWalk' class='btn btn-default' onclick=\"lookupPathAndMove('startPathSelect','endPathSelect','stepDelay',false,false)\">Walk</button>\
        <button id='pathRun'class='btn btn-default' onclick=\"lookupPathAndMove('startPathSelect','endPathSelect','stepDelay',true,false)\">Run</button>\
        <button class='btn btn-danger' onclick=\"stopWalking('now')\">STOP!</button>\
        <br />\
        <button id='pathLoop'class='btn btn-default' onclick=\"lookupPathAndMove('startPathSelect','endPathSelect','stepDelay',false,true)\">Loop</button>\
        <button class='btn btn-danger' onclick=\"stopWalking('end of loop')\">End Loop</button>\
        <br />Fine tune step delay (ms):\
        <input type='number' id='stepDelay' name = 'stepDelay' min='1' value='2500' style='width:60px;'/>\
      </div>\
    </div>\
    <div class='panel col-xs-12 col-lg-6' style='padding:10px;float:left;margin-bottom:10px'>\
      <div id='divAutoPath' class='panel col-xs-12 col-lg-12' style='padding:10px;float:left;margin-bottom:10px'>\
        <p>AutoMap Path, Select Destination \
        <a href='#' id='editAutoRooms' data-toggle='modal' data-target='#mapEdit'>(edit rooms)</a>\</p>\
        Group: <select id='autoGroup' onchange=\"autoGroupSelected('autoGroup', 'autoRoom', false)\" onfocus=\"autoGroupSelected('autoGroup', 'autoRoom', false)\" style='width:250px;'></select>\
        <br />Room: <select id='autoRoom' onchange='displayAutoPath()' onfocus='displayAutoPath()' style='width:250px;'></select>\
        <br />\
        <br />\
        <button id='autoMapWalk' class='btn btn-default'>Walk</button>\
        <button id='autoMapRun' class='btn btn-default'>Run</button>\
      </div>\
      <div id='autoCommands' class='panel col-xs-12 col-lg-12' style='padding:10px;clear:left;margin-bottom:10px'>\
        <p>Auto Commands</p>\
        <p>Enter a command and frequency below. Seperate multiple commands with a comma. Toggle sending on/off with the checkbox.</p>\
        <p>Send auto commands:\
          <input type='checkbox' id='sendAutoCmds' onchange=\"autoCmdCheck('autoCmd','autoCmdDelay','sendAutoCmds')\")/>\
        </p>\
        <p>Command(s):\
          <input type='text' id='autoCmd' style='width:200px' value='' />\
        </p>\
        <p>Delay (sec):\
          <input type='number' id='autoCmdDelay' name = 'autoCmdDelay' min='1' value='6' style='width:50px;'/>\
        </p>\
      </div>\
    </div>\
</div>\
<div id='Path Management' class='panel col-xs-12 col-lg-8' style='padding:10px;float:left;margin-bottom:10px'>\
  <div id='pathCreate' class='panel col-xs-12 col-lg-6' style='padding:10px;float:left;margin-bottom:10px'>\
    <p>Path and Loop Creation</p>\
    <p>Create a new path/loop by filling in the boxes below. Spaces will be removed.</p>\
    <p>Starting room / Loop name:\
      <input type='text' id='startingRoom' style='width:150px;' value='Start_Room_Name' />\
    </p>\
    <p>Ending room (n/a for loops):\
      <input type='text' id='endingRoom' style='width:150px;' value='End_Room_Name' />\
    </p>\
    <p>Enter the steps for the path below, seperated by commas (n,s,e,w,ne,se,sw,nw,u,d):\
      <br /><textarea id='newPath' rows='5' cols='40'></textarea>\
    </p>\
    <p>\
      <button class='btn btn-default' onclick=\"newPath('CustomPaths_','path')\">Save Path</button>\
      <button class='btn btn-default' onclick=\"newPath('CustomPaths_','loop')\">Save Loop</button>\
      <button type='button' class='btn btn-success' style='float:right' data-toggle='modal' data-target='#importExportDialog'>Import/Export</button>\
    </p>\
  </div>\
  <div id='pathGrouping' class='panel col-xs-12 col-lg-6' style='padding:10px;float:left;margin-bottom:10px'>\
    <p>Path grouping</p>\
    <p>Select a group from the dropdown box and add/remove paths. Note, paths are grouped based on the starting room.</p>\
    <p>Select Group:&nbsp&nbsp\
      <select id='groupingGroupSelect' class='groupSelect' onchange=\"groupSelected('groupingGroupSelect','groupingCurPathSelect')\" style='width:225px;'></select>\
    </p>\
    <p>Current paths:&nbsp\
      <select id='groupingCurPathSelect' style='width:225px;'></select>\
    </p>\
    <p>All Paths:&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp\
      <select id='groupingAllPathSelect' class='pathSelect' style='width:225px;'></select>\
    </p>\
    <p>\
      <button class='btn btn-default' onclick=\"editGroup('add')\">Add Path</button>\
      <button class='btn btn-default' onclick=\"editGroup('remove')\">Remove Path</button>\
      <button class='btn btn-danger' onclick=\"deleteSelectedPath('CustomPaths_','groupingAllPathSelect','pathGroups_')\">Delete Path</button>\
    </p>\
    <p>\
      <button class='btn btn-success' onclick=\"editGroup('new')\">New Group</button>\
      <button class='btn btn-danger' onclick=\"editGroup('delete')\">Delete Group</button>\
    </p>\
  </div>\
</div>\
").insertAfter('#divExpTimer');

//Div for addon status
$("<div id='addonStatus'>\
  <p>Addon Status: <label id=\"addonStatusText\"></label></p>\
</div>").insertAfter('#mainScreen');

//Modal dialog for path import/export
$("<div id='importExportDialog' class='modal fade' tabindex='-1' role='dialog' aria-labelledby='pathImportExport'>\
  <div class='modal-dialog'>\
    <div class='modal-content'>\
      <div class='modal-header'>\
        <button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button>\
        <h4 class='modal-title'>Path Import and Export Tools</h4>\
      </div>\
      <div class='modal-body'>\
        <p style='font-size:12px'>The following buttons and box will let you import and export paths. Special formatting is required for import so be careful when using this ability and only paste paths from a known good source.  To import, paste a single, group, or mass path list into the box and click Import. For export, use the single, group, or all buttons. Single will export only the currently selected path, Group will export all paths in the selected group, and All will export all paths/groups.</p>\
        Group: <select id='exportGroupSelect' class='groupSelect'></select><br />\
        Path: <select id='exportPathSelect' class='pathSelect'></select><br />\
        <textarea id='pathImportExport' rows='5' cols='70' style='max-width:550px'></textarea>\
      </div>\
      <div class='modal-footer'>\
        <div style='margin:0 auto'>\
          <button type='button' id='importPath' class='btn btn-success' data-dismiss='modal' style='float:left'>Import</button>\
        </div>\
        <div style='margin:0 auto; width:40%'>\
          <button type='button' id='exportSingle' class='btn btn-primary' style='float:left'>Single</button>\
          <button type='button' id='exportGroup' class='btn btn-primary' style='float:left'>Group</button>\
          <button type='button' id='exportAll' class='btn btn-primary' style='float:left'>All</button>\
        </div>\
        <div style='margin:0 auto'>\
          <button type='button' id='clearAllPaths' class='btn btn-danger'>Clear All Paths</button>\
          <button type='button' class='btn btn-danger' data-dismiss='modal'>Close</button>\
        </div>\
      </div>\
    </div>\
  </div>\
</div>").insertAfter('#divCharacterSetup');

//Map window
$("<div id='divMap' class='panel col-xs-12 col-lg-4' style='padding:10px;float:left;margin-bottom:10px'>\
  <canvas id='mapCanvas' height='200' width='280'>Browser doesn't support canvas</canvas>\
  <div id='canvasControls' style='float:right'>\
    <a href='#' id='resetMap'>Reset</a><br />\
    <a href='#' id='mapImpExp' data-toggle='modal' data-target='#mapImpExpModal'>Im/Export</a><br />\
    <a href='#' class='button' id='downloadMap'>Download</a><br />\
    <a href='#' id='configMap' data-toggle='modal' data-target='#mapOptions'>Configure</a>\
  </div>\
</div>").insertAfter('#divHealth');

//Mapping option modal
$("<div class='modal fade' id='mapOptions' data-backdrop='false' tabindex='-1' role='dialog' aria-labelledby='mapOptions' aria-hidden='true' style='top:10%;right:0%;left:auto;bottom:auto;'>\
      <div class='modal-dialog modal-sm'>\
        <div class='modal-content'>\
          <div class='modal-header'>\
            <button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button>\
            <h4 class='modal-title'>Configure the map</h4>\
          </div>\
          <div class='modal-body'>\
            Rooms to draw: <input type='text' id='mapSize' style='width:150px;' value='1000' />\
            <br />\
            Room size (pixels): <input type='text' id='roomSize' style='width:150px;' value='10' />\
          </div>\
          <div class='modal-footer'>\
            <button type='button' id='applyMapOptions' class='btn btn-success'>Apply</button>\
            <button type='button' class='btn btn-danger' data-dismiss='modal'>Close</button>\
          </div>\
        </div>\
      </div>\
    </div>"
).insertAfter('#divCharacterSetup');

//Mapping room edit modal
$("<div class='modal fade' id='mapEdit' data-backdrop='false' tabindex='-1' role='dialog' aria-labelledby='mapEdit'>\
    <div class='modal-dialog'>\
      <div class='modal-content'>\
        <div class='modal-header'>\
          <button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button>\
          <h4 class='modal-title'>Edit Auto Map Rooms</h4>\
        </div>\
        <div class='modal-body'>\
          <p>Edit the <b>current room</b> (already loaded) or select a different room using the dropdowns below. \
          Only unique rooms are shown other than the current room. Room commands should be seperated by a comma.\
          <p>Select a group: <select id='mapGroupSel' onchange=\"autoGroupSelected('mapGroupSel', 'mapRoomSel', true)\" style='width:300px;'></select>\
          <br />Select a room:&nbsp&nbsp<select id='mapRoomSel' onchange=\"mapRoomSelected()\" onfocus=\"mapRoomSelected()\" style='width:300px;'></select></p>\
          <p>Id: <input type='text' id='mapId' style='width:300px;' disabled /></p>\
          <p>Name: <input type='text' id='mapName' style='width:300px;' disabled /></p>\
          <p>Alt Name: <input type='text' id='mapAltName' style='width:300px;' /></p>\
          <p>Group: <input type='text' id='mapGroup' style='width:300px;' /></p>\
          <p>Room Commands: <input type='text' id='mapCmd' style='width:300px;' /></p>\
          <p>Unlisted: <input type='checkbox' id='mapUnlisted'></p>\
        </div>\
        <div class='modal-footer'>\
          <button type='button' id='applyMapEdits' class='btn btn-success'>Save</button>\
          <button type='button' class='btn btn-danger' data-dismiss='modal'>Close</button>\
        </div>\
      </div>\
    </div>\
  </div> \
").insertAfter('#divCharacterSetup');

//Mapping export modal
$("<div class='modal fade' id='mapImpExpModal' data-backdrop='false' tabindex='-1' role='dialog' aria-labelledby='mapImpExpModal'>\
    <div class='modal-dialog'>\
      <div class='modal-content'>\
        <div class='modal-header'>\
          <button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button>\
          <h4 class='modal-title'>Import/Export Auto Map Rooms</h4>\
        </div>\
        <div class='modal-body'>\
          <p>Use the buttons below to import and export the map. If you're importing, \
          make sure to only use a good source because formatting is very important.</p>\
          <br /><br />\
          <textarea id='mapImpExpText' rows='5' cols='70' style='max-width:550px'></textarea>\
        </div>\
        <div class='modal-footer'>\
          <button type='button' id='importMap' class='btn btn-success' style='float:left'>Import Map</button>\
          <button type='button' id='exportMap' class='btn btn-success' style='float:left'>Export Map</button>\
          <button type='button' class='btn btn-danger' data-dismiss='modal'>Close</button>\
        </div>\
      </div>\
    </div>\
  </div> \
").insertAfter('#divCharacterSetup');

//Constants used across many functions
const START_PATH_SELECT_ID = 'startPathSelect';
const END_PATH_SELECT_ID = 'endPathSelect';
const START_GROUP_SELECT_ID = 'startGroupSelect';
const END_GROUP_SELECT_ID = 'endGroupSelect';
const PATH_LIST = 'CustomPaths_';
const GROUP_LIST = 'pathGroups_';
const DB_NAME = 'webmud_addon';
const DB_VERSION = 2;

//Global variables used to manage player state
let inCombat = false;
let playerMoving = false;
let playerResting = false;
let aiRunning = false;
let stopWalkingFlag = '';
let sendAutoCmds = false;
let lastSwingTime = Date.now();
let combatEndTime = Date.now();
let partyInfo;
let curPlayer;
let map;
let movedFrom = {};
let ctx;
let map_size = 1000;
let room_size = 10;
let db;
let curRoomID;


/*****************************************************************************\
| Classes                                                                     |
\*****************************************************************************/

class Player {
  constructor(id, friends, settings) {
    this._id = id;

    if (friends) {
      this._friends = friends;
    } else {
      this._friends = [];
    }

    this._settings = {
      'curPaths':{'startGroup':'_All_Paths', 'endGroup':'_All_Paths',
                  'startPath':'', 'endPath':''},
      'stepDelay':2500,
      'autoCmds':{'commands':'', 'delay':6, 'enabled':false}
    };

    if (settings) {
      if (settings.curPaths) {
        this._settings.curPaths = settings.curPaths;
      }

      if (settings.stepDelay) {
        this._settings.stepDelay = settings.stepDelay;
      }

      if (settings.autoCmds) {
        this._settings.autoCmds = settings.autoCmds;
      }
    }
  }

  savePlayer() {
    localStorage.setItem(this._id, JSON.stringify(this));
  }

  addFriend(friend) {
    this._friends.push(friend);

    this.savePlayer();
  }

  removeFriend(enemy) {
    let i = this._friends.length;
    while (i--) {
      if (this._friends[i] === enemy) {
        this._friends.splice(i,1);
      }
    }
  }

  isFriend(name) {
    if (this._friends.indexOf(name) !== -1) {
      return true;
    } else {
      return false;
    }
  }

  updateSettings() {
    //selected paths
    this._settings.curPaths.startGroup = document.getElementById(START_GROUP_SELECT_ID).value;
    this._settings.curPaths.endGroup = document.getElementById(END_GROUP_SELECT_ID).value;
    this._settings.curPaths.startPath = document.getElementById(START_PATH_SELECT_ID).value;
    this._settings.curPaths.endPath = document.getElementById(END_PATH_SELECT_ID).value;

    //step delay
    this._settings.stepDelay = document.getElementById('stepDelay').value;

    //auto command settings
    this._settings.autoCmds.commands = document.getElementById('autoCmd').value;
    this._settings.autoCmds.delay = document.getElementById('autoCmdDelay').value;
    this._settings.autoCmds.enabled = document.getElementById('sendAutoCmds').checked;

    this.savePlayer();
  }

  loadSettings() {
    //selected groups
    selectIfExists(this._settings.curPaths.startGroup, START_GROUP_SELECT_ID);
    selectIfExists(this._settings.curPaths.endGroup, END_GROUP_SELECT_ID);
    //reload selectors after selecting grops so paths are available
    reloadSelectors();
    //selected paths
    selectIfExists(this._settings.curPaths.startPath, START_PATH_SELECT_ID);
    selectIfExists(this._settings.curPaths.endPath, END_PATH_SELECT_ID);

    //step delay
    document.getElementById('stepDelay').value = this._settings.stepDelay;

    //auto commands
    document.getElementById('autoCmd').value = this._settings.autoCmds.commands;
    document.getElementById('autoCmdDelay').value = this._settings.autoCmds.delay;
    document.getElementById('sendAutoCmds').checked = this._settings.autoCmds.enabled;
  }
}

class GameMap {
  constructor(roomStore, currentRoom) {
    this._roomStore = roomStore;

    if (currentRoom) {
      this._currentRoom = currentRoom;
    } else {
      this._currentRoom = {};
    }

    this.export = false;

    this._rooms = [];
  }

  move(movedFrom, actionData) {
    //let txn = db.transaction(['rooms'], 'readwrite');
    //let store = txn.objectStore('rooms');
    let data = Object.assign({}, actionData);
    let movingFrom = Object.assign({}, movedFrom);
    let movingTo;
    let prevRoom;

    //get the new room from the database, if it exists
    getRoom(movingFrom.id)
      .then(function(result) {
        prevRoom = result;
        return getRoom(actionData.RoomID);
      })
      .then(function(result) {
        movingTo = result;
        return Promise.resolve();
      })
      .then(function() {
        if (!movingTo) {
          return addRoom(data);
        } else {
          return Promise.resolve(movingTo);
        }
      })
      .then(function(result) {
        movingTo = result;

        if (prevRoom.exits[movingFrom.dir] === -1) {
          prevRoom.exits[movingFrom.dir] = movingTo.id;
        }

        if (movingTo.exits[oppositeDir(movingFrom.dir)] === -1) {
          movingTo.exits[oppositeDir(movingFrom.dir)] = movingFrom.id;
        }

        updateRoom(prevRoom)
          .then(function() { return updateRoom(movingTo); })
          .then(function() {
            return Promise.resolve(map.drawMap(ctx, room_size, map_size, actionData.RoomID));
          });
      })
      .catch(function(err) {
        console.error(err);
      });
  }

  draw(ctx, roomSize, drawSize, currentRoomID) {
    let x = (ctx.canvas.width / 2) - (roomSize / 2);
    let y = (ctx.canvas.height / 2) - (roomSize / 2);
    let roomQueue  = [];
    let roomsToDraw = drawSize;
    let drawn = [];

    let lookup = {};
    let len = this._rooms.length;

    for (let i = 0; i < len; i++) {
      lookup[this._rooms[i].id] = this._rooms[i];
    }

    //clear the canvas
    ctx.beginPath();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    roomQueue.push({
      'id':currentRoomID,
      'position':[x,y]
    });

    //the current room is drawn to the center of the canvas as a start
    //position.  It also gets special formatting
    ctx.rect(x, y, roomSize, roomSize);
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'greenyellow';
    ctx.fill();
    ctx.stroke();

    //add it to the drawn array so it won't be redrawn
    drawn.push(currentRoomID);

    //reset the fill style
    ctx.fillStyle = 'black';

    let i = 0;
    while ( (roomQueue.length > 0) && (i < roomsToDraw) ) {
      x = roomQueue[0].position[0];
      y = roomQueue[0].position[1];
      let parentId = roomQueue[0].id;

      //loop through each of the room's exits
      for (let exit in lookup[parentId].exits) {
        //variables for the connector and room x y coordinates
        let scx = x;
        let scy = y;
        let ecx = x;
        let ecy = y;
        let rx = x;
        let ry = y;

        let exitId = lookup[parentId].exits[exit];

        //set stroke for the default connector
        ctx.strokeStyle = 'white';

        //determine the x y coordinates for the draw based on direction
        switch (exit) {
          case 'n':
            scx = x + (roomSize / 2);
            ecx = scx;
            ecy = y - roomSize;
            ry = y - (roomSize * 2);
            break;

          case 's':
            scx = x + (roomSize / 2);
            ecx = scx;
            scy = y + roomSize;
            ecy = y + (roomSize * 2);
            ry = y + (roomSize * 2);
            break;

          case 'e':
            scx = x + roomSize;
            ecx = x + (roomSize * 2);
            scy = y + (roomSize / 2);
            ecy = scy;
            rx = x + (roomSize * 2);
            break;

          case 'w':
            ecx = x - roomSize;
            scy = y + (roomSize / 2);
            ecy = scy;
            rx = x - (roomSize * 2);
            break;

          case 'ne':
            scx = x + roomSize;
            ecx = x + (roomSize * 2);
            ecy = y - roomSize;
            rx = x + (roomSize * 2);
            ry = y - (roomSize * 2);
            break;

          case 'se':
            scx = x + roomSize;
            ecx = x + (roomSize * 2);
            scy = y + roomSize;
            ecy = y + (roomSize * 2);
            rx = x + (roomSize * 2);
            ry = y + (roomSize * 2);
            break;

          case 'nw':
            ecx = x - roomSize;
            ecy = y - roomSize;
            rx = x - (roomSize * 2);
            ry = y - (roomSize * 2);
            break;

          case 'sw':
            ecx = x - roomSize;
            scy = y + roomSize;
            ecy = y + (roomSize * 2);
            rx = x - (roomSize * 2);
            ry = y + (roomSize * 2);
            break;

          case 'u':
            ctx.strokeStyle = 'orange';
            break;

          case 'd':
            ctx.strokeStyle = 'orange';
            break;

          default:

        }

        //draw connector
        ctx.beginPath();
        ctx.moveTo(scx,scy);
        ctx.lineTo(ecx,ecy);
        ctx.stroke();

        if (lookup[parentId].exits[exit] !== -1) {
          //draw room

          if (exitId === currentRoomID) {
            ctx.fillStyle = 'greenyellow';
          } else {
            ctx.fillStyle = 'black';
          }

          //give orange border if the rooms has an up or down exit
          let exitCheck = lookup[exitId].exits;
          if ( exitCheck.hasOwnProperty('u') || exitCheck.hasOwnProperty('d') ) {

            ctx.strokeStyle = 'orange';
          } else {
            ctx.strokeStyle = 'white';
          }
          
          lookup[exitId].top = ry + (roomSize/2);
          lookup[exitId].bottom = ry - (roomSize/2);
          lookup[exitId].left = rx - (roomSize/2);
          lookup[exitId].right = rx + (roomSize/2);
          
//          console.log(lookup[exitId]);
          
          ctx.rect(rx, ry, roomSize, roomSize);
          ctx.fill();
          ctx.stroke();

          //add connected room to the drawing queue except if it's an exit
          //that changes z plane or if it's already been drawn
          if ( !(exit === 'u' || exit === 'd') &&
              drawn.indexOf(lookup[parentId].exits[exit]) === -1 ) {

            roomQueue.push({
              'id':exitId,
              'position':[rx,ry]
            });
          }

        }

        //add it to the drawn array so it won't be redrawn
        if (exitId !== -1) {
          drawn.push(exitId);
        }
      }  //end for exits loop

      //remove the completed room from the queue for the next loop
      roomQueue.shift();
      i++;

    }  //end for roomsToDraw loop
  }  //end draw method

  drawMap(ctx, roomSize, drawSize, currentRoomID) {
    let txn = db.transaction(['rooms'], 'readonly');
    let store = txn.objectStore('rooms');

    store.getAll().onsuccess = function(event) {
      this._rooms = event.target.result;

      this.draw(ctx, roomSize, drawSize, currentRoomID);

      //export the map if the user requested it
      if (map.export) {
        let downloadLink = document.getElementById('downloadMap');
        downloadLink.href = ctx.canvas.toDataURL('image/png');
        downloadLink.download = 'WebMud_Map.png';
        window.open(downloadLink.href);
        this.export = false;
      }
    }.bind(this);
  }


}  //end Map class

class Room {
  constructor(id, name, exits, altName, group, commands, unlisted) {
    this.id = id;
    this.name = name;
    this.exits = exits;
    this.left = 0.0;
    this.right = 0.0;
    this.bottom = 0.0;
    this.top = 0.0;

    if (altName) {
      this.altName = altName;
    } else {
      this.altName = null;
    }

    if (group) {
      this.group = group;
    } else {
      this.group = null;
    }

    if (commands) {
      this.commands = commands;
    } else {
      this.commands = null;
    }

    if (unlisted) {
      this.unlisted = unlisted;
    } else {
      unlisted = false;
    }
  }
}

/*****************************************************************************\
| Initialization code (self invoked)                                          |
\*****************************************************************************/

(function() {
  //used to load all of the initial data stored in localStorage
  let custPaths = localStorage.getItem(PATH_LIST);
  let groupList = localStorage.getItem(GROUP_LIST);

  //Save a starter path list if none currently exists
  if (custPaths === null) {
    storePath(PATH_LIST,'');
    custPaths = localStorage.getItem(PATH_LIST);
  }
  //Save a starter group list if none currently exists
  if (groupList === null) {
    storePath(GROUP_LIST,'_All_Paths');
  }

  //Overwrite the _All_Paths group with the current list of all paths
  //from localStorage.
  storePath('_All_Paths',custPaths);

  //load the selectors
  reloadSelectors();

  //create the player object
  let storedPlayer = JSON.parse(localStorage.getItem(playerID));

  if (storedPlayer) {
    curPlayer = new Player(playerID, storedPlayer._friends, storedPlayer._settings);
  } else {
    curPlayer = new Player(playerID);
  }

  //load the player's saved settings
  curPlayer.loadSettings();

  //start or stop auto commands after loading preferences
  autoCmdCheck('autoCmd','autoCmdDelay','sendAutoCmds');

  //open the database
  openDatabase();

  //alert the player that the addon loaded successfully
  notifyPlayer('yellow','WebMUD addon successfully loaded');

})();


/*****************************************************************************\
| Path walking / looping code                                                 |
\*****************************************************************************/

function lookupPathAndMove(startSelectId, endSelectId, delaySelectId, runPath, loopPath) {
  let start = document.getElementById(startSelectId).value;
  let end = document.getElementById(endSelectId).value;
  let stepDelay = document.getElementById(delaySelectId).value;

  //make sure the stopWalkingFlag is blank to start
  stopWalkingFlag = '';

  if (loopPath) {
    if (start.slice(0,5) !== 'loop_') {
      window.alert('In order to loop, you must select a loop as the starting \
                    room. Loops begin with \"loop\" and can be created with the \
                    \"Save Loop\" button under \"Path and Loop Creation\"');

    } else {
      let path = localStorage.getItem(start);
      //start the path
      walkPath(path, stepDelay, loopPath, start);
      //tell the player
      notifyPlayer('greenyellow', 'Looping of ' + start + ' started.');

    }

  } else {
    //for not loops, find the shortest path and build the step string
    let path = findPath(start, end);

    if (path) {
      let steps = buildPath(path);

      //if the player want to run (no combat), disable AI combat
      if (runPath) {
        sendMessageDirect('DisableAI Combat');
        document.getElementById('chkAICombat').checked = false;
      }

      //start the path
      walkPath(steps, stepDelay, loopPath, path.split(',').join(' => '));
      //tell the player
      notifyPlayer('greenyellow', 'Walking path: ' + path.split(',').join(' => '));

    } else {
      let displayString = 'ERROR: No path found between ' + start + ' and ' + end;
      window.alert(displayString);
    }
  }

  //save the player's current settings
  curPlayer.updateSettings();
}

function walkPath(path, stepDelay, loopPath, selectedPath) {
  let pathArray = path.split(',');
  let genObj = genFunc(pathArray);

  //disable movement buttons to prevent multiple clicks
  toggleMoveButtons(false);

  let interval = setInterval(() => {
    //The following if statement checks a bunch of boolians so I use 'not' logic
    //which lets me keep the line short
    if (
        !(inCombat || playerMoving || resting || meditating || aiRunning) &&
        ((combatEndTime + 1000) < Date.now())
      ) {

      //get the next step
      let val = genObj.next();

      //if the path is done
      if (val.done || stopWalkingFlag === 'now') {
        //stop the timed interval since the path is done
        clearInterval(interval);
        //enable the movement buttons
        toggleMoveButtons(true);

        if (!loopPath && stopWalkingFlag !== 'now') {
          //reverse the selected start/end group and path for quality of life
          switchPathSelection();
        }

        //Determine the reason or stopping and notify the player
        if (loopPath && stopWalkingFlag === '') {
          //if the player wants to loop, recall the function using the
          //same conditions
          notifyPlayer('greenyellow', 'Loop Complete, re-looping ' + selectedPath);

          walkPath(path, stepDelay, loopPath, selectedPath);

        } else if (stopWalkingFlag === 'now') {
          //if the player asked to stop now, stop and alert them
          genObj = null;  //reset the generator
          notifyPlayer('red', 'WALKING/LOOPING STOPPED NOW!');
          stopWalkingFlag = '';

        } else if (stopWalkingFlag === 'end of loop') {
          //if the player was looping but wanted to stop at the end of the
          //current loop, stop and let them know the current loop is done
          notifyPlayer('yellow', 'STOPPED: end of current loop');
          stopWalkingFlag = '';

        } else {
          //send a message to player telling them the path is complete
          notifyPlayer('lime', 'Path complete, you have arrived');
          stopWalkingFlag = '';
          //re-enable combat in case the user was running the path
        }

        //re-enable combat if it was disabled for a run
        if (document.getElementById('chkAICombat').checked === false) {
          sendMessageDirect('EnableAI Combat');
          document.getElementById('chkAICombat').checked = true;
        }

        //save the player's current settings
        curPlayer.updateSettings();

      } else {
        //Send the next step
        sendMessageDirect(val.value[0]);

        //update the player
        if (loopPath) {
          if (stopWalkingFlag === 'end of loop') {
            notifyPlayer('greenyellow', 'Stopping at end of current loop (' + selectedPath + '): ' +
                          val.value[1] + ' steps left');
          } else {
            notifyPlayer('greenyellow', 'Looping ' + selectedPath + ' (' +
                          val.value[1] + ' steps left)');
          }

        } else {
          notifyPlayer('greenyellow', 'Walking path (' + val.value[1] +
                      ' steps left): ' + selectedPath);
        }

      }
    } else {
      //check for combat inactivity where combat is set to true but a swing
      //hasn't happened for a least 10000 miliseconds (10 seconds)
      if (inCombat === true && (lastSwingTime + 10000) < Date.now()) {
        inCombat = false;
        //reset swing timer so combat doesn't disable right away
        lastSwingTime = (Date.now() + 10000);
      }

      //failsafe for when the AI doesn't properly break after resting
      if ( (resting || meditating) && playerResting === false ) {
        sendMessageDirect('break');
      }
      /*
      //failsafe for when the AI doesn't properly break after party running
      if (aiRunning) {
        let memberResting = false;
        sendMessageDirect('par');
        //check to see if any of the party members are resting
        for (let member of partyInfo) {
          if (member.HPPercent < 100 || memberResting) {
            memberResting = true;
          }
        }
        aiRunning = memberResting;
      }
      */
    }
  }, stepDelay);
}

function* genFunc(passedArr) {
  let Arr = passedArr;
  let i = Arr.length;

  for(let item of Arr) {
    yield [item, --i];
  }
}

function stopWalking(whenToStop) {
  stopWalkingFlag = whenToStop;

  notifyPlayer('yellow', 'Stop walking selected, will stop walking: ' + whenToStop);
}

function switchPathSelection() {
  let curStartGroup = document.getElementById(START_GROUP_SELECT_ID).value;
  let curEndGroup = document.getElementById(END_GROUP_SELECT_ID).value;
  let curStartRoom = document.getElementById(START_PATH_SELECT_ID).value;
  let curEndRoom = document.getElementById(END_PATH_SELECT_ID).value;

  //swap the groups start <> end
  selectIfExists(curStartGroup, END_GROUP_SELECT_ID);
  selectIfExists(curEndGroup, START_GROUP_SELECT_ID);
  //reload selectors so paths are available
  reloadSelectors();
  //swap the paths start <> end
  selectIfExists(curStartRoom, END_PATH_SELECT_ID);
  selectIfExists(curEndRoom, START_PATH_SELECT_ID);

}

/*****************************************************************************\
| Path creation code                                                          |
\*****************************************************************************/

function newPath(pathList, pathType) {
  let custPaths = localStorage.getItem(pathList);
  let startingRoom = removeSpaces(document.getElementById('startingRoom').value);
  let endingRoom = removeSpaces(document.getElementById('endingRoom').value);

  //Get the path from the text box then remove extra spaces
  let newPath = document.getElementById('newPath').value.split(',');

  for (let i = 0; i < newPath.length; i++) {
    newPath[i] = newPath[i].trim();
  }
  //rejoin the array back into a string so we can store the path
  newPath = newPath.join(',');

  if (pathType === 'path') {
    let newPathName = startingRoom + '__2__' + endingRoom;
    let newPathNameReverse = endingRoom + '__2__' + startingRoom;
    let newPathReverse = reversePath(newPath);

    custPaths = custPaths + ',' + newPathName + ',' + newPathNameReverse;
    storePath(pathList, custPaths);
    storePath(newPathName, newPath);
    storePath(newPathNameReverse, newPathReverse);

  } else if (pathType === 'loop') {

    let newLoopName = 'loop_' + startingRoom;

    custPaths = custPaths + ',' + newLoopName;
    storePath(pathList, custPaths);
    storePath(newLoopName, newPath);
  }

  //clear the boxes for the next path
  document.getElementById('startingRoom').value = '';
  document.getElementById('endingRoom').value = '';
  document.getElementById('newPath').value = '';

  //Update the _All_Paths group
  storePath('_All_Paths', custPaths);

  //reload selectors with the new paths
  reloadSelectors();


  //alert the user that the path saved successfully
  notifyPlayer('yellow', 'New path/loop saved');
}

/*****************************************************************************\
| Path tools                                                                  |
\*****************************************************************************/

function deleteSelectedPath(pathList, pathSelectId, groupList) {
  let pathToDelete = document.getElementById(pathSelectId).value;
  let groupListArray = localStorage.getItem(groupList).split(',');

  let playerConfirm = window.confirm('Are you sure you want to delete ' + pathToDelete + '?');

  if (playerConfirm) {
    removePathFromGroups(pathList, pathToDelete);

    //loop through all groups and remove the path if found
    groupListArray.forEach(function(group) {
      removePathFromGroups(group, pathToDelete);
    });

    //delete the associated path from local storage
    localStorage.removeItem(pathToDelete);

    //reload the path list
    reloadSelectors();

    //notify the player
    notifyPlayer('red','Path ' + pathToDelete + ' successfully deleted');
  }
}

function removePathFromGroups(pathList, pathToDelete) {
  let custPaths = localStorage.getItem(pathList);
  let custPathsArray = custPaths.split(',');
  let i = custPathsArray.length;
  let startingLength = custPathsArray.length;

  //Loop through the array and remove the selected path
  while (i--){
    if (custPathsArray[i] === pathToDelete) {
      custPathsArray.splice(i,1);
    }
  }

  //put the array back together into a string
  custPaths = custPathsArray.join(',');

  //if the new array is shorter than the original, meaning a path was deleted
  //then write it to local storage
  if (custPathsArray.length < startingLength) {
    storePath(pathList, custPaths);
  }
}

function getPathsToImport(pathList, groupList) {
  let importConfirm = window.confirm('Are you sure you want to import the \
  paths from the textbox below?');

  if (importConfirm) {
    let pathImportList = document.getElementById('pathImportExport').value;
    importPaths(pathList, groupList, pathImportList);
  }

  //clear the import box
  document.getElementById('pathImportExport').value = '';
}

function importPaths(pathList, groupList, pathsToImport) {
  let pathsToImportArray = pathsToImport.split(';');
  let currentPaths = localStorage.getItem(pathList);
  let currentGroups = localStorage.getItem(groupList);
  let currentPathsArray = currentPaths.split(',');
  let currentGroupsArray = currentGroups.split(',');
  let processGroups = false;

  pathsToImportArray.forEach(function(path) {
    if (path === '__STARTING_GROUPS__') {
      processGroups = true;

    } else {

      let pathArray = path.split(':');
      storePath(pathArray[0], pathArray[1]);

      if (processGroups) {
        currentGroupsArray.push(pathArray[0]);
      } else {
        currentPathsArray.push(pathArray[0]);
      }

    }

  });

  //remove dupe path names before writing by converting the array to a
  //set then using the spread operator to change it back and finally
  //joining it back together as a comma seperated string
  let uniqPaths = [...new Set(currentPathsArray)];
  currentPaths = uniqPaths.join(',');
  let uniqGroups = [...new Set(currentGroupsArray)];
  currentGroups = uniqGroups.join(',');

  storePath(pathList, currentPaths);
  storePath(groupList, currentGroups);

  //update the _All_Paths group
  storePath('_All_Paths', currentPaths);

  //update the path selector and alert the user import is complete
  reloadSelectors();
  notifyPlayer('greenyellow','Path import complete');
}

function exportPaths(pathList, groupList, exportType) {
  let pathsToExport = [];
  let exportString = '';

  if (exportType === 'single') {
    let path = document.getElementById('exportPathSelect').value;
    let pathSteps = localStorage.getItem(path);
    pathsToExport.push(path + ':' + pathSteps);

  } else {

    let currentGroups = '';
    let currentPaths = '';
    let currentGroupsArray = [];
    let currentPathsArray = [];


    if (exportType === 'group') {
      currentGroups = document.getElementById('exportGroupSelect').value;
      currentGroupsArray = currentGroups.split(',');
      currentPaths = localStorage.getItem(currentGroups);
      currentPathsArray = currentPaths.split(',');

    } else if (exportType === 'all') {
      currentPaths = localStorage.getItem(pathList);
      currentPathsArray = currentPaths.split(',');
      currentGroups = localStorage.getItem(groupList);
      currentGroupsArray = currentGroups.split(',');
    }

    currentPathsArray.forEach(function(path) {
      let pathSteps = localStorage.getItem(path);
      pathsToExport.push(path + ':' + pathSteps);
    });

    //add indicator for the start of groups
    pathsToExport.push('__STARTING_GROUPS__');

    currentGroupsArray.forEach(function(group) {
      let groupPaths = localStorage.getItem(group);
      pathsToExport.push(group + ':' + groupPaths);
    });
  }

  //Join the array back together into a string for export
  exportString = pathsToExport.join(';');

  document.getElementById('pathImportExport').value = exportString;

  window.alert('Export complete: copy the text in the box below');
}

function storePath(pathKey, pathValue) {
  localStorage.setItem(pathKey, pathValue);
}


function clearAllPaths(pathList, groupList){
  let pathListArray = localStorage.getItem(pathList).split(',');
  let groupListArray = localStorage.getItem(groupList).split(',');

  let playerConfirm = window.confirm('Are you sure you want to delete ALL paths and groups?');

  if (playerConfirm) {
    //delete all of the paths
    pathListArray.forEach(function(path) {
      //delete the associated path from local storage
      localStorage.removeItem(path);
    });
    //delete all of the groups
    groupListArray.forEach(function(group) {
      //delete the associated path from local storage
      localStorage.removeItem(group);
    });
    //Remove all paths from the CustomPaths_ list and _All_Paths list
    localStorage.setItem('_All_Paths','');
    localStorage.setItem('CustomPaths_','');
    localStorage.setItem('pathGroups_','_All_Paths');
  }

  //reload the path list
  reloadSelectors();

  //notify the player
  notifyPlayer('red','ALL paths successfully deleted');
}


function reversePath(dir) {
  let revDir = '';

  //loop through the array and replace directions with their opposites
  //only n,s,e,w,u,d are needed because each character is evaluated so
  //se becomes nw
  for (let i = 0; i < dir.length; i++) {
    switch (dir[i]) {
      case 'n':
        revDir += 's';
        break;
      case 's':
        revDir += 'n';
        break;
      case 'e':
        revDir += 'w';
        break;
      case 'w':
        revDir += 'e';
        break;
      case 'u':
        revDir += 'd';
        break;
      case 'd':
        revDir += 'u';
        break;
      default:
        revDir += dir[i];
        break;
    }
  }

  //combine the replacement list then reverse it for the correct order and
  //return the results
  return revDir.split(',').reverse().join();
}

/*****************************************************************************\
| Auto command code                                                           |
\*****************************************************************************/

function autoCmdCheck(cmdBox, delayId, cmdCheckBox) {
  //When the user clicks the auto commands checkbox, check to see if it's
  //checked or unchecked and set the appropriate flag
  let cmdDelay = document.getElementById(delayId).value;
  let commands = document.getElementById(cmdBox).value;

  if (document.getElementById(cmdCheckBox).checked) {
    sendAutoCmds = true;
    startAutoCmds(commands, cmdDelay * 1000);

    //tell the player commands started
    notifyPlayer('yellow','Auto Commands Started');

  } else {
    sendAutoCmds = false;

  }

  //update the player with new commands
  curPlayer.updateSettings();
}

function startAutoCmds(commands, cmdDelay) {
  let commandArray = commands.split(',');

  if (sendAutoCmds) {
    commandArray.forEach(function(cmd) {
      sendMessageDirect(cmd);
    });
  } else {
    //stop auto commands once the checkbox is unchecked
    notifyPlayer('yellow','Auto Commands Stopped');
    return;
  }

  setTimeout(startAutoCmds, cmdDelay, commands, cmdDelay);

}


/*****************************************************************************\
| Path grouping code                                                          |
\*****************************************************************************/

function editGroup(editType) {
  let selectedGroup = document.getElementById('groupingGroupSelect').value;
  let pathToRemove = document.getElementById('groupingCurPathSelect').value;
  let pathToAdd = document.getElementById('groupingAllPathSelect').value;

  if (editType === 'new') {
    newGroup();

  } else if (selectedGroup === '_All_Paths') {
    //Check if the user is trying to modify _All_Paths
    window.alert('Modifying the _All_Paths group is not allowed');

  } else {
    //In all other cases, modify the group selected
    if (editType === 'add') {
      addToGroup(selectedGroup, pathToAdd);
    } else if (editType === 'remove') {
      removeFromGroup(selectedGroup, pathToRemove);
    } else if (editType === 'delete') {
      deleteGroup(selectedGroup);
    }
  }
}

function addToGroup(selectedGroup, pathToAdd) {
  let selectedGroupPaths = localStorage.getItem(selectedGroup);
  //add the path to the selected group's paths and save to a variable
  let updatedPaths = selectedGroupPaths + ',' + pathToAdd;
  //write the updated path list to the group
  storePath(selectedGroup, updatedPaths);

  //alert the player
  notifyPlayer('lime', pathToAdd + ' added to group ' + selectedGroup);
  //reload all of the selection lists
  reloadSelectors();
}

function removeFromGroup(selectedGroup, pathToRemove) {
  let selectedGroupPaths = localStorage.getItem(selectedGroup);
  let groupPathsArray = selectedGroupPaths.split(',');
  let i = groupPathsArray.length;

  //loop through the array and remove the path
  while (i--){
    if (groupPathsArray[i] === pathToRemove) {
      groupPathsArray.splice(i,1);
    }
  }

  //rejoin the array
  selectedGroupPaths = groupPathsArray.join(',');

  //write the updated path list back to local storage
  storePath(selectedGroup, selectedGroupPaths);

  //alert the player
  notifyPlayer('yellow', pathToRemove + ' removed from group ' + selectedGroup);

  //reload all of the selection lists
  reloadSelectors();
}

function newGroup() {
  let groupToAdd = window.prompt('Please enter a name for your new group');
  let groupList = localStorage.getItem(GROUP_LIST);

  if (groupToAdd) {
    //Clean the new name, add it to the current group list, and write out to
    //local storage
    groupToAdd = removeSpaces(groupToAdd);
    groupList += ',' + groupToAdd;
    storePath(GROUP_LIST, groupList);

    //Add a blank group under the new name to local storage
    storePath(groupToAdd, '');

    //reload selectors
    reloadSelectors();

    notifyPlayer('lime', 'New group ' + groupToAdd + ' successfully added');
  }
}

function deleteGroup(groupToDelete) {
  let groupList = localStorage.getItem(GROUP_LIST);
  let groupListArray = groupList.split(',');
  let i = groupListArray.length;

  //Ask the player if they're sure
  let playerConfirm = window.confirm('Are you sure you want to delete ' + groupToDelete + '?');

  if (playerConfirm) {
    //Loop through the array and remove the selected path
    while (i--){
      if (groupListArray[i] === groupToDelete) {
        groupListArray.splice(i,1);
      }
    }

    //put the array back together into a string and write the
    //modified group   list to localstorage
    groupList = groupListArray.join();
    storePath(GROUP_LIST, groupList);

    //delete the associated path from local storage
    localStorage.removeItem(groupToDelete);

    //reload the group lists
    reloadSelectors();

    //notify the player
    notifyPlayer('red', 'Group ' + groupToDelete + ' successfully deleted');
  }
}

function saveGroup() {
  let pathTextArea = document.getElementById('pathTextArea').value;
  let pathGroupName = document.getElementById('pathGroupName').value;
  let newGroup = document.getElementById('newGroup').checked;
  let newChain = document.getElementById('newChain').checked;
  let custPaths = localStorage.getItem(PATH_LIST);

  if (!pathTextArea) {
    alert('Path list is blank. Try adding some paths first.');
  } else if (!pathGroupName) {
    alert('Path group name is blank. Add one and try again');
  } else {
    //Clean up the name/path before storing
    pathGroupName = removeSpaces(pathGroupName);
    pathTextArea = removeSpaces(pathTextArea);

    //prepend a (+) for a group or (c) for a chain
    if (newGroup) {
      pathGroupName = '\(g\)' + pathGroupName;
    } else if (newChain) {
      pathGroupName = '\(c\)' + pathGroupName;
    }

    //write the new path group/chain to local storage
    storePath(pathGroupName, pathTextArea);

    //add the new group/chain to the group paths list
    custPaths += ',' + pathGroupName;
    storePath(GROUP_LIST, custPaths);

    //reload the group and paths dropdown
    reloadSelectors();

    //clear the boxes for the next path
    document.getElementById('pathTextArea').value = '';
    document.getElementById('pathGroupName').value = '';

    //tell the player the new group/chain has been added
    notifyPlayer('green','New path group/chain added');
  }
}


/*****************************************************************************\
| Pathfinding Code                                                            |
| Note: uses code in the other authors section for Dijkstra algorithm         |
\*****************************************************************************/

function displayPath() {
  let start = document.getElementById(START_PATH_SELECT_ID).value;
  let end = document.getElementById(END_PATH_SELECT_ID).value;

  let pathString = findPath(start, end);

  if (pathString) {
    let pathArray = pathString.split(',');
    let steps = 0;
    let displayString = '';

    pathArray.forEach(function(path) {
      let pathSteps = localStorage.getItem(path).split(',');
      steps += pathSteps.length;
      displayString += ' => ' + path;
    });

    displayString = 'Path found (' + steps +' steps): ' + displayString.slice(4);
    notifyPlayer('green', displayString);
  } else {
    let displayString = 'No path found between ' + start + ' and ' + end;
    notifyPlayer('yellow', displayString);
  }
}

function buildPath(pathString) {
  let pathArray = pathString.split(',');
  let pathSteps = '';

  pathArray.forEach(function(path) {
    let steps = localStorage.getItem(path);
    pathSteps += steps + ',';
    //add a comma at the end to allow seperation with the next path
  });

  //clip the last comma off the string since there isn't another connection
  pathSteps = pathSteps.slice(0, -1);
  return pathSteps;
}

function findPath(startRoom, endRoom) {
  let pathMap = buildPathMap();
  let graph = new Graph(pathMap);
  let path = graph.findShortestPath(startRoom, endRoom);
  let pathName = [];

  if (path) {
    //reconstruct the path names from start/ending rooms
    for (let i = 0; i < (path.length - 1); i++) {
      pathName.push(path[i] + '__2__' + path[i + 1]);
    }
    //return a comma seperated string of actual paths in the found path
    return pathName.join(',');

  } else {
    //if no path could be found, return null
    return null;
  }
}

/*
  function to build a path map of all existing paths that is passed to a
  pathfinding function
*/
function buildPathMap() {
  let pathArray = localStorage.getItem('CustomPaths_').split(',');
  let connectGraph = {};
  let startRoomArray = [];

  //Get all starting rooms
  pathArray.forEach(function(path) {
    let rooms = path.split('__2__');
    if (rooms[1]) {
      startRoomArray.push(rooms[0]);
    }
  });
  //pull a list of only unique starting rooms which are used as nodes
  let uniqRooms = [...new Set(startRoomArray)];

  //go through each of the unique rooms, find connecting nodes, and write to
  //an object with the node as an object property then the connections and
  //distance (in steps) as sub properties of the node
  uniqRooms.forEach(function(room) {
    //omit null rooms if they exist
    if (room) {
      let connections = {};
      pathArray.forEach(function(path) {
        //omit null paths if they exist
        if (path) {
          //split the path name into starting and ending room
          let node = path.split('__2__');
          //find the distance bettween the nodes by counting path steps
          let distance = localStorage.getItem(path).split(',').length;
          //omit loops by checking for null ending nodes
          if (node[1]) {
            if (room === node[0]) {
              //write sub property to an object for later merging
              connections[node[1]] = distance;
            }
          }
        }
      });
      //merge in sub properties to the main node
      connectGraph[room] = connections;
    }
  });

  return connectGraph;
}


/*****************************************************************************\
| Auto mapping code                                                           |
\*****************************************************************************/

/*
let isDragging = false;

$("#mapCanvas").mousedown(function(){
    isDragging = true;
});

$(window).mouseup(function(){
    isDragging = false;
});

$(window).mousemove(function(event) {
    if (isDragging == true) {
      let x = event.clientX - event.target.offsetLeft - (event.target.width / 2);
      let y = event.clientY - event.target.offsetTop - (event.target.height / 2);
      ctx.setTransform(1,0,0,1,x,y);
      map.drawMap(ctx,room_size,map_size);
    }
});
*/

function openDatabase() {
  let request = indexedDB.open(DB_NAME, DB_VERSION);

  request.onerror = function(event) {
    console.error('Could not open DB: ' + event.target.error);
  };

  request.onupgradeneeded = function(event) {
    db = event.target.result;

    if (db.objectStoreNames.contains('rooms')) {
      db.deleteObjectStore('rooms');
    }

    let store = db.createObjectStore('rooms', { keyPath: 'id' });

    store.createIndex('name', 'name', { unique: false });
    store.createIndex('altName', 'altName', { unique: true });
    store.createIndex('group', 'group', { unique: false });

  };  //end db upgrade

  request.onsuccess = function(event) {
    console.log('DB Opened');
    db = event.target.result;

    reloadAutoSelectors();

    //start mapping by sending an enter to show the room
    sendMessageDirect('');
  };
}

function translateDir(dir) {
  let dirStr;
  switch (dir) {
    case 0:
    case 'north':
      dirStr = 'n';
      break;

    case 1:
    case 'south':
      dirStr = 's';
      break;

    case 2:
    case 'east':
      dirStr = 'e';
      break;

    case 3:
    case 'west':
      dirStr = 'w';
      break;

    case 4:
    case 'northeast':
      dirStr = 'ne';
      break;

    case 5:
    case 'northwest':
      dirStr = 'nw';
      break;

    case 6:
    case 'southeast':
      dirStr = 'se';
      break;

    case 7:
    case 'southwest':
      dirStr = 'sw';
      break;

    case 8:
    case 'up':
      dirStr = 'u';
      break;

    case 9:
    case 'down':
      dirStr = 'd';
      break;

    default:

  }
  return dirStr;
}

function oppositeDir(dir) {
  let oppDir;
  switch (dir) {
    case 'n':
      oppDir = 's';
      break;
    case 's':
      oppDir = 'n';
      break;
    case 'e':
      oppDir = 'w';
      break;
    case 'w':
      oppDir = 'e';
      break;
    case 'ne':
      oppDir = 'sw';
      break;
    case 'nw':
      oppDir = 'se';
      break;
    case 'se':
      oppDir = 'nw';
      break;
    case 'sw':
      oppDir = 'ne';
      break;
    case 'u':
      oppDir = 'd';
      break;
    case 'd':
      oppDir = 'u';
      break;

    default:

  }
  return oppDir;
}

function startNewMap(actionData) {
  let data = actionData;

  roomIdToIndex = [];

  roomIdToIndex.push(data.RoomID);

  let id = roomIdToIndex.indexOf(data.RoomID);
  let name = data.Name;
  let exits = {};

  for (let exit of data.ObviousExits) {
    exits[translateDir(exit)] = -1;
  }

  let room = new Room(id, name, exits);
  let rooms = [];
  rooms.push(room);
  map = new GameMap(rooms, room);

}

function getRoom(id) {
  let txn = db.transaction(['rooms'], 'readonly');
  let store = txn.objectStore('rooms');

  return new Promise(function(resolve, reject) {
    let trans = store.get(id);

    trans.onsuccess = function(event) {
      resolve(event.target.result);
    };

    trans.onerror = function(event) {
      reject(Error(event.target.error));
    };
  });
}

function getRoomByName(name, useAltName) {
  let txn = db.transaction(['rooms'], 'readonly');
  let store = txn.objectStore('rooms');
  let idx;

  if (useAltName) {
    idx = store.index('altName');
  } else {
    idx = store.index('name');
  }

  return new Promise(function(resolve, reject) {
    let trans = idx.get(name);

    trans.onsuccess = function(event) {
      resolve(event.target.result);
    };

    trans.onerror = function(event) {
      reject(Error(event.target.error));
    };
  });
}

function getAllRooms() {
  let txn = db.transaction(['rooms'], 'readonly');
  let store = txn.objectStore('rooms');

  return new Promise(function(resolve, reject) {
    let trans = store.getAll();

    trans.onsuccess = function(event) {
      resolve(event.target.result);
    };

    trans.onerror = function(event) {
      reject(Error(event.target.error));
    };
  });
}

function addRoom(actionData) {
  let txn = db.transaction(['rooms'], 'readwrite');
  let store = txn.objectStore('rooms');

  let id = actionData.RoomID;
  let name = actionData.Name.toLowerCase().trim();
  let altName = null;
  let commands = null;
  let unlisted = false;
  
  let exits = {};

  for (let exit of actionData.ObviousExits) {
    exits[translateDir(exit)] = -1;
  }

  let group;
  let nameSplit = name.split(',');

  if (nameSplit[1]) {
    group = nameSplit[0].toLowerCase().trim();
  } else {
    group = '_not_grouped';
  }

  let newRoom = new Room(id, name, exits, altName, group, commands, unlisted);

  return new Promise(function(resolve, reject) {
    let trans = store.put(newRoom);

    trans.onsuccess = function() {
      reloadAutoSelectors();
      resolve(newRoom);
    };

    trans.onerror = function(event) {
      reject(Error(event.target.error));
    };
  });
}

function updateRoom(room) {
  let txn = db.transaction(['rooms'], 'readwrite');
  let store = txn.objectStore('rooms');

  //format the room before saving
  if (room.altName) {
    room.altName = room.altName.toLowerCase().trim();
  }

  if (room.group) {
    room.group = room.group.toLowerCase().trim();
  }

  return new Promise(function(resolve, reject) {
    let trans = store.put(room);

    trans.onsuccess = function(event) {
      resolve(event.target.result);
    };

    trans.onerror = function(event) {
      reject(Error(event.target.error));
    };
  });
}

function loadMap(actionData) {
  //start auto mapping
  ctx = document.getElementById('mapCanvas').getContext('2d');

  getRoom(actionData.RoomID)
    .then(function(room) {
      if (!room) {
        return addRoom(actionData);
      } else {
        return Promise.resolve(room);
      }
    })
    .then(function(room) {
      map = new GameMap('rooms', room);

      //now that map is loaded, show the room again to start the map
      sendMessageDirect('');

    })
    .catch(function(err) {
      console.error(err);
    });
}

function resetMap() {
  let txn = db.transaction(['rooms'], 'readwrite');
  let store = txn.objectStore('rooms');

  store.clear().onsuccess = function() {
    //clear the current map
    map = null;
    //show the room to load a new map
    sendMessageDirect('');
  };

}

function downloadMap() {
  if (map) {
    let exCanvas = document.createElement('canvas');
    exCanvas.width = 8000;
    exCanvas.height = 8000;
    let exCtx = exCanvas.getContext('2d');

    map.export = true;
    map.drawMap(exCtx, room_size, map_size, curRoomID);
    exCanvas = null;
  }
}

/*
  function to build a path map of all known rooms in the map that is passed
  to a pathfinding function.

  Async, returns a Promise
*/
function buildAutoPathMap() {
  let txn = db.transaction(['rooms'], 'readonly');
  let store = txn.objectStore('rooms');

  let returnObject = {};
  let connectGraph = {};

  return new Promise(function(resolve, reject) {
    let trans = store.getAll();

    trans.onsuccess = function(event) {
      let rooms = event.target.result;

      for (let room of rooms) {
        let connections = {};

        for (let exit in room.exits) {
          let exitId = room.exits[exit];
          connections[exitId] = 1;
        }
        connectGraph[room.id] = connections;
      }

      returnObject.rooms = rooms;
      returnObject.connectGraph = connectGraph;

      resolve(returnObject);
    };

    trans.onerror = function(event) {
      reject(Error(event.target.error));
    };

  });
}

function findAutoPath(startID, endID) {
  let rooms = {};

  return new Promise(function(resolve, reject) {
    buildAutoPathMap()
      .then(function(result) {
        let pathMap = result.connectGraph;
        rooms = result.rooms;

        let graph = new Graph(pathMap);
        let path = graph.findShortestPath(startID, endID);

        return Promise.resolve(path);
      })
      .then(function(result) {
        let pathList = result;
        let path = [];

        let lookup = {};

        for (let i = 0; i < rooms.length; i++) {
          lookup[rooms[i].id] = rooms[i];
        }

        for (let i = 0; i < pathList.length; i++) {
          let exits = lookup[pathList[i]].exits;
          for (let exit in exits) {
            if ( exits[exit] === pathList[i + 1] ) {
              path.push(exit);
            } //end if check
          } //end for exit in exits loop
        } //end for pathList loop

        //return comma seperated string of the path
        resolve(path.join(','));
      })
      .catch(function(err) {
        reject(Error(err));
      });
  });
}

function reloadAutoSelectors() {
  //reload the autopath group and path selectors (partially async)
  let allRooms = [];

  getAllRooms()
    .then(function(result) {
      allRooms = result;
      let uniqueAutos = getUniqueAutos(allRooms, false);
      let groupArray = uniqueAutos.groups;

      let curAutoGroup = document.getElementById('autoGroup').value;
      let selectorToLoad = document.getElementById('autoGroup');
      loadSelector(groupArray, selectorToLoad);
      selectIfExists(curAutoGroup, 'autoGroup');

      autoGroupSelected('autoGroup', 'autoRoom', false);
    })
    .catch(function(err) {
      console.error(err);
    });
}

function getUniqueAutos(allRooms, showUnlisted) {
  let groupArray = [];
  let roomArray = [];
  let returnObject = {};
  let notUnique = [];

  for (let room of allRooms) {
    let groupIndex = groupArray.indexOf(room.group);
    if (groupIndex === -1) {
      groupArray.push(room.group);
    }

    if (!room.unlisted || showUnlisted) {
      //process room if it should be listed
      let roomIndex;
      let roomUnqIdx;

      //process alt name if it's set
      if (room.altName || room.altName === '') {
        roomIndex = roomArray.indexOf(room.altName);
        roomUnqIdx = notUnique.indexOf(room.altName);

        if (room.altName) {
          if (roomIndex === -1 && roomUnqIdx === -1) {
            roomArray.push(room.altName);

          } else if (roomIndex !== -1) {
            roomArray.splice(roomIndex,1);
            notUnique.push(room.altName);
          }
        }  //end if altName check

      } else {
        //process normal room name since alt name doesn't exist
        roomIndex = roomArray.indexOf(room.name);
        roomUnqIdx = notUnique.indexOf(room.name);

        if (roomIndex === -1 && roomUnqIdx === -1) {
          roomArray.push(room.name);

        } else if (roomIndex !== -1) {

          roomArray.splice(roomIndex,1);
          notUnique.push(room.name);
        }
      }  //end else
    } //end if unlisted/showUnlisted check
  } //end for room of allrooms

  returnObject.groups = groupArray;
  returnObject.rooms = roomArray;

  return returnObject;
}

function autoGroupSelected(group, selector, showUnlisted) {
  let txn = db.transaction(['rooms'], 'readonly');
  let store = txn.objectStore('rooms');
  let index = store.index('group');

  let selectedGroup = document.getElementById(group).value;

  return new Promise(function(resolve, reject) {
    let trans = index.getAll(selectedGroup);

    trans.onsuccess = function(event) {
      let uniques = getUniqueAutos(event.target.result, showUnlisted);

      let selectorToLoad = document.getElementById(selector);
      loadSelector(uniques.rooms, selectorToLoad);

      resolve(event.target.result);
    };

    trans.onerror = function(event) {
      reject(Error(event.target.error));
    };
  });
}

function displayAutoPath() {
  let start = curRoomID;
  let end = document.getElementById('autoRoom').value;
  let dest = end;
  let useAltName = checkAltName(end);

  getRoomByName(end, useAltName)
    .then(function(result) {
      end = result.id;

      findAutoPath(start, end)
        .then(function(result) {
          let pathString = result;

          if (pathString) {
            let pathArray = pathString.split(',');
            let steps = pathArray.length;

            notifyPlayer('green', 'Path found to ' + dest + ' (' + steps + ' steps)');
          } else {
            let displayString = 'No path found to destination room';
            notifyPlayer('yellow', displayString);
          }
        });
    })
    .catch(function(err) {
      console.error(err);
    });
}

function autoMapGo(type) {
  let start = curRoomID;
  let end = document.getElementById('autoRoom').value;
  let useAltName = checkAltName(end);

  getRoomByName(end, useAltName)
    .then(function(result) {
      end = result.id;

      findAutoPath(start, end)
        .then(function(result) {
          let pathString = result;
          let steps = pathString.split(',').length;
          let delay = document.getElementById('stepDelay').value;
          let dest = 'AutoMap walk to ' + document.getElementById('autoRoom').value;

          if (pathString) {
            notifyPlayer('yellowgreen', dest + ' (' + steps + ' steps)');

            if (type === 'run') {
              sendMessageDirect('DisableAI Combat');
              document.getElementById('chkAICombat').checked = false;
            }

            walkPath(pathString, delay, false, dest);

          } else {
            let displayString = 'No path found to destination room';
            notifyPlayer('yellow', displayString);
          }
        });
    })
    .catch(function(err) {
      console.error(err);
    });
}

function reloadAutoEditSel() {
  //reload the autopath group and path selectors (partially async)
  let allRooms = [];

  getAllRooms()
    .then(function(result) {
      allRooms = result;
      let uniqueAutos = getUniqueAutos(allRooms, true);
      let groupArray = uniqueAutos.groups;

      let curAutoGroup = document.getElementById('mapGroupSel').value;
      let selectorToLoad = document.getElementById('mapGroupSel');
      loadSelector(groupArray, selectorToLoad);
      selectIfExists(curAutoGroup, 'mapGroupSel');

      autoGroupSelected('mapGroupSel', 'mapRoomSel', true);
    })
    .catch(function(err) {
      console.error(err);
    });
}

function mapRoomSelected() {
  //get detail about the current room then load it into the edit fields
  let roomName = document.getElementById('mapRoomSel').value;
  let useAltName = checkAltName(roomName);

  getRoomByName(roomName, useAltName)
    .then(function(result) {
      let roomDetail = result;
      loadRoomFields(roomDetail);
    })
    .catch(function(err) {
      console.error(err);
    });
}

function loadRoomFields(room) {
  document.getElementById('mapId').value = room.id;
  document.getElementById('mapName').value = room.name;
  document.getElementById('mapUnlisted').checked = room.unlisted;

  //the following entries may be null so must first be checked
  let altName = document.getElementById('mapAltName');
  if (room.altName) {
    altName.value = room.altName;
  } else {
    altName.value = '';
  }

  let group = document.getElementById('mapGroup');
  if (room.group) {
    group.value = room.group;
  } else {
    group.value = '';
  }

  let mapCmd = document.getElementById('mapCmd');
  if(room.commands) {
    mapCmd.value = room.commands;
  } else {
    mapCmd.value = '';
  }
}

function editAutoRooms() {
  //load the selectors
  reloadAutoEditSel();

  //get detail about the current room then load it into the edit fields
  getRoom(curRoomID)
    .then(function(result) {
      let curRoomDetail = result;
      loadRoomFields(curRoomDetail);
    })
    .catch(function(err) {
      console.error(err);
    });
}

function saveRoomEdits() {
  let id = document.getElementById('mapId').value;
  let name = document.getElementById('mapName').value;
  let altName = document.getElementById('mapAltName').value;
  let group = document.getElementById('mapGroup').value;
  let commands = document.getElementById('mapCmd').value;
  let unlisted = document.getElementById('mapUnlisted').checked;
  let exits;

  if (group === '' || !group) {
    group = '_not_grouped';
  }

  //add an _ to the altName to signify it's an alternate name
  if ( altName && (altName !== '') && !checkAltName(altName) ) {
    altName += '_';
  }

  getRoom(id)
    .then(function(result) {
      exits = result.exits;
      let room = new Room(id, name, exits, altName, group, commands, unlisted);

      updateRoom(room)
        .then(function() {
          alert('Room updated');
        })
        .then(function() {
          return reloadAutoEditSel();
        })
        .then(function() {
          return reloadAutoSelectors();
        });
    })
    .catch(function(err) {
      console.error(err);
    });

}

function checkAltName(roomName) {
  if (roomName.slice(-1) === '_') {
    return true;
  } else {
    return false;
  }
}

function exportMap() {
  //get all the map rooms then turn them into a json string and export
  getAllRooms()
    .then(function(result) {
      let mapExport = JSON.stringify(result);
      let exportArea = document.getElementById('mapImpExpText');

      exportArea.value = mapExport;
    });
}

function importMap() {
  let playerConfirm = window.confirm('This will update your current map, are you sure?');

  if (playerConfirm) {
    let mapString = document.getElementById('mapImpExpText').value;
    let mapObjArray = [];

    if (mapString && mapString !== '') {
      try {

        mapObjArray = JSON.parse(mapString);

        //check the first room to see if it exists to verify parsing success
        if ( mapObjArray[0].hasOwnProperty('id') ) {
          for (let room of mapObjArray) {
            updateRoom(room).then();
          }

          //show the room to load a new map
          sendMessageDirect('');

          //reload the group/room selectors then alert the player
          reloadAutoSelectors();

          alert('Import complete');

        } else {
          throw 'Error with parsing the map string provided';
        }
      }  //end try
      catch (e) {
        alert('An error with the import occured. Make sure the text provided is correct.');
      }  //end catch
    } //end if map
  } //end player confirm
} //end importMap function


/*****************************************************************************\
| General functions                                                           |
\*****************************************************************************/

function notifyPlayer(msgColor, msgText) {
  //Used to alert the player by appending messages to the main window
  let status = document.getElementById('addonStatusText');
  status.style = 'color:' + msgColor;
  status.innerHTML = msgText;
}

function removeSpaces(str) {
  return str.replace(/\s+/g, '');
}

function reloadSelectors() {
  //Save the current state of the group selectors
  let curStartGroup = document.getElementById(START_GROUP_SELECT_ID).value;
  let curEndGroup = document.getElementById(END_GROUP_SELECT_ID).value;
  let curGroupingGroup = document.getElementById('groupingGroupSelect').value;

  //reload the group selectors
  let groupListArray = localStorage.getItem(GROUP_LIST).split(',');

  let selectorToLoad = document.getElementById(START_GROUP_SELECT_ID);
  loadSelector(groupListArray, selectorToLoad);

  selectorToLoad = document.getElementById(END_GROUP_SELECT_ID);
  loadSelector(groupListArray, selectorToLoad);

  selectorToLoad = document.getElementsByClassName('groupSelect');
  loadSelector(groupListArray, selectorToLoad);

  //select previously selected group, if it exists
  selectIfExists(curStartGroup, START_GROUP_SELECT_ID);
  selectIfExists(curEndGroup, END_GROUP_SELECT_ID);
  selectIfExists(curGroupingGroup, 'groupingGroupSelect');

  //reload the path selector based on the group
  loadRooms(document.getElementById(START_GROUP_SELECT_ID).value, START_PATH_SELECT_ID, 'start');
  loadRooms(document.getElementById(END_GROUP_SELECT_ID).value, END_PATH_SELECT_ID, 'end');

  //reload the group path selector based on the selected group
  curGroupingGroup = document.getElementById('groupingGroupSelect').value;
  let pathArray = localStorage.getItem(curGroupingGroup).split(',');

  selectorToLoad = document.getElementById('groupingCurPathSelect');
  loadSelector(pathArray, selectorToLoad);

  //reload the all_paths selector
  pathArray = localStorage.getItem(PATH_LIST).split(',');
  selectorToLoad = document.getElementsByClassName('pathSelect');
  loadSelector(pathArray, selectorToLoad);

}

function loadRooms(pathList, selectorId, type) {
  let pathArray = localStorage.getItem(pathList).split(',');
  let startRoomArray = [];
  let endRoomArray = [];
  let selectorToLoad = document.getElementById(selectorId);

  pathArray.forEach(function(path) {
    let rooms = path.split('__2__');
    if (rooms[0]) {
      startRoomArray.push(rooms[0]);
    }
    if (rooms[1]) {
      endRoomArray.push(rooms[1]);
    }
  });

  if (type === 'start') {
    let uniqRooms = [...new Set(startRoomArray)];
    loadSelector(uniqRooms, selectorToLoad);
  } else {
    let uniqRooms = [...new Set(endRoomArray)];
    loadSelector(uniqRooms, selectorToLoad);
  }
}

function loadSelector(optionArray, selectorToLoad) {
  //Sort the array before populating the list
  optionArray.sort();

  let selectors = selectorToLoad.length;

  if (!(selectorToLoad instanceof HTMLCollection)) {
    //false: only one selector given, process as single

    //Clear the current options
    selectorToLoad.options.length = 0;

    //Populate the list from the array
    optionArray.forEach(function(item) {
      if (item) {
        let opt = document.createElement('option');
        opt.textContent = item;
        opt.value = item;
        selectorToLoad.add(opt);
      }
    });

  } else {
    //true: collection given, process as multiple
    for (let i = 0; i < selectors; i++) {
      //Clear the current options
      selectorToLoad[i].options.length = 0;

      //Populate the list from the array
      for (let item of optionArray) {
        if (item) {
          let opt = document.createElement('option');
          opt.textContent = item;
          opt.value = item;
          selectorToLoad[i].add(opt);
        } //end item if
      } //end for item
    } //end for selectors
  } //end else
} //end function loadSelector

/*
  This function is used by the selectors for the onchange event
*/
function groupSelected(groupSelectId, pathSelectId) {
  //save currently selected paths
  let curStartRoom = document.getElementById(START_PATH_SELECT_ID).value;
  let curEndRoom = document.getElementById(END_PATH_SELECT_ID).value;
  let curGroupingRoom = document.getElementById('groupingCurPathSelect').value;

  //reload all of the selectors
  reloadSelectors();

  //reselect previously selected paths for all path selectors if it still exists
  selectIfExists(curStartRoom, START_PATH_SELECT_ID);
  selectIfExists(curEndRoom, END_PATH_SELECT_ID);
  selectIfExists(curGroupingRoom, 'groupingCurPathSelect');
}

function selectIfExists(valToSel, selectorId) {
  let exists = document.querySelector('#' + selectorId + ' [value="' + valToSel + '"]');
  if (valToSel && exists) {
    document.querySelector('#' + selectorId + ' [value="' + valToSel + '"]').selected = true;
  }
}

function combatEnd() {
  inCombat = false;
  combatEndTime = Date.now();
}

function combatStart() {
  lastSwingTime = Date.now();
  inCombat = true;
}

function toggleMoveButtons(turnOn) {
  let walk = document.getElementById('pathWalk');
  let run = document.getElementById('pathRun');
  let loop = document.getElementById('pathLoop');
  let autoMapWalk = document.getElementById('autoMapWalk');
  let autoMapRun = document.getElementById('autoMapRun');

  if (turnOn) {
    //enable the buttons
    walk.disabled = false;
    run.disabled = false;
    loop.disabled = false;
    autoMapWalk.disabled = false;
    autoMapRun.disabled = false;
  } else {
    //disable the buttons
    walk.disabled = true;
    run.disabled = true;
    loop.disabled = true;
    autoMapWalk.disabled = true;
    autoMapRun.disabled = true;
  }
}


/*****************************************************************************\
| Event handling code                                                         |
\*****************************************************************************/

//Deal with events from the WebMud hub
/*
  Start combat    .attack
  End combat      .breakCombat or .death
  Start move      .playerMove
  End move        .showRoom
  AI Command      .aiCommand
  Party messages  .partyMessage

  Note: setting the variables then passing them actionData is necessary
  otherwise the main webmud window won't show the message normally
*/

//Physical combat started, set combat flag to true
let wm_moveToAttack = window.attack;
window.attack = function(actionData) {
  wm_moveToAttack(actionData);
  combatStart();
};

//Spell combat started, set combat flag to true
let wm_castSpell = window.castSpell;
window.castSpell = function(actionData) {
  wm_castSpell(actionData);
  switch (actionData.Result) {
    case -11:
      //attempt to cast but fail
      if (actionData.CasterID === playerID) {
        lastSwingTime = Date.now();
      }
      return;
    case 4:
      //Player cast (good and bad)
      if (actionData.CasterID === playerID && actionData.EvilInCombat) {
        lastSwingTime = Date.now();
      }
      return;
    case 7:
      //single target move to cast
      if (actionData.CasterID === playerID) {
        combatStart();
      }
      return;
    case 8:
      //room move to cast
      if (actionData.CasterID === playerID) {
        combatStart();
      }
      return;
  }
};

//Exp earned, set combat flag to false
let wm_gainExperience = window.gainExperience;
window.gainExperience = function(actionData) {
  wm_gainExperience(actionData);
  combatEnd();
};

//Move started, set move flag to true
let wm_playerMove = window.playerMove;
window.playerMove = function(actionData) {
  wm_playerMove(actionData);

  if (actionData.Result === 1 || actionData.Result === 2) {
    playerMoving = true;
    inCombat = false;
    movedFrom = {
      'id':curRoomID,
      'dir':translateDir(actionData.Direction)
    };
  }

};

//Move ended, set move flag to false
let wm_showRoom = window.showRoom;
window.showRoom = function(actionData) {
  wm_showRoom(actionData);
  playerMoving = false;

  if (movedFrom.hasOwnProperty('id') || !curRoomID) {
    //only update room id if player actually moved (not looked)
    curRoomID = actionData.RoomID;
  }

  if (!map) {
    loadMap(actionData);

  } else {

    if (movedFrom.hasOwnProperty('id')) {
      map.move(movedFrom, actionData);
      //reset movedFrom
      movedFrom = {};

    } else {
      map.drawMap(ctx, room_size, map_size, curRoomID);
    }

  }
};

//Note time of last combat swing to fix movement combat bug
let wm_combatSwing = window.combatSwing;
window.combatSwing = function(actionData) {
  wm_combatSwing(actionData);
  if (actionData.AttackerID === playerID) {
    lastSwingTime = Date.now();
  }
};

//Deal with AI commands
let wm_aiCommand = window.aiCommand;
window.aiCommand = function(actionData) {
  wm_aiCommand(actionData);
  if (actionData.Hint === 'Running - Low HP') {
    aiRunning = true;
  } else if (actionData.Hint === 'Moving back - Health/Mana OK') {
    aiRunning = false;
    playerResting = false;
  }

  if (actionData.TypedCommand === 'rest') {
    playerResting = true;
  }
};

//Deal with party messages
let wm_partyMessage = window.partyMessage;
window.partyMessage = function(actionData) {
  wm_partyMessage(actionData);
  let slicedMessage = actionData.MessageText.slice(0,8);
  if (slicedMessage === 'Running!') {
    aiRunning = true;
  }
};

//Keep track of party health
let wm_party = window.party;
window.party = function(actionData) {
  wm_party(actionData);
  partyInfo = actionData.PartyMemberInfos;
};

//Remove resting flag when player is a full HP/MA
let wm_updateHPMA = window.updateHPMA;
window.updateHPMA = function(actionData) {
  wm_updateHPMA(actionData);
  if (actionData.HP === actionData.MaxHP && actionData.MA === actionData.MaxMA) {
    playerResting = false;
  }
};

//event listener for the dialog modal
document.getElementById('importExportDialog').addEventListener('click', function(e) {
  switch (e.target.id) {
    case 'importPath':
      getPathsToImport('CustomPaths_', 'pathGroups_');
      break;

    case 'exportSingle':
      exportPaths('CustomPaths_', 'pathGroups_', 'single');
      break;

    case 'exportGroup':
      exportPaths('CustomPaths_', 'pathGroups_', 'group');
      break;

    case 'exportAll':
      exportPaths('CustomPaths_', 'pathGroups_', 'all');
      break;

    case 'clearAllPaths':
      clearAllPaths('CustomPaths_','pathGroups_');
      break;

    default:

  }
},false);

//event listener for the map options modal
document.getElementById('mapOptions').addEventListener('click', function(e) {
  switch (e.target.id) {
    case 'applyMapOptions':
      map_size = parseInt(document.getElementById('mapSize').value);
      room_size = parseInt(document.getElementById('roomSize').value);
      map.drawMap(ctx, room_size, map_size, curRoomID);
      break;

    default:

  }
},false);

//event listener for the map
document.getElementById('divMap').addEventListener('click', function(e) {
  switch (e.target.id) {
    case 'downloadMap':
      downloadMap();
      break;

    case 'resetMap':
      resetMap();
      break;

    default:

  }
},false);

//event listener for the map import/export modal
document.getElementById('mapImpExpModal').addEventListener('click', function(e) {
  switch (e.target.id) {
    case 'importMap':
      importMap();
      break;

    case 'exportMap':
      exportMap();
      break;

    default:

  }
},false);

//event listener for auto path
document.getElementById('divAutoPath').addEventListener('click', function(e) {
  switch (e.target.id) {
    case 'editAutoRooms':
      editAutoRooms();
      break;

    case 'autoMapWalk':
      autoMapGo('walk');
      break;

    case 'autoMapRun':
      autoMapGo('run');
      break;

    default:

  }
},false);

//event listener for map edit
document.getElementById('mapEdit').addEventListener('click', function(e) {
  switch (e.target.id) {
    case 'applyMapEdits':
      saveRoomEdits();
      break;

    default:

  }
},false);

//keypress events for numpad walking
$(document).keyup(function(e) {
  switch (e.which) {
    case 96:  //numpad 0
      sendMessageDirect('rest');
      $('#message').val('');
      break;

    case 97:  //numpad 1
      sendMessageDirect('sw');
      $('#message').val('');
      break;

    case 98:  //numpad 2
      sendMessageDirect('s');
      $('#message').val('');
      break;

    case 99:  //numpad 3
      sendMessageDirect('se');
      $('#message').val('');
      break;

    case 100:  //numpad 4
      sendMessageDirect('w');
      $('#message').val('');
      break;

    case 101:  //numpad 5
      sendMessageDirect('sn');
      $('#message').val('');
      break;

    case 102:  //numpad 6
      sendMessageDirect('e');
      $('#message').val('');
      break;

    case 103:  //numpad 7
      sendMessageDirect('nw');
      $('#message').val('');
      break;

    case 104:  //numpad 8
      sendMessageDirect('n');
      $('#message').val('');
      break;

    case 105:  //numpad 9
      sendMessageDirect('ne');
      $('#message').val('');
      break;

    case 107:  //numpad +
      sendMessageDirect('u');
      $('#message').val('');
      break;

    case 109:  //numpad -
      sendMessageDirect('d');
      $('#message').val('');
      break;

    case 110:  //numpad .
      sendMessageDirect('med');
      $('#message').val('');
      break;

    default:

  }

});



//The following MIT license and credits apply to the Graph class, which is an
//implementation of the Dijkstra algorithm.  Code was obtained from github on
//2016-03-21 at https://github.com/andrewhayward/dijkstra
/*
The MIT License (MIT)

Copyright (c) 2014 Andrew Hayward

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

var Graph = (function (undefined) {

  var extractKeys = function(obj) {
    var keys = [], key;
    for (key in obj) {
      Object.prototype.hasOwnProperty.call(obj,key) && keys.push(key);
    }
    return keys;
  };

  var sorter = function (a, b) {
    return parseFloat (a) - parseFloat (b);
  };

  var findPaths = function (map, start, end, infinity) {
    infinity = infinity || Infinity;

    var costs = {},
      open = {'0': [start]},
      predecessors = {},
      keys;

    var addToOpen = function (cost, vertex) {
      var key = '' + cost;
      if (!open[key]) open[key] = [];
      open[key].push(vertex);
    };

    costs[start] = 0;

    while (open) {
      if(!(keys = extractKeys(open)).length) break;

      keys.sort(sorter);

      var key = keys[0],
        bucket = open[key],
        node = bucket.shift(),
        currentCost = parseFloat(key),
        adjacentNodes = map[node] || {};

      if (!bucket.length) delete open[key];

      for (var vertex in adjacentNodes) {
        if (Object.prototype.hasOwnProperty.call(adjacentNodes, vertex)) {
          var cost = adjacentNodes[vertex],
            totalCost = cost + currentCost,
            vertexCost = costs[vertex];

          if ((vertexCost === undefined) || (vertexCost > totalCost)) {
            costs[vertex] = totalCost;
            addToOpen(totalCost, vertex);
            predecessors[vertex] = node;
          }
        }
      }
    }

    if (costs[end] === undefined) {
      return null;
    } else {
      return predecessors;
    }

  };

  var extractShortest = function (predecessors, end) {
    var nodes = [],
      u = end;

    while (u) {
      nodes.push(u);
      u = predecessors[u];
    }

    nodes.reverse();
    return nodes;
  };

  var findShortestPath = function (map, nodes) {
    var start = nodes.shift(),
      end,
      predecessors,
      path = [],
      shortest;

    while (nodes.length) {
      end = nodes.shift();
      predecessors = findPaths(map, start, end);

      if (predecessors) {
        shortest = extractShortest(predecessors, end);
        if (nodes.length) {
          path.push.apply(path, shortest.slice(0, -1));
        } else {
          return path.concat(shortest);
        }
      } else {
        return null;
      }

      start = end;
    }
  };

  var toArray = function (list, offset) {
    try {
      return Array.prototype.slice.call(list, offset);
    } catch (e) {
      var a = [];
      for (var i = offset || 0, l = list.length; i < l; ++i) {
        a.push(list[i]);
      }
      return a;
    }
  };

  var Graph = function (map) {
    this.map = map;
  };

  Graph.prototype.findShortestPath = function (start, end) {
    if (Object.prototype.toString.call(start) === '[object Array]') {
      return findShortestPath(this.map, start);
    } else if (arguments.length === 2) {
      return findShortestPath(this.map, [start, end]);
    } else {
      return findShortestPath(this.map, toArray(arguments));
    }
  };

  Graph.findShortestPath = function (map, start, end) {
    if (Object.prototype.toString.call(start) === '[object Array]') {
      return findShortestPath(map, start);
    } else if (arguments.length === 3) {
      return findShortestPath(map, [start, end]);
    } else {
      return findShortestPath(map, toArray(arguments, 1));
    }
  };

  return Graph;

})();


/*****************************************************************************\
| Jaeger's Combat Stats Watcher                                               |
\*****************************************************************************/
var JaegerWM;
(function(JaegerWM) {
    var CombatStatsWatcher = (function() {
        function CombatStatsWatcher() {
            var _this = this;
            this.swingCount = 0;
            this.hitCount = 0;
            this.hitDamage = 0;
            this.bsCount = 0;
            this.bsDamage = 0;
            this.bsAttempt = 0;
            this.critCount = 0;
            this.critDamage = 0;
            this.missCount = 0;
            this.swingsAtYouCount = 0;
            this.dodgeCount = 0;
            this.glanceCount = 0;
            this.roundCount = 0;
            this.roundStart = Date.now();
            this.inRound = false;
            this.wmCombatSwing = combatSwing;
            combatSwing = function(actionData) {
                _this.combatSwingOverride(actionData);
            };
            $('#divExpTimer table tr:last').before('<tr>' +
                '<td>Round Damage (SPR):</td>' +
                '<td><span id="roundStats">0 (0)</span></td>' +
                '</tr>');
            $('#divExpTimer table tr:last').before('<tr>' +
                '<td>Hit Damage (%):</td>' +
                '<td><span id="hitStats">0 (0.00 %)</span></td>' +
                '</tr>');
            $('#divExpTimer table tr:last').before('<tr>' +
                '<td>BS Damage (%):</td>' +
                '<td><span id="bsStats">0 (0.00 %)</span></td>' +
                '</tr>');
            $('#divExpTimer table tr:last').before('<tr>' +
                '<td>Crit Damage (%):</td>' +
                '<td><span id="critStats">0 (0.00 %)</span></td>' +
                '</tr>');
            $('#divExpTimer table tr:last').before('<tr>' +
                '<td>Miss Percentage:</td>' +
                '<td><span id="missStats">0.00 %</span></td>' +
                '</tr>');
            $('#divExpTimer table tr:last').before('<tr>' +
                '<td>Dodge Percentage:</td>' +
                '<td><span id="dodgeStats">0.00 %</span></td>' +
                '</tr>');
            $('#divExpTimer table tr:last').before('<tr>' +
                '<td>Glance Percentage:</td>' +
                '<td><span id="glanceStats">0.00 %</span></td>' +
                '</tr>');
            $('#btnResetExpTimer').click(function() {
                _this.resetCombatStats();
            });
            setInterval(function() {
                _this.setStatsUI();
            }, 2000);
        }
        Object.defineProperty(CombatStatsWatcher.prototype, "roundDamageAvg", {
            get: function() {
                if (this.roundCount === 0)
                    return "0";
                return Math.round((this.hitDamage + this.critDamage) / this.roundCount).toString();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CombatStatsWatcher.prototype, "swingsPerRound", {
            get: function() {
                if (this.roundCount === 0)
                    return "0";
                return Math.round(this.swingCount / this.roundCount).toString();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CombatStatsWatcher.prototype, "hitPercent", {
            get: function() {
                return this.getPercent(this.hitCount, this.swingCount);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CombatStatsWatcher.prototype, "hitDamageAvg", {
            get: function() {
                if (this.hitCount === 0)
                    return "0";
                return Math.round(this.hitDamage / this.hitCount).toString();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CombatStatsWatcher.prototype, "bsPercent", {
            get: function() {
                return this.getPercent(this.bsCount, this.bsAttempt);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CombatStatsWatcher.prototype, "bsDamageAvg", {
            get: function() {
                if (this.bsCount === 0)
                    return "0";
                return Math.round(this.bsDamage / this.bsCount).toString();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CombatStatsWatcher.prototype, "critPercent", {
            get: function() {
                return this.getPercent(this.critCount, this.swingCount);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CombatStatsWatcher.prototype, "critDamageAvg", {
            get: function() {
                if (this.critCount === 0)
                    return "0";
                return Math.round(this.critDamage / this.critCount).toString();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CombatStatsWatcher.prototype, "missPercent", {
            get: function() {
                return this.getPercent(this.missCount, this.swingCount);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CombatStatsWatcher.prototype, "dodgePercent", {
            get: function() {
                return this.getPercent(this.dodgeCount, this.swingsAtYouCount);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CombatStatsWatcher.prototype, "glancePercent", {
            get: function() {
                return this.getPercent(this.glanceCount, this.swingsAtYouCount);
            },
            enumerable: true,
            configurable: true
        });
        CombatStatsWatcher.prototype.setStatsUI = function() {
            $('#roundStats').text(this.roundDamageAvg + " (" + this.swingsPerRound + " SPR)");
            $('#hitStats').text(this.hitDamageAvg + " (" + this.hitPercent + " %)");
            $('#bsStats').text(this.bsDamageAvg + " (" + this.bsPercent + " %)");
            $('#critStats').text(this.critDamageAvg + " (" + this.critPercent + " %)");
            $('#missStats').text(this.missPercent + " %");
            $('#dodgeStats').text(this.dodgePercent + " %");
            $('#glanceStats').text(this.glancePercent + " %");
        };
        CombatStatsWatcher.prototype.resetCombatStats = function() {
            this.swingCount = 0;
            this.hitCount = 0;
            this.hitDamage = 0;
            this.bsCount = 0;
            this.bsDamage = 0;
            this.bsAttempt = 0;
            this.critCount = 0;
            this.critDamage = 0;
            this.missCount = 0;
            this.swingsAtYouCount = 0;
            this.dodgeCount = 0;
            this.glanceCount = 0;
            this.roundCount = 0;
        };
        CombatStatsWatcher.prototype.combatSwingOverride = function(actionData) {
            this.wmCombatSwing(actionData);
            if (actionData.AttackerID === playerID) {
                var now = Date.now();
                if (!this.inRound || (now - this.roundStart) > 1500) {
                    this.roundStart = now;
                    this.inRound = true;
                    this.roundCount++;
                }
                if (actionData.Surprise) {
                    this.bsAttempt++;
                } else {
                    this.swingCount++;
                }
                switch (actionData.SwingResult) {
                    case 1:
                        if (actionData.Surprise) {
                            this.bsCount++;
                            this.bsDamage += actionData.Damage;
                        } else {
                            this.hitCount++;
                            this.hitDamage += actionData.Damage;
                        }
                        break;
                    case 2:
                        this.critCount++;
                        this.critDamage += actionData.Damage;
                        break;
                    case 0:
                        this.missCount++;
                        break;
                }
            } else if (actionData.TargetID === playerID) {
                this.inRound = false;
                this.swingsAtYouCount++;
                switch (actionData.SwingResult) {
                    case 3:
                        this.dodgeCount++;
                        break;
                    case 4:
                        this.glanceCount++;
                        break;
                }
            } else {
                this.inRound = false;
            }
        };
        CombatStatsWatcher.prototype.getPercent = function(count, total) {
            return total === 0 ? "0.00" : ((count / total) * 100).toFixed(2);
        };
        return CombatStatsWatcher;
    }());
    JaegerWM.CombatStatsWatcher = CombatStatsWatcher;
})(JaegerWM || (JaegerWM = {}));

let statsWatcher;
setTimeout(function() {
    statsWatcher = new JaegerWM.CombatStatsWatcher();
}, 2000);