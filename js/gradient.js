const Gradient = function(stops) {
    this.sample = at => {
        let lastIndex = 0;

        while (stops[lastIndex].at <= Math.min(0.9999, at))
            ++lastIndex;

        const first = stops[lastIndex - 1];
        const last = stops[lastIndex];
        const factor = (at - first.at) / (last.at - first.at);

        return new Color(
            first.color.r * (1 - factor) + last.color.r * factor,
            first.color.g * (1 - factor) + last.color.g * factor,
            first.color.b * (1 - factor) + last.color.b * factor,
            first.color.a * (1 - factor) + last.color.a * factor);
    };
};

Gradient.Stop = function(at, color) {
    this.at = at;
    this.color = color;
};