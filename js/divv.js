var DW = {

	/**
	 * api url
	 * @type {String}
	 */
	queryUrl: 'https://divvapi.parkshark.nl/apitest.jsp?callback=?',

	/**
	 * api call params
	 * @type {Object}
	 */
	params: {
		//csurl: 'http://divvapi.parkshark.nl/apitest.jsp?callback=?',
		action: 'plan',
		to_lat: 52.372,
		to_lon: 4.860,
		dd: 15,					//day
		mm: 3,					//month
		yy: 2014,				//year
		h: 13,					//hour
		m: 0,					//minute
		dur: 2,					//duration
		opt_routes: 'y',
		opt_routes_ret: 'n',	// Also calculate the return routes (y/n)
		opt_am: 'n',			// Include the full list of meters	(y/n)
		opt_rec: 'y',			// return recommendations (y/n)
		plan_radius: 1
	},

	autocomplete: {},			//google autocomplate object
	placesService: {},			//google places serive
	mapBounds: {},				//current google map bounds
	geolocation: '',			//geolocations of destination
	map: {},					//leaflet map
	markers: [],				//hold all markers on the map
	garages: [],				//holds garages search results
	polylines: [],				//holds all polylines shown on the map
	nodeMarkers: [],			//holds all nodemarkers between polylines
	destinationMarker: {},		//holds destination marker
	destinationName: "",
	iconlist: {},
	isInCentrum: "",
	isInPaidParking: "",

	destinationMarkerIcon: L.icon({
		iconUrl: 'images/destination.png',
		iconRetinaUrl: 'images/destination@2x.png',
		iconSize: [29, 36],
		iconAnchor: [29, 36],
		popupAnchor: [-1, -34]
	}),

	garageIcon: L.icon({
		iconUrl: 'images/parking-garage.png',
		iconRetinaUrl: 'images/parking-garage@2x.png',
		iconSize: [26, 26],
		iconAnchor: [26, 26],
		popupAnchor: [-1, -34],
		shadowUrl: 'images/marker-shadow.png',
		shadowRetinaUrl: 'images/marker-shadow@2x.png',
		shadowSize: [36, 36],
		shadowAnchor: [31, 29]
	}),

	osmIcon: L.icon({
		iconUrl: 'images/on-street-meter.png',
		iconRetinaUrl: 'images/on-street-meter@2x.png',
		iconSize: [26, 26],
		iconAnchor: [26, 26],
		popupAnchor: [-1, -34],
		shadowUrl: 'images/marker-shadow.png',
		shadowRetinaUrl: 'images/marker-shadow@2x.png',
		shadowSize: [36, 36],
		shadowAnchor: [31, 29]
	}),

	parIcon: L.icon({
		iconUrl: 'images/park-and-ride.png',
		iconRetinaUrl: 'images/park-and-ride@2x.png',
		iconSize: [26, 26],
		iconAnchor: [26, 26],
		popupAnchor: [-1, -34],
		shadowUrl: 'images/marker-shadow.png',
		shadowRetinaUrl: 'images/marker-shadow@2x.png',
		shadowSize: [36, 36],
		shadowAnchor: [31, 29]
	}),

	nodeIcon: L.icon({
		iconUrl: 'images/node.png',
		iconRetinaUrl: 'images/node@2x.png',
		iconSize: [14, 14],
		iconAnchor: [14, 14]
	}),

	/**
	 * LatLon locations for all train stations in Amsterdam
	 * @type {Array}
	 */
	trainStations: [
		{
			name: 'Amsterdam Centraal',
			lat: 52.378706,
			lon: 4.900489
		},
		{
			name: "Amsterdam Bijlmer ArenA",
			lat: 52.312011,
			lon: 4.947046
		},
		{
			name: "Amsterdam Sloterdijk",
			lat: 52.389133,
			lon: 4.837017
		},
		{
			name: "Amsterdam Amstel",
			lat: 52.346689,
			lon: 4.917453
		},
		{
			name: "Amsterdam Zuid",
			lat: 52.339192,
			lon: 4.873894
		},
		{
			name: "Amsterdam Lelylaan",
			lat: 52.358641,
			lon: 4.833901
		},
		{
			name: "Amsterdam Muiderpoort",
			lat: 52.360656,
			lon: 4.931384
		},
		{
			name: "Duivendrecht",
			lat: 52.323682,
			lon: 4.936545
		},
		{
			name: "Holendrecht", //hoolendrecht
			lat: 52.29799,
			lon: 4.9605207
		},
		{
			name: "Amsterdam Rai", //rai
			lat: 52.3370321,
			lon: 4.8900462
		},
		{
			name: "Amsterdam Science Park", //science park
			lat: 52.352904,
			lon: 4.9482893
		},
	],

	months: ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'julie', 'augustus', 'september', 'oktober', 'november', 'december'],
	months: ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'],
	//		0	   1	2	 3	  4	   5    6
	days: ['Zo	', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'],

	/**
	 * initalizes the app
	 * @return {[type]} [description]
	 */
	init: function () {

		DW.initAutocomplete();
		DW.iconlist = {
			'on-street-meter': DW.osmIcon,
			'parking-garage': DW.garageIcon,
			'park-and-ride': DW.parIcon
		};

		//activate home button
		$('.nav .button.home').click(function (e) {
			e.preventDefault();
			DW.home();
		});

		//activate back button from detail
		$('.nav .button.overview').click(function (e) {
			e.preventDefault();
			DW.overview();
		});


		//fill date dropdown
		var d = new Date();
		var options = $("#date");
		for (i = 0; i < 14; i++) {
			var value = d.getFullYear().toString() + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2);
			if (i == 0) text = 'vandaag';
			else if (i == 1) text = 'morgen';
			else text = DW.days[d.getDay()] + ' ' + d.getDate().toString() + ' ' + DW.months[d.getMonth()];
			options.append($("<option />").val(value).text(text));
			d.setDate(d.getDate() + 1);
		}

		if (d.getHours() < 23) {
			defaultHour = d.getHours() + 1
		} else {
			defaultHour = 0;
		}

		$('#time').val(defaultHour);

		//make them look pretty
		if (DW.checkMobile()) {
			//disable panning on mobile
			Map.dragging.disable();
		} else {
			$('#date').selectize({create: false});
			$('#time').selectize({create: false});
			$('#duration').selectize({create: false});

			//disable typing in dropdowns
			$('.selectize-input.items input').attr('readonly', 'true');
		}

		//make full address box clickable for focus
		$('.address').click(function (e) {
			$(this).find('input#searchInput').focus().select();
		});


		if ($('#searchInput').val() != '') {
			DW.getGeoByString($('#searchInput').val(), function (geo) {
				if (geo) {
					var marker = L.marker([geo.lat, geo.lon], {icon: DW.destinationMarkerIcon}).addTo(Map);
					DW.markers.push(marker);
					DW.destinationMarker = marker;
				}
			});
		}


	},

	/*
	 * Navigate to the home screen
	 */
	home: function () {

		ga('send', 'event', 'button', 'back to home', 'home');

		$(".results").fadeOut(300, function () {
			$('.gratis-result').hide();
			$(".search").fadeIn(300);
		});

		DW.clearMarkers();
	},

	/*
	 * Navigate back to overview from detail view
	 */
	overview: function () {

		ga('send', 'event', 'button', 'back to overview', 'overview');

		$('.container').animate({scrollTop: "0"});

		$(".details").fadeOut(300, function () {
			$('.not-centrum-warning').hide();
			$(this).hide();
			$('.results').show();
			$(".results").animate({right: 0}, 300);

			DW.clearPolylines();
			//show all markers again
			$.each(DW.garages, function (index, value) {
				Map.addLayer(value.marker);
			});
		});
	},

	getGeoByString: function (string, callback) {
		var request = {
			location: DW.geolocation,
			query: string,
			radius: 5000,
			language: 'nl'
		};

		DW.placesService.textSearch(request, function (place, status) {
			if (undefined != place[0]) {
				geo = place[0].geometry.location;
				cor = {lat: geo.lat(), lon: geo.lng()};
				callback(cor);
			} else {
				callback(false);
			}
		});
	},

	/**
	 * Prepare the query by processing the dom and filling the params in js
	 * @return {[type]} [description]
	 */
	prepareQuery: function () {

		ga('send', 'event', 'button', 'search', 'search');

		$('div.search-warning').hide();
		$('div.api-warning').hide();
		$('div.address').removeClass('error');
		cor = DW.getLatLong();

		var date = $("#date").val();
		DW.params.yy = date.substr(0, 4);
		DW.params.mm = date.substr(4, 2);
		DW.params.dd = date.substr(6, 2);

		DW.params.dur = $("#duration").val();
		DW.params.h = $("#time").val();

		if (cor) {
			DW.params.to_lat = cor.lat;
			DW.params.to_lon = cor.lon;
			DW.destinationName = DW.autocomplete.getPlace().name;
			DW.queryDivv();
		} else if ($('#searchInput').val() != '' && !cor) {

			var request = {
				location: DW.geolocation,
				query: $('#searchInput').val(),
				radius: 5000,
				language: 'nl'
			};

			DW.placesService.textSearch(request, function (place, status) {

				if (undefined != place[0]) {

					geo = place[0].geometry.location;
					cor = {lat: geo.lat(), lon: geo.lng()};
					DW.params.to_lat = cor.lat;
					DW.params.to_lon = cor.lon;

					DW.destinationName = place[0].name

					DW.queryDivv();
				} else {
					$('div.address').addClass('error');
				}
			});

		} else if (!cor) {

			$('div.address').addClass('error');
		}
	},


	/*
	 * start query by preparing the request 
	 */
	queryDivv: function () {

		$(".duration-input").removeClass('error');
		if (DW.params.dur == '') {
			$(".duration-input").addClass('error');
			return;
		}

		$('.location-name').html(DW.destinationName);
		$('.note span.location').html(DW.destinationName);

		$(".search").fadeOut(300, function () {
			$(this).hide();
			$('.loader').fadeIn(150, function () {
				//do the actual request
				DW.requestData();
			});
		});
	},

	/*
	 * Fetch results from the divv api, passing the this.param
	 */
	requestData: function () {

		$.getJSON(this.queryUrl, DW.params, function (data, status) {

			// KAREN: enabled again
			// is it in paid Amsterdam area 
			if (data.result.isInAmsterdamWiderArea == 'n') {
				$('.loader').fadeOut(150, function () {
					$('div.address').addClass('error');
					$('div.search-warning').show();
					DW.home();
				});
			} else if (status != 'success') {
				//if(status != 'success'){
				$('.loader').fadeOut(150, function () {
					$('div.api-warning').show();
					DW.home();
				});
			} else {

				DW.isInCentrum = data.result.isInAmsterdamCentrum;
				DW.isInPaidParking = data.result.isInPaidParkingAmsterdam;


				if (DW.isInPaidParking === 'n') {
					$('.gratis-result').show();
				}

				DW.clearMarkers();

				apiResult = data.result.reccommendations;

				var marker = L.marker([DW.params.to_lat, DW.params.to_lon], {icon: DW.destinationMarkerIcon}).addTo(Map);
				DW.markers.push(marker);
				DW.destinationMarker = marker;

				var searchDate = new Date(DW.params.yy, DW.params.mm - 1, DW.params.dd);

				var durationString = DW.days[searchDate.getDay()] + ' ' + DW.params.dd + ' ' + DW.months[DW.params.mm - 1] + ' ' + DW.params.h + ':00 voor ' + DW.params.dur + ' uur';
				$('.date-durations').html(durationString);

				// we have 3 types: on-street-meter | parking-garage | park-and-ride
				// need 1 of each

				// KAREN CHANGED: displaytype: 'park-and ride' to displaytype: 'p-and-r' and changed back
				if (DW.isInPaidParking === 'y') {
					types = [{displaytype: 'park-and-ride', count: 3}, {displaytype: 'parking-garage', count: 1}, {
						displaytype: 'on-street-meter',
						count: 1
					}];
				} else {
					types = [{displaytype: 'park-and-ride', count: 3}, {displaytype: 'parking-garage', count: 1}, {
						displaytype: 'on-street-meter',
						count: 0
					}];
				}


				$.each(types, function (index, value) {

					DW.selectOption(apiResult, value.displaytype, value.count);

				});

				var finished = 0
				//fix data problems, sanatize for viewing
				$.each(DW.garages, function (index, value) {

					// KAREN: CHANGED URL
					var PTUrl = "https://divvapi.parkshark.nl/divvapi" + value.reccommended_pt_route.proxy_url + "&callback=?";
					$.jsonp({
						url: PTUrl,
						success: function (data) {
							DW.garages[index].reccommended_pt_route = data.result.ptroute;
							finished++;
							console.log(finished);
							if (finished == DW.garages.length) {
								DW.formatRouteData();
							}
						},
						error: function (data) {
							$('.loader').fadeOut(150, function () {
								$('div.api-warning').show();
								DW.home();
							});
						}
					});
				});
			}
		});
	},

	formatRouteData: function () {
		//fix data problems, sanatize for viewing
		$.each(DW.garages, function (index, value) {

			var garage = DW.garages[index];

			//return false;
			// KAREN: bij de p and r's gaan de legs mis
			if (typeof garage.reccommended_pt_route.legs != 'undefined') {
				$.each(garage.reccommended_pt_route.legs, function (j, val) {
					if (val.type == "leg") {
						if (val.mode.toUpperCase() != "WALKING") {
							DW.garages[index].has_pt = true;
							return false;
						} else {
							DW.garages[index].has_pt = false;
						}
					}
				});
			}

			if (value.sort_type == 'on-street-meter') {
				value.name = value.name.replace(/T\/H_BORD|T\/H|T\/O|_BORD|t\/o/g, '');
				value.name = value.name.toLowerCase();
			}

			//rewrite duration to minutes for entire trip
			value.reccommended_pt_route.duration = Math.round(value.reccommended_pt_route.duration / 60);

			if (value.reccommended_pt_route.duration == 0) value.reccommended_pt_route.duration = 'Geen';
			else if (value.reccommended_pt_route.duration == 1) value.reccommended_pt_route.duration += ' minuut';
			else value.reccommended_pt_route.duration += ' minuten';

			if (value.notes == "null") value.notes = false;

			//parse costs
			value.prcost = value.cost ? value.cost : 0;
			value.ptcost = value.reccommended_pt_route.cost ? value.reccommended_pt_route.cost : 0;
			value.cost_total = parseFloat(value.prcost) + parseFloat(value.ptcost);


			//check if is on street meter and in busy area to add warning mesages
			pricePerHour = value.cost / DW.params.dur;


			if (value.sort_type == 'on-street-meter' && pricePerHour > 4) {
				DW.garages[index].busy = "Let op, het is hier vaak druk. Je weet dus nooit zeker of en waar je in de buurt op straat kunt parkeren. In een parkeergarage of op een P+R is vaak wel plek.";
			} else if (value.sort_type == 'on-street-meter' && pricePerHour > 3) {
				DW.garages[index].busy = "Let op, het kan in Amsterdam soms druk zijn. Je weet dus nooit zeker of en waar je in de buurt op straat kunt parkeren. Een parkeergarage of P+R geeft vaak meer zekerheid.";
			} else if (value.sort_type == 'on-street-meter') {
				DW.garages[index].busy = "Dit advies toont een parkeerautomaat in de buurt van je bestemming. Afhankelijk van de beschikbare parkeerplaatsen, kun je mogelijk iets dichterbij parkeren of net iets verder weg.";
			}

			if (value.cost_total == 0) value.display_cost_total = 'Gratis'
			else value.display_cost_total = '€ ' + value.cost_total.toFixed(2);

			if (value.cost == 0) value.display_cost = 'Gratis';
			else value.display_cost = '€ ' + value.cost.toFixed(2);

			if (value.reccommended_pt_route.cost == 0) value.reccommended_pt_route.display_cost = 'Gratis';
			else value.reccommended_pt_route.display_cost = '€ ' + value.reccommended_pt_route.cost.toFixed(2);

			if (undefined != value.reccommended_pt_route.legs) {
				$.each(value.reccommended_pt_route.legs, function (index, leg) {
					//rewrite duration to minutes for legs
					leg.duration = Math.round(leg.duration / 60);

					if (leg.duration == 0) leg.duration = '1 minuut';
					else if (leg.duration == 1) leg.duration += ' minuut';
					else leg.duration += ' minuten';

				});

				//rename first leg to parking spot's name
				value.reccommended_pt_route.legs[0].from.name = DW.capitalizeFirstLetter(value.name);

				// add last leg with only destination name
				value.reccommended_pt_route.legs.push({from: {name: DW.destinationName}});
			}
		});

		DW.compileTemplates();
		DW.showResults();

		setTimeout(function () {
			Map.fitBounds(new L.featureGroup(DW.markers));
		}, 0)
	},

	capitalizeFirstLetter: function (string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	},

	clearMarkers: function () {
		for (i = 0; i < DW.markers.length; i++) {
			Map.removeLayer(DW.markers[i]);
		}
		DW.garages = [];
		DW.markers = [];
	},

	clearPolylines: function () {
		for (i = 0; i < DW.polylines.length; i++) {
			Map.removeLayer(DW.polylines[i]);
		}

		for (i = 0; i < DW.nodeMarkers.length; i++) {
			Map.removeLayer(DW.nodeMarkers[i]);
		}

		Map.fitBounds(new L.featureGroup(DW.markers));
		DW.polylines = [];
	},

	compileTemplates: function () {
		var source = $("#result-template").html();
		DW.resultTemplate = Handlebars.compile(source);
	},

	formatOpeninghoursString: function (data) {

		//				   0	     1		   2		  3			  4			5		   6
		var daysString = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];
		days = data.split('|');
		var returnString = '';

		$.each(days, function (index, value) {

			items = value.split(' ');
			console.log(items);

			// [0]= day(s) [1]=open [3]=close

			//multi day case?
			if (items[0][1] == '-') {

				fromDay = items[0][0];
				toDay = items[0][2];

				//days
				returnString += daysString[fromDay] + ' - ' + daysString[toDay] + ' ';

				//hours
				if (items[1] == '0000' && items[3] == '2359') returnString += "24 uur per dag";
				else returnString += items[1] + '-' + items[3];
				returnString += "<br>";
			} else {

				//day
				returnString += daysString[items[0][0]] + ' ';

				//hours
				if (items[1] == '0000' && items[3] == '2359') returnString += "24 uur per dag";
				else returnString += items[1][0] + items[1][1] + ':' + items[1][2] + items[1][3] + ' tot ' + items[3][0] + items[3][1] + ':' + items[3][2] + items[3][3];
				returnString += "<br>";
			}

		});

		return returnString;
	},

	/*
	 * Select an option for the result set optained from the api
	 */
	selectOption: function (apiResult, selector, count) {

		//set count to 1 if not set
		if (undefined === count) count = 1;

		counter = 0;

		var option;
		var extraRadius = 0;
		var startRadius;
		var type;

		$.each(apiResult, function (index, value) {


			if (value.displaytype == 'garage') {
				type = value.garage_type;
			} else {
				type = value.displaytype;
			}

			// KAREN: Moved counter conditinal up here
			if (counter == count) return false;

			if (type == selector) {


				value.sort_type = type;

				//don't display P+R in overview if +1
				if (counter > 0) value.display = false;
				else value.display = true;

				//special on steer meter cases
				if (selector == 'on-street-meter') {
					//street on meter doesn't have a name, use street as name
					if (value.name == "") value.name = value.address;

					//set start radius and first option
					if (!startRadius) {
						startRadius = value.dist_in_meters;
						option = value;
					} else {
						//look for options wider than 'extraRadius'
						if (value.dist_in_meters < startRadius + extraRadius && value.cost < option.cost) {
							option = value;
						} else if (value.dist_in_meters > startRadius + extraRadius) {
							DW.garages.push(option);
							counter++;

						}
					}

				} else {
					DW.garages.push(value);
					counter++;
				}
			}

		});
	},

	/*
	 * Show search result 
	 */
	showResults: function () {

		$('.results .data').html('');

		$.each(this.garages, function (index, value) {
			//show only garages that have display true
			if (value.display) {
				var result = $(DW.resultTemplate(value));

				result.click(function (e) {
					DW.showDetail(value);
				});

				$('.results .data').append(result);
			}

			icon = DW.iconlist[value.sort_type.toString()];

			var marker = L.marker([value.lat, value.lon], {icon: icon}).addTo(Map);

			marker.on('click', function () {
				DW.showDetail(value);
			});

			//add references to marker
			DW.garages[index].marker = marker;
			DW.markers.push(marker);
		});

		//show OV advies
		var nearestStation = DW.getNearestTrainStation(DW.params.to_lat, DW.params.to_lon);

		$('.results .station').html(nearestStation.name);
		$('.results .duration').html(nearestStation.duration);
		$('.results .location').html(DW.destinationName);

		$('.loader').fadeOut(150, function () {
			$('.results').fadeIn();
		});

	},

	/*
	 * Show detail for a parking garage
	 */
	showDetail: function (garage) {

		ga('send', 'event', 'detailpage', garage.sort_type, 'click');

		//hide other garage icons
		$.each(DW.garages, function (index, value) {
			if (value.marker != garage.marker) {
				Map.removeLayer(value.marker);
			}
		});

		var source = $("#result-detail-template").html();
		detailTemplate = Handlebars.compile(source);
		var source = $("#leg-template").html();
		legTemplate = Handlebars.compile(source);

		$('.details .container').html(detailTemplate(garage));
		numLegs = garage.reccommended_pt_route.legs.length;

		//plot every leg of route
		if (numLegs > 1) {

			$.each(garage.reccommended_pt_route.legs, function (index, value) {

				if (undefined != value.mode) {
					value.mode = value.mode.toLowerCase();
					if (value.mode == 'walking') value.walking = true;
					if (value.mode == 'walking') value.mode_display = 'Lopen';
					if (value.mode == 'train') value.mode_display = 'Trein';
					if (value.mode == 'subway') value.mode_display = 'Metro';
					if (value.mode == 'tram') value.mode_display = 'Tram';
					if (value.mode == 'ferry') value.mode_display = 'Pont';
				}

				if (index == 0) value.nodetype = 'first';
				else if (numLegs - 1 == index) value.nodetype = 'last';
				else value.nodetype = 'mid';

				value.id = DW.uuid("leg");

				legHtml = legTemplate(value);

				$('.details .legs').append(legHtml);

				if (undefined != value.transitinfo) {

					var encoded = jQuery.parseJSON(value.transitinfo.polyline);

					//just in case start and end location are the same
					if (encoded.length > 0) {
						var polyline = new L.Polyline.fromEncoded(encoded.points, {color: 'red', className: 'polyline'});
						DW.polylines.push(polyline);
					}

					//add node marker except for last and first node
					if (typeof polyline !== 'undefined') {
						coords = polyline.getLatLngs()
						if (index < numLegs - 1 && index > 0) {

							//var lat = coords[coords.length-1].lat;
							//var lon = coords[coords.length-1].lng;

							var lat = coords[1].lat;
							var lon = coords[1].lng;


							var marker = L.marker([lat, lon], {icon: DW.nodeIcon}).addTo(Map);

							marker.on('mouseover', function (e) {
								$("#" + value.id).addClass('active');
							});

							marker.on('mouseout', function (e) {
								$("#" + value.id).removeClass('active');
							});

							DW.nodeMarkers.push(marker);
						}
					}


					//add hover state for garage marker
					if (index == 0) {

						garage.marker.on('mouseover', function (e) {
							$("#" + value.id).addClass('active');
						});

						garage.marker.on('mouseout', function (e) {
							$("#" + value.id).removeClass('active');
						});
					}
				}

				//add hover state for destinationMarker
				if (index == numLegs - 1) {
					DW.destinationMarker.on('mouseover', function (e) {
						$("#" + value.id).addClass('active');
					});

					DW.destinationMarker.on('mouseout', function (e) {
						$("#" + value.id).removeClass('active');
					});
				}

			});
		}

		//plot the polylines on the map
		if (DW.polylines.length > 0) {
			featureGroup = L.featureGroup(DW.polylines).addTo(Map);
			Map.fitBounds(featureGroup.getBounds());
		} else {
			Map.setView(L.latLng(garage.lat, garage.lon), 16);
		}

		// KAREN: added 'n/a' conditional
		if (undefined !== garage.garage_opening_hours && garage.garage_opening_hours !== 'n/a') {
			openinghours = DW.formatOpeninghoursString(garage.garage_opening_hours)
			$('.openinghours').html(openinghours);
		} else {
			$('.openinghours').html("Niet bekend");
		}

		if (DW.isInCentrum === 'n' && garage.sort_type === "park-and-ride") {
			$('.not-centrum-warning').show();
		}

		$('.results').animate({right: $(".results").outerWidth() + 'px'}, 300, function () {
			$('.results').hide();
			$('.details').fadeIn(300, function () {

				$('.container').niceScroll({
					railpadding: {top: 0, right: 2, left: 0, bottom: 0},
					cursorborder: "1px solid #b1b1b1",
					cursorwidth: 6,
					cursorcolor: "#b1b1b1"
				});
			});
		});

	},

	initAutocomplete: function () {

		var input = document.getElementById('searchInput');
		var options = {
			types: ['geocode', 'establishment'],
			componentRestrictions: {country: 'nl'}
		};

		DW.autocomplete = new google.maps.places.Autocomplete(input, options);
		DW.placesService = new google.maps.places.PlacesService(GoogleLayer._google);

		DW.geolocation = new google.maps.LatLng(52.325, 4.855);
		DW.autocomplete.setBounds(new google.maps.LatLngBounds(DW.geolocation, DW.geolocation));

		return true;
	},

	getLatLong: function () {

		if (undefined == DW.autocomplete.getPlace()) return;


		return {lat: DW.autocomplete.getPlace().geometry.location.lat(), lon: DW.autocomplete.getPlace().geometry.location.lng()};
	},


	getNearestTrainStation: function (lat, lon) {

		nearestDistance = 1000000;
		nearestStation = {};

		$.each(DW.trainStations, function (index, value) {

			if (undefined !== value) {
				var d = DW.getDistanceBetweenLatLong(lat, lon, value.lat, value.lon);
				var m = d / (5000 / 60);

				if (d < nearestDistance) {
					nearestDistance = d;
					value.duration = Math.round(m);

					if (value.duration > 3) value.duration -= 2;

					value.duration = Math.ceil(value.duration / 5) * 5;

					if (value.duration > 20) value.duration = 20;

					value.duration += ' minuten';

					nearestStation = value;
				}
			}
		});

		return nearestStation;
	},

	getDistanceBetweenLatLong: function (lat1, lon1, lat2, lon2) {
		var R = 6371000; // m
		var dLat = (lat2 - lat1).toRad();
		var dLon = (lon2 - lon1).toRad();
		var lat1 = lat1.toRad();
		var lat2 = lat2.toRad();

		var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		var d = R * c;
		return d;
	},

	checkMobile: function () {
		var check = false;
		(function (a) {
			if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))check = true
		})(navigator.userAgent || navigator.vendor || window.opera);
		return check;
	},

	uuid: function (pre) {
		var S4 = function () {
			return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
		};
		return (pre + S4() + S4() + S4());
	}


}

Number.prototype.toRad = function () {
	return this * (Math.PI / 180);
};

Handlebars.registerHelper('equal', function (lvalue, rvalue, options) {
	if (arguments.length < 3)
		throw new Error("Handlebars Helper equal needs 2 parameters");
	if (lvalue != rvalue) {
		return options.inverse(this);
	} else {
		return options.fn(this);
	}
});

Handlebars.registerHelper('notequal', function (lvalue, rvalue, options) {
	if (arguments.length < 3)
		throw new Error("Handlebars Helper equal needs 2 parameters");
	if (lvalue == rvalue) {
		return options.inverse(this);
	} else {
		return options.fn(this);
	}
});

Handlebars.registerHelper('cutoff', function (s) {
	if (s.length > 30) s = s.substring(0, 30) + '...';

	return new Handlebars.SafeString(s);
});

DW.init();