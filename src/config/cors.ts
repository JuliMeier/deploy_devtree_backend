import { CorsOptions } from 'cors'

export const corsConfig  = {
    origin: function(origin, callback) {

        const whiteList = [process.env.FRONTEND_URL]

        //se hace para que no tenga error de cors desde thunderclient o postman para la autenticacion 
        //debe ejecutarse el script npm run dev:api
        
        if(process.argv[2] === '--api'){
            whiteList.push(undefined)
        }

        if(whiteList.includes(origin)){
            
            callback(null, true)
        } else {
            callback(new Error('Error de CORS'))
            
        }
        
    }
}

