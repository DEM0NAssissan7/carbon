let VM = createVM(128, 8, 1);
VM.init();
let test_program = {
    arch: 8,
    data: [
        [2, 31],//Set register to 31
        [1, 29],//Put that value in ram address 31

        [0, 29],//Load ram address 31
        [3, 1],//Increment the register
        [1, 29],//Store register to 31

        [5, 70],//Subtract 70
        [10, 10],//If the increment is equal to 70, end the program
        
        [2, 100],//Set register to 100
        [9, 29],//Store register value at the ram addressed specified at ram address 31        
        [7, 2],//Jump to line 2

        [8, 0],//When program ends, halt it.
    ]
}
let vm_kernel = {
    arch: 8,
    data: [
        [7, 0],
        
    ]
}
VM.set_program(test_program);
VM.print_debug();
create_process (() => {runVM(VM, 3)});