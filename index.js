// -----------------------------------------------------------------------------
// | CLASSES                                                                   |
// -----------------------------------------------------------------------------
/**
 * Wrapper class for a list, containing methods for functional programming.
 * 
 * @param {list} list - the underlying list.
 */
function Iterator(list) {
  this.list = list;
}


Iterator.prototype = {
  /**
   * Filters elements that satisfy a requirement.
   * 
   * @param {function} func - A function that takes an element as a parameter,
   *                          returning true if this element should be included
   *                          in the filtered list.
   * @returns {Iterator}    - An `Iterator` containing the filtered list.
   */
  filter: function(func) {
    var filteredList = [];
    
    for (var i = 0; i < this.list.length; i++) {
      if (func(this.list[i])) {
        appendItem(filteredList, this.list[i]);
      }
    }
    
    return toIter(filteredList);
  },
  
  
  /**
   * Calls a function on each element, returning a resulting `Iterator`.
   * 
   * @param {function} func - A function to be called with each element.
   * @returns {Iterator}    - An `Iterator` object whose elements are the
   *                          return values of calling `func` with each
   *                          elements of the current `Iterator`.
   */
  map: function(func) {
    var mappedList = [];
    
    for (var i = 0; i < this.list.length; i++) {
      appendItem(mappedList, func(this.list[i]));
    }
    
    return toIter(mappedList);
  },
  
  
  /**
   * Calls a function on each element.
   * 
   * @param {function} func - A function to be called with each element.
   */
  each: function(func) {
    for (var i = 0; i < this.list.length; i++)  {
      func(this.list[i]);
    }
  },
  
  /**
   * Returns whether all elements satisfy a requirement.
   * 
   * @param {function} func - A function that takes an element as a parameter,
   *                          returning true when an element satisfies a
   *                          condition.
   * @returns {boolean}     - Whether all the function calls evaluate to true.
   */
  all: function(func) {
    for (var i = 0; i < this.list.length; i++) {
      if (!func(this.list[i])) {
        return false;
      }
    }
    
    return true;
  },
  

  /**
   * Returns whether any of the elements satisfy a requirement.
   * 
   * @param {function} func - A function that takes an element as a parameter,
   *                          returning true when an element satisfies a
   *                          condition.
   * @returns {boolean}     - Whether any of the function calls evaluate to
   *                          true.
   */
  any: function(func) {
    for (var i = 0; i < this.list.length; i++) {
      if (func(this.list[i])) {
        return true;
      }
    }
    
    return false;
  },
};


/**
 * A 2-dimension vector.
 * 
 * @param {number} x - the x-component.
 * @param {number} y - the y-component.
 */
function Vec2(x, y) {
  this.x = x;
  this.y = y;
}


