//Declaration of global variables for board, game and pruning check
var board = null;
var game = new Chess();
var isPruned = false;
var timeTakenArr = []
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
    alert("White plays first");
}

/*The "AI" part starts here */

function parentNodeMove(depth, game, isMaximisingPlayer, isPruned) {

    //Get all possible moves
    var newGameMoves = game.moves();
    $('#possible-move-count').text(newGameMoves.length);
    //Default value for best move is negative so as to apply min-max logic accordingly
    var bestMove = Number.NEGATIVE_INFINITY;
    var bestMoveFound;

    for(var i = 0; i < newGameMoves.length; i++) 
    {
        // Get move i
        var newGameMove = newGameMoves[i];
        // Make the current move so as to evaluate further
        game.move(newGameMove);
        
        var value = null;
        
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
        console.log("After Recursion:"+isMaximisingPlayer)
        if(value >= bestMove) {
            // If the heuristic value returned is greater than the best move 
            bestMove = value;
            console.log(value);
            // Set the best move to current game move with greater heuristic value
            bestMoveFound = newGameMove;
        }
    }
    //Return the best move
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
        // If the tree depth is 0, return with infinite loop value
        return -evaluateBoard(game.board());
    }

    // Get all possible moves
    var newGameMoves = game.moves();

    // Check if the move is maximising the player value
    if (isMaximisingPlayer) 
    {
        // Set the best move to negative infinity for max logic
        var bestMove = Number.NEGATIVE_INFINITY;

        // Loop for every possible move 
        for (var i = 0; i < newGameMoves.length; i++) 
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
        var bestMove = Number.POSITIVE_INFINITY;
        // Loop every possible move
        for (var i = 0; i < newGameMoves.length; i++) 
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
        // If the tree depth is 0, return with infinite loop value
        return -evaluateBoard(game.board());
    }

    // Get all the possible moves
    var newGameMoves = game.moves();
    console.log("Current player:"+ isMaximisingPlayer);
    // Check if the move is maximising the player value
    if (isMaximisingPlayer) 
    {
        // Set the best move to negative infinity for max logic
        var bestMove = Number.NEGATIVE_INFINITY;

        // Loop for every possible move
        for (var i = 0; i < newGameMoves.length; i++) 
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
        var bestMove = Number.POSITIVE_INFINITY;
        // Loop every possible move
        for (var i = 0; i < newGameMoves.length; i++) 
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
    for (var i = 0; i < 8; i++) 
    {
        for (var j = 0; j < 8; j++) 
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

// Visualize the board and check the state of the game
var onDragStart = function (source, piece, position, orientation) {
    if (game.in_checkmate() === true || game.in_draw() === true ||
        piece.search(/^b/) !== -1) {
        return false;
    }
};

// Make the best move and then generate the history
function makeBestMove() {
    var bestMove = getBestMove(game);
    console.log("Best Move is:"+bestMove);
    game.move(bestMove);
    board.position(game.fen());
    generateMoveHistory(game.history());
    if (game.game_over()) {
        alert('Game over');
        console.log(timeTakenArr);
    }
}


var positionsEvaluatedCount;

// Function to get the best move
function getBestMove(game) {
    // Check if the game is over or not
    if (game.game_over()) 
    {
        alert('Game over');
        console.log(timeTakenArr);
    }

    // If the game is not over, proceed further by setting positions evaluated to 0
    positionsEvaluatedCount = 0;

    // Get the depth of the tree
    var depth = parseInt($('#depth').find(':selected').text());

    //Minimax with alpha-beta pruning
    isPruned = true;

    //Minimax without alpha-beta pruning
    //isPruned = false;

    // Get the start and end time to get the best move
    var time1 = new Date().getTime();
    var bestMove = parentNodeMove(depth, game, true, isPruned);
    var time2 = new Date().getTime();

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
    $('#positions-evaluated').text(positionsEvaluatedCount);
    $('#time-taken').text((time2 - time1)/1000 + 's');
    $('#positions-per-second').text((positionsEvaluatedCount * 1000 / (time2 - time1)));
    timeTakenArr.push((time2 - time1)/1000);
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
    var tableString = '<table id="moveHistoryTable"><th>Player Move</th><th>AI Move</th>';
    
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




/*******Recommended Best Move Section*******/
// Function to get total values of all pieces on the board
function evaluateBoardForPlayer(board) {
    var boardEvaluationVal = 0;
    for (var i = 0; i < 8; i++) 
    {
        for (var j = 0; j < 8; j++) 
        {
            boardEvaluationVal += getPieceValueForPlayer(board[i][j]);
        }
    }
    return boardEvaluationVal;
}

// Function to return piece value of the player
function getPieceValueForPlayer(piece) {
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
        return piece.color === 'b' ? -pieceValues[piece.type] : pieceValues[piece.type];
    }
    else
    {
        // Throw unknown piece error otherwise
        throw "Unknown piece type: " + piece.type;
    }
}

/**********End of Recommended best move section*********/