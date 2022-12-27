class FileHandler{
    constructor(file){
        this.file = file;
    }
    update(canvas, graphics){
        setBackground(canvas, graphics);
        if(this.file.type === "text"){
            let parsed_text = [];
            let parse_text = string => {
                let string_buffer = "";
                let delimiter = "\n";
                for (let i = 0; i < string.length; i++) {
                  let character = string[i];
                  if (character !== delimiter)
                    string_buffer += character;
                  if(character === delimiter || i === string.length - 1){
                    parsed_text.push(string_buffer)
                    string_buffer = "";
                  }
                }
            }
            parse_text(this.file.data);
            graphics.fillStyle = colorScheme.textColor;
            for(let i = 0; i < parsed_text.length; i++)
                graphics.fillText(parsed_text[i], 5, i * 12 + 12, canvas.width);
            exit();
        }
    }
}
let spawn_file_handler = function(file){
    let handler = new FileHandler(file);
    let file_handler = (canvas, graphics) => {handler.update(canvas, graphics);};
    create_child_window([spawn_process(file_handler)], file.name + " [" + file.type + "]");
}
class FileBrowser{
    constructor(){
        this.files_buffer = [];
        this.icon_spacing = 15;
        this.icon_size = 32;
    }
    update_files(){
        this.files_buffer = get_files();
        sleep(5000);
    }
    update(canvas, graphics){
        setBackground(canvas, graphics);
        for(let i = 0; i < this.files_buffer.length; i++){
            let file = this.files_buffer[i];

            let raw_icon_x = i * (this.icon_size + this.icon_spacing) + this.icon_spacing;
            let icon_x = raw_icon_x % canvas.width;
            let icon_y = ((raw_icon_x + this.icon_size + this.icon_spacing) / canvas.width) * (this.icon_size + this.icon_spacing);
            //File Icon
            if(file.type === "text"){
                graphics.fillStyle = "gray"
                Button(graphics, icon_x, icon_y, this.icon_size / 1.5, this.icon_size, () => {spawn_file_handler(file);});
                // graphics.fillRect(icon_x, icon_y, this.icon_size / 1.5, this.icon_size);
            }
            graphics.fillStyle = colorScheme.textColor;
            graphics.fillText(file.name, icon_x, icon_y + this.icon_size + 13);
        }
        sleep(100);
    }
    iconFunction(canvas, graphics){
        graphics.fillStyle = "gray";
        graphics.fillRect(0, 0, canvas.width, canvas.height);
        graphics.fillStyle = "blue";
        graphics.fillRect(20, 40, canvas.width - 40, canvas.height - 50);
    }
    create_window(){
        let fsb = new FileBrowser();
        let file_browser = (canvas, graphics) => {fsb.update(canvas, graphics);};
        let process = spawn_process(file_browser);
        process.thread(() => {fsb.update_files();})
        create_window([process], "File Browser");
    }
}