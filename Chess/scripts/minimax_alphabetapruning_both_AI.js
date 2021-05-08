//Declaration of global variables for board, game and pruning check
var board = null;
var game = new Chess();
var isPruned = false;
var maximizerbool = false;
var timeTakenArr = [];
var positionsEvaluatedPerMove = [];
var possibleMoveCount = [];
var moveNumberSelected = [];
/**
 * Ready function to declare the configuration for the game
 * Initialization of event functions for drag, drop, mouseover and others
 */
$(document).ready(function() {

    // Declare chess board such that it is draggable, allow spare pieces and droppable
    var boardCustom = Chessboard('boardCustom', {
        dropOffBoard: 'trash',
        sparePieces: true,
        draggable: true
        });
    
    // Declare configuration for every type of event functions like on drop, dragstart etc. with default start position and true set for draggable.
    var cfg = {
        draggable: true,
        position: 'start',
        onMouseoutSquare: onMouseoutSquare,
        onDragStart: onDragStart,
        onDrop: onDrop,
        onSnapEnd: onSnapEnd,
        onMouseoverSquare: onMouseoverSquare
    };
    //$('#startBtn').on('click', boardCustom.start);
    
    // For AI VS AI

    //board = Chessboard('boardCustom', cfg);
    //window.setTimeout(makeBestMove, 500);

    // For Player VS Player
    //board = Chessboard('boardCustom', config);

    // For Player VS Alpha Beta Pruning Algorithm AI
    board = Chessboard('boardCustom', cfg);
});

function startmatch()
{
    while(game.game_over() == false)
    {
        makeBestMove();
        maximizerbool = !maximizerbool;
        console.log("In Progress");
    }
    alert("Game over finally!");
}

/*The "AI" part starts here */

function parentNodeMove(depth, game, isMaximisingPlayer, isPruned) {

    //Get all possible moves
    var newGameMoves = game.moves();

    //console.log(isMaximisingPlayer);
    //console.log("Possible moves for "+ (isMaximisingPlayer ? "Player 1 (White)" : "Player 2 (Black)") +" are:");
    //console.log(newGameMoves);

    if($("#possible-move-count").text() == "")
        $('#possible-move-count').text(newGameMoves.length);
    else
        $("#possible-move-count").text(parseInt($("#possible-move-count").text()) + newGameMoves.length);
    //Default value for best move is negative so as to apply min-max logic accordingly
    let bestMove = null;
    if(isMaximisingPlayer == false)
    {
        bestMove = Number.POSTIVE_INFINITY;
    }
    else
    {
        bestMove = Number.NEGATIVE_INFINITY;
    }
    let bestMoveFound;

    for(let i = 0; i < newGameMoves.length; i++) 
    {
        // Get move i
        let newGameMove = newGameMoves[i];
        // Make the current move so as to evaluate further
        game.move(newGameMove);
        
        let value = null;
        
        if(isPruned == true)
        {
            // If minimax is pruned using alpha-beta pruning
            value = minimax_alphabetapruning(depth - 1, game, Number.NEGATIVE_INFINITY - 1, Number.POSITIVE_INFINITY + 1, !isMaximisingPlayer);
        }
        else
        {
            // If minimax is not pruned
            value = minimax(depth - 1, game, !isMaximisingPlayer);
        }
        game.undo();
        if(isMaximisingPlayer == true)
        {
            if(value >= bestMove) 
            {
                // If the heuristic value returned is greater than the best move 
                bestMove = value;
                //console.log("New Best Move Value is:"+bestMove);
                // Set the best move to current game move with greater heuristic value
                bestMoveFound = newGameMove;
            }
        }
        else
        {
            if(value <= bestMove) 
            {
                // If the heuristic value returned is greater than the best move 
                bestMove = value;
                //console.log("New Best Move Value is:"+bestMove);
                // Set the best move to current game move with greater heuristic value
                bestMoveFound = newGameMove;
            }
        }
    }
    //Return the best move
    if(bestMoveFound != undefined)
    {
        possibleMoveCount.push(newGameMoves.length);
        moveNumberSelected.push(newGameMoves.indexOf(bestMoveFound) + 1);
    }

    return bestMoveFound;
}

