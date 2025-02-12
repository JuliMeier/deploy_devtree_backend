import type { Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

// se declara para poder pasar el request entre ambos middlewares
declare global {
    namespace Express {
        interface Request {
            user?: IUser  //el signo ? es para que no sea obligatorio
        }
    }
}

export const authenticate = async (req, res, next) => {
    const bearer = req.headers.authorization

    if(!bearer) {
      const error = new Error('No autorizado')
      return res.status(401).json({error: error.message})
    }

    const [, token] = bearer.split(' ')
    
    if(!token) {
      const error = new Error('No autorizado')
      return res.status(401).json({error: error.message})
    }
    
    try {
      const result = jwt.verify(token, process.env.JWT_SECRET)
      if(typeof result === 'object' && result.id){
        const user = await (await User.findById(result.id).select('-password')) //'name handle email' es para que solo me devuelva esos campos, '-password' es para que no me devuelva el password
        if(!user){
          const error = new Error('El usuario no existe')
          return res.status(404).json({error: error.message})
        }
        req.user = user
        next() //si todo esta bien, continua con la siguiente funcion
      }
      
    } catch (error) {
      res.status(500).json({error: 'Token no valido'})
    }
}