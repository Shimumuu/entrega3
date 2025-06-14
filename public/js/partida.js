//PRIMERO OBTENDREMOS ARREGLOS DE LAS DIFERENTES PIEZAS
const peones = document.querySelectorAll('.peon-pieza')
const caballos = document.querySelectorAll('.caballo-pieza')
const torres = document.querySelectorAll('.torre-pieza')
const alfiles = document.querySelectorAll('.alfil-pieza')
const reinas = document.querySelectorAll('.reina-pieza')
const reyes = document.querySelectorAll('.rey-pieza')
// Obtiene todas las casillas del tablero
const casillas = document.querySelectorAll('[id^="casilla"]') 
//turno (false = blancas, true = negras)
let turnos = false;
let posiblesPosiciones = [];
//para poder indicar el turno de cada jugador
function actualizarIndicadorTurno() {
    const indicador = document.getElementById('indicador-turno');
    if (turnos) {
        indicador.innerHTML = 'Negras <img class="equipoficha" src="imagenes/peonnegroequipo.png">';
    } else {
        indicador.innerHTML = 'Blancas <img class="equipoficha" src="imagenes/peonblancoequipo.png">';
    }
}

//CASO PEON
peones.forEach(peon => {
    peon.addEventListener('dragstart', e => {
        const altPieza = e.target.alt
        if ((turnos && altPieza !== "negra") || (!turnos && altPieza !== "blanca")) {
            e.preventDefault(); // Bloquea el arrastre(amen)
            return;
        }
        console.log('Rey se mueve')
        const contenedor = e.target.parentElement
        e.dataTransfer.setData("fila", contenedor.dataset.fila)
        e.dataTransfer.setData("columna", contenedor.dataset.columna)
        const filaActual = contenedor.dataset.fila
        const columnaActual = contenedor.dataset.columna
        

        posiblesPosiciones = movPeon(parseInt(filaActual), columnaActual, altPieza) // SE USA PARSEINT DEBIDO A QUE EL NUMERO DE LA FILA ESTA GUARDADO COMO TEXTO

        for (let i = 0; i < posiblesPosiciones.length; i++) {
            const casillaDestino = document.querySelector(posiblesPosiciones[i]);

            if (casillaDestino != null) {
                casillaDestino.style.backgroundColor = '#70aaff'
                casillaDestino.style.border = '3px solid #999';

            } else {
                console.log("Error");
            }
        }



    })
})

function movPeon(fila, columna, altPieza) {
    const movimientos = []
    let direcciones = []
    //Variables para verificar si moverse
    const casillaFrenteBlanca = document.querySelector("#casilla" + (fila + 1) + columna)
    const casillaDobleFrenteBlanca = document.querySelector("#casilla" + (fila + 2) + columna)
    const casillaFrenteNegra = document.querySelector("#casilla" + (fila - 1) + columna)
    const casillaDobleFrenteNegra = document.querySelector("#casilla" + (fila - 2) + columna)
    if (altPieza == "blanca") {
        if (fila == 2) {
            if (casillaFrenteBlanca.querySelector("img") == null && casillaDobleFrenteBlanca.querySelector("img") == null) {
                direcciones = [[1, 0], [2, 0]]
            }
            else if (casillaFrenteBlanca.querySelector("img") == null) {
                direcciones = [[1, 0]]
            }
        }
        else {
            if (casillaFrenteBlanca.querySelector("img") == null) {
                direcciones = [[1, 0]]
            }
        }
    }
    else {
        if (fila == 7) {
            if (casillaFrenteNegra.querySelector("img") == null && casillaDobleFrenteNegra.querySelector("img") == null) {
                direcciones = [[-1, 0], [-2, 0]]
            }
            else if (casillaFrenteNegra.querySelector("img") == null) {
                direcciones = [[-1, 0]]
            }
        }
        else {
            if (casillaFrenteNegra.querySelector("img") == null) {
                direcciones = [[-1, 0]]
            }
        }
    }

    //Caso para comer en diagonal
    const columnaDer = String.fromCharCode(columna.charCodeAt(0) + 1)
    const columnaIzq = String.fromCharCode(columna.charCodeAt(0) - 1)

    if (altPieza == "blanca") {
        //Esta condicional es para evitar el caso de los peones de la columna A y que calculen su diagonal derecha
        if (columna != "A") {
            const diagonalIzq = document.querySelector("#casilla" + (fila + 1) + columnaIzq)

            //el signo ? pregunta si existe o no el objeto, de no ser el caso transforma la variable a undefined
            const imgIzq = diagonalIzq?.querySelector("img")
            //Aqui lo primero que se hace es acceder al imgDer.alt, si no existe (Caso donde no haya una img) devolver undefined
            //Aplica para todos los otros casos
            if (imgIzq?.alt === "negra") {
                direcciones.push([1, -1])
            }
        }
        //Esta condicional es para evitar el caso de los peones de la columna H y que calculen su diagonal derecha
        if (columna != "H") {
            const diagonalDer = document.querySelector("#casilla" + (fila + 1) + columnaDer)
            //el signo ? pregunta si existe o no el objeto, de no ser el caso transforma la variable a undefined
            const imgDer = diagonalDer?.querySelector("img")
            //Aqui lo primero que se hace es acceder al imgDer.alt, si no existe (Caso donde no haya una img) devolver undefined
            //Aplica para todos los otros casos
            if (imgDer?.alt === "negra") {
                direcciones.push([1, 1])
            }

        }


    } else if (altPieza == "negra") {

        //Esta condicional es para evitar el caso de los peones de la columna A y que calculen su diagonal derecha
        if (columna != "A") {
            const diagonalIzq = document.querySelector("#casilla" + (fila - 1) + columnaIzq)
            //el signo ? pregunta si existe o no el objeto, de no ser el caso transforma la variable a undefined
            const imgIzq = diagonalIzq?.querySelector("img")
            //Aqui lo primero que se hace es acceder al imgDer.alt, si no existe (Caso donde no haya una img) devolver undefined
            //Aplica para todos los otros casos
            if (imgIzq?.alt === "blanca") {
                direcciones.push([-1, -1])
            }
        }
        //Esta condicional es para evitar el caso de los peones de la columna H y que calculen su diagonal derecha        
        if (columna != "H") {
            const diagonalDer = document.querySelector("#casilla" + (fila - 1) + columnaDer)
            //el signo ? pregunta si existe o no el objeto, de no ser el caso transforma la variable a undefined
            const imgDer = diagonalDer?.querySelector("img")
            //Aqui lo primero que se hace es acceder al imgDer.alt, si no existe (Caso donde no haya una img) devolver undefined
            //Aplica para todos los otros casos
            if (imgDer?.alt === "blanca") {
                direcciones.push([-1, 1])
            }

        }
    }

    direcciones.forEach(([direccionFila, direccionColumna]) => {
        const nuevaFila = fila + direccionFila
        const nuevaColumna = String.fromCharCode(columna.charCodeAt(0) + direccionColumna)
        //charCodeAt devuelve un número indicando el valor Unicode del carácter en el índice proporcionado.
        //fromCharCode devuelve una cadena creada mediante el uso de una secuencia de valores Unicode especificada.

        if (nuevaFila >= 1 && nuevaFila <= 8 && nuevaColumna >= 'A' && nuevaColumna <= 'H') {
            movimientos.push(["#casilla" + nuevaFila + nuevaColumna])
        }
    })

    return movimientos
}