Vec2.prototype = {
  /**
   * Returns a copy of this vector.
   * 
   * @returns - a deep copy of the current `Vec2`.
   */
  clone: function() {
    return new Vec2(this.x, this.y);
  },
  
  
  /**
   * Checks if two vectors are equal.
   * 
   * @param {Vec2} other - the `Vec2` to compare to.
   * @returns {boolean}  - whether the two `Vec2`s are equal.
   */
  equals: function(other) {
    return this.x == other.x && this.y == other.y;
  },
  

  /**
   * Adds two vectors.
   * 
   * @param {Vec2} other - the `Vec2` to add to.
   * @returns {Vec2}     - the sum of the two `Vec2`s.
   */
  add: function(other) {
    return new Vec2(
      this.x + other.x,
      this.y + other.y
    );
  },
  
  
  /**
   * Subtracts two vectors.
   * 
   * @param {Vec2} other - the subtrahend `Vec2`.
   * @returns {Vec2}     - the difference of the two `Vec2`s.
   */
  subtract: function(other) {
    return new Vec2(
      this.x - other.x,
      this.y - other.y
    );
  },
  
  
  /**
   * Negates the vector.
   * 
   * @returns {Vec2} - the result of the negation.
   */
  negate: function() {
    return new Vec2(
      -this.x,
      -this.y
    );
  },
  
  
  /**
   * Rotates the vector by 90 degrees clockwise.
   * 
   * @returns {Vec2} - the result of the rotation.
   */
  clockwise: function() {
    return new Vec2(
      this.y,
      -this.x
    );
  },
  
  
  /**
   * Checks if two vectors are adjacent orthogonally or diagonally.
   * 
   * @param {Vec2} other - the second `Vec2` to check for adjacency with.
   * @returns {Vec2}     - whether the two `Vec2`s are adjacent.
   */
  adjacentTo: function(other) {
    var delta = this.subtract(other);
    
    return (
      -1 <= delta.x && delta.x <= 1
    ) && (
      -1 <= delta.y && delta.y <= 1
    );
  },
  
  
  /**
   * Returns the neighbors of this position in the given directions.
   * 
   * @param {list|Iterators} directions - the directions to get neighbors in.
   * @returns {Iterator}                - an `Iterator` of neighbors in the
   *                                      given directions.
   */
  inDirs: function(directions) {
    var source = this;
    
    if (directions instanceof Iterator) {
      return directions.map(function(dir) {
        return source.add(dir);
      });
    } else {
      return toIter(directions).map(function(dir) {
        return source.add(dir);
      });
    }
  },
  
  
  /**
   * Returns all neighbors of this positions that are inside the game field.
   * 
   * @returns {Iterator} - an `Iterator` of neighbors.
   */
  neighbors: function() {
    return this.inDirs(ALL_DIRS).filter(not(isOutsideField));
  },
};


/**
 * Represents an opened cell.
 */
function Open() {}


/**
 * Represents an unopened cell.
 */
function Close() {
  this.flagged = false;
}


/**
 * Represents a mine cell.
 * 
 * @param {number} id - the group id of this mine.
 */
function Mine(id) {
  this.id = id;
  this.flagged = false;
}


// -----------------------------------------------------------------------------
// | CONSTANTS                                                                 |
// -----------------------------------------------------------------------------
var CANVAS_SIZE = 320;


var NORTH = new Vec2(0, -1);
var NORTHEAST = new Vec2(1, -1);
var EAST = new Vec2(1, 0);
var SOUTHEAST = new Vec2(1, 1);
var SOUTH = new Vec2(0, 1);
var SOUTHWEST = new Vec2(-1, 1);
var WEST = new Vec2(-1, 0);
var NORTHWEST = new Vec2(-1, -1);


var ALL_DIRS = toIter([
  NORTH,
  NORTHEAST,
  EAST,
  SOUTHEAST,
  SOUTH,
  SOUTHWEST,
  WEST,
  NORTHWEST
]);


var ORTHO_DIRS = toIter([
  NORTH,
  EAST,
  SOUTH,
  WEST,
]);


// -----------------------------------------------------------------------------
// | GAME VARIABLES                                                            |
// -----------------------------------------------------------------------------
// Customizable gameplay variables
var dimension = 8;
var totalMines = 8;

// Sizes for displaying
var cellSize = CANVAS_SIZE / dimension;
var margin = cellSize * 0.15;
var imageSize = cellSize - 2 * margin;


var grid = [];


// Mine generation
var minables = [];
var currentId = 1;


// -----------------------------------------------------------------------------
// | UTILITY FUNCTIONS                                                         |
// -----------------------------------------------------------------------------
/**
 * Wraps a list in an `Iterator`.
 * 
 * @param {list} list  - the underlying list for the `Iterator`.
 * @returns {Iterator} - the resulting `Iterator`.
 */
function toIter(list) {
  return new Iterator(list);
}


/**
 * Negates the result of a boolean-returning function.
 * 
 * Returns a function that when called with an argument `arg`, returns the
 * equivalent of `!func(arg)`.
 * 
 * @param {function} func - A function that takes one argument and returns a
 *                          a boolean.
 * @returns {function}    - a function that returns the negated result of
 *                          calling `func`.
 */
function not(func) {
  return function(arg) {
    return !func(arg);
  };
}


