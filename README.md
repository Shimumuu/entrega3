#Entrega 3 de Desarrollo web

El sistema debe permitir a los usuarios:
• Registrarse en el sitio web, almacenando los datos de usuario
en una base de datos MongoDB de acuerdo a las características
del formulario desarrollado anteriormente.
• Iniciar sesión con usuario-contraseña con autenticación basada en JWT, utilizando cookies HttpOnly para el almacenamiento seguro del token.
• Cerrar sesión de forma segura.
• Crear nuevas partidas de ajedrez:
• Genera un identificador único para cada partida.
• Cada partida tiene un único creador/propietario.
• No es necesario que la propiedad de la partida se pueda
transferir a otro usuario.
• El propietario de la partida es el único que puede invitar a
otros usuarios a participar.
• El propietario de la partida es uno de los dos jugadores, y
puede elegir el color de sus piezas (blancas o negras).
• Invitar a otros usuarios registrados a una partida existente:
• Se puede invitar a cualquier usuario registrado en el sistema.
• La invitación puede ser para jugar o para ser espectador.
• Una partida solo puede tener dos jugadores. El creador o
propietario es el jugador uno, el que acepta la invitación
como jugador es el jugador dos.
• Una partida puede tener múltiples invitaciones a jugar, el
primer jugador que acepte es el que se convierte en el
segundo participante.
• Todo invitado a jugar que no haya obtenido la posición
como el segundo jugador automáticamente su invitación
cambia a espectador.
• Se debe recordar a que jugador corresponde cada color
(blancas y negras).
• Acceder a partidas en las que el usuario esté registrado como
participante o espectador.
• Eliminar partidas en las que el usuario sea el creador.
• No es necesario enviar notificaciones de ningún tipo a los
usuarios. Estos deben poder ver sus invitaciones y partidas
disponibles directamente en la página principal del sitio.
2.2. Requisitos de seguridad y almacenamiento
• Las contraseñas de los usuarios deben almacenarse en la base
de datos de forma hasheada y salteada (salted hash), utilizando una función criptográfica segura (por ejemplo, bcrypt o
argon2).
• Dos usuarios no pueden compartir ni el nombre de usuario ni
el correo electrónico.
• El JWT debe ser firmado con una clave secreta segura y tener
un tiempo de expiración razonable.
• El JWT debe enviarse y almacenarse únicamente como cookie
HttpOnly. Puede obtener un 20 % de bono sobre la nota
(transferible a otras entregas si sobrepasa el 7) si hace la cookie
Secure.
• No se debe exponer el JWT en el frontend ni en almacenamiento local/sessionStorage.
• No es necesario proteger las rutas de las páginas con autenticación, pero si toda llamada a la API del juego.
• No es necesario almacenar el estado del tablero de ajedrez,
solo la gestión de usuarios y partidas.
