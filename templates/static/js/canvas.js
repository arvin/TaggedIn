// Class Constants
function Constants() {}

Constants.FONT_FAMILY = "Helvetica Neue, Helvetica, Arial, sans-serif";

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
		context.fillStyle = '#ED7E7E';
		context.strokeStyle = '#D13B3B';
	}
	else {
		context.fillStyle = '#8FF57A';
		context.strokeStyle = '#49B035';
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

// Global
function initialize() {
	window.view = new View(document.getElementById('floor-plan'), document.getElementById('floor-plan-wrapper'));
	$.getJSON('static/json/floor_9.json', function(json) {
		parseFloorPlan('9th Floor', json);
	}).fail(function() {
		console.log('error');
	});
	bindFloorDropdownEvents();
}

function bindFloorDropdownEvents() {
	$('#floor-dropdown a').click(function(event) {
		var floorName = $(event.target).text() + ' Floor';
		$.getJSON('static/json/' + $(event.target).data('floor-plan-href'), function(json) {
		parseFloorPlan(floorName, json);
		}).fail(function() {
			console.log('error');
		});
	});
}

function parseFloorPlan(floorName, json) {
	var floorPlan = new FloorPlan(json);
	window.view.setFloorPlan(floorPlan);
	setViewOccupiedRooms();
	$('#floor-title').text(floorName);
}

function setViewOccupiedRooms() {
	parseOccupiedRooms(function(occupiedSet) {
		window.view.setOccupied(occupiedSet);
		repeatedParseOccupiedRooms();
	});
}

function repeatedParseOccupiedRooms() {
	clearTimeout(window.refreshTimeout);
	window.refreshTimeout = setTimeout(setViewOccupiedRooms, 10000);
}

$(document).ready(initialize);
