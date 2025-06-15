const express = require('express')
const cookieparser = require("cookie-parser")
const bcrypt = require('bcrypt')
const path = require('path');
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://Magdalena:magdamaki14@cluster0.uvqqml9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const app = express()
app.use(express.json())
app.use(cookieparser())
app.use(express.urlencoded({ extended: true }));


app.use(express.static('public')) // Esto me permite mostrar mis vistas html de manera mas sencilla

/*
//Funcionamiento de una cookie
 
app.get("/heartbeat", (req, res) =>{
    res.cookie("Galleta", "Chocolate",{
        httpOnly: true
    })
    res.send({"alive": true, "cookie": req.cookies})
})
 
 
console.log("Server start")
 
app.listen(8080, () =>{
    console.log("The server is listening")
})
 
*/


//index
app.get('/', (req, res) => {
    //Comando para mandar a la pagina principal
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})
app.get('/registrar', (req, res) => {
    //Comando para mandar a la pagina de registro
    res.sendFile(path.join(__dirname, 'public', 'registrar.html'))
})

app.post('/registrar', async (req, res) => {
    //Obtenemos las variables desde el form
    const { nombre, correo, confirmar, fechaNacimiento } = req.body;
    //Esta variable debe ser let porque despues cambiara a un hash
    let { contraseña } = req.body


    //usamos el await para que nos devuelva la contraseña no como una promesa
    contraseña = await hashearContraseña(contraseña);

    const nuevoUsuario = {
        nombre,
        correo,
        contraseña,
        fechaNacimiento,
        partidas: [], // Inicializamos un array para las partidas del usuario
        partidaActiva: null // Inicializamos la partida activa como null
    };
    if (await validaUsuario(nombre, correo)) {
        await agregarUsuario(nuevoUsuario)
        console.log("Se ha agregado el usuario de manera exitosa")
        res.redirect('/login');
    }
    else {
        console.log("No se ha podido crear este usuario, nombre o correo invalido/ mejor dicho, ya existe un usuario con ese nombre o correo")
    }

});


//Esta funcion es la que nos permite hashear la contraseña
async function hashearContraseña(contraseña) {
    //Este comando, bcrypt.hash, hashea la contraseña con un salt de 5
    const contraseñaHash = bcrypt.hash(contraseña, 5);
    return contraseñaHash
}

//Creación del cliente de mongodb
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

//Funcion para conectarse a la base de datos
async function agregarUsuario(nuevoUsuario) {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        //Crear un usuario para la base de datos

        //Accedemos a la base de datos prueba
        const database = client.db("Prueba");


        //Creamos la tabla usuarios
        const usuarios = database.collection("usuarios");

        const resultado = await usuarios.insertOne(nuevoUsuario)


        //Ahora viendo esto, deberia haber una validacion para que se cree el usuario
        if (resultado) {
            console.log("Se ha subido un usuario a la base de datos")
        }
        else {
            console.log("No se ha podido subir un usuario a la base de datos")
        }
        /*
        // Insertar el usuario en la tabla
        const resultado = await usuarios.insertOne(nuevoUsuario);
        // Mostrar confirmación
        console.log(`Usuario insertado con el id: ${resultado.insertedId}`);

        //Buscamos el usuario llamado Naruto Uzumaki
        let consulta = await usuarios.findOne({ "nombre": "Naruto Uzumaki" })
        console.log('Usuario encontrado: ', consulta)

        //Buscamos el usuario llamado julio lopez
        consulta = await usuarios.findOne({ "nombre": "Julio lopez" })
        console.log('Usuario encontrado: ', consulta)

        */

    } finally {
        await client.close();
    }
}

//Funcion para validar si el usuario existe
async function validaUsuario(nombre, correo) {
    let consultaNombre, consultaCorreo
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("has accedido a la base de datos para validar el usuario");

        //Accedemos a la base de datos prueba
        const database = client.db("Prueba");

        //almacenamos en una variable la tabla usuarios
        const usuarios = database.collection("usuarios");

        consultaNombre = await usuarios.findOne({ "nombre": nombre })
        consultaCorreo = await usuarios.findOne({ "correo": correo })

        if (consultaNombre || consultaCorreo) {
            return false
        }
        else {
            return true
        }
    }
    finally {
        await client.close();
        console.log("Adios dice el servidor")
    }

}

//Para dirigirse a la pagina del login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'))
})

// Funcion para evaluar si existe el usuario
// IMPORTANTE: debe ser async porque sino no funcina el await
//Pero el async debe estar al lado de (req, res)
app.post('/login', async (req, res) => {
    const { email, contraseña } = req.body
    console.log(email, contraseña)

    const usuario = await buscarUsuario(email)

    if (usuario) {

        const comparadorContraseña = await bcrypt.compare(contraseña, usuario.contraseña)

        if (comparadorContraseña) {
            //Acá estamos creando el token con el cual mantendremos los datos del usuario
            const token = jwt.sign(
                {
                    // Decimos que datos guardaremos en el token
                    id: usuario._id,
                    username: usuario.nombre
                },
                //Acá va la contraseña del token
                'Contraseña123',
                { expiresIn: '12h' }
            );
            console.log("Usuario y contraseña correctas, ingresando a la pagina")

            //Enviamos una cooki
            res.cookie('token', token, {
                //La hacemos httpOnly para que no se acceda desde js
                httpOnly: true,
                //aqui se coloca el secure para que la cookie solo se envie por https
                secure: false, // Cambiar a true si se usa HTTPS 
            });

            //Redireccionamos al index
            res.redirect('/indexV')

        }

    }
    else {
        return res.send("No se ha encontrado a dicho usuario");
    }

})





