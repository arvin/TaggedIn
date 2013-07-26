// Class Constants
function Constants() {}

Constants.FONT_FAMILY = "Helvetica Neue, Helvetica, Arial, sans-serif";
Constants.FLOOR_PLANS = [
	[9, 'floor_9.json'],
	[10, 'floor_10.json']
];

// Class FloorPlan
function FloorPlan(json) {
	this.rooms = new Array();
	for (var i = 0; i < json.rooms.length; ++i)
		this.rooms.push(new Room(json.rooms[i]));
}

// Class Room
function Room(json) {
	if (json.coordinates.length < 3)
		throw 'Warning: Room ' + room.name + ' has fewer than 3 coordinates.';

	this.id = json.id;
	this.name = json.name;
	this.shouldShowLabel = json.should_show_label;
	this.isBookable = json.bookable;
	this.coordinates = new Array();

	var min = Point.MAX_VALUE;
	var max = Point.MIN_VALUE;
	for (var i = 0; i < json.coordinates.length; ++i) {
		var point = new Point(json.coordinates[i][0], json.coordinates[i][1]);
		this.coordinates.push(point);
		min = Point.min(min, point);
		max = Point.max(max, point);
	}
	this.center = new Point((max.x + min.x) / 2, (max.y + min.y) / 2);
}

// Class Point
function Point(x, y) {
	this.x = x;
	this.y = y;
}

Point.MIN_VALUE = new Point(-Number.MAX_VALUE, -Number.MAX_VALUE);
Point.MAX_VALUE = new Point(Number.MAX_VALUE, Number.MAX_VALUE);

Point.min = function(a, b) {
	return new Point(Math.min(a.x, b.x), Math.min(a.y, b.y));
}

Point.max = function(a, b) {
	return new Point(Math.max(a.x, b.x), Math.max(a.y, b.y));
}

Point.prototype.scale = function(canvas) {
	return new Point(this.x * canvas.width / 100, this.y * canvas.height / 100);
}

//Class View
function View(canvas, wrapper) {
	this.canvas = canvas;
	this.wrapper = wrapper;
	this.bindEvents();
	this.rooms = new Array();
}

View.prototype.bindEvents = function() {
	_this = this;
	$(window).resize(function() {
		_this.draw();
	});
	this.canvas.addEventListener('mousemove', function(evt) {
		_this.mouseMove(evt);
	});
	this.canvas.addEventListener('mouseout', function(evt) {
		_this.mouseOut();
	});
}

View.prototype.convertEventToPoint = function(evt) {
	var rect = this.canvas.getBoundingClientRect();
	return new Point(evt.clientX - rect.left, evt.clientY - rect.top);
}

View.prototype.definePath = function(context, room) {
	context.beginPath();

	var tempPoint = room.coordinates[0].scale(this.canvas);
	context.moveTo(tempPoint.x, tempPoint.y);
	for (var i = 1; i < room.coordinates.length; ++i) {
		tempPoint = room.coordinates[i].scale(this.canvas);
		context.lineTo(tempPoint.x, tempPoint.y);
	}

	context.closePath();
}

View.prototype.draw = function() {
	this.canvas.width = Math.min(this.wrapper.clientWidth, this.wrapper.clientHeight);
	this.canvas.height = Math.min(this.wrapper.clientWidth, this.wrapper.clientHeight);
	var context = this.canvas.getContext('2d');

	context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	this.drawRooms(context);
}

View.prototype.drawRoom = function(context, room) {
	this.definePath(context, room);
	context.lineWidth = 2;
	if (!room.isBookable) {
		context.fillStyle = '#CCCCCC';
		context.strokeStyle = '#999999';
	}
	else if (room.isOccupied) {
		context.fillStyle = room.isSelected ? '#F5D0D0' : '#ED7E7E';
		context.strokeStyle = room.isSelected ? '#D98F8F' : '#D13B3B';
	}
	else {
		context.fillStyle = room.isSelected ? '#C6F2BD' : '#8FF57A';
		context.strokeStyle = room.isSelected ? '#8ED681' : '#49B035';
	}
	context.fill();
	context.stroke();
}

View.prototype.drawRoomText = function(context, room) {
	if (!room.shouldShowLabel)
		return;

	context.font = this.getTextSize() + "pt " + Constants.FONT_FAMILY;
	context.fillStyle = '#333333';
	context.textAlign = 'center';
	var tempPoint = room.center.scale(this.canvas);
	context.fillText(room.name, tempPoint.x, tempPoint.y);
}

View.prototype.drawRooms = function(context) {
	for (var i = 0; i < this.rooms.length; ++i)
		this.drawRoom(context, this.rooms[i]);
	for (var i = 0; i < this.rooms.length; ++i)
		this.drawRoomText(context, this.rooms[i]);
}

View.prototype.getTextSize = function() {
	var min = Math.min(this.canvas.width, this.canvas.height);
	if (min < 480)
		return 7;
	if (min < 600)
		return 8;
	if (min < 768)
		return 9;
	return 10;
}

View.prototype.mouseMove = function(evt) {
	var mousePos = this.convertEventToPoint(evt);
	var context = this.canvas.getContext('2d');
	for (var i = 0; i < this.rooms.length; ++i) {
		this.definePath(context, this.rooms[i]);
		this.rooms[i].isSelected = context.isPointInPath(mousePos.x, mousePos.y);
	}
	this.draw();
}

