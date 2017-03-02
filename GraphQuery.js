var jsonfile = require('jsonfile')
var file = './output.json'

/* Retrieves the amount of money made by a movie title. */
function findGross(title, graph) {
    for (var key in graph) {
        if( graph[key].title == title) {
            console.log(title + " grossed " + graph[key].gross + " at the box office.");
        }
    }
}

/* Retrieves the list of movies which an actor has worked in. */
function findFilmography(actor, graph) {
    //Search graph
    for (var key in graph) {
        //If actor is found
        if( graph[key].name == actor) {
            //Print all movies actor was in
            if (graph[key].movieNodes.length > 0) {
                console.log(actor + " worked in the following film(s):");
                for (var i = 0; i < graph[key].movieNodes.length; i++) {
                    console.log("\t" + graph[key].movieNodes[i]);
                }
            }
        }
    }
}

/* Retrieves the cast members for a movie title. */
function findCast(title, graph) {
    for (var key in graph) {
        if( graph[key].title == title) {
            //Print all cast members for the title
            if (graph[key].actorNodes.length > 0) {
                console.log(title + " features the following cast:");
                for (var i = 0; i < graph[key].actorNodes.length; i++) {
                    console.log("\t" + graph[key].actorNodes[i]);
                }
            }
        }
    }
}


/* Retrieves the top x oldest actors. */

function findOldestActors(x, graph) {
    var topX = [];
    // Compare every actor in graph to top X oldest actors array
    for (var key in graph) {
        if( graph[key].age ) {
            if (topX.length < x) {
                topX.push(graph[key].age);
            }
            else {
                // Get current youngest actor in Top X oldest actors array
                var youngestActor = Math.min(topX);
                if (graph[key].age > youngestActor ) {
                    console.log(topX);

                    // Find youngest actor in topX and replace
                    for (var i = 0; i < topX.length; i++) {
                        if (topX[i] == youngestActor) {
                            topX[i] = graph[key].age;
                        }
                    }
                }
            }
        }
    }
    console.log("The top " + x + " oldest actors are " + topX);
}

/* Retrieves all movies released in a given year. */
function findMoviesByYear(year, graph){
    for (var key in graph) {
        if( graph[key].year == year) {
            //Print all cast members for the title
            console.log(graph[key].title + " was released in " + year);
        }
    }
}

/* Retrieves all actors who were in a film during a given year. */
function findActorsByYear(year, graph) {
    for (var key in graph) {
        if( graph[key].year == year) {
            //Print all cast members for the title
            if (graph[key].actorNodes.length > 0) {
                console.log("The following actors were in the film " + graph[key].title + " during " + year);
                for (var i = 0; i < graph[key].actorNodes.length; i++) {
                    console.log("\t" + graph[key].actorNodes[i]);
                }
            }
        }
    }
}


// Opens the JSON file for querying
jsonfile.readFile(file, function(err, graph) {
    // Find how much a movie has grossed
    findGross("Wild (2014 film)", graph);
    // List which movies an actor has worked in
    findFilmography("Morgan Freeman", graph);
    // List which actors worked in a movie
    findCast("Brubaker", graph);
    // List the oldest X actors
    findOldestActors(5, graph);
    // List all the movies for a given year
    findMoviesByYear(2015, graph);
    // List all the actors for a given year
    findActorsByYear(1995, graph);
});