/**
 * Implementation Minimax algorithm function
 * @param depth: Depth of tree 
 * @param game: The current game state
 * @param isMaximisingPlayer: Boolean to check maximisation of player
 * @returns
 */
function minimax(depth, game, isMaximisingPlayer) {
    // Count of positions evaluated is incremented
    positionsEvaluatedCount++;
    if (depth === 0) 
    {
        // If the tree depth is 0, return board value
        return -evaluateBoard(game.board());
    }

    // Get all possible moves
    let newGameMoves = game.moves();

    // Check if the move is maximising the player value
    if (isMaximisingPlayer) 
    {   
        // Set the best move to negative infinity for max logic
        let bestMove = Number.NEGATIVE_INFINITY;

        // Loop for every possible move 
        for (let i = 0; i < newGameMoves.length; i++) 
        {
            // Make current move i in the game
            game.move(newGameMoves[i]);

            // Get maximum value from state of the game with the current move
            bestMove = Math.max(bestMove, minimax(depth - 1, game, !isMaximisingPlayer));

            // Undo the current move to check the next move
            game.undo();
        }
        // Return the best move
        return bestMove;
    }
    else
    {   
        // If not maximising, set the best move value to positive infinity
        let bestMove = Number.POSITIVE_INFINITY;
        // Loop every possible move
        for (let i = 0; i < newGameMoves.length; i++) 
        {
            // Make current move i in the game
            game.move(newGameMoves[i]);

            // Get minimum value state of the game with the current move
            bestMove = Math.min(bestMove, minimax(depth - 1, game, !isMaximisingPlayer));

            // Undo the current move to check the next move
            game.undo();
        }
        // Return the best move
        return bestMove;
    }

}

/**
 * Implementation Minimax algorithm with alpha-beta pruning
 * @param depth: Depth of tree 
 * @param game: Current Game state
 * @param alpha: Highest value evaluated at any given point for the maximizer
 * @param beta: Highest value evaluated at any given point for the minimizer
 * @param isMaximisingPlayer: Boolean to check maximisation of player
 * @returns 
 */
function minimax_alphabetapruning(depth, game, alpha, beta, isMaximisingPlayer) {
    // Count of positions evaluated is incremented
    positionsEvaluatedCount++;
    if (depth === 0) 
    {
        // If the tree depth is 0, return board value
        return -evaluateBoard(game.board());
    }

    // Get all the possible moves
    let newGameMoves = game.moves();

    // Check if the move is maximising the player value
    if (isMaximisingPlayer) 
    {
        // Set the best move to negative infinity for max logic
        let bestMove = Number.NEGATIVE_INFINITY;

        // Loop for every possible move
        for (let i = 0; i < newGameMoves.length; i++) 
        {
            // Make current move i in the game
            game.move(newGameMoves[i]);

            // Get maximum value from state of the game with the current move by passing alpha and beta values for pruning methodology
            bestMove = Math.max(bestMove, minimax_alphabetapruning(depth - 1, game, alpha, beta, !isMaximisingPlayer));

            // Undo current move to check the next move
            game.undo();

            // Get new value of alpha from the max of previous alpha and best move value
            alpha = Math.max(alpha, bestMove);
            if (beta <= alpha) 
            {
                // If the beta value is less than or equal to alpha value, we need not explore further branches and therefore return the best move instead
                return bestMove;
            }
        }
        // Return the best move if alpha was always less than beta
        return bestMove;
    } 
    else 
    {
        // If not maximising, set the best move value to positive infinity
        let bestMove = Number.POSITIVE_INFINITY;
        // Loop every possible move
        for (let i = 0; i < newGameMoves.length; i++) 
        {
            // Make current move i in the game
            game.move(newGameMoves[i]);

            // Get minimum value state of the game with the current move by passing alpha and beta values for pruning methodology
            bestMove = Math.min(bestMove, minimax_alphabetapruning(depth - 1, game, alpha, beta, !isMaximisingPlayer));

            // Undo the current move to check the next move
            game.undo();

            // Get new value of beta from the min of previous beta and best move value
            beta = Math.min(beta, bestMove);
            if (beta <= alpha) 
            {
                // If the beta value is less than or equal to alpha value, we need not explore further branches and therefore return the best move instead
                return bestMove;
            }
        }
        // Return the best move if alpha was always less than beta
        return bestMove;
    }
}

