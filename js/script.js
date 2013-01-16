(function ($) {
	"use strict";

	// --- global vars
	var $key = "3a9fcb2a47a5";


	// --- methods
    var resizeImg = function(){
        var $images = $('.retina');

        $images.each(function(i) {

        $(this).width($(this).width() / 2);
        $(this).height($(this).height() / 2);

        });
    };

    var launchApp = function(e){

        var $submit;
        $('#planning').hide();
        $('header').show();
        $('#ajoutSeries').show();
        $('footer').show();
        $submit = $('#searchSerie');
        $( ".resultats li" ).remove();  
        $('.resultats h3').show();
        $submit.on('click', displayResults);

        $('#menuPlanning').on('click',displayPlanning);
       /* $('#menuMesSeries').on('click',listSeries);
        $('#menuAjoutSerie').on('click',function(){
            return false;*/
        // });
    };

    var displayResults = function ( e ) {
        e.preventDefault();
        var $buttonAddSerie,
            $search = $( "#serie" ).val();
        
        if ( $search !== 0 && $search.length > 2 ) {
            $.ajax(
               {
                    url : "http://api.betaseries.com/shows/search.json?title="+$search+"&key="+$key,
                    type : "get",
                    dataType : "jsonp",
                    success : function ( e ) {
                        $('.resultats h3').show();
                        $('.resultats li').remove();
                      
                        for( var i = 0; i < e.root.shows.length; i++ ) {                        
                            $( "<li class='"+e.root.shows[i].url+"'><span>" + e.root.shows[i].title + "</span><button type='button' class='ajout' id='"+i+"'>Ajouter</button></li>" ).appendTo( ".resultats" );                        
                        }
                        $buttonAddSerie = $('.ajout');
                        $buttonAddSerie.on('click', storeSerie);
                    }
                }
            )
        };
    };

    var storeSerie = function(e){
    	var object = $(this);
    	var $serieTitle = object.parent().attr("class");
    	
        addSerie( $serieTitle , function ( infoSerie ) {
            window.localStorage.setItem( "sS_" + $serieTitle , JSON.stringify( infoSerie ) );
            $('#ajoutSeries').hide();
        } );

    };

    var addSerie = function(urlSerie, sucessCallback){
    	$.ajax(
    	{
    		url: 'http://api.betaseries.com/shows/display/'+urlSerie+'.json?hide_notes=1&key='+$key,
    		type: 'get',
    		dataType:'jsonp',
    		success : function(infoSerie){
    			sucessCallback.apply(null, [infoSerie]);
                $('#mesSeries').show();
                listSeries();
    		}
    	}

    	)
    };

    var listSeries = function () {

            for( var infoSerie in window.localStorage ){
                if( infoSerie.substring( 0 , 3 ) === "sS_"){
                    var dataSerie = JSON.parse( window.localStorage.getItem( infoSerie ) );
                    var titleSerie = dataSerie.root.show.title;
                    var bannerSerie = dataSerie.root.show.banner;  
                    var descSerie = dataSerie.root.show.description;
                    var seasonSerie = dataSerie.root.show.season;
                    var genderSerie = dataSerie.root.show.genres;
                    var durationEpi = dataSerie.root.show.duration;
                                     
                    $( "#listeSeries" ).append( "<li><img width='250' class='banner' src='"+bannerSerie+"'><h2 class='titre'>"+titleSerie+"</h2><div class='detailsSerie'><span class='nbrSaisons'>"+seasonSerie+" saison(s)</span><span class='dureeEpi'>Episodes de "+durationEpi+" min</span><span class='genreSerie'>Genre: "+genderSerie+"</span><p class='descSerie'>"+descSerie+"</p><span class='moinsDetails'>Moins de détails</span></div><span class='delete'><img width='30' height='30' class='retina' src='img/delete.png'></span></li>" );
                    
                    $('.detailsSerie').hide();

                    $('.titre').on('click', displayDetails);

                    if(bannerSerie = 'undefined'){
                        bannerSerie = 'img/defaultBanner.png';
                    }
                }
            }


            /*$('#listeSeries li').on('click',displaySerie);*/
            $('.delete').on('click',removeSerie);
            $('#menuAjoutSerie').on('click',launchApp);
            $('#menuPlanning').on('click',displayPlanning);
    };

    var displayDetails = function(e){
        $(this).next().show();
        $('.moinsDetails').on('click',function(){
            $('.detailsSerie').hide();
        })
    };



    var removeSerie = function(e) {
             alert('Ca, ca ne marche pas encore ! :D'); 
               var $keySerie = $( this ).attr("id");
                $( this ).parents("li").slideUp( function() {
                $( this ).remove();
                } );
        window.localStorage.removeItem($keySerie);   
    };

var displayPlanning = function(e) {  
            $('#ajoutSeries').hide();     
            $('#mesSeries').hide();
            $('#planning').show();

            $.ajax(
            {
                url:'http://api.betaseries.com/planning/general.json?key='+$key,
                type:'get',
                dataType:'jsonp',
                success:function(monPlanning) {
                    for(var i=0 ; i<monPlanning.root.planning.length ; i++){
                        var n=0, maSerie=[];
                        
                        for( var infoSerie in window.localStorage){
                            if(infoSerie.substring(0,3) === "sS_"){
                                
                                maSerie[n] = infoSerie.split("_");
                                if(monPlanning.root.planning[i].url === maSerie[n][1]){
                                    var date = new Date(monPlanning.root.planning[i].date * 1000);
                                    var months = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sept","Oct","Nov","Déc"];
                                    var month = months[date.getMonth()];
                                    var day = date.getDate();
                                    var dateEpi = day + " " + month;

                                    $('#planning ul').append("<li><span>"+dateEpi+"</span><h3>"+monPlanning.root.planning[i].show+"</h3><h4>Episode n°"+monPlanning.root.planning[i].episode+": "+monPlanning.root.planning[i].title+"</h4></li>");
                                }
                            }
                        }
                    }
                }
            }
            )
        };

    var resetAll = function(e){

        $('#resetBulle').show();

        $('#oui').on('click',function() {
        localStorage.clear();
        location.reload();
        });

        $('#non').on('click', function(){ 

        $('#resetBulle').hide();
        });

    };


	$( function () {
	// --- onload routines
    resizeImg();
    launchApp();
    $('#mesSeries').hide();
    $('#planning').hide();
    $('#detailsSerie').hide();
    $('.resultats h3').hide();
    $('#resetBulle').hide();
    $('#reset').on('click', resetAll);
	});

}(jQuery));