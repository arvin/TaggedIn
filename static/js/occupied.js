function parseOccupiedRooms() {
	$.getJSON('/rooms', parseOccupied).fail(function() {
		console.log('error');
	});
}

function parseOccupied(json) {
	var hashOfOccupied = [];
	for (var i = 0; i < json.length; i++)
	{
		var singleJson = json[i];
		if(singleJson["occupied"])
		{
			console.log("Test");
			var id = singleJson["id"];
			hashOfOccupied.push(id);
		}
	}
	return hashOfOccupied;
}