// Function to get total values of all pieces on the board
function evaluateBoard(board) {
    var boardEvaluationVal = 0;
    for (let i = 0; i < 8; i++) 
    {
        for (let j = 0; j < 8; j++) 
        {
            boardEvaluationVal += getPieceValue(board[i][j]);
        }
    }
    return boardEvaluationVal;
}

// Function to return piece value of the player
function getPieceValue(piece) {
    if (piece === null) {
        // Return 0 if piece is null
        return 0;
    }
    // JSON object for all pieces as keys and its values
    var pieceValues = {
        "p": 10,
        "n": 50,
        "b": 50,
        "r": 100,
        "q": 500,
        "k": 1000
    }
    if (piece.type in pieceValues)
    {
        // If the given piece exists, return the absolute value based upon the player to play
        return piece.color === 'w' ? pieceValues[piece.type] : -pieceValues[piece.type];
    }
    else
    {
        // Throw unknown piece error otherwise
        throw "Unknown piece type: " + piece.type;
    }
}

// Make the best move and then generate the history
function makeBestMove() {
    var bestMove = getBestMove(game);
    //console.log("Best Move is:"+bestMove);
    game.move(bestMove);
    board.position(game.fen());
    generateMoveHistory(game.history());
    if (game.game_over()) {
        //alert('Game over');
        //console.log(timeTakenArr);
    }
}


var positionsEvaluatedCount;

// Function to get the best move
function getBestMove(game) {
    // Check if the game is over or not
    if (game.game_over()) 
    {
        //alert('Game over');
        //console.log(timeTakenArr);
    }

    // If the game is not over, proceed further by setting positions evaluated to 0
    positionsEvaluatedCount = 0;

    // Get the depth of the tree
    var depth = parseInt($('#depth').find(':selected').text());

    //Minimax with alpha-beta pruning
    //isPruned = true;

    //Minimax without alpha-beta pruning
//     set on line 4
//     isPruned = false;

    // Get the start and end time to get the best move
    let time1 = new Date().getTime();
    //var bestMove = parentNodeMove(depth, game, true, isPruned);
    let bestMove = parentNodeMove(depth, game, maximizerbool, isPruned);
    let time2 = new Date().getTime();

    // Set the text accordingly
    if(isPruned)
    {
        $("#pruned").text("with Alpha-Beta Pruning");
    }
    else
    {
        $("#pruned").text("without Alpha-Beta Pruning");
    }

    // Fill in the stats at their respective ids accordingly
    // $('#positions-evaluated').text(positionsEvaluatedCount);
    // $('#time-taken').text((time2 - time1)/1000 + 's');
    // $('#positions-per-second').text((positionsEvaluatedCount * 1000 / (time2 - time1)));
    timeTakenArr.push((time2 - time1)/1000);
    positionsEvaluatedPerMove.push(positionsEvaluatedCount);

    var totalTimeTaken = 0;
    var totalPositionsEvaluated = 0;
    var avgPositionsPerSecond = 0;

    for(var index = 0; index < timeTakenArr.length; index++)
    {
        totalTimeTaken = totalTimeTaken + timeTakenArr[index];
    }

    for(var index = 0; index < positionsEvaluatedPerMove.length; index++)
    {
        totalPositionsEvaluated = totalPositionsEvaluated + positionsEvaluatedPerMove[index];
    }

    avgPositionsPerSecond = (totalPositionsEvaluated) / totalTimeTaken;

    $('#positions-evaluated').text(totalPositionsEvaluated);
    $('#time-taken').text(totalTimeTaken + 's');
    $('#positions-per-second').text(avgPositionsPerSecond);


    return bestMove;
}


