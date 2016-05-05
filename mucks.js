/**
 * http://usejsdoc.org/
 */


$('#mapCanvas').click(function (e) {
	var coords = getMousePos(this, e);
    var clickedX = coords.x;
    var clickedY = coords.y;
     
    for (var i = 0; i < map._rooms.length; i++) {
        if (clickedX < map._rooms[i].right && clickedX > map._rooms[i].left && clickedY < map._rooms[i].top && clickedY > map._rooms[i].bottom) {
        	autoMapWalk(map._rooms[i].id);
        }
    }
});

////////////////////////////////////////////////////////////

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
    	// I needed to -7 to get accurate clicks on my screen, this value may not hold for you.
        x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width -7,
        y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height -7
    };
}