// CASO REY
reyes.forEach(rey => {
    rey.addEventListener('dragstart', e => {
        const altPieza = e.target.alt
        if ((turnos && altPieza !== "negra") || (!turnos && altPieza !== "blanca")) {
            e.preventDefault(); // Bloquea el arrastre(amen)
            return;
        }
        console.log('Rey se mueve')
        const contenedor = e.target.parentElement
        e.dataTransfer.setData("fila", contenedor.dataset.fila)
        e.dataTransfer.setData("columna", contenedor.dataset.columna)
        const filaActual = contenedor.dataset.fila
        const columnaActual = contenedor.dataset.columna

        posiblesPosiciones = movRey(parseInt(filaActual), columnaActual) // SE USA PARSEINT DEBIDO A QUE EL NUMERO DE LA FILA ESTA GUARDADO COMO TEXTO

        for (let i = 0; i < posiblesPosiciones.length; i++) {
            const casillaDestino = document.querySelector(posiblesPosiciones[i]);

            if (casillaDestino != null) {
                casillaDestino.style.backgroundColor = '#70aaff'
                casillaDestino.style.border = '3px solid #999';

            } else {
                console.log("Error");
            }
        }



    })
})

function movRey(fila, columna) {
    const movimientos = []
    const direcciones = [
        [1, 0], [1, 1], [-1, 0], [-1, 1], [0, 1], [0, -1], [-1, -1], [1, -1]
    ]

    direcciones.forEach(([direccionFila, direccionColumna]) => {
        const nuevaFila = fila + direccionFila
        const nuevaColumna = String.fromCharCode(columna.charCodeAt(0) + direccionColumna)
        //charCodeAt devuelve un número indicando el valor Unicode del carácter en el índice proporcionado.
        //fromCharCode devuelve una cadena creada mediante el uso de una secuencia de valores Unicode especificada.

        if (nuevaFila >= 1 && nuevaFila <= 8 && nuevaColumna >= 'A' && nuevaColumna <= 'H') {
            movimientos.push(["#casilla" + nuevaFila + nuevaColumna])
        }
    })

    return movimientos

}

//CASO REINA
reinas.forEach(reina => {
    reina.addEventListener('dragstart', e => {
        const altPieza = e.target.alt
        if ((turnos && altPieza !== "negra") || (!turnos && altPieza !== "blanca")) {
            e.preventDefault(); // Bloquea el arrastre(amen)
            return;
        }
        console.log('Reina se mueve')
        const contenedor = e.target.parentElement
        e.dataTransfer.setData("fila", contenedor.dataset.fila)
        e.dataTransfer.setData("columna", contenedor.dataset.columna)
        const filaActual = contenedor.dataset.fila
        const columnaActual = contenedor.dataset.columna
        

        posiblesPosiciones = movReina(parseInt(filaActual), columnaActual, altPieza) // SE USA PARSEINT DEBIDO A QUE EL NUMERO DE LA FILA ESTA GUARDADO COMO TEXTO

        for (let i = 0; i < posiblesPosiciones.length; i++) {
            const casillaDestino = document.querySelector(posiblesPosiciones[i]);

            if (casillaDestino != null) {
                casillaDestino.style.backgroundColor = '#70aaff'
                casillaDestino.style.border = '3px solid #999';

            } else {
                console.log("Error");
            }
        }



    })
})

