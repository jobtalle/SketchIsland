const Island = function(size) {
    this.update = timeStep => {

    };

    this.draw = (context, angle) => {
        context.save();
        context.scale(1, 0.5);
        context.rotate(angle);

        context.beginPath();
        context.moveTo(0, 0);
        context.arc(0, 0, 64, 0, Math.PI * 2);
        context.strokeStyle = "red";
        context.stroke();

        context.restore();
    };
};