// -----------------------------------------------------------------------------
// | GAME FUNCTIONS                                                            |
// -----------------------------------------------------------------------------
/**
 * Returns a random position from the `minables` list.
 * 
 * @throws         - throws an error if there are no minable spaces left.
 * @returns {Vec2} - a random minable position.
 */
function randomMinablePos() {
  if (minables.length == 0) {
    throw new Error("No minable spaces left!");
  }
  
  var index = randomNumber(0, minables.length - 1);
  var pos = minables[index];
  
  removeItem(minables, index);
  return pos;
}


/**
 * Checks if a position is outside the game field.
 * 
 * @param {Vec2} pos  - the position to check.
 * @returns {boolean} - whether the position is outside the game field.
 */
function isOutsideField(pos) {
  return (
    pos.x < 0 || dimension <= pos.x
    || pos.y < 0 || dimension <= pos.y
  );
}


/**
 * Checks if there is a mine at the given position.
 * 
 * @param {Vec2} pos  - the position to check.
 * @returns {boolean} - whether there is a mine at the given position.
 */
function isMine(pos) {
  return getState(pos) instanceof Mine;
}


/**
 * Checks if the given position is inside the field and not a mine.
 * 
 * @param {Vec2} pos  - the position to check.
 * @returns {boolean} - whether the given position is inside the field and not a
 *                      mine.
 */
function isEmpty(pos) {
  return !isOutsideField(pos) && (getState(pos) instanceof Close);
}


/**
 * Gets the cell state at the given position.
 * 
 * @param {Vec2} pos          - the position to get the cell state of.
 * @returns {Close|Open|Mine} - the cell state.
 */
function getState(pos) {
  return grid[pos.x + pos.y * dimension];
}


/**
 * Sets the cell state at the given position.
 * 
 * @param {Vec2} pos                 - the position to set the cell state of.
 * @param {Close|Open|Mine} newState - the new state at the position.
 */
function setState(pos, newState) {
  grid[pos.x + pos.y * dimension] = newState;
}

/**
 * Get the group id of an unempty position.
 * 
 * @param {Vec2} pos - the position to get the group id of.
 * @returns number   - the group id at that position.
 */
function getId(pos) {
  if (isOutsideField(pos)) {
    return 0;
  } else {
    return getState(pos).id;
  }
}


/**
 * Returns a function that checks whether a position has a specified group id.
 * 
 * @param {number} id  - the group id to check with.
 * @returns {function} - a function that takes in a position and returns whether
 *                       it has a group id of `id`.
 */
function hasId(id) {
  return function(pos) {
    return !isEmpty(pos) && getId(pos) == id;
  };
}


/**
 * Returns the common group id of two neighbors.
 * 
 * @param {Vec2} pos  - the source position.
 * @param {Vec2} dir1 - the direction of the first neighbor.
 * @param {Vec2} dir2 - the direction of the second neighbor.
 * @returns {number}  - the common id of the two neighbors. If the two neighbors
 *                      are empty or they have different group ids, null is
 *                      returned.
 */
function getCommonIdInDirs(pos, dir1, dir2) {
  var neighbor1 = pos.add(dir1);
  var neighbor2 = pos.add(dir2);
  
  if (
    !isEmpty(neighbor1)
    && !isEmpty(neighbor2)
    && getId(neighbor1) == getId(neighbor2)
  ) {
    return getId(neighbor1);
  } else {
    return null;
  }
}


/**
 * Returns whether a position is surrounded by mines.
 * 
 * @param {Vec2} pos  - the position to check.
 * @returns {boolean} - whether the position is surrounded by mines.
 */
function isSurrounded(pos) {
  return pos.neighbors().all(isMine);
}


/**
 * Returns whether creating a mine will create an empty island.
 * 
 * @param {Vec2} pos  - the position to check whether placing a mine there will
 *                      create an empty island.
 * @returns {boolean} - whether an empty island will be created.
 */