function movReina(fila, columna, altPieza) {
    let direccionesFinales = []
    const direcciones = [
        [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0],
        [-1, 0], [-2, 0], [-3, 0], [-4, 0], [-5, 0], [-6, 0], [-7, 0], [-8, 0],
        [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8],
        [0, -1], [0, -2], [0, -3], [0, -4], [0, -5], [0, -6], [0, -7], [0, -8],
        [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8],
        [-1, -1], [-2, -2], [-3, -3], [-4, -4], [-5, -5], [-6, -6], [-7, -7], [-8, -8],
        [1, -1], [2, -2], [3, -3], [4, -4], [5, -5], [6, -6], [7, -7], [8, -8],
        [-1, 1], [-2, 2], [-3, 3], [-4, 4], [-5, 5], [-6, 6], [-7, 7], [-8, 8]
    ]

    direcciones.forEach(([direccionFila, direccionColumna]) => {
        const nuevaFila = fila + direccionFila
        const nuevaColumna = String.fromCharCode(columna.charCodeAt(0) + direccionColumna)
        //charCodeAt devuelve un número indicando el valor Unicode del carácter en el índice proporcionado.
        //fromCharCode devuelve una cadena creada mediante el uso de una secuencia de valores Unicode especificada.

        if (nuevaFila >= 1 && nuevaFila <= 8 && nuevaColumna >= 'A' && nuevaColumna <= 'H') {
            direccionesFinales.push(["#casilla" + nuevaFila + nuevaColumna])
        }
    })

    direccionesFinales.forEach((casilla) => {
        //LA POSICION DE LA CASILLA ITERADORA
        let posicion = document.querySelector(casilla)

        console.log("Numero casilla: ", posicion)
        let comio = 0;
        //POSICION CASILLA INICIAL
        const posicionOrigen = document.querySelector("#casilla" + fila + columna)
        const y = posicionOrigen.dataset.fila
        const x = posicionOrigen.dataset.columna
        const img = posicion?.querySelector("img")
        if (img != null) {
            filaTemp = posicion.dataset.fila
            columnaTemp = posicion.dataset.columna




            //-------------CASO DONDE LAS PIEZAS SON DEL MISMO COLOR-----------------------------------
            if (img.alt == altPieza || img.alt != altPieza) {
                if (img.alt == altPieza && comio < 1) {
                    //BORRAMOS LA CASILLA DONDE SE ENCUENTRA LA OTRA PIEZA DEL MISMO COLOR
                    direccionesFinales = direccionesFinales.filter(casilla => casilla != "#casilla" + filaTemp + columnaTemp)
                    comio++
                }
                if (filaTemp > y && columnaTemp > x) {
                    // BUSCAMOS SI EXISTE EN EL ARREGLO UNA CASILLA DE LA DIAGONAL SUPERIOR DERECHA
                    console.log("Primer if")
                    for (let i = 0; i < 8; i++) {
                        //proceso de cambio de la cordenada 
                        columnaTemp = columnaTemp.charCodeAt(0)
                        columnaTemp++
                        columnaTemp = String.fromCharCode(columnaTemp)
                        filaTemp++
                        console.log("Entre al primer for")
                        // Puede existir el caso que con el ciclo las casillas que se creen no existan por eso usamos la condicion para los 
                        //posibles movimientos para evitar el error
                        if (filaTemp < 1 || filaTemp > 8 || columnaTemp < 'A' || columnaTemp > 'H') {
                            break
                        }
                        console.log("Entre al primer for")

                        console.log(filaTemp, columnaTemp)
                        const casillaSig = document.querySelector("#casilla" + filaTemp + columnaTemp)
                        const id = casillaSig?.id
                        console.log("#" + id)
                        direccionesFinales = direccionesFinales.filter(casilla => casilla != "#" + id)
                        direccionesFinalesCopia = direccionesFinales
                    }

                }
                else if (filaTemp > y && columnaTemp < x) {
                    // BUSCAMOS SI EXISTE EN EL ARREGLO UNA CASILLA DE LA DIAGONAL SUPERIOR IZQUIERDA
                    for (let i = 0; i < 8; i++) {
                        //proceso de cambio de la cordenada 
                        columnaTemp = columnaTemp.charCodeAt(0)
                        columnaTemp--
                        columnaTemp = String.fromCharCode(columnaTemp)
                        filaTemp++
                        console.log("Segundo if")
                        // Puede existir el caso que con el ciclo las casillas que se creen no existan por eso usamos la condicion para los 
                        //posibles movimientos para evitar el error
                        if (filaTemp < 1 || filaTemp > 8 || columnaTemp < 'A' || columnaTemp > 'H') {
                            break
                        }
                        console.log("Segundo if")

                        console.log(filaTemp, columnaTemp)
                        const casillaSig = document.querySelector("#casilla" + filaTemp + columnaTemp)
                        const id = casillaSig?.id
                        console.log("#" + id)
                        direccionesFinales = direccionesFinales.filter(casilla => casilla != "#" + id)
                        console.log("eliminacion segundo if" + direccionesFinales)
                    }
                }
                else if (filaTemp < y && columnaTemp > x) {
                    console.log("Tercer if")
                    // DIAGONAL INFERIOR DERECHA
                    for (let i = 0; i < 8; i++) {
                        columnaTemp = columnaTemp.charCodeAt(0)
                        columnaTemp++
                        columnaTemp = String.fromCharCode(columnaTemp)
                        filaTemp--

                        if (filaTemp < 1 || filaTemp > 8 || columnaTemp < 'A' || columnaTemp > 'H') {
                            break
                        }

                        const casillaSig = document.querySelector("#casilla" + filaTemp + columnaTemp)
                        const id = casillaSig?.id
                        direccionesFinales = direccionesFinales.filter(casilla => casilla != "#" + id)
                    }
                }
                else if(filaTemp < y && columnaTemp < x){
                    console.log("Cuarto if")
                    // DIAGONAL INFERIOR IZQUIERDA
                    for (let i = 0; i < 8; i++) {
                        columnaTemp = columnaTemp.charCodeAt(0)
                        columnaTemp--
                        columnaTemp = String.fromCharCode(columnaTemp)
                        filaTemp--

                        if (filaTemp < 1 || filaTemp > 8 || columnaTemp < 'A' || columnaTemp > 'H') {
                            break
                        }

                        const casillaSig = document.querySelector("#casilla" + filaTemp + columnaTemp)
                        const id = casillaSig?.id
                        direccionesFinales = direccionesFinales.filter(casilla => casilla != "#" + id)
                    }
                }
                else if (filaTemp > y) {
                    // BUSCAMOS SI EXISTE EN EL ARREGLO SUPERIOR
                    console.log("Primer if")
                    for (let i = 0; i < 8; i++) {
                        //proceso de cambio de la cordenada 
                        filaTemp++
                        console.log("Entre al primer for")
                        // Puede existir el caso que con el ciclo las casillas que se creen no existan por eso usamos la condicion para los 
                        //posibles movimientos para evitar el error
                        if (filaTemp < 1 || filaTemp > 8) {
                            break
                        }
                        console.log("Entre al primer for")

                        console.log(filaTemp, columnaTemp)
                        const casillaSig = document.querySelector("#casilla" + filaTemp + columnaTemp)
                        const id = casillaSig?.id
                        console.log("#" + id)
                        direccionesFinales = direccionesFinales.filter(casilla => casilla != "#" + id)
                    }

                }
                else if (filaTemp < y) {
                    // BUSCAMOS SI EXISTE EN EL ARREGLO UNA CASILLA INFERIOR
                    for (let i = 0; i < 8; i++) {
                        //proceso de cambio de la cordenada 
                        filaTemp--
                        console.log("Segundo if")
                        // Puede existir el caso que con el ciclo las casillas que se creen no existan por eso usamos la condicion para los 
                        //posibles movimientos para evitar el error
                        if (filaTemp < 1 || filaTemp > 8) {
                            break
                        }
                        console.log("Segundo if")

                        console.log(filaTemp, columnaTemp)
                        const casillaSig = document.querySelector("#casilla" + filaTemp + columnaTemp)
                        const id = casillaSig?.id
                        console.log("#" + id)
                        direccionesFinales = direccionesFinales.filter(casilla => casilla != "#" + id)
                        console.log("eliminacion segundo if" + direccionesFinales)
                    }
                }
                else if (columnaTemp > x) {
                    console.log("Tercer if")
                    // DIAGONAL INFERIOR DERECHA
                    for (let i = 0; i < 8; i++) {
                        columnaTemp = columnaTemp.charCodeAt(0)
                        columnaTemp++
                        columnaTemp = String.fromCharCode(columnaTemp)

                        if (columnaTemp < 'A' || columnaTemp > 'H') {
                            break
                        }

                        const casillaSig = document.querySelector("#casilla" + filaTemp + columnaTemp)
                        const id = casillaSig?.id
                        direccionesFinales = direccionesFinales.filter(casilla => casilla != "#" + id)
                    }
                }
                else {
                    console.log("Cuarto if")
                    // DIAGONAL INFERIOR IZQUIERDA
                    for (let i = 0; i < 8; i++) {
                        columnaTemp = columnaTemp.charCodeAt(0)
                        columnaTemp--
                        columnaTemp = String.fromCharCode(columnaTemp)

                        if (columnaTemp < 'A' || columnaTemp > 'H') {
                            break
                        }

                        const casillaSig = document.querySelector("#casilla" + filaTemp + columnaTemp)
                        const id = casillaSig?.id
                        direccionesFinales = direccionesFinales.filter(casilla => casilla != "#" + id)
                    }
                }
            }

        }
    })
    return direccionesFinales

}


