
// Cursor
set_cursor(graphics => {
    // Color black
    graphics.strokeStyle = 'white';
    graphics.fillStyle = 'black';

    // graphics.lineJoin = 'round';
    graphics.lineWidth = 1;
    graphics.beginPath();
    //Base (left)
    graphics.moveTo(0, 0);
    graphics.lineTo(0, 14);
    //Handle (left)
    graphics.lineTo(3, 10);
    //Handle base (l/r)
    graphics.lineTo(5, 15);
    graphics.lineTo(8, 14);
    //Handle (right)
    graphics.lineTo(6, 9);
    //Base (right)
    graphics.lineTo(11, 10);
    graphics.lineTo(0, 0);

    graphics.fill();
    graphics.stroke();
});

// Background
set_background((canvas, graphics) => {
    graphics.fillStyle = "#CC77FF";
    graphics.fillRect(0, 0, canvas.width, canvas.height);

    graphics.fillStyle = "black";
    graphics.strokeStyle = "gray";
    graphics.lineWidth = 6;
    
    // First line
    graphics.beginPath();
    graphics.lineTo(-20, 0);
    graphics.lineTo(canvas.width, canvas.height + 20);
    graphics.lineTo(canvas.width + 20, canvas.height);
    graphics.lineTo(0, -20);
    graphics.fill();
    graphics.stroke();

    // Second line
    graphics.beginPath();
    graphics.lineTo(canvas.width + 20, 0);
    graphics.lineTo(20, canvas.height);
    graphics.lineTo(-20, canvas.height);
    graphics.lineTo(canvas.width, -20);
    graphics.fill();
    graphics.stroke();

    // Center circle
    graphics.lineWidth = 16;
    graphics.fillStyle = "black";
    graphics.strokeStyle = "white";
    graphics.beginPath();
    graphics.arc(canvas.width / 2, canvas.height / 2, 150, 0, 360);
    graphics.fill();
    graphics.stroke();


    let gradient = graphics.createRadialGradient(canvas.width / 2, canvas.height / 2, 100, canvas.width / 2, canvas.height / 2, 60);
    gradient.addColorStop("0", "black");
    gradient.addColorStop("1", "white");

    graphics.beginPath();
    graphics.fillStyle = gradient;
    graphics.arc(canvas.width / 2, canvas.height / 2, 100, 0, 360);
    graphics.fill();  

    // Graphite text
    graphics.fillStyle = "white";
    graphics.font = "40px Sans";
    graphics.fillText("Graphite", 10, 50);
});