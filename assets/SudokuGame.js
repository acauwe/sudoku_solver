"use strict";

class SudokuGame {

    cells = [];
    board = [];

    constructor(rows, anchor) {
        this.anchor = anchor;
        this.board = rows;
        rows.forEach((row, rowNumber) => {
            row.forEach((number, columnNumber) => {
                this.cells.push(new Cell(number, rowNumber, columnNumber, this))
            })
        });
        this.backtrackIndex = 0;
    }

    goToNextBacktrackIndex() {
        while (this.backtrackIndex < this.cells.length && this.cells[this.backtrackIndex].solved) {
            this.backtrackIndex++;
        }
    }

    resetCell(cell) {
        cell.possibilityIndex = 0;
        cell.number = 0;
        this.board[cell.rowNumber][cell.columnNumber] = 0
        this.show()
    }

    decrement_cell(cell) {
        while (cell.possibilityIndex === cell.possibilities.length - 1) {
            this.resetCell(cell);

            // find the previous unsolved cell.
            this.backtrackIndex--;
            while (this.cells[this.backtrackIndex].solved) {
                this.backtrackIndex--;
            }
            cell = this.cells[this.backtrackIndex];
        }
        cell.possibilityIndex++;


    }

    async solve() {
        while (this.backtrackIndex < this.cells.length) {
            this.goToNextBacktrackIndex();
            let currentCell = this.cells[this.backtrackIndex];
            currentCell.fill_number();
            currentCell.incrementBacktrackIndex();
            if (currentCell.isValid()) {
                this.backtrackIndex++;
            } else {
                this.decrement_cell(currentCell)
            }
            if (document.getElementById('progress').checked) await this.sleep(1);
        }
    }

    getRow(n) {
        return this.board[n];
    }

    getColumn(n) {
        return this.board.map(row => {
            return row[n]
        })
    }

    getGrid(row, column) {
        let result = [];
        let rootCellRow = Math.floor(row / 3) * 3;
        let rootCellCol = Math.floor(column / 3) * 3;
        for (let row = rootCellRow; row < rootCellRow + 3; row++) {
            for (let col = rootCellCol; col < rootCellCol + 3; col++) {
                result.push(this.board[row][col]);
            }
        }
        return result;
    }

    getNumber(x, y) {
        return this.board[y][x]
    }

    async show() {
        let table = "<table><tbody>";
        table += "<tr>";
        this.cells.forEach((cell,index) => {
            table += `<td`;
            if (cell.solved){
                table += ' class="given"'
            }
            table += `>`;
            if (cell.number > 0){
                table += cell.number
            }
            table += `</td>`;
            if((index+1) % 9 === 0 ){
                table += '</tr><tr>'
            }
        });
        table += "</tbody></table>"
        this.anchor.innerHTML = table;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

}


class Cell {

    constructor(number, rowNumber, columnNumber, game) {
        this.number = number;
        this.rowNumber = rowNumber;
        this.columnNumber = columnNumber;
        this.solved = number > 0;
        if (!this.solved) {
            this.possibilities = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        } else {
            this.possibilities = [];
        }
        this.possibilityIndex = 0;
        this.game = game;
        if (!this.solved) {
            this.findPossibilities()
        }
    }

    fill_number() {
        if (!this.solved) {
            this.number = this.possibilities[this.possibilityIndex];
            this.game.board[this.rowNumber][this.columnNumber] = this.possibilities[this.possibilityIndex];
        }
        this.game.show();
    }

    findPossibilities() {
        let unavailable_options = this.findUnavailableOptions();
        this.possibilities = this.possibilities.filter(number => !unavailable_options.includes(number));
        if (this.possibilities.length === 1) {
            this.fill_number();
            this.solved = true;
        }
    }

    findUnavailableOptions() {
        return [...new Set([
            ...this.game.getRow(this.rowNumber),
            ...this.game.getColumn(this.columnNumber),
            ...this.game.getGrid(this.rowNumber, this.columnNumber)
        ])].filter(number => number !== 0);
    }

    isValid() {
        // findUnavailableOptions opnieuw uitvoeren met de voorlopig ingevulde velden...
        let currentNumber = this.possibilities[this.possibilityIndex];
        this.game.board[this.rowNumber][this.columnNumber] = 0;
        let unavailable = this.findUnavailableOptions();
        this.game.board[this.rowNumber][this.columnNumber] = currentNumber;
        return !unavailable.includes(currentNumber);
    }

    incrementBacktrackIndex() {
        while (!this.isValid() && this.possibilityIndex < this.possibilities.length - 1) {
            this.possibilityIndex++;
            this.fill_number()
        }
    }
}



