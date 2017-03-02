var Crawler = require("crawler");
var url = require('url');
var cheerio = require('cheerio');
var fs = require('fs');
const winston = require('winston')
var log = require('log4javascript.js');


/**
 * movieNode is an object that stores information about a movie.
 * This includes the title, the grossing value, the year of release,
 * and a cast list represented by an array of actorNode objects.
 */
function movieNode(title, gross, year, castList) {
   this.title = title;
   this.gross = gross;
   this.year = year;
   this.actorNodes = castList;
}

/**
 * actorNode is an object that stores information about an actor.
 * This includes the name, the age, and a list of movies the actor was in,
 * represented by an array of movieNode objects.
 */
function actorNode(name, age, movies) {
    this.name = name;
    this.age = age;
    this.movieNodes = movies;
}

/**
 * printGraph prints out every node in the graph as console output.
 */
function printGraph() {
    graph.forEach(function(node) {
        console.log(node);
    });
}

function isDuplicateActor(name) {
    for (var i = 0; i < graph.length; i++) {
        if (name == graph[i].name) {
            return true;
        }
    }
    return false;
}

function isDuplicateMovie(title) {
    for (var i = 0; i < graph.length; i++) {
        if (title == graph[i].title) {
            return true;
        }
    }
    return false;
}

/**
 * getActorData is a helper function that is used in the callback of a crawler object.
 * This function locates actor information and uses it to instantiate a new actorNode object,
 * and adds the new actorNode to the graph.
 *
 * This function scans the DOM for many locations where age and filmography can be located.
 *
 * @param $ is the HTML body. It symbolizes a jquery selector used by the cheerio library.
 */
function getActorData($) {
    // Get age of actor
    var $age = $(".ForceAgeToShow").text();
    // Get name of actor and parse
    var name = $("title").text();
    name = name.replace(" - Wikipedia", "");
    var isDup = isDuplicateActor(name);
    // if (isDup) {
    //     // winston.log('info', 'Already visited this actor page.', {
    //     //   pageTitle: name
    //     // })
    // }
    // If age is found, then we are on an actor page
    if ($age) {
        // Parse age to remove everything except the numbers
        $age = $age.replace(")", "");
        $age = $age.replace("(age", "");
        $age = $age.replace(/\s/g,'');

        // winston.log('info', 'Actor data found.', {
        //       pageTitle: name,
        //       age: $age
        // });

        // Get filmography: Case 1
        var filmography = $("div.div-col a");
        // Case 2
        if(filmography.length == 0 ) {
            filmography = $("ul:nth-child(12) a");
        }
        // Case 3
        if(filmography.length == 0 ) {
            filmography = $(".hatnote+ ul a");
        }
        // Case 4
        if(filmography.length == 0 ) {
            filmography = $(".wikitable a");
        }
        // Case 5
        if(filmography.length == 0 ) {
            filmography = $("ul:nth-child(15) a");
        }
        // Case 6
        if(filmography.length == 0 ) {
            filmography = $("ul:nth-child(19) a");
        }
        // Case 7
        if(filmography.length == 0 ) {
            filmography = $("ul:nth-child(18) a");
        }

        // Store list of movies the actor was in
        var movieList = [];
        $(filmography).each(function(i, film){
            var link = $(this).attr('href');
            // Parse movie titles and add to this actor's node
            var cleanLink = link.replace("/wiki/", "");
            // Avoid broken links
            if(cleanLink.substring(0,3) != "/w/" && cleanLink.substring(0,1) != "#" && cleanLink.substring(0,4) != "http" ) {
                movieList.push(cleanLink);
            }
            // Add movie links to crawler queue
            var newLink = "https://en.wikipedia.org/wiki/" + String(cleanLink);
            c.queue(newLink);
        });
        // Add actor node to graph
        var actor = new actorNode(name, $age, movieList);
        graph.push(actor);
    }
    // else {
    //     winston.log('info', 'Actor data not found! Must be on another page.', {
    //       pageTitle: name
    //     })
    // }
}

/**
 * getMovieData is a helper function that is used in the callback of a crawler object.
 * This function locates movie information and uses it to instantiate a new movieNode object,
 * and adds the new movieNode to the graph.
 *
 * This function scans the DOM for many locations where gross, year, and cast info can be located.
 *
 * @param $ is the HTML body. It symbolizes a jquery selector used by the cheerio library.
 */