/**
 * Generate all the moves played by the respective user
 * @param moves: Array that stores all the moves played by the users
 */
function generateMoveHistory(moves) {
    // Set the element as empty
    var historyElement = $('#movesPlayed').empty();
    historyElement.empty();

    // Set the table string to the following for initialization of table
    var tableString = '<table id="moveHistoryTable"><th>White Move</th><th>Black Move</th>';
    
    // Set the values by looping through the moves
    for (var i = 0; i < moves.length; i = i + 2) 
    {
        tableString = tableString + "<tr><td>" + moves[i] + "</td><td>" + ( moves[i + 1] ? moves[i + 1] : " ") + "</td></tr>";
    }
    tableString = tableString + "</table>";

    // Append the string and set the scroll top
    historyElement.append(tableString);
    historyElement.scrollTop(historyElement[0].scrollHeight);

}

/********************Following code is used to play as Player VS AI, as pet the API and not used for the project*********************8*/

// Visualize the board and check the state of the game
var onDragStart = function (source, piece, position, orientation) {
    if (game.in_checkmate() === true || game.in_draw() === true ||
        piece.search(/^b/) !== -1) {
        return false;
    }
};

var onDrop = function (source, target) {

    var move = game.move({
        from: source,
        to: target,
        promotion: 'q'
    });

    removeGreySquares();
    if (move === null) {
        return 'snapback';
    }

    generateMoveHistory(game.history());
    window.setTimeout(makeBestMove, 250);
};

var onSnapEnd = function () {
    board.position(game.fen());
};

var onMouseoverSquare = function(square, piece) {
    var moves = game.moves({
        square: square,
        verbose: true
    });

    if (moves.length === 0) return;

    greySquare(square);

    for (var i = 0; i < moves.length; i++) {
        greySquare(moves[i].to);
    }
};

var onMouseoutSquare = function(square, piece) {
    removeGreySquares();
};

var removeGreySquares = function() {
    $('#boardCustom .square-55d63').css('background', '');
};

var greySquare = function(square) 
{
    var background = '#a9a9a9';
    var squareEl = $('#boardCustom .square-' + square);

    if (squareEl.hasClass('black-3c85d') === true) 
    {
        background = '#696969';
    }

    squareEl.css('background', background);
};

/**********************End of Player VS AI code****************************/

/********************Graphs were generated for initial analysis but were then again created using python to maintain same format throughout the report*******************/
function generateAnalysisGraphs()
{
    var options = null;

    generatePlayerVSPlayerGraph();
    
    options = timeComplexityGraph(0);
    $("#player1timecomplexity").CanvasJSChart(options);
    
    options = timeComplexityGraph(1);
    $("#player2timecomplexity").CanvasJSChart(options);

    options = timeComplexityGraph_multiyaxis(0);
    $("#player1timecomplexity_multi_y_player1").CanvasJSChart(options);

    //options = timeComplexityGraph_multiyaxis(1);
    //$("#player1timecomplexity_multi_y_player2").CanvasJSChart(options);

    positionsEvaluatedGraph();

    positionsEvaluatedBothPlayersPattern();
}

function toogleDataSeries(e){
	if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
		e.dataSeries.visible = false;
	} else{
		e.dataSeries.visible = true;
	}
	e.chart.render();
}

