(function ($) {

	$.fn.choropleth_map = function(data, metadata){

		return this.each(function() {

      var $el = jQuery( this );

			var map, gjLayerDist, gjLayerDivisions;
			console.log(metadata);
      // CREATE ELEMENTS ON THE FLY
      function createElements(){

        /*var $loader = jQuery( document.createElement( 'div' ) );
        $loader.addClass('spinner-grow');
				$loader.attr('role', 'status');
        $loader.html( '<span class="sr-only">Loading...</span>' );
        $loader.appendTo( $el );*/

        var $map = jQuery( document.createElement( 'DIV' ) );
        $map.attr('id', 'map');
        $map.appendTo( $el );

				var $goTop = jQuery( document.createElement( 'a' ) );
        $goTop.attr('id', 'top-btn');
				$goTop.attr('href', '#sidebar');
				$goTop.addClass('d-md-none d-lg-none d-xl-none')
				$goTop.html('<i class="fa fa-caret-up"></i>')
        $goTop.appendTo( $el );

				var $legend = jQuery( document.createElement( 'DIV' ) );
        //$legend.attr('id', 'legend');
				//$legend.html('<h5>Map Key:</h5><p><span class="key-item" style="background-color:#feebe2"></span> No cases reported</p><p><span class="key-item" style="background-color:#fbb4b9"></span> 5 cases or less</p><p><span class="key-item" style="background-color:#f768a1"></span> 6 to 15 cases</p><p><span class="key-item" style="background-color:#c51b8a"></span> 16 to 30 cases</p><p><span class="key-item" style="background-color:#7a0177"></span> 31 to 50</p><p><span class="key-item" style="background-color:#190019"></span> More than 50</p>');
				$legend.html('<strong>Number of cases:</strong><br><p class="key-item" style="background-color:#feebe2"> Nil</p><p class="key-item" style="background-color:#fbb4b9"> 1 to 5 </p><p class="key-item" style="background-color:#f768a1"> 6 to 20 </p><p class="key-item" style="background-color:#c51b8a;color:white"> 21 to 75 </p><p class="key-item" style="background-color:#7a0177;color:white"> 76 to 150 </p><p class="key-item" style="background-color:#360134;color:white"> 150+ </p>');

        $legend.appendTo('#legend');

				$("#timestamp").empty().append(metadata[0]["Value"]);

				//NATIONAL LEVEL TOTALS
				var totals = [0,0,0,0,0]
				for (var i = 0; i < data.length; i++){
					totals[0] = totals[0] + Number(data[i]["Confirmed Cases"]);
					totals[1] = totals[1] + Number(data[i]["Discharged"]);
					totals[2] = totals[2] + Number(data[i]["Deaths"]);
					totals[3] = totals[3] + Number(data[i]["Active"]);
					totals[4] = totals[4] + Number(data[i]["Total Test"]);
				}
				$('#tot_conf').empty().append(totals[0]);
				$('#tot_disch').empty().append(totals[1]);
				$('#tot_death').empty().append(totals[2]);
				$('#tot_act').empty().append(totals[3]);
				$('#tot_tes').empty().append(totals[4]);
				$("#div_aff").empty().append(metadata[6]["Value"]+'/8');
				$("#dt_aff").empty().append(metadata[5]["Value"]+'/64');

				//MODAL INFO
				$('#abt-modal').click( function () {
					$("#infoModalLabel").empty().append("About this Map");
					$(".modal-body").empty().append('<p>This map is an attempt at tracking COVID-19 cases in Bangladesh at the district level. The source of this data is news reports and Division bulletins, and the official <a href="http://www.iedcr.gov.bd/" target="_blank">numbers from IEDCR</a> are only used as a reference. The <a href="https://docs.google.com/spreadsheets/d/e/2PACX-1vS0Ajb1XjkCkqU3ZOFC0U4VboEYyHSLz6adblkI5P7uMdUSu4KmX7BYbf3nxh7AJPPj_78Wmoi0ZKEW/pubhtml#" target="_blank">data is compiled here</a>.</p><p>Some issues regarding this exercise: # Should the cases be marked where the patient is currently quarantined or where they reside (or where spread may have happened); Please see <a href="https://www.corona.gov.bd/" target="_blank">corona.gov.bd</a> for more up-to-date numbers.</p><p>Feedback is more than welcome. Please DM <a href="https://github.com/shanto-xd/Covid-19-visualize-and-live-lockdown-map" target="_blank">create an issue here</a>, or write an <a href="mailto:vedo96@gmail.com?subject=covid19 Bangladesh district map feedback">email</a>. Thank you!</p><hr><p>If you need help or more information about the pandemic, consider the following links:</p><ul><li><a href="https://www.who.int/health-topics/coronavirus" target="_blank">World Health Organization</a></li><li><a href="http://www.iedcr.gov.bd/" target="_blank">Institute of Epidemiology Disease Control and Research(IEDCR)</a></li><li><a href="https://github.com/datameet/covid19" target="_blank">DataMeet Archive on COVID19</a></li><li><a href="https://www.corona.gov.bd/" target="_blank">Bangladesh COVID-19 tracker</a></li><li></ul>');
				});
				$('#ct-modal').click( function () {
					$("#infoModalLabel").empty().append("Contribute to this Map");
					$(".modal-body").empty().append('<p>Check out the <a href="https://github.com/shanto-xd/Covid-19-visualize-and-live-lockdown-map" target="_blank">git repo</a> and contribute</p><p>If you are a journalist or someone carefully tracking news, you can help maintain the data. See the <a href="https://docs.google.com/spreadsheets/d/e/2PACX-1vS0Ajb1XjkCkqU3ZOFC0U4VboEYyHSLz6adblkI5P7uMdUSu4KmX7BYbf3nxh7AJPPj_78Wmoi0ZKEW/pubhtml#" target="_blank"">readme sheet here</a>.</p>');
				});
				$('#div-modal').click( function () {
					$("#infoModalLabel").empty().append("Division Level Data");
					$(".modal-body").empty().append(DivisionData());
				});
				$('#dt-modal').click( function () {
					$("#infoModalLabel").empty().append("District Level Data");
					$(".modal-body").empty().append(districtData());
				});
      }

      function drawMap(){

        // HIDE THE LOADER
        $('.loader').hide();

				//SETUP BASEMAP
				map = L.map('map').setView( [23.45, 90.23], 20 );

        //var hybUrl='https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ3VuZWV0bmFydWxhIiwiYSI6IldYQUNyd0UifQ.EtQC56soqWJ-KBQqHwcpuw';
        var hybUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';
        var hybAttrib = 'Map data © <a href="http://openstreetmap.org" target="_blank">OpenStreetMap</a> contributors & <a href="http://datameet.org" target="_blank">Data{Meet}</a>';
        var hyb = new L.TileLayer(hybUrl, {minZoom: 4, maxZoom: 7, attribution: hybAttrib, opacity:1}).addTo(map);

        //---------------ADD DISTRICT BOUNDARIES

				gjLayerDist = L.geoJson( geodist, { style: styledist, onEachFeature: onEachDist } );
				gjLayerDist.addTo(map);

        //---------------ADD Division BOUNDARIES


        gjLayerDivisions = L.geoJson( geoDivisions, { style: styleDivision } );
        gjLayerDivisions.addTo(map);

      }
			//END OF drawMap

			function popContent( feature ) {
        //FOR DISTRICT POP UPS ON CLICK
				for(var i = 0; i < data.length; i++) {
					if (data[i]["District"] == feature.properties["dtname"]) {
        		return '<h4>'+feature.properties["dtname"]+', '+feature.properties["divname"]+'</h4><hr><p>Confirmed Cases: <b>'+data[i]["Confirmed Cases"]+'</b> out of '+counter("Division",feature) +' in the Division</p><p>Discharged/Recovered: '+data[i]["Discharged"]+'</p><p>Deaths: '+data[i]["Deaths"]+'</p><p>Active Cases: '+data[i]["Active"]+'</p><hr><small>'+data[i]["Notes"]+'</small>';
					}
					else if ( i == data.length-1) return '<h4>'+feature.properties["dtname"]+', '+feature.properties["divname"]+'</h4><hr><p>No cases reported</p>';

				}
      }
			//-----------------------------

			function styleDivision( feature ) {
        //Division STYLES

				//var c_count = counter("Division", feature);
				return {
          weight: 1,
          opacity: 1,
          color: "#000",
          fill: false
        };
      }

			function styledist( feature ) {
        //DISTRICTS STYLES - CHOROPLETH COLORS BASED ON RANGE ONLY
        var color = "#feebe2";

				var c_count = counter("District", feature); //JUST FINDS THE CORRECT ROW

				//if (c_count > 30) color = "#7a0177";
				if (c_count > 150) color = "#360134";
				else if (c_count > 75 && c_count <= 150) color = "#7a0177";
				else if (c_count > 20 && c_count <= 75 ) color = "#c51b8a";
				else if (c_count > 5 && c_count <= 20) color = "#f768a1";
				else if (c_count > 0 && c_count <= 5) color = "#fbb4b9";
				else {color = "#feebe2";}

				return {
          fillColor: color,
          weight: 1,
          opacity: 0.4,
          color: 'black',
          dashArray: '1',
          fillOpacity: 1
        };
      }

			function counter(level, feature){
				//CASE COUNTER FOR Divisions
				var count = 0;

				if (level == "District") var property = "dtname";
				else var property = "divname";

				for (var i = 0;i<data.length;i++){
          if (data[i][level] == feature.properties[property] && data[i]["Division"] == feature.properties['divname']) {
						count = count + Number(data[i]["Confirmed Cases"]);
					}
        }
				return count;
			}

      function onEachDist( feature, layer ) {
        //CONNECTING TOOLTIP AND POPUPS TO DISTRICTS
        layer.on({
          mouseover: highlightFeature,
          mouseout: resetHighlight,
        });
				layer.on('click', function(e, feature){
					zoomToFeature(e);
				});
        layer.bindTooltip( feature.properties["dtname"] + ', ' + feature.properties["divname"], {
          direction : 'auto',
          className : 'Divisionlabel',
          permanent : false,
          sticky    : true
        } );
        layer.bindPopup(popContent(feature), {maxWidth:700});

      }

      function highlightFeature(e) {
        //DISTRICT HIGHLIGHT ON MOUSEOVER
        var layer = e.target;

        layer.setStyle( {
          weight: 3,
          color: 'violet',
          opacity: 0.8
        } );
        if ( !L.Browser.ie && !L.Browser.opera ) {
          layer.bringToFront();
        }
      }

      function resetHighlight(e) {
          //RESET HIGHLIGHT ON MOUSEOUT
          var layer = e.target;
          layer.setStyle({
            weight: 1,
            color: 'black',
            opacity: 0.4
          });
					if ( !L.Browser.ie && !L.Browser.opera ) {
	          layer.bringToBack();
	        }
      }

      function zoomToFeature(e) {
				//ZOOM TO DISTRICT ON CLICK
        map.fitBounds(e.target.getBounds().pad(1.6));
      }

			$('#resetZoom').click(function(){
				map.setZoom(20);
			});

			//Division COUNTS FOR MODAL
			function DivisionData(){
				var div_totals = [];
				var flag = 0;

				for ( var i = 0; i < data.length; i++ ){
					flag = 0; //CHECKS IF ARRAY ALREADY HAS Division
					div_totals.forEach( function(Division){
						if(Division.name == data[i]["Division"]) flag = 1;
					});

					if (flag == 0) {
						var totals = allCounts("Division", data[i]["Division"]);
						div_totals.push({name:data[i]["Division"],cc:totals[0],di:totals[1],de:totals[2],ac:totals[3]});
					}
				}

				div_totals.sort((a,b) => b.cc - a.cc); //SORT BY CONFIRMED CASES

				var DivisionHTML = "<table><tbody><tr><th>Division</th><th>Confirmed Cases</th><th>Discharged/Recovered</th><th>Deaths</th><th>Active Cases</th></tr>";
				div_totals.forEach( function(Division) {
					DivisionHTML = DivisionHTML + '<tr><td>'+Division.name+'</td><td>'+Division.cc+'</td><td>'+Division.di+'</td><td>'+Division.de+'</td><td>'+Division.ac+'</td></tr>';
				});
				DivisionHTML = DivisionHTML + '</tbody></table>';

				return DivisionHTML;
			}
			//CASES COUNTS FOR Divisions
			function allCounts(level, name) {
				var totals = [0,0,0,0];
				for ( var i = 0; i < data.length; i++ ){
					if (data[i][level] == name) {
						totals[0] = totals[0] + Number(data[i]["Confirmed Cases"]);
						totals[1] = totals[1] + Number(data[i]["Discharged"]);
						totals[2] = totals[2] + Number(data[i]["Deaths"]);
						totals[3] = totals[3] + Number(data[i]["Active"]);
					}
				}
				return totals;
			}

			//DISTRICTS MODAL
			function districtData() {
				data.sort((a,b) => b["Confirmed Cases"] - a["Confirmed Cases"]);
				var districtHTML = "<table><tbody><tr><th>District</th><th>Division</th><th>Confirmed Cases</th><th>Discharged/Recovered</th><th>Deaths</th><th>Active Cases</th><th>Notes</th><th>Total Test</th></tr>";
				data.forEach( function(district) {
					districtHTML = districtHTML + '<tr><td>'+district["District"]+'</td><td>'+district["Division"]+'</td><td>'+district["Confirmed Cases"]+'</td><td>'+district["Discharged"]+'</td><td>'+district["Deaths"]+'</td><td>'+district["Active"]+'</td><td>'+district["Notes"]+'</td><td>'+district["Total Test"]+'</td></tr>';
				});
				districtHTML = districtHTML + '</tbody></table>';

				return districtHTML;
			}

      // INITIALIZE FUNCTION
      function init(){

        // CREATE ALL THE DOM ELEMENTS FIRST
        createElements();

        // RENDER THE MAP IN THE CORRECT DOM
        drawMap();
      }

      init();

    });
  };
}(jQuery));

