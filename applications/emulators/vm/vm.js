/* Graphite Virtual Machine
    RISC archetecture [based on the Evergreen Architecture]
    One byte = 8 bits
    Configurable architecture size, RAM size, and CPU count

    Bit Architecture: undecided
    Clock speed: Depends on your computer

Set specs as needed.
*/

{

    let convert_to_binary = function (number) {
        return (number).toString(2);
    }
    let convert_to_decimal = function (binary) {
        return parseInt(binary, 2);
    }
    let convert_from_hex = function (hex) {
        return parseInt(hex, 16);
    }
    let append_value = function (target, binary) {
        for (let i = 0; i < binary.length; i++) {
            target.push(binary[i]);
        }
    }
    let insdc = function(verb, binary){
        return {
            verb: verb,
            binary: binary
        }
    }
    let instruction_description_table = [
        insdc("lod", 0),
        insdc("str", 1),
        insdc("set", 2),
        insdc("add", 3),
        insdc("jdmp", 4),
        insdc("sub", 5),
        insdc("and", 6),
        insdc("brc", 7),
        insdc("hlt", 8),
        insdc("rld", 9),
        insdc("cbr", 10),
    ]
    let VMIDs = 0;

    class CarboniteVM {
        constructor(ram_size, arch, CPUs) {
            //VM ID configuration
            this.id = VMIDs;
            //Size configurations
            this.arch = arch;
            this.cpus = CPUs;

            this.instruction_length = 4 + this.arch;
            this.increment = Math.floor(this.instruction_length / 8) + 1;

            //Vectors
            this.reset_vector = 64;

            //Initialize data sets
            this.ram = new Uint8Array(ram_size);
            this.reg = 0;
            this.cache = [];
            this.program_counter = 0;
            this.halt = false;
            this.output = [];

            /* Instruction set:
                0: LOD (reg = m) [0000]
                1: STR (m = reg) [0001]
                2: SET (reg = arg) [0010]
                3: ADD (reg += op) [0011]
                4: DMP (dump register contents through console.log) [0100]
                5: SUB (reg = XOR(reg, m) ) [0101]
                6: AND (reg = AND(reg, m)) [0110]
                7: BRC (pc = m) [0111]
                8: HLT (stop the CPU from executing) [1000]
                9: RLD (m[m[arg]] = reg) [1001] (set the register to be the memory address referenced at the ram address specified)
                10: CBR (if->reg=0: pc = m) [1010]

            */
            this.instruction_set = [
                (arg) => {//LOD
                    this.reg = this.ram[arg];
                },
                (arg) => {//STR
                    this.ram[arg] = this.reg;
                },
                (arg) => {//SET
                    this.reg = arg;
                },
                (arg) => {//ADD
                    this.reg += arg;
                },
                () => {//DMP
                    console.log(this.reg);
                },
                (arg) => {//SUB
                    this.reg -= arg;
                },
                (arg) => {//AND
                    this.reg = (arg === this.reg);
                },
                (arg) => {//BRC
                    this.program_counter = arg * this.increment;
                    return 0;
                },
                () => {//HLT
                    this.halt = true;
                    return 0;
                },
                (arg) => {//RLD
                    this.ram[this.ram[arg]] = this.reg;
                },
                (arg) => {//CBR
                    if(this.reg === 0){
                        this.program_counter = arg * this.increment;
                        return 0;
                    }
                },

            ];

            VMIDs++;
        }
        init() {
            console.log("VM " + this.id + " initialized");
        }
        print_debug() {
            console.log({
                cpus: this.cpus,
                ram: this.ram,
                reg: this.regs,
                id: this.id,
            });
        }
        instruct(op_code, arg_code) {
            /* 4 bit op code, 8-128 bit arg code */

            this.instruction_set[op_code](arg_code);
        }
        clock() {
            if (this.halt === false) {
                this.opcode_buffer = 0;
                for(let i = 1; i < this.increment; i++)
                    this.opcode_buffer += this.ram[this.program_counter + i];
                try{
                    let instruction_output = this.instruction_set[this.ram[this.program_counter]](this.opcode_buffer);

                    if(instruction_output !== 0){
                        this.program_counter += this.increment;
                    }
                    if (this.program_counter >= this.ram.length) {
                        this.halt = true;
                    }
                } catch (e) {
                    console.error("Virtual machine " + this.id + " has encountered a fatal error.");
                    console.error(e);
                    this.halt = true;
                }
            }
        }
        instruct_hex(op_code, arg_code) {
            this.instruction_set[convert_from_hex(op_code)](convert_from_hex(arg_code));
        }
        set_program(program) {
            /* Program Layout:
            - arch: x
            - data: [[op, arg],[op, arg],[op, arg],[op, arg]]
            MUST NOT USE HEX.
            */
            if (program.arch === this.arch) {
                for (let i = 0; i < program.data.length; i++) {
                    this.ram[i * this.increment] = program.data[i][0];
                    for(let l = 0; l < Math.floor(program.data[i][1]/255) + 1; l++){
                        this.ram[(i * this.increment) + l + 1] = Math.min(255, program.data[i][1] - (255 * l));
                    }
                }
            }
        }
        reset() {
            this.ram = new Uint8Array(this.ram.length);
            this.reg = 0;
            this.cache = [];
            this.program_counter = 0;
            this.halt = false;
        }
    }
    function createVM(ram_size, arch, CPUs) {
        return new CarboniteVM(ram_size, arch, CPUs);
    }
    function runVM(virtual_machine, max_time) {
        let _max_time = 10;
        if (max_time) {
            _max_time = max_time;
        }
        let start_time = Date.now() + _max_time;
        while (Date.now() < start_time) {
            virtual_machine.clock();
        }
    }
    function convert_program_to_decimal(program) {

    }
}

class VMGUI{
    constructor(){
        this.vm = createVM(256, 8, 1);
    }
    update(){

    }
}