function generatePlayerVSPlayerGraph()
{
    var data_player1= [];
    var data_player2 = [];
    var player1_moveCount = 1;
    var player2_moveCount = 1;
    for(var i = 0; i < timeTakenArr.length; i++)
    {
        var temp = {};
        if(i % 2 == 0)
        {
            temp["x"] = player1_moveCount;
            temp["y"] = timeTakenArr[i];
            player1_moveCount += 1;
            data_player1.push(temp);
        }
        temp = {};
        if(i % 2 == 1)
        {
            temp["x"] = player2_moveCount;
            temp["y"] = timeTakenArr[i];
            player2_moveCount += 1;
            data_player2.push(temp);
        }
    }
    var options = {
        animationEnabled: true,
        theme: "light2",
        title:{
            text: isPruned ? "Player 1 vs Player 2 with Alpha-Beta Pruning" : "Player 1 vs Player 2 without Alpha-Beta Pruning"
        },
        axisX:{
            title: "Move Count"
        },
        axisY: {
            title: "Time Taken",
            suffix: " Sec",
            minimum: 0.0
        },
        toolTip:{
            shared:true
        },  
        legend:{
            cursor:"pointer",
            verticalAlign: "bottom",
            horizontalAlign: "left",
            dockInsidePlotArea: true,
            itemclick: toogleDataSeries
        },
        data: [{
            type: "spline",
            showInLegend: true,
            name: "Player 1",
            markerType: "square",
            color: "#51CDA0",
            dataPoints: data_player1
        },
        {
            type: "spline",
            showInLegend: true,
            name: "Player 2",
            lineDashType: "dash",
            color: "#6495ED",
            dataPoints: data_player2
        }]
    };
    $("#chartContainer").CanvasJSChart(options);
}

function timeComplexityGraph(remainder)
{
    var data_playeractual= [];
    var data_playercalculated = [];
    var player_moveCount = 1;
    for(var i = 0; i < timeTakenArr.length; i++)
    {
        var tempActualTime = {};
        var tempWorstCaseTime = {}
        if(i % 2 == remainder)
        {
            tempActualTime["x"] = player_moveCount;
            tempActualTime["y"] = timeTakenArr[i];

            tempWorstCaseTime["x"] = player_moveCount;
            tempWorstCaseTime["y"] = (positionsEvaluatedPerMove[i] ** (parseInt($('#depth').find(':selected').text()) / 2)) / 1000;
            
            player_moveCount += 1;
            data_playeractual.push(tempActualTime);
            data_playercalculated.push(tempWorstCaseTime);
        }
    }
    var options = {
        animationEnabled: true,
        theme: "light2",
        title:{
            text: isPruned ? "Player "+(remainder + 1)+" Time Complexity Analysis with Alpha-Beta Pruning": "Player "+(remainder + 1)+" Time Complexity Analysis without Alpha-Beta Pruning"
        },
        axisX:{
            title: "Move Count"
        },
        axisY: {
            title: "Time Taken",
            suffix: " Sec",
            minimum: 0.0
        },
        toolTip:{
            shared:true
        },  
        legend:{
            cursor:"pointer",
            verticalAlign: "bottom",
            horizontalAlign: "left",
            dockInsidePlotArea: true,
            itemclick: toogleDataSeries
        },
        data: [{
            type: "spline",
            showInLegend: true,
            name: "Player "+(remainder + 1)+" - Actual",
            markerType: "square",
            color: "#51CDA0",
            dataPoints: data_playeractual
        },
        {
            type: "spline",
            showInLegend: true,
            name: isPruned ? "Player "+(remainder + 1)+" - Worst Case (O(b^d/2))" : "Player "+(remainder + 1)+" - Worst Case (O(b^d))",
            lineDashType: "dash",
            color: "#F08080",
            dataPoints: data_playercalculated
        }]
    };
    return options;
}