View.prototype.mouseOut = function(evt) {
	for (var i = 0; i < this.rooms.length; ++i)
		this.rooms[i].isSelected = false;
	this.draw();
}

View.prototype.highlight = function(roomId) {
	var highlighted = false;
	for (var i = 0; i < this.rooms.length; ++i)
		this.rooms[i].isSelected = this.rooms[i].id === roomId;
	this.draw();
}

View.prototype.setFloorPlan = function(floorPlan) {
	this.rooms = new Array();
	for (var i = 0; i < floorPlan.rooms.length; ++i)
		this.rooms.push(new View.RoomView(floorPlan.rooms[i]));
	this.draw();
}

View.prototype.setOccupied = function(occupiedSet) {
	for (var i = 0; i < this.rooms.length; ++i)
		this.rooms[i].isOccupied = this.rooms[i].id in occupiedSet;
	this.draw();
}

// Class View.RoomView
View.RoomView = function(room) {
	this.id = room.id;
	this.name = room.name;
	this.coordinates = room.coordinates;
	this.center = room.center;
	this.shouldShowLabel = room.shouldShowLabel;
	this.isBookable = room.isBookable;
	this.isSelected = false;
	this.isOccupied = false;
}

// Class SideBar
SideBar = function(sideBarElement) {
	this.sideBarElement = sideBarElement;
}

SideBar.prototype.setFreeRooms = function(freeRoomsHash) {
	var $container = $('.rooms-container', this.sideBarElement);
	$('.rooms li', $container).addClass('invalidated');
	$.each(freeRoomsHash, function(id, nameFloorTuple) {
		var $element = $('#room-' + id, $container);
		if ($element.length > 0)
			$element.removeClass('invalidated');
		else {
			var aTag = document.createElement('a');
			aTag.setAttribute('href', '#');
			aTag.innerHTML = nameFloorTuple[0];
			aTag.setAttribute('data-id', id);
			aTag.setAttribute('data-floor', nameFloorTuple[1]);
			var liTag = document.createElement('li');
			liTag.setAttribute('id', 'room-' + id);
			liTag.setAttribute('data-id', id);
			liTag.setAttribute('data-floor', nameFloorTuple[1]);
			liTag.appendChild(aTag);
			$('.floor-' + nameFloorTuple[1] + ' .rooms', $container).append(liTag); 
			$(liTag).click(function(evt) {
				selectRoom(parseInt($(evt.target).data('floor')), parseInt($(evt.target).data('id')));
			});
		}
	});
	$('.rooms li.invalidated', $container).remove();
}

// Global
function initialize() {
	window.floorPlans = {};
	var floorPlanLoadCount = 0;
	window.view = new View(document.getElementById('floor-plan'), document.getElementById('floor-plan-wrapper'));
	window.sideBar = new SideBar(document.getElementById('#sidebar-container'));
	loadFloor(0);
	bindFloorDropdownEvents();
}

function loadFloor(index) {
	$.getJSON('static/json/' + Constants.FLOOR_PLANS[index][1], function(json) {
		window.floorPlans[Constants.FLOOR_PLANS[index][0]] = new FloorPlan(json);
		index++;
		if (index === Constants.FLOOR_PLANS.length)
			contentLoaded();
		else
			loadFloor(index);
	}).fail(function() {
		console.log('error');
	});
}

function contentLoaded() {
	setFloor(9);
}

function bindFloorDropdownEvents() {
	$('#floor-dropdown a').click(function(event) {
		setFloor(parseInt($(event.target).data('floor')));
	});
}

function setFloor(floorNumber) {
	window.floorNumber = floorNumber;
	window.view.setFloorPlan(window.floorPlans[floorNumber]);
	setViewOccupiedRooms();
	setFreeRooms();
	$('#floor-title').text(toFloorName(floorNumber));
}

function selectRoom(floorNumber, roomId) {
	if (window.floorNumber !== floorNumber)
		setFloor(floorNumber);
	window.view.highlight(roomId);
}

function toFloorName(floorNumber) {
	if (floorNumber % 100 >= 10 && floorNumber % 100 < 20)
		return floorNumber + 'th';
	switch (floorNumber % 10) {
		case 1:
			return floorNumber + 'st';
		case 2:
			return floorNumber + 'nd';
		case 3:
			return floorNumber + 'rd';
	}
	return floorNumber + 'th';
}

function setViewOccupiedRooms() {
	parseOccupiedRooms(function(occupiedSet) {
		window.view.setOccupied(occupiedSet);
		repeatedParseOccupiedRooms();
	});
}

function repeatedParseOccupiedRooms() {
	clearTimeout(window.refreshOccupiedRoomsTimeout);
	window.refreshOccupiedRoomsTimeout = setTimeout(setViewOccupiedRooms, 10000);
}

function setFreeRooms() {
	parseFreeRooms(function(freeRoomsMap) {
		window.sideBar.setFreeRooms(freeRoomsMap);
		repeatedParseFreeRooms();
	});
}

function repeatedParseFreeRooms() {
	clearTimeout(window.refreshFreeRoomsTimeout);
	window.refreshFreeRoomsTimeout = setTimeout(setFreeRooms, 10000);
}

$(document).ready(initialize);