//CASO CABALLO
caballos.forEach(caballo => {
    caballo.addEventListener('dragstart', e => {
        const altPieza = e.target.alt
        if ((turnos && altPieza !== "negra") || (!turnos && altPieza !== "blanca")) {
            e.preventDefault(); // Bloquea el arrastre(amen)
            return;
        }
        console.log('Caballo se mueve')
        const contenedor = e.target.parentElement
        e.dataTransfer.setData("fila", contenedor.dataset.fila)
        e.dataTransfer.setData("columna", contenedor.dataset.columna)
        const filaActual = contenedor.dataset.fila
        const columnaActual = contenedor.dataset.columna

        posiblesPosiciones = movCaballo(parseInt(filaActual), columnaActual)


        for (let i = 0; i < posiblesPosiciones.length; i++) {
            const casillaDestino = document.querySelector(posiblesPosiciones[i]);

            if (casillaDestino != null) {
                casillaDestino.style.backgroundColor = '#70aaff'
                casillaDestino.style.border = '3px solid #999';

                console.log(casillaDestino);
            } else {
                console.log("Error");
            }
        }



    })
})

//FUNCION PARA CALCULAR LOS MOVIMIENTOS DEL CABALLO
function movCaballo(fila, columna) {
    const movimientos = []
    const direcciones = [
        [-2, -1], [-2, 1],//---------->POSIBLES POSICIONES DEL CABALLO.
        [-1, -2], [-1, 2],
        [1, -2], [1, 2],
        [2, -1], [2, 1],
    ]

    direcciones.forEach(([direccionFila, direccionColumna]) => {
        const nuevaFila = fila + direccionFila
        const nuevaColumna = String.fromCharCode(columna.charCodeAt(0) + direccionColumna)
        //charCodeAt devuelve un número indicando el valor Unicode del carácter en el índice proporcionado.
        //fromCharCode devuelve una cadena creada mediante el uso de una secuencia de valores Unicode especificada.

        if (nuevaFila >= 1 && nuevaFila <= 8 && nuevaColumna >= 'A' && nuevaColumna <= 'H') {
            movimientos.push("#casilla" + nuevaFila + nuevaColumna)
        }
    })

    return movimientos
}

