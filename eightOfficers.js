var SIZE = 8;
var PIECES = ['Q', 'R', 'R',  'B', 'B', 'N', 'N', 'K'];
var board = [];
var COVER = []
var positions = 0;
var positionsFound = 0;
var pruneDepth3 = 0;
var pruneDepth2 = 0;
var pruneDepth1 = 0;
var FULL_COVER = 0;
var SQUARES = SIZE * SIZE;
for(var full=0; full<SIZE;full++) {
	FULL_COVER |= 1 << full;
}
var bitTable = [0];
for (var i = 0; i < 256; i++) {
   bitTable[i] = (i & 1) + bitTable[i>>1];
}
initBoard(board);
initCover(COVER);

function out(s) {
    // assumes <pre id="output"></pre>
    document.getElementById('output').innerHTML += s + "\n";
}

function clearCover(c) {
  for(var i=0; i<SIZE;++i) {
    c[i] = 0;
  }
}

function initBoard(b) {
  for(var i=0; i<SIZE;i++) {
  	b[i] = []
    for(var j=0; j<SIZE;j++) {
      b[i][j] = 0;
    }
  }
}

function initCover(c) {
  for(var i=0; i<SIZE;i++) {
  	c[i] = 0;
  }
}

function printBoard(b) {
  out("\n");
  b.forEach(function(rank) {
   	out(rank);
  })
}
function outOfBounds(rank, file) {
  return (rank < 0 || file < 0 || rank >= SIZE || file >= SIZE);
}
function hasPiece(board, rank, file) {
	if(outOfBounds(rank, file)) {
  	return false;
  }
  cell = board[rank][file];
	return (cell!=0 && cell!=1) 
}
function markSquare(covered, rank, file) {
	if(outOfBounds(rank, file)) {
  	return;
  }
  covered[rank] |= 1 << file;
}
function markBishop(covered, b, rank, file) {
  var r,f;
  // upper right diagnol;
  for(r=rank+1,f=file+1;!outOfBounds(r,f);++r,++f) {
  	if(hasPiece(b, r, f)) {
    	break;
    }
    markSquare(covered, r, f);
  }
  // lower left diagnal
  for(r=rank-1,f=file-1;!outOfBounds(r,f);--r,--f) {
  	if(hasPiece(b, r, f)) {
    	break;
    }
    markSquare(covered, r, f);
  }
  // upper left diagnal
  for(r=rank+1,f=file-1;!outOfBounds(r,f);++r,--f) {
  	if(hasPiece(b, r, f)) {
    	break;
    }
    markSquare(covered, r, f);
  }
  // lower right diagnal
  for(r=rank-1,f=file+1;!outOfBounds(r,f);--r,++f) {
  	if(hasPiece(b, r, f)) {
    	break;
    }
    markSquare(covered, r, f);
  }
}
function markRook(covered, b, rank, file) {
  var r,f;
  // up;
  for(r=rank+1;r<SIZE;++r) {
  	if(hasPiece(b, r, file)) {
    	break;
    }
    markSquare(covered, r, file);
  }
  // down
  for(r=rank-1;r>=0;--r) {
  	if(hasPiece(b, r, file)) {
    	break;
    }
    markSquare(covered, r, file);
  }
  // left
  for(f=file-1;f>=0;--f) {
  	if(hasPiece(b, rank, f)) {
    	break;
    }
    markSquare(covered, rank, f);
  }
  // right
  for(f=file+1;f<SIZE;++f) {
  	if(hasPiece(b, rank, f)) {
    	break;
    }
    markSquare(covered, rank, f);
  }
}
function markCover(covered, b, rank, file) {
	var piece = b[rank][file];
  markSquare(covered, rank, file);
	if (piece == 'R') {
  	markRook(covered, b, rank, file);
  } else if (piece == 'B') {
    markBishop(covered, b, rank, file);
  } else if (piece == 'Q') {
  	markRook(covered, b, rank, file);
    markBishop(covered, b, rank, file);
  } else if (piece == 'N') {
  	markSquare(covered, rank-2, file-1);
    markSquare(covered, rank-2, file+1);
  	markSquare(covered, rank+2, file-1);
    markSquare(covered, rank+2, file+1);
  	markSquare(covered, rank-1, file+2);
    markSquare(covered, rank+1, file+2);
  	markSquare(covered, rank-1, file-2);
    markSquare(covered, rank+1, file-2);
	} else if (piece == 'K') {
    markSquare(covered, rank-1, file-1);
    markSquare(covered, rank-1, file);
  	markSquare(covered, rank+1, file+1);
    markSquare(covered, rank, file-1);
  	markSquare(covered, rank, file+1);
    markSquare(covered, rank+1, file-1);
  	markSquare(covered, rank+1, file);
    markSquare(covered, rank+1, file+1);
  }
}

