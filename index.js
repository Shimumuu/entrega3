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


//Registro
app.get('/', (req, res) => {
    //Comando para mandar a la pagina del registro
    res.sendFile(path.join(__dirname, 'public', 'register.html'))
})

app.post('/registrar', async (req, res) => {
    //Obtenemos las variables desde el form
    const { nombre, apellido, correo, confirmar, fechaNacimiento } = req.body;
    //Esta variable debe ser let porque despues cambiara a un hash
    let { contraseña } = req.body


    //usamos el await para que nos devuelva la contraseña no como una promesa
    contraseña = await hashearContraseña(contraseña);

    const nuevoUsuario = {
        nombre,
        apellido,
        correo,
        contraseña,
        fechaNacimiento
    };
    if (await validaUsuario(nombre, correo)) {
        await agregarUsuario(nuevoUsuario)
        console.log("Se ha agregado el usuario de manera exitosa")
    }
    else {
        console.log("No se ha podido crear este usuario, nombre o correo invalido")
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
            });

            //Redireccionamos al index
            res.redirect('/index.html')

        }

    }
    else {
        return res.send("No se ha encontrado a dicho usuario");
    }

})





//Funcion para buscar al usuario en la base de dato y retornarlo
async function buscarUsuario(email) {
    let contraseñaUsuario
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


app.get('/index', (req, res) =>{
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.get('/partida', (req, res) =>{
    res.sendFile(path.join(__dirname, 'public', 'partida.html'))
})

console.log("Server start")

app.listen(8080, () => {
    console.log("The server is listening")
})
