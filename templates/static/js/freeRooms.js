function parseFreeRooms(callback) {
	$.getJSON('rooms/free', function(json) {
		parseFree(json, callback);
	}).fail(function() {
		console.log("ERROR");
		parseFree({"rooms": [{"name": "9th Floor", "floor": 9, "aux_id": 9000, "occupied": false, "id": 1, "bookable": false}, {"name": "Elevator", "floor": 9, "aux_id": 9001, "occupied": false, "id": 2, "bookable": false}, {"name": "Lobby", "floor": 9, "aux_id": 9002, "occupied": false, "id": 3, "bookable": false}, {"name": "Kitchen", "floor": 9, "aux_id": 9003, "occupied": false, "id": 4, "bookable": false}, {"name": "Washrooms", "floor": 9, "aux_id": 9004, "occupied": false, "id": 5, "bookable": false}, {"name": "Levchins", "floor": 9, "aux_id": 9005, "occupied": false, "id": 6, "bookable": true}, {"name": "Comic Shop", "floor": 9, "aux_id": 9006, "occupied": false, "id": 7, "bookable": true}, {"name": "Pawn Shop", "floor": 9, "aux_id": 9007, "occupied": false, "id": 8, "bookable": true}, {"name": "Hookah Bar", "floor": 9, "aux_id": 9008, "occupied": false, "id": 9, "bookable": true}, {"name": "Rifle Range", "floor": 9, "aux_id": 9009, "occupied": false, "id": 10, "bookable": true}, {"name": "Dance Studio", "floor": 9, "aux_id": 9010, "occupied": false, "id": 11, "bookable": true}, {"name": "Aquarium", "floor": 9, "aux_id": 9011, "occupied": false, "id": 12, "bookable": true}, {"name": "10th Floor", "floor": 10, "aux_id": 10000, "occupied": false, "id": 13, "bookable": false}, {"name": "Elevator", "floor": 10, "aux_id": 10001, "occupied": false, "id": 14, "bookable": false}, {"name": "Elevator Area", "floor": 10, "aux_id": 10002, "occupied": false, "id": 15, "bookable": false}, {"name": "Kitchen", "floor": 10, "aux_id": 10003, "occupied": false, "id": 16, "bookable": false}, {"name": "Shower", "floor": 10, "aux_id": 10004, "occupied": false, "id": 17, "bookable": false}, {"name": "Washrooms", "floor": 10, "aux_id": 10005, "occupied": false, "id": 18, "bookable": true}, {"name": "Hostel", "floor": 10, "aux_id": 10006, "occupied": false, "id": 19, "bookable": true}, {"name": "The Creperie", "floor": 10, "aux_id": 10007, "occupied": false, "id": 20, "bookable": true}, {"name": "Gastro Pub", "floor": 10, "aux_id": 10008, "occupied": false, "id": 21, "bookable": true}, {"name": "Dog Park", "floor": 10, "aux_id": 10009, "occupied": false, "id": 22, "bookable": true}, {"name": "Zoo", "floor": 10, "aux_id": 10010, "occupied": false, "id": 23, "bookable": false}, {"name": "Pool Table", "floor": 10, "aux_id": 10011, "occupied": false, "id": 24, "bookable": false}]}, callback);
	});
}

function parseFree(json, callback) {
	var hashOfFree = {};
	for (var i = 0; i < json.rooms.length; i++)
	{
		var singleJson = json.rooms[i];
		if(singleJson["bookable"])
		{
			var id = singleJson["aux_id"];
			var name = singleJson["name"];
			var floor = singleJson["floor"];
			hashOfFree[id] = [name, floor];
		}
	}
	callback(hashOfFree);
}
