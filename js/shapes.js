const Shapes = function(size, height) {
    const sizeCells = Math.ceil(size * Shapes.CELL_SIZE_INVERSE);
    const sizeCellsSquared = sizeCells * sizeCells;
    const heightCells = Math.ceil(height * Shapes.CELL_SIZE_INVERSE);
    const cells = new Array(sizeCellsSquared * heightCells);

    for (let i = 0; i < cells.length; ++i)
        cells[i] = [];

    this.cropBounds = bounds => {
        if (bounds.start.x < 0)
            bounds.start.x = 0;

        if (bounds.start.y < 0)
            bounds.start.y = 0;

        if (bounds.start.z < 0)
            bounds.start.z = 0;

        if (bounds.end.x > size)
            bounds.end.x = size;

        if (bounds.end.y > size)
            bounds.end.y = size;

        if (bounds.end.z > height)
            bounds.end.z = height;
    };

    this.clear = bounds => {
        const shapes = [];

        for (let z = Math.floor(bounds.start.z * Shapes.CELL_SIZE_INVERSE);
             z < Math.ceil(bounds.end.z * Shapes.CELL_SIZE_INVERSE);
             ++z)
            for (let y = Math.floor(bounds.start.y * Shapes.CELL_SIZE_INVERSE);
                 y < Math.ceil(bounds.end.y * Shapes.CELL_SIZE_INVERSE);
                 ++y)
                for (let x = Math.floor(bounds.start.x * Shapes.CELL_SIZE_INVERSE);
                     x < Math.ceil(bounds.end.x * Shapes.CELL_SIZE_INVERSE);
                     ++x)
                    for (const shape of cells[z * sizeCellsSquared + y * sizeCells + x])
                        if (shapes.indexOf(shape) === -1 && shape.bounds.overlaps(bounds))
                            shapes.push(shape);

        for (const shape of shapes) {
            for (let z = Math.floor(shape.bounds.start.z * Shapes.CELL_SIZE_INVERSE);
                 z < Math.ceil(shape.bounds.end.z * Shapes.CELL_SIZE_INVERSE);
                 ++z) {
                for (let y = Math.floor(shape.bounds.start.y * Shapes.CELL_SIZE_INVERSE);
                     y < Math.ceil(shape.bounds.end.y * Shapes.CELL_SIZE_INVERSE);
                     ++y) {
                    for (let x = Math.floor(shape.bounds.start.x * Shapes.CELL_SIZE_INVERSE);
                         x < Math.ceil(shape.bounds.end.x * Shapes.CELL_SIZE_INVERSE);
                         ++x) {
                        const cell = cells[z * sizeCellsSquared + y * sizeCells + x];

                        for (let i = cell.length; i-- > 0;)
                            if (shapes.indexOf(cell[i]) !== -1)
                                cell.splice(i, 1);
                    }
                }
            }
        }
    };

    this.add = shape => {
        this.cropBounds(shape.bounds);

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

Shapes.CELL_SIZE = 24;
Shapes.CELL_SIZE_INVERSE = 1 / Shapes.CELL_SIZE;