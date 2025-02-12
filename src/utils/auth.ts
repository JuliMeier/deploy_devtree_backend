import bcrypt from 'bcrypt'

// hash de password
export const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt)
}

// chequeo de password
export const checkPassword = async (password: string, hashedPassword: string) => {
    return await bcrypt.compare(password, hashedPassword)
    
}