function positionsEvaluatedGraph()
{
    var data_player1 = [];
    var data_player2 = [];
    var player1_moveCount = 1;
    var player2_moveCount = 1;
    for(var i = 0; i < positionsEvaluatedPerMove.length; i++)
    {
        var temp = {};
        if(i % 2 == 0)
        {
            temp["x"] = player1_moveCount;
            temp["y"] = positionsEvaluatedPerMove[i];
            
            player1_moveCount += 1;
            data_player1.push(temp);
        }
        temp = {};
        if(i % 2 == 1)
        {
            temp["x"] = player2_moveCount;
            temp["y"] = positionsEvaluatedPerMove[i];

            player2_moveCount += 1;
            data_player2.push(temp);
        }
    }

    var options = {
        animationEnabled: true,
        theme: "light2",
        title:{
            text: isPruned ? "Player Positions Evaluated VS Move with Alpha-Beta Pruning": "Player Positions Evaluated VS Move without Alpha-Beta Pruning"
        },
        axisX:{
            title: "Move Count"
        },
        axisY: {
            title: "Positions Evaluated",
            minimum: 0.0
        },
        toolTip:{
            shared:true
        },  
        legend:{
            cursor:"pointer",
            verticalAlign: "bottom",
            horizontalAlign: "left",
            dockInsidePlotArea: true,
            itemclick: toogleDataSeries
        },
        data: [{
            type: "spline",
            showInLegend: true,
            name: "Player 1 - Positions evaluated",
            markerType: "square",
            color: "#51CDA0",
            dataPoints: data_player1
        },
        {
            type: "spline",
            showInLegend: true,
            name: "Player 2 - Positions evaluated",
            lineDashType: "dash",
            color: "#6495ED",
            dataPoints: data_player2
        }]
    };
    $("#playerspositionsevaluated").CanvasJSChart(options);
}

function positionsEvaluatedBothPlayersPattern()
{
    var moveHistory = [];
    var data_player_positions_move = [];
    for(var i = 0; i < $("#moveHistoryTable td").length; i++)
    {
        moveHistory.push($("#moveHistoryTable td")[i].innerText);
    }

    for(var i = 0; i < positionsEvaluatedPerMove.length; i++)
    {
        var temp = {};
        temp["label"] = moveHistory[i];
        temp["y"] = positionsEvaluatedPerMove[i];
        data_player_positions_move.push(temp);
    }
    var options = {
        animationEnabled: true,
        theme: "light2",
        title:{
            text: isPruned ? "Both Player Positions Evaluated VS Move with Alpha-Beta Pruning": "Both Player Positions Evaluated VS Move without Alpha-Beta Pruning"
        },
        axisX:{
            title: "Move Played"
        },
        axisY: {
            title: "Positions Evaluated",
            minimum: 0.0
        },
        toolTip:{
            shared:true
        },  
        legend:{
            cursor:"pointer",
            verticalAlign: "bottom",
            horizontalAlign: "left",
            dockInsidePlotArea: true,
            itemclick: toogleDataSeries
        },
        data: [{
            type: "spline",
            showInLegend: true,
            name: "Player Positions evaluated per move",
            markerType: "square",
            color: "#6495ED",
            dataPoints: data_player_positions_move
        }]
    };
    $("#playerpositionsevaluated_singleLine").CanvasJSChart(options);

}


