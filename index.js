const express = require('express')
const cookieparser = require("cookie-parser")
const bcrypt = require('bcrypt')
const path = require('path');
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId} = require('mongodb');
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
//crear partida
app.post('/crearpartida', verificarToken, async (req, res) => {
const { nombrePartida, color } = req.body;
 try {
        await client.connect();
        const db = client.db("Prueba");
        const usuarios = db.collection("usuarios");

        const usuarioId = new ObjectId(req.usuario.id);

        // Verificamos si el usuario ya tiene una partida activa
        const usuario = await usuarios.findOne({ _id: usuarioId });

        if (!usuario) {
            return res.send("Usuario no encontrado.");
        }

        if (usuario.partidaActiva) {
            return res.send("Ya tienes una partida activa. Elimina esa antes de crear otra.");
        }
  const existe = await buscarPartida(nombrePartida);
// Verificamos si la partida ya existe
if (existe) {
    console.log("Ya existe una partida con ese nombre");
    res.redirect('/crearpartida');
}
const nuevaPartida = {
    // Creamos un objeto con los datos de la partida
    nombreP: nombrePartida,
    creador: req.user.id,
    color: color,
    jugador2: null,
    espectadores: [], //lo unico que se me ocurre es que los espectadores sean un array
    invitaciones: [],
    EspectadorSI:[] //tengo que ver la manera de que los jugadores puedan invitar a otros jugadores y que si hay alun jugadorm que las invitaciones restantes se transformen en espectadores
  };
const agregador = await agregarPartida(nuevaPartida);
if (agregador) {
    // Actualizamos el usuario para que tenga la partida activa
    await usuarios.updateOne(
        { _id: usuarioId },
        { $set: { partidaActiva: agregador.insertedId } }
    );
    console.log("Partida creada exitosamente");
    res.redirect('/invitar');
} else {
    console.log("Error al crear la partida");
    res.send("Error al crear la partida");
}
    } catch (error) {
        console.error("Error al crear la partida:", error);
    } finally {
        await client.close();
    } });
    // buscar partida si existe
async function buscarPartida(nombrePartida) {
    try {
        await client.connect();
        const db = client.db("Prueba");
        const partidas = db.collection("partidas");

        const partida = await partidas.findOne({ nombreP: nombrePartida });
        return partida; // devuelve la partida o null
    } finally {
        await client.close();
    }
}
// Agregar nueva partida
async function agregarPartida(nuevaPartida) {
    try {
        await client.connect();
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
        const db = client.db("Prueba");
        const partidas = db.collection("partidas");

        const resultado = await partidas.insertOne(nuevaPartida);
        return resultado; // devuelve el resultado del insert
    } finally {
        await client.close();
    }
}
app.post('/invitarE', verificarToken, async (req, res) => {
    const { correoJugador } = req.body;
    try {
        await client.connect();
        const db = client.db("Prueba");
        const usuarios = db.collection("usuarios");
        const partidas = db.collection("partidas");

        const usuarioId = new ObjectId(req.usuario.id);

        // Buscar al usuario que invita (creador)
        const creador = await usuarios.findOne({ _id: usuarioId });
        if (!creador) {
            return res.send("Usuario no encontrado.");
        }
        // Verificar si el creador tiene una partida activa
        if (!creador.partidaActiva) {
            return res.send("No tienes una partida activa.");
        }
        // Buscar al espectador por correo
        const Espectador = await usuarios.findOne({ correo: correoJugador });
        if (!Espectador) {
            return res.send("Espectador no encontrado.");
        }
        // Verificar si el espectador ya está en la partida activa del creador
        const espectadorPartida = await partidas.findOne({ _id: new ObjectId(creador.partidaActiva), espectadores: new ObjectId(Espectador._id) });
        if (espectadorPartida) {
            return res.send("El espectador ya está en una partida activa.");
        }
        // Agregar al espectador a la partida
        const partida = await partidas.findOne({ _id: new ObjectId(creador.partidaActiva) });
        if (!partida) {
            return res.send("Partida no encontrada.");
        }
            partida.espectadores.push(Espectador._id); // Agregar el ID del espectador al array de espectadores
            await partidas.updateOne({ _id: new ObjectId(creador.partidaActiva) }, { $set: { espectadores: partida.espectadores } });
            console.log("Espectador agregado exitosamente");
            res.send("Espectador invitado exitosamente");
        
    } catch (error) {
        console.error("Error al invitar al espectador:", error);
        res.status(500).send("Error al invitar al espectador");
    } finally {
        await client.close();
    }
});
app.post('/invitarJ', verificarToken, async(req, res) => {
    const { correoJugador } = req.body;
try {
    await client.connect();
    const db = client.db("Prueba");
    const usuarios = db.collection("usuarios");
    const partidas = db.collection("partidas");

    const usuarioId = new ObjectId(req.usuario.id);
        // Buscar al usuario que invita
        const creador = await usuarios.findOne({ _id: usuarioId });
    // Buscar al usuario que invita
        if (!creador) {
            return res.send("Usuario no encontrado.");
        }

        // Verificar si el creador tiene una partida activa
        if (!creador.partidaActiva) {
            return res.send("No tienes una partida activa.");
        }

        // Buscar al jugador por correo
        const jugador = await usuarios.findOne({ correo: correoJugador });
        if (!jugador) {
            return res.send("Jugador no encontrado.");
        }
       const partida = await partidas.findOne({ _id: new ObjectId(creador.partidaActiva) });
       if (partida.jugador2) {
  // Ya hay un jugador, agregar como espectador
     partida.espectadores.push(jugador._id);
    await partidas.updateOne({ _id: new ObjectId(creador.partidaActiva) }, { $set: { espectadores: partida.espectadores } });
    return res.send("Ya hay un jugador en la partida. El invitado fue agregado como espectador.");
        }
        if (!partida) {
            return res.send("Partida no encontrada.");
        } else if (partida.jugador2) {
            return res.send("Ya hay un jugador en la partida.");
        }
        // Agregar al jugador a la partida
        partida.jugador2 = jugador._id; // Asignar el ID del jugador
        await partidas.updateOne({ _id: new ObjectId(creador.partidaActiva) }, { $set: { jugador2: partida.jugador2 } });
        console.log("Jugador agregado exitosamente");
        res.send("Jugador invitado exitosamente");
} catch (error) {
    console.error("Error al invitar al jugador:", error);
    res.status(500).send("Error al invitar al jugador");
} finally {
    await client.close();
}});