//CASO TORRES
torres.forEach(torre => {
    torre.addEventListener('dragstart', e => {
        const altPieza = e.target.alt
        if ((turnos && altPieza !== "negra") || (!turnos && altPieza !== "blanca")) {
            e.preventDefault(); // Bloquea el arrastre(amen)
            return;
        }
        console.log("Torre se mueve")
        contenedor = e.target.parentElement
        e.dataTransfer.setData("fila", contenedor.dataset.fila)// Esta linea junto a la de abajo almacena informacion sobre la posicion de la pieza se usaran en el drop, por eso es importante guardarlas
        e.dataTransfer.setData("columna", contenedor.dataset.columna)

        const filaActual = contenedor.dataset.fila
        const columnaActual = contenedor.dataset.columna

        posiblesPosiciones = movTorre(parseInt(filaActual), columnaActual, altPieza)
        console.log(posiblesPosiciones)

        for (let i = 0; i < posiblesPosiciones.length; i++) {
            const casillaDestino = document.querySelector(posiblesPosiciones[i]);

            if (casillaDestino != null) {
                casillaDestino.style.backgroundColor = '#70aaff'
                casillaDestino.style.border = '3px solid #999';

                console.log(casillaDestino);
            } else {
                console.log("Error");
            }
        }
    })
})

