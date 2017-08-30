this.addSingleLine = function(lolaS, lolaE, color) {
    var color = color !== undefined ? color : 0xffffff;
    if (lolaS instanceof PlanetLoLa && lolaE instanceof PlanetLoLa) {
        addLine(lolaS, lolaE, color, true);
    }
};