app.get('/accederPartida', verificarToken, async (req, res) => {
    try {
        await client.connect();
        const db = client.db("Prueba");
        const usuarios = db.collection("usuarios");
        const partidas = db.collection("partidas");
        // Obtener el ID del usuario desde el token
        const usuarioId = new ObjectId(req.usuario.id);

        // Buscar al usuario por su ID
        const usuario = await usuarios.findOne({ _id: usuarioId });
        if (!usuario) {
            return res.send("Usuario no encontrado.");
        }

const resultado = await partidas.find({
            $or: [
                { creador: usuarioId },
                { jugador2: usuarioId },
            ]
        }).toArray();
        res.json(resultado); // Enviar las partidas encontradas como respuesta
    } catch (error) {
        console.error("Error al acceder a la partida:", error);
        res.status(500).send("Error al acceder a la partida");
    } finally {
        await client.close();
    }
});
app.post('/eliminarPartida', verificarToken, async (req, res) => {
    try {
        await client.connect();
        const db = client.db("Prueba");
        const usuarios = db.collection("usuarios");
        const partidas = db.collection("partidas");

        // Obtener el ID del usuario desde el token
        const usuarioId = new ObjectId(req.usuario.id);

        // Buscar al usuario por su ID
        const usuario = await usuarios.findOne({ _id: usuarioId });
        if (!usuario) {
            return res.send("Usuario no encontrado.");
        }

        // Verificar si el usuario tiene una partida activa
        if (!usuario.partidaActiva) {
            return res.send("No tienes una partida activa.");
        }
                // Verificar si el usuario es el creador de la partida
        const partida = await partidas.findOne({ _id: new ObjectId(usuario.partidaActiva    ) });
        if (!partida) {
            return res.send("Partida no encontrada.");
        }
        if (partida.creador !== req.usuario.id) {
            return res.send("No tienes permiso para eliminar esta partida.");
        }
        // Eliminar la partida activa del usuario
        await partidas.deleteOne({ _id: new ObjectId(usuario.partidaActiva) });

        // Actualizar el usuario para eliminar la referencia a la partida activa
        await usuarios.updateOne({ _id: usuarioId }, { $set: { partidaActiva: null } });

        console.log("Partida eliminada exitosamente");
        res.send("Partida eliminada exitosamente");
    } catch (error) {
        console.error("Error al eliminar la partida:", error);
        res.status(500).send("Error al eliminar la partida");
    } finally {
        await client.close();
    }
});

app.post('/listainvitados', verificarToken, async (req, res) => {

});
//Iniciamos el servidor
console.log("Server start")

app.listen(8080, () => {
    console.log("The server is listening")
})