function willCreateIsland(pos) {
  var id;
  
  id = getCommonIdInDirs(pos, NORTH, SOUTH);
  if (id != null) {
    if (
      pos.inDirs([WEST, NORTHWEST, SOUTHWEST])
         .all(hasId(id))
    ) {
      if (hasId(id)(pos.add(EAST))) {
        return !pos.inDirs([SOUTHEAST, NORTHEAST])
                   .any(hasId(id));
      } else {
        return false;
      }
    } else if (
      pos.inDirs([EAST, NORTHEAST, SOUTHEAST])
         .all(hasId(id))
    ) {
      if (hasId(id)(pos.add(WEST))) {
        return pos.inDirs([SOUTHWEST, NORTHWEST])
                   .any(hasId(id));
      } else {
        return false;
      }
    } else {
      return true;
    }
  }
  
  id = getCommonIdInDirs(pos, WEST, EAST);
  if (id != null) {
    if (
      pos.inDirs([NORTH, NORTHWEST, NORTHEAST])
         .all(hasId(id))
    ) {
      if (hasId(id)(pos.add(SOUTH))) {
        return !pos.inDirs([SOUTHWEST, SOUTHEAST])
                   .any(hasId(id));
      } else {
        return false;
      }
    } else if (
      pos.inDirs([SOUTH, SOUTHWEST, SOUTHEAST])
         .all(hasId(id))
    ) {
      if (hasId(id)(pos.add(NORTH))) {
        return pos.inDirs([NORTHWEST, NORTHEAST])
                   .any(hasId(id));
      } else {
        return false;
      }
    } else {
      return true;
    }
  }
  
  
  
  return ORTHO_DIRS.any(function(dir) {
    var clockwiseDir = dir.clockwise();
    
    id = getCommonIdInDirs(pos, dir, clockwiseDir);
    return id != null && hasId(id)(pos.add(dir).add(clockwiseDir));
  });
}


/**
 * Propagates an id change through a group.
 * 
 * @param {Vec2} pos           - the pos to start updating.
 * @param {number} newId       - the new group id to set to.
 * @param {Vec2} fromDirection - the direction pointing to the previous position
 *                               where the id change was propagated from.
 */
function updateId(pos, newId, fromDirection) {
  if (!isOutsideField(pos) && getId(pos) != newId) {
    getState(pos).id = newId;
    
    var mineDirs = ORTHO_DIRS.filter(function(dir) {
      return isMine(pos.add(dir));
    });
    
    mineDirs.each(function(dir) {
      if (!dir.equals(fromDirection)) {
        updateId(pos.add(dir), newId, dir.negate());
      }
    });
  }
}


/**
 * Generates a mine.
 */
function generateMine() {
  var pos = randomMinablePos();
  setState(pos, new Mine(null));
  
  while (
    isSurrounded(pos)
    || pos.neighbors().any(isSurrounded)
    || willCreateIsland(pos)
  ) {
    setState(pos, new Close());
    pos = randomMinablePos();
    setState(pos, new Mine(null));
  }
  
  var mineDirs = ORTHO_DIRS.filter(function(dir) {
    return !isEmpty(pos.add(dir));
  });
  
  if (mineDirs.list.length > 0) {
    var id = currentId;
    
    mineDirs.each(function(dir) {
      var neighborId = getId(pos.add(dir));
      if (neighborId != null) {
        id = Math.min(id, neighborId);
      }
    });
    
    getState(pos).id = id;
    
    mineDirs.each(function(dir) {
      updateId(pos.add(dir), id, dir.negate());
    });
    
    currentId++;
  }
}


setActiveCanvas("gameCanvas");
setStrokeColor(rgb(0, 0, 0, 0));
setFillColor("#cccccc");
rect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
setStrokeColor(rgb(255, 255, 255));


function drawBlankGrid() {
  for (var offset = 0; offset <= CANVAS_SIZE; offset += cellSize) {
    line(offset, 0,      offset,      CANVAS_SIZE);
    line(0,      offset, CANVAS_SIZE, offset);
  }
}


drawBlankGrid();
