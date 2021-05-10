import time
from math import inf as infinity
import pandas as pd

moveCounter = 0
listOfMoves = []
listOfTime = []
listOfTurns = []
listOfMovesPerTime = []

currentBoard = [[' ',' ',' '],
                [' ',' ',' '],
                [' ',' ',' ']]

# Player X always plays first
currentTurn = 'X'

def saveCSV():
    dict = {'Turn': listOfTurns, 'Searched_Moves': listOfMoves, 'Time_Taken': listOfTime, 'Moves_Per_Second': listOfMovesPerTime}
    df = pd.DataFrame(dict) 
    df.to_csv('TicTacToeMiniMaxNew.csv', index=False)
    print('\nOutput Saved! Exiting...\n\n')


def printBoard():
    print('---------------')
    print('| ' + str(currentBoard[0][0]) + ' || ' + str(currentBoard[0][1]) + ' || ' + str(currentBoard[0][2]) + ' |')
    print('---------------')
    print('| ' + str(currentBoard[1][0]) + ' || ' + str(currentBoard[1][1]) + ' || ' + str(currentBoard[1][2]) + ' |')
    print('---------------')
    print('| ' + str(currentBoard[2][0]) + ' || ' + str(currentBoard[2][1]) + ' || ' + str(currentBoard[2][2]) + ' |')
    print('---------------')


# checks to see if move is legal
def isMoveValid(boardI, boardJ):
    if boardI < 0 or boardI > 2 or boardJ < 0 or boardJ > 2:
        return False
    elif currentBoard[boardI][boardJ] != ' ':
        return False
    else:
        return True


# checks if the game has ended and returns the result
def hasGameEnded():
    # vertical win
    for i in range(0, 3):
        if (currentBoard[0][i] != ' ' and
            currentBoard[0][i] == currentBoard[1][i] and
            currentBoard[1][i] == currentBoard[2][i]):
            return currentBoard[0][i]

    # horizontal win
    for i in range(0, 3):
        if (currentBoard[i] == ['X', 'X', 'X']):
            return 'X'
        elif (currentBoard[i] == ['O', 'O', 'O']):
            return 'O'

    # main diagonal win
    if (currentBoard[0][0] != ' ' and
        currentBoard[0][0] == currentBoard[1][1] and
        currentBoard[0][0] == currentBoard[2][2]):
        return currentBoard[0][0]

    # second diagonal win
    if (currentBoard[0][2] != ' ' and
        currentBoard[0][2] == currentBoard[1][1] and
        currentBoard[0][2] == currentBoard[2][0]):
        return currentBoard[0][2]

    # if the whole board is not full then continue game
    for i in range(0, 3):
        for j in range(0, 3):
            if (currentBoard[i][j] == ' '):
                return None

    # if the board is full return tie
    return ' '

    
# Maximizer (X)
def maximizerAlphaBeta(alpha, beta):
    global currentBoard
    global moveCounter 
    
    # initial best value for maximizer
    bestMaxVal = -infinity

    # indices for the initial best value
    boardI = None
    boardJ = None

    # get game status
    winner = hasGameEnded()

    # depending on who wins, return the best value and the board index associated with it
    if winner == 'X':
        moveCounter += 1
        return (1, 0, 0)
    elif winner == 'O':
        moveCounter += 1
        return (-1, 0, 0)
    elif winner == ' ':
        moveCounter += 1
        return (0, 0, 0)

    # for all the remaining values on the board
    for i in range(0, 3):
        for j in range(0, 3):
            # enter the current player value if value can be entered
            if currentBoard[i][j] == ' ':
                currentBoard[i][j] = 'X'
                # call the minimizer
                (val, minI, minJ) = minimizerAlphaBeta(alpha, beta)
                # get the best value and index
                if val > bestMaxVal:
                    bestMaxVal = val
                    boardI = i
                    boardJ = j
                
                # set back the field to empty for next call
                currentBoard[i][j] = ' '
                
                # update alpha
                if bestMaxVal > alpha:
                    alpha = bestMaxVal
                    
                # if the value is greater than beta, that means we have found the best possible value for the maximizer
                if alpha >= beta:
                    return (bestMaxVal, boardI, boardJ)

    # return the best value and it's associated indices
    return (bestMaxVal, boardI, boardJ)


# Minimizer (O)
def minimizerAlphaBeta(alpha, beta):
    global currentBoard
    global moveCounter

    # initial worst value for minimizer
    bestMinVal = infinity

    # indices for the initial best value
    boardI = None
    boardJ = None

    # get game status
    winner = hasGameEnded()

    # depending on who wins, return the best value and the board index associated with it
    if winner == 'X':
        moveCounter += 1
        return (1, 0, 0)
    elif winner == 'O':
        moveCounter += 1
        return (-1, 0, 0)
    elif winner == ' ':
        moveCounter += 1
        return (0, 0, 0)
    
    # for all the remaining values on the board
    for i in range(0, 3):
        for j in range(0, 3):
            # enter the current player value if value can be entered
            if currentBoard[i][j] == ' ':
                currentBoard[i][j] = 'O'
                # call the maximizer
                (val, maxI, maxJ) = maximizerAlphaBeta(alpha, beta)
                # get the best value and index
                if val < bestMinVal:
                    bestMinVal = val
                    boardI = i
                    boardJ = j
                
                # set back the field to empty for next call
                currentBoard[i][j] = ' '
                
                # update beta
                if bestMinVal < beta:
                    beta = bestMinVal
                    
                # if the value is less than alpha, that means we have found the best possible value for the minimizer
                if alpha >= beta:
                    return (bestMinVal, boardI, boardJ)

    # return the best value and it's associated indices
    return (bestMinVal, boardI, boardJ)


# driver code
def playAlphaBeta():
    global currentTurn
    global moveCounter
    
    print('\n\nTic-Tac-Toe using AlphaBeta Pruning:\n\n')
    print('Initial Empty Board:')
    
    while True:
        # print game board
        printBoard()

        # check game status
        winner = hasGameEnded()

        # if the game has ended, stop while loop and print appropriate message
        if winner != None:
            if winner == 'X':
                print('X wins!')
                # saveCSV()
            elif winner == 'O':
                print('O wins!')
                # saveCSV()
            elif winner == ' ':
                print("Draw!")
                # saveCSV()
            return

        listOfTurns.append(currentTurn)

        # call the maximizer in X's turn and update the board with the best returned value
        if currentTurn == 'X':
            print('\nX\'s turn:')
            moveCounter = 0
            
            start = time.time()
            (val, boardI, boardJ) = maximizerAlphaBeta(float('-inf'), float('inf'))
            end = time.time()
            print('Time Taken: {}s'.format(end - start))
            print('Best Move i,j = {},{}'.format(boardI, boardJ))
            print("Positions Evaluated:", moveCounter)

            listOfMoves.append(moveCounter)
            listOfTime.append(end - start)

            currentBoard[boardI][boardJ] = 'X'
            currentTurn = 'O'
            print('\nX played:')

        # call the minimizer in O's turn and update the board with the best returned value
        else:
            print('\nO\'s turn:')
            moveCounter = 0
            start = time.time()
            (val, boardI, boardJ) = minimizerAlphaBeta(float('-inf'), float('inf'))
            end = time.time()
            print('Time Taken: {}s'.format(end - start))
            print('Best Move i,j = {},{}'.format(boardI, boardJ))
            print("Positions Evaluated:", moveCounter)
            
            listOfMoves.append(moveCounter)
            listOfTime.append(end - start)
            
            currentBoard[boardI][boardJ] = 'O'
            currentTurn = 'X'
            print('\nO played:')


playAlphaBeta()
