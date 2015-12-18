$('<input id="chkScrollToBottom" type="checkbox"><span>scroll to bottom?</span></input>').insertAfter("#divConversations");
function scrollToBottom() {
	if($("#chkScrollToBottom").prop("checked")){
		var objDiv = document.getElementById("divConversations");
		objDiv.scrollTop = objDiv.scrollHeight;
	}
}