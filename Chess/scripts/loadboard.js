var board = null
var game = new Chess()
var whiteSquareGrey = '#a9a9a9'
var blackSquareGrey = '#696969'
var positionCount;

var config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onMouseoutSquare: onMouseoutSquare,
    onMouseoverSquare: onMouseoverSquare,
    onSnapEnd: onSnapEnd
}

$(document).ready(function() {
    var board2 = Chessboard('board2', {
        draggable: true,
        dropOffBoard: 'trash',
        sparePieces: true
        });
    
    $('#startBtn').on('click', board2.start);

    //const { Chess } = require('../src/chessboard/js/chess.js');
    
    // For AI VS AI

    board = Chessboard('board2', config);
    window.setTimeout(makeRandomMove, 500);

    // For Player VS Player
    //board = Chessboard('board2', config);

    // For Player VS Alpha Beta Pruning Algorithm AI
    //board = Chessboard('board2', config);
    //window.setTimeout(makeBestMove, 500);
});

$('#clearBtn').on('click', function(){
    game.clear();
    game.fen();
});

function makeRandomMove () {
    var possibleMoves = game.moves()
  
    // exit if the game is over
    if (game.game_over()) return
  
    var randomIdx = Math.floor(Math.random() * possibleMoves.length)
    game.move(possibleMoves[randomIdx])
    board.position(game.fen())
  
    window.setTimeout(makeRandomMove, 500)
}


function removeGreySquares () {
    $('#board2 .square-55d63').css('background', '')
}
  
function greySquare (square) {
    var $square = $('#board2 .square-' + square)
  
    var background = whiteSquareGrey
    if ($square.hasClass('black-3c85d')) {
      background = blackSquareGrey
    }
  
    $square.css('background', background)
}
  
function onDragStart (source, piece) {
    // do not pick up pieces if the game is over
    if (game.game_over()) return false
  
    // or if it's not that side's turn
    if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
      return false
    }
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

    renderMoveHistory(game.history());
    window.setTimeout(makeBestMove, 250);
};
  
function onMouseoverSquare (square, piece) {
    // get list of possible moves for this square
    var moves = game.moves({
      square: square,
      verbose: true
    });
  
    // exit if there are no moves available for this square
    if (moves.length === 0) return
  
    // highlight the square they moused over
    greySquare(square)
  
    // highlight the possible squares for this piece
    for (var i = 0; i < moves.length; i++) {
      greySquare(moves[i].to)
    }
}
  
function onMouseoutSquare (square, piece) {
    removeGreySquares()
}
  
function onSnapEnd () {
    board.position(game.fen())
}


/***MiniMax with Alpha Beta Pruning***/
var minimaxRoot =function(depth, game, isMaximisingPlayer) {

    var newGameMoves = game.moves();
    var bestMove = -9999;
    var bestMoveFound;

    for(var i = 0; i < newGameMoves.length; i++) {
        var newGameMove = newGameMoves[i]
        game.move(newGameMove);
        var value = minimax(depth - 1, game, -10000, 10000, !isMaximisingPlayer);
        game.undo();
        if(value >= bestMove) {
            bestMove = value;
            bestMoveFound = newGameMove;
        }
    }
    return bestMoveFound;
};

var minimax = function (depth, game, alpha, beta, isMaximisingPlayer) {
    positionCount++;
    if (depth === 0) {
        return -evaluateBoard(game.board());
    }

    var newGameMoves = game.moves();

    if (isMaximisingPlayer) {
        var bestMove = -9999;
        for (var i = 0; i < newGameMoves.length; i++) {
            game.move(newGameMoves[i]);
            bestMove = Math.max(bestMove, minimax(depth - 1, game, alpha, beta, !isMaximisingPlayer));
            game.undo();
            alpha = Math.max(alpha, bestMove);
            if (beta <= alpha) {
                return bestMove;
            }
        }
        return bestMove;
    } else {
        var bestMove = 9999;
        for (var i = 0; i < newGameMoves.length; i++) {
            game.move(newGameMoves[i]);
            bestMove = Math.min(bestMove, minimax(depth - 1, game, alpha, beta, !isMaximisingPlayer));
            game.undo();
            beta = Math.min(beta, bestMove);
            if (beta <= alpha) {
                return bestMove;
            }
        }
        return bestMove;
    }
};

var evaluateBoard = function (board) {
    var totalEvaluation = 0;
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            totalEvaluation = totalEvaluation + getPieceValue(board[i][j], i ,j);
        }
    }
    return totalEvaluation;
};



var getPieceValue = function (piece, x, y) {
    if (piece === null) 
    {
        return 0;
    }
    var getAbsoluteValue = function (piece) {
        if (piece.type === 'p') 
        {
            return 10;
        } 
        else if (piece.type === 'r') 
        {
            return 50;
        } 
        else if (piece.type === 'n') 
        {
            return 30;
        } 
        else if (piece.type === 'b') 
        {
            return 30;
        } 
        else if (piece.type === 'q') 
        {
            return 90;
        } 
        else if (piece.type === 'k') 
        {
            return 900;
        }
        throw "Unknown piece type: " + piece.type;
    };

    var absoluteValue = getAbsoluteValue(piece);
    return piece.color === 'w' ? absoluteValue : -absoluteValue;
};



var makeBestMove = function () {
    var bestMove = getBestMove(game);
    game.move(bestMove);
    board.position(game.fen());
    renderMoveHistory(game.history());
    if (game.game_over()) {
        alert('Game over');
    }
};

var getBestMove = function (game) {
    if (game.game_over()) {
        alert('Game over');
    }

    positionCount = 0;
    var depth = parseInt($('#search-depth').find(':selected').text());

    var d = new Date().getTime();
    var bestMove = minimaxRoot(depth, game, true);
    var d2 = new Date().getTime();
    var moveTime = (d2 - d);
    var positionsPerS = ( positionCount * 1000 / moveTime);

    $('#position-count').text(positionCount);
    $('#time').text(moveTime/1000 + 's');
    $('#positions-per-s').text(positionsPerS);
    return bestMove;
};


var renderMoveHistory = function (moves) {
    var historyElement = $('#move-history').empty();
    historyElement.empty();
    for (var i = 0; i < moves.length; i = i + 2) {
        historyElement.append('<span>' + moves[i] + ' ' + ( moves[i + 1] ? moves[i + 1] : ' ') + '</span><br>')
    }
    historyElement.scrollTop(historyElement[0].scrollHeight);

};