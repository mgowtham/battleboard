import Component from '@ember/component'
import { computed, get, set, getProperties } from '@ember/object'

let ships = [{ size: 4 }, { size: 3 }, { size: 2 }, { size: 2 }, { size: 3 }, { size: 3 }];
const HORIZONTAL_COUNT = 3;
const VERTICAL_COUNT = 3;
const ROW = 10;
const COLUMN = 10;
export default Component.extend({
  row: ROW,
  column: COLUMN,
  ships: ships,
  classNames: ['app-container'],
  horizontalShips: computed.filter('ships', (ship) => get(ship, 'isHorizontal')),
  verticalShips: computed.filter('ships', (ship) => !get(ship, 'isHorizontal')),

  init() {
    this._super(...arguments);
    this.placeShips();
  },

  actions: {
    showCellStatus(cell) {
      if (!get(this, 'viewMode')) {
        if (get(cell, 'hasShip')) {
          set(cell, 'showShip', true);
        } else {
          set(cell, 'showEmptyCell', true);
        }
      }
    },
    shuffleBoard() {
      this.placeShips();
    }
  },

  resetCells() {
    let cells = [];
    for (let i = 0; i < ROW; i++) {
      let column = [];
      for (let j = 0; j < COLUMN; j++) {
        let cell = { hasShip: false };
        column.push(cell);
      }
      cells.push(column);
    }
    this.set('cells', cells);
  },

  randomNumber(start, end) {
    let diff = end - start;
    let decNumber = (Math.random() * diff) + start;
    return Math.floor(decNumber);
  },

  setShipProperties() {
    let horizontalCount = 0, verticalCount = 0;
    let ships = get(this, 'ships');
    ships.forEach(ship => {
      if (horizontalCount === HORIZONTAL_COUNT) {
        set(ship, 'isHorizontal', false);
      } else if (verticalCount === VERTICAL_COUNT) {
        set(ship, 'isHorizontal', true);
      } else {
        let isHorizontal = this.randomNumber(0, 2);
        isHorizontal ? ++horizontalCount : ++verticalCount;
        set(ship, 'isHorizontal', Boolean(isHorizontal));
      }
    });
  },

  isHorizontalRangeOccupied(cells, row, colStart, colEnd) {
    for (let i = colStart; i <= colEnd; i++) {
      if (cells[row][i].hasShip || cells[row][i].isShipNeighbour) {
        return true;
      }
    }
    return false;
  },

  isVerticalRangeOccupied(cells, col, rowStart, rowEnd) {
    for (let i = rowStart; i <= rowEnd; i++) {
      if (cells[i][col].hasShip || cells[i][col].isShipNeighbour) {
        return true;
      }
    }
    return false;
  },


  markHorizontalRangeOccupied(cells, row, colStart, colEnd) {
    for (let i = colStart; i <= colEnd; i++) {
      cells[row][i].hasShip = true
      if (row !== 0) {
        cells[row - 1][i].isShipNeighbour = true
      }
      if (row + 1 !== ROW) {
        cells[row + 1][i].isShipNeighbour = true
      }
    }
    if (colStart !== 0) {
      for (let i = -1; i <= 1; i++) {
        if (cells[row + i] && cells[row + i][colStart - 1]) {
          cells[row + i][colStart - 1].isShipNeighbour = true;
        }
      }
    }

    if (colEnd + 1 !== COLUMN) {
      for (let i = -1; i <= 1; i++) {
        if (cells[row + i] && cells[row + i][colEnd + 1]) {
          cells[row + i][colEnd + 1].isShipNeighbour = true;
        }
      }
    }
  },

  markVerticalRangeOccupied(cells, col, rowStart, rowEnd) {
    for (let i = rowStart; i <= rowEnd; i++) {
      cells[i][col].hasShip = true
      if (col !== 0) {
        cells[i][col - 1].isShipNeighbour = true
      }
      if (col + 1 !== COLUMN) {
        cells[i][col + 1].isShipNeighbour = true
      }
    }
    if (rowStart !== 0) {
      for (let i = -1; i <= 1; i++) {
        if (cells[rowStart - 1][col + i]) {
          cells[rowStart - 1][col + i].isShipNeighbour = true;
        }
      }
    }
    if (cells[rowEnd + 1]) {
      for (let i = -1; i <= 1; i++) {
        if (cells[rowEnd + 1][col + i]) {
          cells[rowEnd + 1][col + i].isShipNeighbour = true;
        }
      }
    }

  },

  placeShipRandomly(cells, ships, shipCount, fixedCapcity, variableCapacity, isOccupied, markRange) {
    let shipsAdded = 0;
    while (shipsAdded !== shipCount) {
      let ship = ships[shipsAdded];
      let fixedStart = 0, fixedEnd = fixedCapcity;
      let fixedPos = this.randomNumber(fixedStart, fixedEnd);
      let variableStart = 0, variableEnd = variableCapacity - ship.size;
      let variablePos = this.randomNumber(variableStart, variableEnd);
      
      if (!isOccupied(cells, fixedPos, variablePos, variablePos + ship.size - 1)) {
        markRange(cells, fixedPos, variablePos, variablePos + ship.size - 1);
        set(ship, 'fixedPos', fixedPos);
        set(ship, 'variablePos', variablePos);
        ++shipsAdded;
      }
    }
  },

  placeShips() {
    this.resetCells();
    let cells = get(this, 'cells');
    this.setShipProperties();
    let { horizontalShips, verticalShips } = getProperties(this, 'horizontalShips', 'verticalShips');
    this.placeShipRandomly(cells, horizontalShips, HORIZONTAL_COUNT, ROW, COLUMN, this.isHorizontalRangeOccupied, this.markHorizontalRangeOccupied)
    this.placeShipRandomly(cells, verticalShips, VERTICAL_COUNT, COLUMN, ROW, this.isVerticalRangeOccupied, this.markVerticalRangeOccupied)
  }

});