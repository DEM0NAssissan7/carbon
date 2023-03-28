{
    let dark_mode = false;
    let color_scheme = {
        background: "white",
        text: "black",
        accent: "#6666FF",
        element: "#CCCCCC"
    }
    function get_color_scheme() {
        return color_scheme;
    }
    function color_background(graphics) {
        graphics.fillStyle = color_scheme.background;
        graphics.fillRect(0, 0, graphics.canvas.width, graphics.canvas.height);
    }
    function get_theme() {
        return {
            dark_mode: dark_mode
        }
    }
}