function timeComplexityGraph_multiyaxis(remainder)
{
    var data_playeractual= [];
    var data_playercalculated = [];
    var data_playercalculated_worst = [];
    var player_moveCount = 1;
    for(var i = 0; i < timeTakenArr.length; i++)
    {
        var tempActualTime = {};
        var tempCalculated = {};
        var tempWorstCaseTime = {}
        if(i % 2 == remainder)
        {
            tempActualTime["x"] = player_moveCount;
            tempActualTime["y"] = timeTakenArr[i];

            tempCalculated["x"] = player_moveCount;
            tempCalculated["y"] = (positionsEvaluatedPerMove[i] ** (parseInt($('#depth').find(':selected').text()) / 2));            

            tempWorstCaseTime["x"] = player_moveCount;
            tempWorstCaseTime["y"] = (positionsEvaluatedPerMove[i] ** (parseInt($('#depth').find(':selected').text()))) / 100000;
            
            player_moveCount += 1;

            data_playeractual.push(tempActualTime);
            data_playercalculated.push(tempCalculated);
            data_playercalculated_worst.push(tempWorstCaseTime);
        }
    }
    var options = {
        animationEnabled: true,
        theme: "light2",
        title:{
            text: isPruned ? "Time Complexity Analysis with Alpha-Beta Pruning": "Time Complexity Analysis without Alpha-Beta Pruning"
        },
        axisX:{
            title: "Move Count"
        },
        axisY:[{
          title: "Positions Evaluated - Observed",
          lineColor: "#6495ED",
          titleFontColor: "#6495ED",
          labelFontColor: "#6495ED"
        },
        {
          title: "Positions Evaluated * 10^5 - Worst Case (O(b^d))",
          lineColor: "#f08080",
          titleFontColor: "#f08080",
          labelFontColor: "#f08080"
        }],
        toolTip:{
            shared:true
        },  
        legend:{
            cursor:"pointer",
            verticalAlign: "bottom",
            horizontalAlign: "left",
            dockInsidePlotArea: true,
            itemclick: toogleDataSeries
        },
        data: [
        // {
        //   type: "spline",
        //   showInLegend: true,
        // //   axisYIndex: 1, //Defaults to Zero
        //   name: "Actual",
        //   xValueFormatString: "####",
        //   color: "#51CDA0",
        //   dataPoints: data_playeractual
        // },
        {
            type: "spline",
            showInLegend: true,                  	
          //   axisYIndex: 1, //When axisYType is secondary, axisYIndex indexes to secondary Y axis & not to primary Y axis
            name: "Observed Positions",
            xValueFormatString: "####",
            color: "#6495ED",
            dataPoints: data_playercalculated
        },
        {
          type: "spline",
          showInLegend: true,                  	
        //   axisYIndex: 1, //When axisYType is secondary, axisYIndex indexes to secondary Y axis & not to primary Y axis
          name: "Worst Case",
          axisYType: "secondary",
          xValueFormatString: "####",
          color: "#F08080",
          dataPoints: data_playercalculated_worst
        }
        ]
    };
    return options;
}

/******************************End of initial generated testing Graphs**********************/

function storeResultsCSV()
{
    //Time Taken CSV
    var tempCSVStr = timeTakenArr.toString();
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(tempCSVStr);
    hiddenElement.target = '_blank';
    hiddenElement.download = isPruned ? 'timetaken_AlphaBeta_Results.csv' : "timetaken_without_AlphaBeta_Results.csv";
    hiddenElement.click();

    //Positions Evaluated CSV
    tempCSVStr = positionsEvaluatedPerMove.toString();
    hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(tempCSVStr);
    hiddenElement.target = '_blank';
    hiddenElement.download = isPruned ? 'positionsevaluated_AlphaBeta_Results.csv' : 'positionsevaluated_without_AlphaBeta_Results.csv';
    hiddenElement.click();

    //Possible Move Count / Branch Count
    tempCSVStr = possibleMoveCount.toString();
    hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(tempCSVStr);
    hiddenElement.target = '_blank';
    hiddenElement.download = isPruned ? 'possibleMoveCount_AlphaBeta_Results.csv' : 'possibleMoveCount_without_AlphaBeta_Results.csv';
    hiddenElement.click();

    //Move Selected / Branch Selected
    tempCSVStr = moveNumberSelected.toString();
    hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(tempCSVStr);
    hiddenElement.target = '_blank';
    hiddenElement.download = isPruned ? 'moveNumberSelected_AlphaBeta_Results.csv' : 'moveNumberSelected_without_AlphaBeta_Results.csv';
    hiddenElement.click();
}
