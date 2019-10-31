const StyleUtils = {
    getVariable: function(name) {
        return getComputedStyle(document.body).getPropertyValue(name);
    },

    getColor: function(name) {
        return Color.fromHex(
            StyleUtils.getVariable(name).toUpperCase().replace("#", "").replace(" ", ""));
    }
};