function movTorre(fila, columna, altPieza) {
    let direccionesFinales = []
    const direcciones = [
        [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0],
        [-1, 0], [-2, 0], [-3, 0], [-4, 0], [-5, 0], [-6, 0], [-7, 0], [-8, 0],
        [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8],
        [0, -1], [0, -2], [0, -3], [0, -4], [0, -5], [0, -6], [0, -7], [0, -8]
    ]

    direcciones.forEach(([direccionFila, direccionColumna]) => {
        const nuevaFila = fila + direccionFila
        const nuevaColumna = String.fromCharCode(columna.charCodeAt(0) + direccionColumna)
        //charCodeAt devuelve un número indicando el valor Unicode del carácter en el índice proporcionado.
        //fromCharCode devuelve una cadena creada mediante el uso de una secuencia de valores Unicode especificada.

        if (nuevaFila >= 1 && nuevaFila <= 8 && nuevaColumna >= 'A' && nuevaColumna <= 'H') {
            direccionesFinales.push(["#casilla" + nuevaFila + nuevaColumna])
        }
    })

    direccionesFinales.forEach((casilla) => {
        //LA POSICION DE LA CASILLA ITERADORA
        let posicion = document.querySelector(casilla)

        console.log("Numero casilla: ", posicion)
        let comio = 0;
        //POSICION CASILLA INICIAL
        const posicionOrigen = document.querySelector("#casilla" + fila + columna)
        const y = posicionOrigen.dataset.fila
        const x = posicionOrigen.dataset.columna
        const img = posicion?.querySelector("img")
        if (img != null) {
            filaTemp = posicion.dataset.fila
            columnaTemp = posicion.dataset.columna



            //-------------CASO DONDE LAS PIEZAS SON DEL MISMO COLOR-----------------------------------
            if (img.alt == altPieza || img.alt != altPieza) {
                if (img.alt == altPieza && comio < 1) {
                    //BORRAMOS LA CASILLA DONDE SE ENCUENTRA LA OTRA PIEZA DEL MISMO COLOR
                    direccionesFinales = direccionesFinales.filter(casilla => casilla != "#casilla" + filaTemp + columnaTemp)
                    comio++
                }

                if (filaTemp > y) {
                    // BUSCAMOS SI EXISTE EN EL ARREGLO SUPERIOR
                    console.log("Primer if")
                    for (let i = 0; i < 8; i++) {
                        //proceso de cambio de la cordenada 
                        filaTemp++
                        console.log("Entre al primer for")
                        // Puede existir el caso que con el ciclo las casillas que se creen no existan por eso usamos la condicion para los 
                        //posibles movimientos para evitar el error
                        if (filaTemp < 1 || filaTemp > 8) {
                            break
                        }
                        console.log("Entre al primer for")

                        console.log(filaTemp, columnaTemp)
                        const casillaSig = document.querySelector("#casilla" + filaTemp + columnaTemp)
                        const id = casillaSig?.id
                        console.log("#" + id)
                        direccionesFinales = direccionesFinales.filter(casilla => casilla != "#" + id)
                    }

                }
                else if (filaTemp < y) {
                    // BUSCAMOS SI EXISTE EN EL ARREGLO UNA CASILLA INFERIOR
                    for (let i = 0; i < 8; i++) {
                        //proceso de cambio de la cordenada 
                        filaTemp--
                        console.log("Segundo if")
                        // Puede existir el caso que con el ciclo las casillas que se creen no existan por eso usamos la condicion para los 
                        //posibles movimientos para evitar el error
                        if (filaTemp < 1 || filaTemp > 8) {
                            break
                        }
                        console.log("Segundo if")

                        console.log(filaTemp, columnaTemp)
                        const casillaSig = document.querySelector("#casilla" + filaTemp + columnaTemp)
                        const id = casillaSig?.id
                        console.log("#" + id)
                        direccionesFinales = direccionesFinales.filter(casilla => casilla != "#" + id)
                        console.log("eliminacion segundo if" + direccionesFinales)
                    }
                }
                else if (columnaTemp > x) {
                    console.log("Tercer if")
                    // DIAGONAL INFERIOR DERECHA
                    for (let i = 0; i < 8; i++) {
                        columnaTemp = columnaTemp.charCodeAt(0)
                        columnaTemp++
                        columnaTemp = String.fromCharCode(columnaTemp)

                        if (columnaTemp < 'A' || columnaTemp > 'H') {
                            break
                        }

                        const casillaSig = document.querySelector("#casilla" + filaTemp + columnaTemp)
                        const id = casillaSig?.id
                        direccionesFinales = direccionesFinales.filter(casilla => casilla != "#" + id)
                    }
                }
                else {
                    console.log("Cuarto if")
                    // DIAGONAL INFERIOR IZQUIERDA
                    for (let i = 0; i < 8; i++) {
                        columnaTemp = columnaTemp.charCodeAt(0)
                        columnaTemp--
                        columnaTemp = String.fromCharCode(columnaTemp)

                        if (columnaTemp < 'A' || columnaTemp > 'H') {
                            break
                        }

                        const casillaSig = document.querySelector("#casilla" + filaTemp + columnaTemp)
                        const id = casillaSig?.id
                        direccionesFinales = direccionesFinales.filter(casilla => casilla != "#" + id)
                    }
                }
            }

        }
    })

    return direccionesFinales
}

//Caso Alfiles
alfiles.forEach(alfil => {
    alfil.addEventListener('dragstart', e => {
        const altPieza = e.target.alt
        if ((turnos && altPieza !== "negra") || (!turnos && altPieza !== "blanca")) {
            e.preventDefault(); // Bloquea el arrastre(amen)
            return;
        }
        console.log("Alfil se mueve")
        contenedor = e.target.parentElement
        e.dataTransfer.setData("fila", contenedor.dataset.fila)// Esta linea junto a la de abajo almacena informacion sobre la posicion de la pieza se usaran en el drop, por eso es importante guardarlas
        e.dataTransfer.setData("columna", contenedor.dataset.columna)

        const filaActual = contenedor.dataset.fila
        const columnaActual = contenedor.dataset.columna

        posiblesPosiciones = movAlfil(parseInt(filaActual), columnaActual, altPieza)

        for (let i = 0; i < posiblesPosiciones.length; i++) {
            const casillaDestino = document.querySelector(posiblesPosiciones[i]);
            if (casillaDestino != null) {
                casillaDestino.style.backgroundColor = '#70aaff'
                casillaDestino.style.border = '3px solid #999';

            } else {
                console.log("Error");
            }
        }
    })
})