//Funcion para buscar al usuario en la base de dato y retornarlo
async function buscarUsuario(email) {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        //Crear un usuario para la base de datos

        //Accedemos a la base de datos prueba
        const database = client.db("Prueba");


        //Creamos la tabla usuarios
        const usuarios = database.collection("usuarios");

        const contraseñaUsuario = await usuarios.findOne({ "correo": email })

        if (contraseñaUsuario) {
            console.log("Se ha encontrado el usuario, devolviendo la contraseña")
            return contraseñaUsuario
        }

    }
    finally {
        await client.close();
        console.log("Adios dice el servidor")
    }

}
    // verificar JWT desde la cookie
//Funcion para verificar que el token es correctoAdd commentMore actions
function verificarToken(req, res, next) {

    //Obtenemos la cookie HTTPonly de jwt
    const token = req.cookies.token

    //Si el token no existe, redirecciona al login
    if (!token) {
        console.log("No puedes ingresar aquí")
        return res.redirect('/login')
    }

    try {
        //Usamos la funcion verify para decodificar los datos con la firma, en este caso harcodeada
        const usuario = jwt.verify(token, 'Contraseña123')

        //Guardamos el nombre de usuario para que se pueda usar en otras paginas
        req.usuario = usuario;
        next(); // seguimos a la siguiente función

    //Si hay algun error borrara el toke, y redirige al login
    } catch (err) {
        console.log("Token inválido")
        res.clearCookie('token')
        return res.redirect('/login')
    }
}


app.get('/indexv', verificarToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'indexV.html'))
})
app.get('/partida',verificarToken, (req, res) =>{
    res.sendFile(path.join(__dirname, 'public', 'partida.html'))
})
app.get('/crearpartida', verificarToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'crearpartida.html'));
});
app.get('/perfil', verificarToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'perfil1.html'));
})
app.get('/cerrarSesion', (req, res) => {
    // Borra la cookie de autenticación
    res.clearCookie('token');
    // Redirige al usuario a la página de inicio
    res.redirect('/');
});
app.get('/ReglayHistoria', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ReglayHistoria.html'));
});
app.get('/ReglayHistoriaV', verificarToken, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'ReglayHistoriaV.html'));
});
app.get('/desarrolladores', (req, res) => {  
    res.sendFile(path.join(__dirname, 'public', 'desarrolladores.html'));
});
app.get('/desarrolladoresV',verificarToken, (req, res) => {  
    res.sendFile(path.join(__dirname, 'public', 'desarrolladoresV.html'));
});
app.get('/invitar', verificarToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'buscarJugador.html'));
});
app.get('/invitarEspectador', verificarToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'invitarEspectador.html'));
});
app.get('/invitarJugador', verificarToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'invitarJugador.html'));
});


app.post('/invitarJugador', verificarToken, async (req, res) => {
    const { nombrePartida, jugador } = req.body;
    //console.log(nombrePartida, jugador)
    const partida = await buscarPartida(nombrePartida);
    if (partida) {
        // Verificamos si el jugador ya está en la partida
        if (partida.jugador2 === null) {
            partida.jugador2 = jugador; // Asignamos el jugador a la partida
            await actualizarPartida(partida);
            res.send("Jugador invitado exitosamente");
        } else {
            res.send("La partida ya tiene un segundo jugador");
        }
    } else {
        res.send("Partida no encontrada");
    }
})
//crear partida
app.post('/crearpartida', verificarToken, async (req, res) => {
const { nombrePartida, color } = req.body;
const nuevaPartida = {
    // Creamos un objeto con los datos de la partida
    nombreP: nombrePartida,
    creador: req.user.id,
    color: color,
    jugador2: null,
    espectadores: [], //lo unico que se me ocurre es que los espectadores sean un array
    invitaciones: [] //tengo que ver la manera de que los jugadores puedan invitar a otros jugadores y que si hay alun jugadorm que las invitaciones restantes se transformen en espectadores
  };
  const existe = await buscarPartida(nombrePartida);
// Verificamos si la partida ya existe
if (existe) {
    console.log("Ya existe una partida con ese nombre");
    res.redirect('/crearpartida');
}
else {
      agregarPartida(nuevaPartida);
       res.redirect('/invitar');
}
});
async function buscarPartida(nombrePartida) {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        //Accedemos a la base de datos prueba
        const database = client.db("Prueba");

        //almacenamos en una variable la tabla partidas
        const partidas = database.collection("partidas");

        consultaPartida = await partidas.findOne({ "nombreP": nombrePartida })

        if (consultaPartida) {
            return true
        }
        else {
            return false
        }
    }
    finally {
        await client.close();
        console.log("Adios dice el servidor")
    }

}

//una funcion que agregue una partida a la base de datos
async function agregarPartida(nuevaPartida) {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        //Accedemos a la base de datos prueba
        const database = client.db("Prueba");

        //Creamos la tabla partidas
        const partidas = database.collection("partidas");
const usuario = await buscarUsuario(nuevaPartida.creador);
        const resultado = await partidas.insertOne(nuevaPartida)

    
        if (resultado) {
            console.log("Se ha subido una partida a la base de datos")
        }
        else {
            console.log("No se ha podido subir una partida a la base de datos")
            res.send("Error al crear la partida");
        }

    } finally {
        await client.close();
    }
}

//Iniciamos el servidor
console.log("Server start")

app.listen(8080, () => {
    console.log("The server is listening")
})
