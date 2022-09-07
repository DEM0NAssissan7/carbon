/* Graphite Virtual Machine
    RISC archetecture [based on the Evergreen Architecture]
    One byte = 8 bits
    Configurable architecture size, RAM size, and CPU count

    Bit Architecture: undecided
    Clock speed: Depends on your computer

Set specs as needed.
*/

{

    let convert_to_binary = function(number){
        return (number).toString(2);
    }
    let convert_to_decimal = function(number){
        return parseInt(number, 2);
    }
    let VMIDs = 0;

    class CarboniteVM{
        constructor(ram_size, arch, CPUs){
            //VM ID configuration
            this.id = VMIDs;
            //Size configurations
            this.arch = arch;
            this.ramsize = ram_size;
            this.cpus = CPUs;

            //Instructions
            this.instruction_set = [
                () => {}
            ]
            this.instruction_length = 4;
            this.instruction_command_length = this.arch + this.instruction_set;

            //Initialize data sets
            this.ram = [];
            this.regs = [];

            VMIDs++;
        }
        init(){
            let ram_string = "00000000";
            for(let i = 0; i < this.ramsize; i++){
                this.ram.push(ram_string);
            }


            console.log("VM initialized");
        }
        print_debug(){
            let result = {
                ram: this.ram
            }
            console.log(result);
        }
        instruct(instruction){

        }
        norm_instruct(instruction, argument){

        }
        load_program(program){
            /* Program Layout:
            - architecture: x
            - data: [i,i,i,i]
            */
        }
    }
    function createVM(ram_size, arch, CPUs){
        return new CarboniteVM(ram_size, arch, CPUs);
    }
}
let VM = new CarboniteVM(128, 8, 1);
VM.init();
VM.print_debug();