function movAlfil(fila, columna, altPieza) {
    const direcciones = [
        [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8],
        [-1, -1], [-2, -2], [-3, -3], [-4, -4], [-5, -5], [-6, -6], [-7, -7], [-8, -8],
        [1, -1], [2, -2], [3, -3], [4, -4], [5, -5], [6, -6], [7, -7], [8, -8],
        [-1, 1], [-2, 2], [-3, 3], [-4, 4], [-5, 5], [-6, 6], [-7, 7], [-8, 8],
    ]
    let direccionesFinales = []

    direcciones.forEach(([direccionFila, direccionColumna]) => {
        const nuevaFila = fila + direccionFila
        const nuevaColumna = String.fromCharCode(columna.charCodeAt(0) + direccionColumna)

        if (nuevaFila >= 1 && nuevaFila <= 8 && nuevaColumna >= 'A' && nuevaColumna <= 'H') {
            direccionesFinales.push("#casilla" + nuevaFila + nuevaColumna)
        }
    })

    console.log(direccionesFinales)
    direccionesFinales.forEach((casilla) => {
        //LA POSICION DE LA CASILLA ITERADORA
        let posicion = document.querySelector(casilla)

        console.log("Numero casilla: ", posicion)
        let comio = 0;
        //POSICION CASILLA INICIAL
        const posicionOrigen = document.querySelector("#casilla" + fila + columna)
        const y = posicionOrigen.dataset.fila
        const x = posicionOrigen.dataset.columna
        const img = posicion?.querySelector("img")
        if (img != null) {
            filaTemp = posicion.dataset.fila
            columnaTemp = posicion.dataset.columna



            //-------------CASO DONDE LAS PIEZAS SON DEL MISMO COLOR-----------------------------------
            if (img.alt == altPieza || img.alt != altPieza) {
                if (img.alt == altPieza && comio < 1) {
                    //BORRAMOS LA CASILLA DONDE SE ENCUENTRA LA OTRA PIEZA DEL MISMO COLOR
                    direccionesFinales = direccionesFinales.filter(casilla => casilla != "#casilla" + filaTemp + columnaTemp)
                    comio++
                }

                if (filaTemp > y && columnaTemp > x) {
                    // BUSCAMOS SI EXISTE EN EL ARREGLO UNA CASILLA DE LA DIAGONAL SUPERIOR DERECHA
                    console.log("Primer if")
                    for (let i = 0; i < 8; i++) {
                        //proceso de cambio de la cordenada 
                        columnaTemp = columnaTemp.charCodeAt(0)
                        columnaTemp++
                        columnaTemp = String.fromCharCode(columnaTemp)
                        filaTemp++
                        console.log("Entre al primer for")
                        // Puede existir el caso que con el ciclo las casillas que se creen no existan por eso usamos la condicion para los 
                        //posibles movimientos para evitar el error
                        if (filaTemp < 1 || filaTemp > 8 || columnaTemp < 'A' || columnaTemp > 'H') {
                            break
                        }
                        console.log("Entre al primer for")

                        console.log(filaTemp, columnaTemp)
                        const casillaSig = document.querySelector("#casilla" + filaTemp + columnaTemp)
                        const id = casillaSig?.id
                        console.log("#" + id)
                        direccionesFinales = direccionesFinales.filter(casilla => casilla != "#" + id)
                        direccionesFinalesCopia = direccionesFinales
                    }

                }
                else if (filaTemp > y && columnaTemp < x) {
                    // BUSCAMOS SI EXISTE EN EL ARREGLO UNA CASILLA DE LA DIAGONAL SUPERIOR IZQUIERDA
                    for (let i = 0; i < 8; i++) {
                        //proceso de cambio de la cordenada 
                        columnaTemp = columnaTemp.charCodeAt(0)
                        columnaTemp--
                        columnaTemp = String.fromCharCode(columnaTemp)
                        filaTemp++
                        console.log("Segundo if")
                        // Puede existir el caso que con el ciclo las casillas que se creen no existan por eso usamos la condicion para los 
                        //posibles movimientos para evitar el error
                        if (filaTemp < 1 || filaTemp > 8 || columnaTemp < 'A' || columnaTemp > 'H') {
                            break
                        }
                        console.log("Segundo if")

                        console.log(filaTemp, columnaTemp)
                        const casillaSig = document.querySelector("#casilla" + filaTemp + columnaTemp)
                        const id = casillaSig?.id
                        console.log("#" + id)
                        direccionesFinales = direccionesFinales.filter(casilla => casilla != "#" + id)
                        console.log("eliminacion segundo if" + direccionesFinales)
                    }
                }
                else if (filaTemp < y && columnaTemp > x) {
                    console.log("Tercer if")
                    // DIAGONAL INFERIOR DERECHA
                    for (let i = 0; i < 8; i++) {
                        columnaTemp = columnaTemp.charCodeAt(0)
                        columnaTemp++
                        columnaTemp = String.fromCharCode(columnaTemp)
                        filaTemp--

                        if (filaTemp < 1 || filaTemp > 8 || columnaTemp < 'A' || columnaTemp > 'H') {
                            break
                        }

                        const casillaSig = document.querySelector("#casilla" + filaTemp + columnaTemp)
                        const id = casillaSig?.id
                        direccionesFinales = direccionesFinales.filter(casilla => casilla != "#" + id)
                    }
                }
                else {
                    console.log("Cuarto if")
                    // DIAGONAL INFERIOR IZQUIERDA
                    for (let i = 0; i < 8; i++) {
                        columnaTemp = columnaTemp.charCodeAt(0)
                        columnaTemp--
                        columnaTemp = String.fromCharCode(columnaTemp)
                        filaTemp--

                        if (filaTemp < 1 || filaTemp > 8 || columnaTemp < 'A' || columnaTemp > 'H') {
                            break
                        }

                        const casillaSig = document.querySelector("#casilla" + filaTemp + columnaTemp)
                        const id = casillaSig?.id
                        direccionesFinales = direccionesFinales.filter(casilla => casilla != "#" + id)
                    }
                }
            }

        }
    })
    return direccionesFinales

}


