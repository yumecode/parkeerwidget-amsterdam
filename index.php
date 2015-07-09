<?php

$params = array('name', 'rgb', 'bg', 'text');
$data = array();

foreach($params as $value) {
	if(isset($_GET[$value])) {
		$data[$value] = $_GET[$value];
	}
}

?>

<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta name="description" content="">
		<meta name="author" content="">
		<meta name="robots" content="noindex, nofollow">
		<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">


		<title>Parkeerwidget Amsterdam</title>

		<link href="css/main.css" rel="stylesheet">
		

		<!-- Alleen voor testen amsterdam Avenir include -->
		<script type="text/javascript" src="http://fast.fonts.net/jsapi/966743dd-98a0-4eff-8095-71b3f07116ab.js"></script>
	
		
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
		<script src="https://maps.google.com/maps/api/js?v=3.2&sensor=false&libraries=places&language=nl"></script>
		<script src="js/leaflet.js"></script>
		<script src="js/jquery.nicescroll.min.js"></script>
		<script src="js/jquery.jsonp.min.js"></script>
		<script src="js/selectize.js"></script>
		<script src="js/Polyline.encoded.js"></script>
		
		<script src="js/leaflet-google.js"></script>
		<script src="js/handlebars-v1.3.0.js"></script>
		
		<!-- HTML5 and JS shim for IE8 support of HTML5 elements and ecma script -->
		<!--[if lt IE 9]>
			<script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
			<script src="https://cdnjs.cloudflare.com/ajax/libs/es5-shim/2.0.8/es5-shim.min.js"></script>
		<![endif]-->
			
		<?php if(isset($data['rgb'])): ?>
			<style type="text/css">
				a {color: #<?php echo $data['rgb'];?> }
				.button { background-color: #<?php echo $data['rgb'];?>}
				.button:hover {background-color: #<?php echo $data['rgb'];?>; opacity: 0.8; }
				.legs .transport-icon { background-color: #<?php echo $data['rgb'];?> !important}
			</style>
		<?php endif; ?>

		<script>
		  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
		  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
		  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

		  ga('create', 'UA-9056588-20', {
			  'cookieDomain': 'none'
			});
		  ga('send', 'pageview');

		</script>
		
	</head>
	
	<body class="<?php if(isset($data['bg'])) echo $data['bg'];?> <?php if(isset($data['text'])) echo $data['text'].'-text';?>">
		<div class="wrapper">
			<div class="contentholder">
				
				<div class="loader" style=""></div>
				
				<div class="search">
					<h1>Slim parkeren in Amsterdam</h1>
					<h2>In 2 stappen de beste parkeerplaats.</h2>
					
					<div class="search-warning">Deze locatie bevindt zich niet in Amsterdam.</div>

					<div class="api-warning">Sorry, de parkeerwidget is erg traag op dit moment. Probeer het later nog eens.</div>
					
					<div class="selectize-input address">
						<input id="searchInput" style="width: 100%;" type="text" placeholder="adres, winkel, restaurant of museum" class="address" value="<?php if(isset($data['name'])) echo $data['name'];?>">
					</div>
					
					<select id="date" class="date-input">

					</select>
					
					<select id="time" class="time-input" >
						<option value="1">01:00</option>
						<option value="2">02:00</option>
						<option value="3">03:00</option>
						<option value="4">04:00</option>
						<option value="5">05:00</option>
						<option value="6">06:00</option>
						<option value="7">07:00</option>
						<option value="8">08:00</option>
						<option value="9">09:00</option>
						<option value="10" selected="selected">10:00</option>
						<option value="11">11:00</option>
						<option value="12">12:00</option>
						<option value="13">13:00</option>
						<option value="14">14:00</option>
						<option value="15">15:00</option>
						<option value="16">16:00</option>
						<option value="17">17:00</option>
						<option value="18">18:00</option>
						<option value="19">19:00</option>
						<option value="20">20:00</option>
						<option value="21">21:00</option>
						<option value="22">22:00</option>
						<option value="23">23:00</option>
						<option value="0">00:00</option>
					</select>
					
					<select id="duration" placeholder="Hoe lang blijf je?" class="duration-input">
						<option value=""></option>
						<option value="1">1 uur</option>
						<option value="2">2 uur</option>
						<option value="3">3 uur</option>
						<option value="4">4 uur</option>
						<option value="5">5 uur</option>
						<option value="6">6 uur</option>
						<option value="7">7 uur</option>
						<option value="8">8 uur</option>
						<option value="12">12 uur</option>
						<option value="24">1 dag</option>
						<option value="48">2 dagen</option>
					</select>
					
					<div class="center">
						<a class="submit button large center" value="submit" onclick="DW.prepareQuery()">Geef parkeeradvies</a>
					</div>
					
					<div class="disclaimer">
						Gemaakt in opdracht van Gemeente Amsterdam<br>
						<a href="http://parkeerwidget.yume.nl" target="_blank" alt="Amsterdamse parkeerwidget">Wil je deze widget ook op je website?</a>
					</div>
					
				</div>
				
				<div class="results">
					<div class="nav">
						<a href="#" class="button home">Wijzig</a>
						<div class="marker-icon"></div>
						<div class="location-data">
							<span class="location-name"></span>
							<span class="date-durations"></span>
						</div>
					</div>
					<div class="pr-result gratis-result">
						<h2>Parkeren op straat</h2>
						<div class="icon icon-on-street-meter"></div>

						<div class="gratis-warning">Je kunt hier gratis parkeren op straat. Let op, een parkeerplaats vinden kan moeilijk zijn. En neem voor blauwe zones een parkeerschijf mee!</div>
					</div>
					
					<div class="data"></div>
					
					<div class="note">
						<h3>Ook aan OV gedacht?</h3>
						<p>Wist je dat je vanaf station <span class="station"></span> binnen <span class="duration"></span> bij <span class="location"></span> bent?</p>
					</div>
				</div>
				
				<div class="details">
					<div class="nav">
						<a href="#" class="button back overview">Overzicht</a>
						<a href="http://9292.nl" target="_blank" class="button button-grey button-9292"><div class="icon-9292"></div>9292</a>				
					</div>
					
					<div class="container">
						
					</div>
					
				</div>


					
			</div>

			<div class="feedback">
				<div class="feedback-label"></div>
				<button class="feedback-positive feedback-button"></button>
				<button class="feedback-negative feedback-button"></button>
				<div class="feedback-label-mobile">Feedback</div>
				
			</div>
			<div class="feedback-overlay">
				<div class="feedback-form">
					<div class="feedback-form-header">
						<span class="pos-header"><span></span>Wat vind je goed?</span>
						<span class="neg-header"><span></span>Wat vind je niet goed?</span>
						<a href="" class="feedback-close">✕</a>
					</div>
					<form action="">
						<div class="feedback-error">Sorry, er is iets mis gegaan. Probeer het opnieuw</div>
						<textarea name="feedback" id="widget-feedback" class="widget-feedback" placeholder="Hallo! Wij willen graag horen wat jij van de Parkeer widget vind zodat wij het vinder van een parkeerplek nog makkelijker voor je kunnen maken"></textarea>
						<input type="submit" value="Verzenden" class="button">
					</form>
					<div class="feedback-succes">Bedankt voor uw feedback, wij hebben het ontvangen</div>
				</div>

			</div>

			<div class="map-holder">
				<div id="map"></div>
			</div>

			
			
		</div>
	</body>
	
	
	<script id="result-template" type="text/x-handlebars-template">
		<div class="pr-result">
			<h2>{{#equal sort_type "on-street-meter"}}Parkeren op straat{{/equal}}{{#equal sort_type "park-and-ride"}}{{{ cutoff name}}}{{/equal}}{{#equal sort_type "parking-garage"}}{{{ cutoff name}}}{{/equal}}</h2>
			<div class="icon icon-{{ sort_type }}"></div>
			{{#equal sort_type "park-and-ride"}}
			<div class="icon icon-{{ prcost }}euro"></div>
			{{/equal}}
			<div class="time">Reistijd <br><span class="value">{{reccommended_pt_route.duration}}</span></div>
			<div class="cost">Kosten <br><span class="value">{{cost_total}}</span></div>
			<div class="arrow"></a>
		</div>
	</script>
	
	
	<script id="result-detail-template" type="text/x-handlebars-template">
		<div class="pr-result result-{{ sort_type }}">
			<h2>{{name}}</h2>
			<div class="icon icon-{{ sort_type }}"></div>
			{{#equal sort_type "park-and-ride"}}
			<div class="icon icon-{{ prcost }}euro"></div>
			{{/equal}}
			<div class="time">Reistijd <br><span class="value">{{reccommended_pt_route.duration}}</span></div>
			<div class="cost">Kosten <br><span class="value">{{cost_total}}</span></div>
			{{#equal sort_type "park-and-ride"}}<span class="remark">{{notes}}</span>{{/equal}}
			{{#if garage_infourl}}<span class="remark"><a href="{{garage_infourl}}" target="_blank">Meer over {{name}}</a></span>{{/if}}
			
			{{#if busy}}<span class="remark">{{busy}}</span>{{/if}}

			<div class="not-centrum-warning">Let op! Je bestemming ligt niet in het centrum-gebied, daarom betaal je hier niet het speciale, lage P+R-parkeertarief.</div>
			
		</div>
		
		<div class="legs-container">
			<div class="legs content"></div>
		</div>
		
		<div class="pr-info">
			{{#if has_pt}}
				<div class="cost">Parkeren <br><span class="value">{{cost}}</span></div>
				{{#notequal reccommended_pt_route.cost "Gratis"}}<div class="cost">Kosten OV <br><span class="value">{{reccommended_pt_route.cost}} p.p.</span></div>{{/notequal}}
			{{/if}}

			{{#notequal sort_type "on-street-meter"}}
			<div class="remark-title">Openingstijden</div>
			<div class="openinghours remark"></div>
			{{/notequal}}
			
		</div>
		
	</script>
	
	
	<script id="leg-template" type="text/x-handlebars-template">
		<div class="leg {{nodetype}}">
			<div class="leg-name" {{#if id}}id="{{id}}"{{/if}}>{{from.name}}</div>
			
			{{#if mode}}
			<div class="leg-type">
				<div class="transport-icon {{mode}}">
				</div>
				<div class="leg-data">
					{{#if walking}}
						<span class="mode">Lopen</span>
					{{else}}
						<span class="mode">{{mode_display}} {{transitinfo.line}} richting {{transitinfo.headsign}}</span>
					{{/if}}
					<span class="duration">{{duration}}</span>
				</div>
			</div>
			{{/if}}
		</div>
	</script>
	
	
	<script>
		
		var GoogleLayer = new L.Google('ROADMAP');
		Map = new L.Map('map', {center: new L.LatLng(52.37, 4.89), zoom: 11, layers: GoogleLayer});
		
		$(document).ready(function() {

			if ( !("placeholder" in document.createElement("input")) ) {
				$("input[placeholder], textarea[placeholder]").each(function() {
					var val = $(this).attr("placeholder");
					if ( this.value == "" ) {
						this.value = val;
					}
					$(this).focus(function() {
						if ( this.value == val ) {
							this.value = "";
						}
					}).blur(function() {
						if ( $.trim(this.value) == "" ) {
							this.value = val;
						}
					})
				});
		
				// Clear default placeholder values on form submit
				$('form').submit(function() {
		            $(this).find("input[placeholder], textarea[placeholder]").each(function() {
		                if ( this.value == $(this).attr("placeholder") ) {
		                    this.value = "";
		                }
		            });
		        });
			}
		});
		
	</script>
	<script src="js/divv.js"></script>
	<script src="js/feedback.js"></script>



</html>