function determineCoverage(b) {
  for(var i=0; i<SIZE;++i) {
    for(var j=0; j<SIZE;++j) {
      if(b[i][j]) {
      	markCover(COVER, b, i, j)
      }
    }
  }
}
function isFullyCovered(b) {
  clearCover(COVER);
  
  determineCoverage(b);
  for(var i=0; i<SIZE;++i) {
    if(COVER[i] != FULL_COVER) {
      return false;
    }
  }
  return true;
}

function getUncoveredSquares(b) {
  clearCover(COVER);
  determineCoverage(b);
  
  var uncovered = 0;
  for(var i=0; i<SIZE;++i) {
    uncovered += bitTable[COVER[i]];
  }
  return SQUARES-uncovered;
}
function placePiece(b, pieceIndex, opt_start) {
	if (pieceIndex == PIECES.length) {
    ++positions;
    if (0 == (positions % 1000000)) {
   		console.log("Considered " + positions)
    }
  	if (isFullyCovered(b)) {
    	++positionsFound;
    	printBoard(b);
    }
    return;
  } else if ((PIECES.length - pieceIndex) == 1) {
  	var uncovered = getUncoveredSquares(b);
    // Assume last piece is King which can cover at most 9 squares.
    if (uncovered > 9) {
    	++pruneDepth1;
    	return;
    }
  } 
  else if ((PIECES.length - pieceIndex) == 2) {
    	var uncovered = getUncoveredSquares(b);
    // Assume last two pieces are Night and King which can cover at most 18.
    if (uncovered > 18) {
    	++pruneDepth2;
    	return;
    }
  } else if ((PIECES.length - pieceIndex) == 3) {
    	var uncovered = getUncoveredSquares(b);
    // Assume last 3 pieces are Two Knights and King which can cover at most 27.
    if (uncovered > 27) {
    	++pruneDepth3;
    	return;
    }
  }
  var iStart = 0;
  var jStart = 0
  var size = SIZE;
  
  if (opt_start) {
  	iStart = opt_start.rank;
  }
  // Due to symmetry, we need only consider the first piece placed in first quadrant.
  if (pieceIndex == 0) {
    size = SIZE/2;
  }
  for (var i=iStart; i<size; i++) {
  	if (pieceIndex == 0) {
    	jStart = i;
 		} else if (opt_start) {
        if (i==iStart) {
        	jStart = opt_start.file;
        } else {
          jStart = 0;
        }
    }
  	for (var j=jStart; j<size; j++) {
    	if (!b[i][j]) {
        b[i][j] = PIECES[pieceIndex];
        // If the next piece is the same, we can discard symmetries.
      	placePiece(b, pieceIndex+1, PIECES[pieceIndex] == PIECES[pieceIndex+1] ? {'rank': i, 'file': j+1} : null);
        b[i][j] = 0;
      }
    }
  }
}

var t0 = performance.now();

placePiece(board, 0);
out("Positions considered = " + positions);
out("Positions found = " + positionsFound);
out("Prune depth 3  = " + pruneDepth3);
out("Prune depth 2  = " + pruneDepth2);
out("Prune depth 1  = " + pruneDepth1);
var t1 = performance.now();
out("Calculations took " + (t1 - t0) + " milliseconds.");