function getMovieData($) {
    // Get gross value of movie
    var $gross = $("th:contains('Box office')").next().text();
    // Get name of movie
    var name = $("title").text();
    name = name.replace(" - Wikipedia", "");
    var isDup = isDuplicateMovie(name);
    // if (isDup) {
    //     winston.log('info', 'Already visited this movie page.', {
    //       pageTitle: name
    //     })
    // }
    // Check if we found box office gross
    if ($gross) {
        // Parse out "[]" symbols from gross
        var result = $gross.search('\\[');
        if (result != -1) {
            $gross = $gross.substring(0, $gross.indexOf('['));
        }

        var castList = [];
        //  Get cast names: case 1
        var cast = $("ul:nth-child(5) a:first-child");
        //  Case 2
        if(cast.length == 0 ) {
            cast = $("ul:nth-child(9) a:first-child");
        }
        //  Case 3
        if(cast.length == 0 ) {
            cast = $(".column-count-2 a:first-child");
        }
        //  Case 4
        if(cast.length == 0 ) {
            cast = $("ul:nth-child(10) a:first-child");
        }
        //  Case 5
        if(cast.length == 0 ) {
            cast = $(".column-width a:first-child");
        }
        //  Case 6
        if(cast.length == 0 ) {
            cast = $("h2+ ul li a");
        }
        //  Case 6
        if(cast.length == 0 ) {
            cast = $(".thumb+ ul a");
        }

        // Check cast list and store each actor in current movie node
        $(cast).each(function(i, cast){
            var castLink = $(this).attr('href');
            // Parse links
            castLink = String(castLink);
            castLink = castLink.replace("/wiki/", "");

            // Check for broken links
            if(castLink.substring(0,3) != "/w/" && castLink.substring(0,1) != "#" && castLink.substring(0,4) != "http" ) {
                castList.push(castLink);
            }
            // Add actor links to crawler queue
            var newLink = "https://en.wikipedia.org/wiki/" + String(castLink);
            c.queue(newLink);
        });

        // Get year movie was released
        var year = $(".vevent").text();
        // Parse HTML by going through every string and checking for a number length of 4
        year = getYearSubstring(year);


        // winston.log('info', 'Movie data found.', {
        //       pageTitle: name,
        //       gross: $gross,
        //       year: year,
        // });
        // Add movie node to graph
        var movie = new movieNode(name, $gross, year, castList);
        graph.push(movie);
    }

}

/**
 * writeJSONToFile is a helper function that is used in the callback of a crawler object.
 * This function converts the graph to JSON, and then stores the JSON locally to "output.json".
 */
function writeJSONToFile() {
    var jsonData = JSON.stringify(graph);
    fs.writeFile("output.json", jsonData, function(err) {
    if(err) {
        return console.log(err);
    }
    });
}

/**
 * getMovieData is a helper function that is used in the callback of a crawler object.
 * This function parses a table in the DOM where release years are stored. It searches
 * for the only instance of a 4 digit number, which is the release year.
 *
 * @param str is a string representing the section of the DOM where a release year would be.
 * @return the 4-digit substring of str that represents the release year.
 */
function getYearSubstring(str) {
    var digitCount = 0;
    for (var i = 0; i<str.length; i++){
        var strChar = str.charAt(i).toLowerCase();
        if( strChar <='9' && strChar >='0') {
            digitCount = digitCount + 1;
            if (digitCount == 4) {
                return str.substring( (i-3), i+1);
            }
        }
        else {
            digitCount = 0;
        }
    }
}

function checkFinished() {
    console.log(graph.length);
    var numberActor = 0;
    var numberMovie = 0;

    //check that amount of actors is enough
    for (var i = 0; i < graph.length; i++) {
        //found an actor
        if (graph[i].age) {
            numberActor += 1;
            console.log("FOUND ACTOR");
        }
        //found a movie
        if (graph[i].gross) {
            numberMovie += 1;
            console.log("FOUND MOVIE");

        }
    }
    console.log("NUMBER OF ACTORS IS " + numberActor);
    console.log("NUMBER OF MOVIES IS " + numberMovie);


    if ( (numberActor > 125) && (numberMovie > 250) ){
        return true;
    }
    else {
        return false;
    }


}

var graph = [];
var c = new Crawler({
    maxConnections : 10,
    // This will be called for each crawled page
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            // $ is Cheerio by default
            //a lean implementation of core jQuery designed specifically for the server
            var $ = res.$;
            getActorData($);
            getMovieData($);
            printGraph();

        }
        writeJSONToFile();
        if( checkFinished() ) {
            process.exit();
        }
        done();
    }
});


// Queue just one URL, with default callback
c.queue('https://en.wikipedia.org/wiki/Morgan_Freeman');
