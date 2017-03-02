const assert = require('assert');
var jsonfile = require('jsonfile')
var file = './output.json'

function movieNode(title, gross, year, castList) {
   this.title = title;
   this.gross = gross;
   this.year = year;
   this.actorNodes = castList;
}

function actorNode(name, age, movies) {
    this.name = name;
    this.age = age;
    this.movieNodes = movies;

}


// Checks that the graph structure is successfuly storing movieNodes.
function isStoringMovieNodes(graph){
    for (var i = 0; i < graph.length; i++) {
        if ( graph[i].gross ) {
            //console.log(graph[i]);
            return true;
        }
    }
    // No movie nodes found
    return false;
}

// Check that movie nodes are storing release year as a four digit number
function movieYearIsCorrect(graph){
    for (var i = 0; i < graph.length; i++) {
        if ( graph[i].year ) {
                var isnum = /^\d+$/.test(graph[i].year);
                assert(isnum);
        }
    }
    // All movie nodes scanned for correct years
    return true;
}

// Check that movie nodes are storing casts as actorNodes
function movieStoresActors(graph){
    for (var i = 0; i < graph.length; i++) {
        if ( graph[i].actorNodes ) {
                    return true;
        }
    }
    // No actor nodes found in any movies
    return false;
}

// Checks that the graph structure is successfuly storing actorNodes.
function isStoringActorNodes(graph){
    for (var i = 0; i < graph.length; i++) {
        if ( graph[i].age ) {
            //console.log(graph[i]);
            return true;
        }
    }
    // No actor nodes found in graph
    return false;
}

// Check that actor nodes are storing filmographies as movieNodes
function actorsStoreMovies(graph){
    for (var i = 0; i < graph.length; i++) {
        if ( graph[i].movieNodes ) {
                    return true;
        }
    }
    // No movie nodes found for any actors
    return false;
}


// Opens the JSON file for querying
jsonfile.readFile(file, function(err, graph) {
    assert(isStoringMovieNodes(graph));
    assert(movieYearIsCorrect(graph))
    assert(movieStoresActors(graph));
    assert(isStoringActorNodes(graph));
    assert(actorsStoreMovies(graph));

});
