import express, { Request, Response } from 'express'; 
import { validationResult } from 'express-validator';
import formidable from 'formidable';
import { v4 as uuid } from 'uuid';
import User from '../models/User';
import { checkPassword, hashPassword } from '../utils/auth';
import { generateJWT } from '../utils/jwt';
import cloudinary from '../config/cloudinary';

export const createAccount = async (req: any, res: any) => {
  // Handle validation errors
  //   const errors = validationResult(req);
  //   if (!errors.isEmpty()) {
    //     return res.status(400).json({ errors: errors.array() });
    //   }
    
    try {
      // Extract user data from request body
      const { email, password, handle } = req.body;
      
      // Check for existing email
      const existingEmailUser = await User.findOne({ email });
      if (existingEmailUser) {
        throw new Error('El usuario con ese email ya esta registrado');
      }
      
      // Check for existing handle (if handle validation is required)
      if (handle) {
        const existingHandleUser = await User.findOne({ handle });
        if (existingHandleUser) {
          throw new Error('Nombre de usuario no disponible');
        }
      }
      
      // Create new user instance
      const user = new User(req.body);
      
      // Hash password securely
      user.password = await hashPassword(password);
      
      // Set handle if provided (optional)
      if (handle) {
        user.handle = handle;
      }
      
      // Save the user to the database
      await user.save();
      
      // Send successful registration response
      res.status(201).json({ message: 'Registro creado correctamente' });
    } catch (error) {
      // Handle errors gracefully
      console.error(error); // Log the error for debugging
      res.status(500).json({ error: error.message }); // Send a generic error response
    }
  };
  
  
  
  
  export const login = async (req, res) => {
    //manejando errorres
    let errors = validationResult(req)
    if(!errors.isEmpty()){
      return res.status(400).json({errors: errors.array()})
    }
    
    const { email, password } = req.body
    
    //Revisar si el usuario esta registrado
    const user = await User.findOne({email})
    if(!user) {
      const error = new Error('El usuario no existe')
      return res.status(404).json({error: error.message})
    }
    
    //Comprobar el password
    const isPasswordCorrect = await checkPassword(password, user.password)
    if(!isPasswordCorrect){
      const error = new Error('Contraseña incorrecta')
      return res.status(401).json({error: error.message})
    }
    
    const token = generateJWT({id: user._id})
    res.send(token)
    
  }

  //deberia ser res: Response, pero uso el any para que me funcione y no salga error al compilar ts
  export const getUser = async (req : Request, res : any) => {
    res.json(req.user)
  }

  export const updateProfile = async (req: Request, res: any) => {
    try {
        const { description, links } = req.body
        const handle = req.body.handle
        if (handle) {
          const existingHandleUser = await User.findOne({ handle });
          if (existingHandleUser && existingHandleUser.email !== req.user.email) {
            
            const error = new Error('Nombre de usuario no disponible')
            return res.status(409).json({error: error.message})
          }
        }

        // Actualizar el usuario
        req.user.description = description
        req.user.handle = handle
        req.user.links = links
        await req.user.save()
        res.send('Perfil actualizado correctamente')

    } catch (e) {
        const error= new Error('Hubo un error')
        return res.status(500).json({error: error.message})
    }
  }

  export const uploadImage = async (req: Request, res: any) => {
    const form = formidable({ multiples: false });
    
    try {
      form.parse(req, (error, fields, files)=> {
        console.log()

        cloudinary.uploader.upload(files.file[0].filepath, { public_id: uuid()}, async function(error, result)
      {
        if(error) {
          const error = new Error('Hubo un error al subir la imagen')
          return res.status(500).json({error: error.message})
        }
        if(result) {
          req.user.image = result.secure_url
          await req.user.save()
          res.json({image: result.secure_url})
        }
      } )
      })

  } catch (e) {
    const error= new Error('Hubo un error') 
    return res.status(500).json({error: error.message})
  }

  }

  export const getUserByHandle = async (req: Request, res: any) => {
    try {
      const { handle } = req.params;
      const user = await User.findOne({ handle }).select('-_id -__v -email -password')

      if(!user) {
        const error = new Error('El usuario no existe')
        return res.status(404).json({error: error.message})
      }

      res.json(user)
    } catch (e) {
      const error = new Error('Hubo un error')
      return res.status(500).json({error: error.message})
    }
  }

  export const searchByHandle = async (req: Request, res: any) => {
    try {
        const { handle } = req.body
        const userExists = await User.findOne({ handle })
        if(userExists){
          const error = new Error(`${handle} ya esta registrado`)
          return res.status(409).json({error: error.message})
        }
        res.send(`${handle} esta disponible`)
      } catch (e) {
      const error = new Error('Hubo un error')
      return res.status(500).json({error: error.message})
    }
  }



  
  // version codigo con Juan no me funciono
  
  // import { Request, response, Response } from "express";
  // import { validationResult } from "express-validator";
  // //import slug from 'slug'
  // import User from "../models/User";
  // import { hashPassword } from "../utils/auth";
  
  // export const createAccount = async (req: any, res: any) => {
  
  //   //manejando errorres
  
  //   let errors = validationResult(req);
  
  //   if (!errors.isEmpty()) {
  //     return res.status(400).json({ errors: errors.array() });
  //   }
  //   return;
  //   const { email, password } = req.body;
  
  //   const userExists = await User.findOne({ email });
  //   if (userExists) {
  //     const error = new Error("El usuario con ese email ya esta registrado");
  
  //     return res.status(409).json({ error: error.message });
  //   }
  
  //   const slug = require("slug");
  
  //   const handle = slug(req.body.handle, "");
  
  //   const handleExists = await User.findOne({ handle });
  
  //   if (handleExists) {
  //     const error = new Error("Nombre de usuario no disponible");
  
  //     return res.status(409).json({ error: error.message });
  //   }
  
  //   const user = new User(req.body);
  
  //   user.password = await hashPassword(password);
  
  //   user.handle = handle;
  
  //   await user.save();
  
  //   res.status(201).send("Registro creado correctamente");
  // };