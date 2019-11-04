const Shapes = function(size, height) {
    const sizeCells = Math.ceil(size * Shapes.CELL_SIZE_INVERSE);
    const sizeCellsSquared = sizeCells * sizeCells;
    const heightCells = Math.ceil(height * Shapes.CELL_SIZE_INVERSE);
    const cells = new Array(sizeCellsSquared * heightCells);

    for (let i = 0; i < cells.length; ++i)
        cells[i] = [];

    this.add = shape => {
        for (let z = Math.floor(shape.bounds.start.z * Shapes.CELL_SIZE_INVERSE);
             z < Math.ceil(shape.bounds.end.z * Shapes.CELL_SIZE_INVERSE);
             ++z) {
            for (let y = Math.floor(shape.bounds.start.y * Shapes.CELL_SIZE_INVERSE);
                 y < Math.ceil(shape.bounds.end.y * Shapes.CELL_SIZE_INVERSE);
                 ++y) {
                for (let x = Math.floor(shape.bounds.start.x * Shapes.CELL_SIZE_INVERSE);
                     x < Math.ceil(shape.bounds.end.x * Shapes.CELL_SIZE_INVERSE);
                     ++x) {
                    cells[z * sizeCellsSquared + y * sizeCells + x].push(shape);
                }
            }
        }
    };

    this.get = (x, y, z) => {
        return cells[
            Math.floor(z * Shapes.CELL_SIZE_INVERSE) * sizeCellsSquared +
            Math.floor(y * Shapes.CELL_SIZE_INVERSE) * sizeCells +
            Math.floor(x * Shapes.CELL_SIZE_INVERSE)];
    };
};

Shapes.CELL_SIZE = 8;
Shapes.CELL_SIZE_INVERSE = 1 / Shapes.CELL_SIZE;