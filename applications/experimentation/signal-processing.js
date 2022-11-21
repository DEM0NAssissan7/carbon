{
    let find_freq = function(signal, frequency, pi_over_length){
        // Frequency is measured in hz per signal.length
        // If frequency = 1, the wave will begin at 1 and end at -1 on the graph

        //Xn = xn cos((2n + 1)pi * k / 2N)
        let freq_amp = 0;
        for(let i = 0; i < signal.length; i++){
            freq_amp += signal[i] * Math.cos(((2 * i + 1) * Math.PI * i) / (2 * signal.length));
            //frequency * i * pi_over_length
        }
        return freq_amp;
    }
    let coeff = -6.28318530718;
    function process_signal(signal){
        return signal.map((sng, i) => {
            let sum = 0;
            for(let i = 0; i < signal.length; i++)
                sum += signal[i] * (Math.pow(Math.E, (coeff * i)))
            return sum
        })
    }
    console.log(process_signal([2, 1, 0]));
}