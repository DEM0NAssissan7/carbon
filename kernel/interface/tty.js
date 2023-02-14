class TTY {
  constructor() {

    this.prompt = "[jsterm]$ ";
    this.textArray = [];
    this.promptArray = [];
    this.textLine = 0;
    this.textBuffer = [];
    this.keys = get_devices().keyboard.keys;
    this.keyPressed = false;
    this.textOrder = 0;
    this.root = false;
    this.kernel_key = null;
  }
  update() {
    //Commandline functions
    var self = this;
    function clr() {
      self.textArray = [];
    }
    function printout(obj) {
      if (obj[0]) {
        for (var i in obj) {
          self.textArray.push(obj[i]);
        }
      } else {
        self.textArray.push(obj);
      }
    }
    function su() {
      self.kernel_key = get_kernel_key();
      self.root = true;
      self.prompt = "[kernel]# ";
    }
    let devices = get_devices();
    if (devices.keyboard.keyCodes[13] && !this.keyPressed) {
      this.textArray.push(this.textBuffer);
      this.promptArray[this.textArray.length - 1] = this.prompt;
      let parse_text = string => {
        let string_buffer = "";
        let delimiter = "\n";
        if(string[0] === "{" || string[0] === "[")
          delimiter = ",";
        for (let i = 0; i < string.length; i++) {
          let character = string[i];
          if (character !== delimiter) {
            string_buffer += character;
          }
          if(character === delimiter || i === string.length - 1){
            this.textArray.push(string_buffer)
            string_buffer = "";
          }
        }
      }
      if (this.textBuffer) {
        let stringToCommand, stringToCommandToString;
        try {
          if (this.root !== true){
            stringToCommand = eval(this.textBuffer);
          } else {
            if (this.textBuffer === "clr()")
              self.textArray = [];
            else
              stringToCommand = run_as_root(this.textBuffer, this.kernel_key);
          }
          if (stringToCommand !== undefined){
            if(typeof stringToCommand === "object")
             stringToCommandToString = JSON.stringify(stringToCommand);
            else
              stringToCommandToString = stringToCommand.toString();
            parse_text(stringToCommandToString);
          }
        } catch (e) {
          this.textArray.push(e);
          parse_text(e);
          stringToCommandToString = e;
        }
      }
      this.textBuffer = "";
      this.keyPressed = true;
      return;
    } else {
      if (devices.keyboard.keyCodes[8] && !this.keyPressed) {
        if (this.textBuffer.length > 0) {
          this.textBuffer = this.textBuffer.slice(0, -1);
        }
        this.keyPressed = true;
      }
      if (devices.keyboard.keyCodes[38] && !this.keyPressed && this.textArray[this.textArray.length - (this.textOrder + 1)] !== undefined) {
        this.textOrder++;
        this.textBuffer = this.textArray[this.textArray.length - this.textOrder];
        this.keyPressed = true;
      }
      if (devices.keyboard.keyCodes[40] && !this.keyPressed && this.textArray[this.textArray.length - (this.textOrder - 1)] !== undefined) {
        this.textOrder--;
        this.textBuffer = this.textArray[this.textArray.length - this.textOrder];
        if (this.textBuffer === undefined) {
          this.textOrder = 0;
        }
        this.keyPressed = true;
      }
      if (devices.keyboard.info.keyCode !== 40 && !this.keyPressed) {
        if (devices.keyboard.info.keyCode !== 38) {
          this.textOrder = 0;
        }
      }
      if (!devices.keyboard.info.keyIsPressed) {
        this.keyPressed = false;
      }
      for (let i in devices.keyboard.keys) {
        if (this.keys[i] !== devices.keyboard.keys[i]) {
          this.keys[i] = devices.keyboard.keys[i];
          let key = this.keys[i];
          if (key !== "Enter" && key !== "Backspace" && key !== "ArrowUp" && key !== "ArrowDown" && key !== "Alt" && key !== "Shift" && key !== "Tab" && key !== "Control") {
            this.textBuffer += key;
          }
        }
      }
    }
  }
  draw(canvas, graphics) {
    graphics.font = '12px Monospace';
    try {
      if (stress) {
        graphics.fillStyle = 'black';
        graphics.fillRect(0, 0, canvas.width, canvas.height);
        graphics.fillStyle = 'white';
      }
    } catch (e) {
      setBackground(canvas, graphics);
      graphics.fillStyle = colorScheme.textColor;
    }
    for (var i = 0; i < this.textArray.length; i++) {
      let currentPrompt = this.promptArray[i];
      if (currentPrompt === undefined)
        currentPrompt = "";
      graphics.fillText(currentPrompt + this.textArray[i], 2, i * 12 + 12);
    }
    graphics.fillText(this.prompt + this.textBuffer, 2, this.textArray.length * 12 + 12);
    sleep(60);
  }
  create_window() {
    var tty = new TTY();

    let terminal = function(canvas, graphics){
      tty.draw(canvas, graphics);
      call_draw();
      tty.update();
    }
    create_window([
      spawn_process(terminal)
    ], "Terminal");
  }
  iconFunction(canvas, graphics) {
    graphics.fillStyle = 'black';
    graphics.fillRect(0, 0, canvas.width, canvas.height, 10);
    graphics.fillStyle = 'white';
    graphics.font = ((canvas.width + canvas.height) / 4) + "px Monospace";
    graphics.fillText(">_", 5, canvas.height / 2);
  }
}
try {
  if (stress) {
    console.log("Starting TTY standalone");
    var tty = new TTY();
    let terminal = function(){
      tty.draw(canvas, graphics);
      tty.update();
    }
    create_init(terminal);
  }
} catch (error) { }