jQuery(document).ready(function(){

	//tabletop.init( { key: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS0Ajb1XjkCkqU3ZOFC0U4VboEYyHSLz6adblkI5P7uMdUSu4KmX7BYbf3nxh7AJPPj_78Wmoi0ZKEW/pubhtml' , callback: getdata, simpleSheet: false } );
	//Tabletop.init( { key: "https://docs.google.com/spreadsheets/d/e/2PACX-1vS0Ajb1XjkCkqU3ZOFC0U4VboEYyHSLz6adblkI5P7uMdUSu4KmX7BYbf3nxh7AJPPj_78Wmoi0ZKEW/pubhtml#" } )
	//Tabletop.init( { key: "1AL1cj_33m3D7JkT-_wPB7LPJAqIfV2Y5XVMui7nczy4", callback: getdata, simpleSheet: false } );
	//Tabletop.init( { key: "1vRlSCAn1nS4h9n9Fp25iuOsH54RfMUjj3xX5CZqjGUqYCVXgwgtJojuqVeqekazs2TkSJ95Jwplo7lL", callback: getdata, simpleSheet: false } );
	Tabletop.init( { key: "1IVG90tQz_QlSVUbzVv9ylRhIBQdOjQCFTtu9xDpkACc" , callback: getdata, simpleSheet: false  } );

	function getdata(d, tabletop) {
		var data, metadata = [];
		data = tabletop.sheets("raw").elements;
		metadata = tabletop.sheets("readme").elements;

		jQuery( '[data-behaviour~=choropleth-map]' ).choropleth_map(data, metadata);
	}

});
