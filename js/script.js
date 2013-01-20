(function ($) {
    'use strict';
//---global vars
	var $key = '3a9fcb2a47a5';
// --- methods

    //Redimentionne les images dans le cas d'un device retina
    var resizeImg = function(){
        var $images = $('.retina');
        $images.each(function(i) {
        $(this).width($(this).width() / 2);
        $(this).height($(this).height() / 2);
        });
    };

    //initialise l'application
    var initialize = function(e) {
    $('#serie').val() === ' ';
    $('header').show();
    $('footer').show();
    $('#addSeries').show();
    $('#mySeries').hide();
    $('#planning').hide();
    $('.result').hide();
    $('.listResult li').remove();
    $('#searchSerie').on('click', searchResult);
    $('#menuAjoutSerie').on('click', chercheSerie);
    $('#menuPlanning').on('click',displayPlanning);
    $('#menuMesSeries').on('click',listSeries);
    if (window.localStorage.length>0)
        listSeries();
    else
        chercheSerie();
    };  

    //afficher la recherche de série en vue de l'ajout.
    var chercheSerie = function(){
    $('#mySeries').hide();
    $('#planning').hide();
    $('#addSeries').show();
    $('.result h1').hide();
};

    //Pour effacer la text-box recherche
    var clearSearch = function() {
    $('#serie').val('');
    $('.listResult li').remove();
};    

    //Affiche les résultats de la recherche
    var searchResult = function ( e ) {

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
                       // $('#serie').autocomplete();
                        $('.result').show();
                        $('.listResult h1').show();
                        $('.listResult li').remove();                      
                        for( var i = 0; i < e.root.shows.length; i++ ) {                        
                            $( "<li class='"+e.root.shows[i].url+"'><span>" + e.root.shows[i].title + "</span><span class='ajout' id='"+i+"'><img width='30' height='30' class='retina' src='img/check.png'></span></li>" ).appendTo( ".listResult" );                        
                        }
                        $buttonAddSerie = $('.ajout');
                        $buttonAddSerie.on('click', storeSerie);
                    }
                }
            );
        }
        
    };     

    //Ajoute la série
    var storeSerie = function(e){
        var object=$(this);
        var $serieTitle=object.parent().attr("class");    	
        addSerie( $serieTitle , function ( infoSerie ) {
            window.localStorage.setItem( "sS_" + $serieTitle , JSON.stringify( infoSerie ) );
            $('#addSeries').hide();
        } );

        clearSearch();
    };

    //Requête Ajax qui permet l'affichage de la liste des séries
    var addSerie = function(urlSerie, sucessCallback){
        $.ajax({
            url: 'http://api.betaseries.com/shows/display/'+urlSerie+'.json?hide_notes=1&key='+$key,
            type: 'get',
            dataType:'jsonp',
            success : function(infoSerie){
                sucessCallback.apply(null, [infoSerie]);
                $('#mySeries').show();
                listSeries();
            }
        });
    };    

    //Renvois la liste des séries
    var listSeries = function () {  

        $('#listSeries li').remove();
        $('#mySeries').show();
        $('#planning').hide();
        $('#addSeries').hide();
            for( var infoSerie in window.localStorage ){
                if( infoSerie.substring( 0 , 3 ) === "sS_"){
                    var dataSerie = JSON.parse( window.localStorage.getItem( infoSerie ) );
                    var titleSerie = dataSerie.root.show.title;
                    var bannerSerie = dataSerie.root.show.banner;  
                    var descSerie = dataSerie.root.show.description;
                    var genderSerie = dataSerie.root.show.genres;
                    var durationEpi = dataSerie.root.show.duration; 
                    var noSrc = 'undefined';
                    var newSrc = 'img/defaultBanner.png';                               
                    $( "#listSeries" ).append( "<li class="+infoSerie+" title='Cliquez pour voir les détails'><img width='250' height='61' class='banner' src='"+bannerSerie+"'><h2 class='titre'>"+titleSerie+" <img src='img/info.png' alt='Cliquez ici pour les infos' title='cliquez sur le titre pour avoir les infos' height='16' width='16'/> </h2><div class='detailsSeries'><span class='dureeEpi'>Episodes de "+durationEpi+" min</span></br><span class='genreSerie'>Genre: "+genderSerie+"</span><p class='descSerie'>"+descSerie+"</p><span class='moinsDetails'>Moins de détails</span></div><span class='delete'><img width='30' height='30' class='retina' src='img/deleteAll.png'></span>  <div class='deleteSerie'><p>Attention, tu vas supprimer cette série de tes favoris&nbsp;! Est-ce que tu veux vraiment faire ca&nbsp;?</p><button class='oui'>Oui</button><button class='non'>Non</button></div></li>");
                    $('.deleteSerie').hide();
                    $('.detailsSeries').hide();
                    $('#listSeries').show();
                    $('.titre').on('click', displayDetails);
                    $('img[src="' + noSrc + '"]').attr('src', newSrc);
                }
            }

            $('.delete').on('click',removeSerie);
            $('#menuAjoutSerie').on('click',chercheSerie);
            $('#menuPlanning').on('click',displayPlanning);
    };
    
    //Effet de Accordéon quand on clique pour afficher les détails
   var displayDetails = function(e){

            $(this).next().slideDown();
            $('.moinsDetails').on('click',function(){
                $(this).parent().slideUp();
            });
        };
    
    //Effacer de la liste des séries et comme on est polit, on le demande avant!
    var removeSerie = function(e) {
        var $keySerie = $( this ).parents('li').attr("class");
        $(this).next('.deleteSerie').show();
        $('.oui').on('click',function() {                
                $( this ).parents("li").slideUp( function() {
                $( this ).remove();
                } );
                 window.localStorage.removeItem($keySerie);   
                });
        $('.non').on('click', function(){ 
        $(this).parents('.deleteSerie').hide();
        });
    };

    //Afficher le planning
    var displayPlanning = function(e) {  
                $('#addSeries').hide();     
                $('#mySeries').hide();
                $('#planning').show();       


                $.ajax(
                {
                    url:'http://api.betaseries.com/planning/general.json?key='+$key,
                    type:'get',
                    dataType:'jsonp',
                    success:function(monPlanning) {
                        $('#planning ul li').remove(); //Empêche la répétition des entrées
                        for(var i=0 ; i<monPlanning.root.planning.length ; i++){
                            var n=0, maSerie=[];
                            
                            for( var infoSerie in window.localStorage){
                                if(infoSerie.substring(0,3) === "sS_"){
                                    
                                    maSerie[n] = infoSerie.split("_");
                                    if(monPlanning.root.planning[i].url === maSerie[n][1]){
                                        var dateThatDay = new Date();
                                        var comparitionDate = dateThatDay.getTime();
                                        var date = new Date(monPlanning.root.planning[i].date * 1000);
                                        var months = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
                                        var month = months[date.getMonth()];
                                        var day = date.getDate();
                                        var dateEpi = day + " " + month;
                                        $('#planning ul').append("<li><span class='dateEpisode'>Episode sorti le "+dateEpi+"</span><h3>"+monPlanning.root.planning[i].show+"</h3><h4>Episode n°"+monPlanning.root.planning[i].episode+": "+monPlanning.root.planning[i].title+"</h4></li>");
                                         if (date <= comparitionDate){
                                            $('.dateEpisode').parents("li").css('opacity','0.85');
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            );
        $('#menuMesSeries').on('click',listSeries);
        $('#listSeries').show();
        $('#menuAjoutSerie').on('click',chercheSerie);
    };

    //Remettre l'appli à 0
    var resetAll = function(e){
        $('#appReset').show();
        $('#oui').on('click',function() {
        localStorage.clear();
        location.reload();
        });
        $('#non').on('click', function(){ 
        $('#appReset').hide();
        });
    };

	$( function () {
	// --- onload routines
    resizeImg();
    initialize();
    $('#mySeries').hide();
    $('#planning').hide();
    $('#addSeries').show();
    $('#detailsSeries').hide();
    $('.result h1').hide();
    $('#appReset').hide();
    $('#reset').on('click', resetAll);
	});
}(jQuery));