function parseOccupiedRooms(callback) {
	$.getJSON('rooms', function(json) {
		parseOccupied(json, callback);
	}).fail(function(asdf) {
		console.log(asdf);
	});
}

function parseOccupied(json, callback) {
	var hashOfOccupied = {};
	for (var i = 0; i < json.rooms.length; i++)
	{
		var singleJson = json.rooms[i];
		if(singleJson["occupied"])
		{
			console.log("Test");
			var id = singleJson["id"];
			hashOfOccupied[id] = true;
		}
	}
	callback(hashOfOccupied);
}
