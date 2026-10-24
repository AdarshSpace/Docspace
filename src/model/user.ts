import mongoose, { Schema, models, model } from "mongoose";
import bcrypt from "bcrypt";


export interface IUser{
    
    email: string,
    password: string,
    _id?: mongoose.Types.ObjectId,
}

const userSchema = new Schema <IUser>(
    { 
        email: {
            type: String, 
            required: [true, 'Please provide an email'],
            unique: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
        },

        password: {
            type: String,
            required: true,
            minlength: [6, 'Password must be atleast 6 characters long'],
            select: false
        },
    }, {
        timestamps: true
    }
)


userSchema.pre('save', async function () {
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10);
    }
})

const User =  models?.User || model<IUser>("User", userSchema)

export default User