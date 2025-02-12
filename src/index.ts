import colors from 'colors'
import server from './server';

const port = process.env.PORT || 4000 // variables de entorno llamada puerto, se asigna el numero que nos asigne el servidor o el 4000 si no hay nada asignado

server.listen(port, () => {
    console.log(colors.magenta.italic('Servidor funcionando en el puerto:'), port);
})