//Se utiliza el for each para aplicar los siguientes eventos en todas las casillas
casillas.forEach(casilla => {
    casilla.addEventListener('dragover', e => {
        e.preventDefault()
        console.log('Drag over')
    })

    casilla.addEventListener('drop', e => {
        e.preventDefault()
        console.log('Drop')
        let validarMovimiento = false //VARIABLES PARA LA LOGICA DE LAS POSICIONES
        let puedeComer = false //variable para saber si se puede comer una pieza
        //Obtenemos la fila y columnas del origen
        const fila = e.dataTransfer.getData("fila")
        const columna = e.dataTransfer.getData("columna")
        //creamos la casilla
        const origen = document.querySelector("#casilla" + fila + columna)
        const listaMovimientos = document.getElementById("lista-de-movimientos");
         const movimiento = document.createElement("li");
        //obtenemos informacion de la pieza que estamos moviendo
        
        const pieza = origen.querySelector("img")
        console.log(pieza)
        const piezaActual = pieza.alt
       
        //Obtenemos informacion de donde dejaremos la pieza
        const casilla = e.currentTarget
        const posiblePieza = casilla.querySelector("img")
        let altPieza = null
        let altPiezaComida = null
        if (posiblePieza != null) {
            altPieza = posiblePieza.alt
            if (piezaActual == "blanca" && altPieza == "negra" || piezaActual == "negra" && altPieza == "blanca") {
                puedeComer = true
            }
        }




        for (let i = 0; i < posiblesPosiciones.length; i++) {
            if ("#" + casilla.id == posiblesPosiciones[i]) {
                validarMovimiento = true
                break;
            }
            console.log("hola")
            console.log(casilla.id)
            console.log(posiblesPosiciones[i])
        }

        if (validarMovimiento) {// Si el movimiento al que quiero acceder es posible sigo dentro del if
            const destino = casilla.id.replace("casilla", ""); 
                    const piezaIMG = document.createElement("img");
                    piezaIMG.src = pieza.src;
                 //esto es para quitar el texto "casilla" y dejar solo la letra y el numero y asi poder usarlo para mostrar en el historia el destino
            if (altPieza === null) { 
                //Aquí estoy viendo si la casilla a la que quiero acceder esta vacia, de estarlo agrego la pieza
                casilla.appendChild(pieza)  
                         
                
            } else {
               
                if (puedeComer) {// si la casilla no esta vacia, pero puede comer una ficha, hace el intercambio
                    
                   console.log("comiendo")
                   //esto es para saber si la pieza que se comieron es negra o blanca
                    altPiezaComida = posiblePieza.alt
                    //la imagen de la pieza se saca de donde estaba y se agrega a pieza comida para poder llevarla a las piezas que se comieron
                    const piezaComida =  casilla.querySelector("img");
                    const piezaIMGComida = document.createElement("img");
                    piezaIMGComida.src = piezaComida.src;
                    casilla.appendChild(pieza) // RECORDATORIO, HACER AQUÍ LA ANIMACION PARA QUE LA PIEZA VAYA A LA ZONA DE PIEZAS MUERTAS
                
                    for (let i = 0; i < posiblesPosiciones.length; i++) { //Eliminar el efecto de los colores despues de colocar la pieza
                        const casillaDestino = document.querySelector(posiblesPosiciones[i]);
                        
                        if (casillaDestino != null) {
                            console.log(casillaDestino)
                            casillaDestino.style.backgroundColor = ''
                            casillaDestino.style.border = ''
                        }
                    }
                    //me costo media madrugada, pero ya lo tengo

                    //aqui estoy viendo si la pieza comida es blanca o negra, y la agrego a su respectiva zona de piezas muertas, la animacion no se como lo hare
             if (altPiezaComida === "blanca") {
                const destino = casilla.id.replace("casilla", "");
                //aqui cambia el turno, por que ya se comio la pieza y este se manda para la zona de captura
                turnos = !turnos;
                 actualizarIndicadorTurno(); 
                 //para verificar que funcione el if
                    
                    
                    document.getElementById("capturadasBlancas").appendChild(piezaComida);
                movimiento.appendChild(piezaIMG);
                movimiento.append(" se movió de " + fila + columna + " a " + destino + " y comió ");
                movimiento.appendChild(piezaIMGComida);
                listaMovimientos.appendChild(movimiento);
                console.log("pieza blanca capturada")
                } else if (altPiezaComida === "negra") {
                    //lo mismo pasa aqui, pero para la pieza negra
                    const destino = casilla.id.replace("casilla", "");
                    turnos = !turnos;
                 actualizarIndicadorTurno(); 
                    console.log("pieza negra capturada")     

                    document.getElementById("capturadasNegras").appendChild(piezaComida);
                    //imprimo si la pieza comida es negra o blanca y la cual se movio (no supe como especificar la pieza comida, pero se sabe que es negra o blanca)

                movimiento.appendChild(piezaIMG);
                movimiento.append(" se movió de " + fila + columna + " a " + destino + " y comió ");
                movimiento.appendChild(piezaIMGComida);
                listaMovimientos.appendChild(movimiento);
                }     
                
                }

                casillaDestino.style.backgroundColor = ''
            }
            //lo mismo pasa aqui, puedo mostrar de que color es la pieza que se movio y a donde se movio
                movimiento.appendChild(piezaIMG);
                movimiento.append(" se movió de " + fila + columna + " a " + destino);
                listaMovimientos.appendChild(movimiento);

       //en caso de que no se come alguna pieza, este cambia el turno para poder mover la siguiente pieza del otro equipo
            turnos = !turnos;
            actualizarIndicadorTurno();
            console.log("magia")
        }

        for (let i = 0; i < posiblesPosiciones.length; i++) {
            const casillaDestino = document.querySelector(posiblesPosiciones[i]);
            if (casillaDestino != null) {
                console.log(casillaDestino)
                casillaDestino.style.backgroundColor = ''
                casillaDestino.style.border = ''
            }
        }


    })
})


