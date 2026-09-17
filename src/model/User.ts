import mongoose, {Schema, Document} from "mongoose";



export interface Message {
    _id: string;
    content: string;
    createdAt: Date;
}

const MessageSchema: Schema<Message> = new Schema ({
    content: {
        type: String,
        required: [true, "Message content is required"],
        trim: true,
        maxlength: [500, "Message must be at most 500 characters"]
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }
})


export interface User extends Document {
    username: string;
    email: string;
    password: string;
    verifyCode: string;
    verifyCodeExpire: Date;
    isActive: boolean;
    isAcceptingMessage: boolean;
    messages: Message[]
}


const UserSchema: Schema<User> = new Schema ({
    username: {
        type: String,
        required: [true, "Username is required"],
        trim: true,
        unique: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'please use valid email']
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    verifyCode: {
        type: String,
        required: false,
        default: ''
    },
    verifyCodeExpire: {
        type: Date,
        required: false,
    },
    isActive: {
        type: Boolean,
        default: false
    },
    isAcceptingMessage: {
        type: Boolean,
        default: true
    },
    messages: [MessageSchema] 


},
{
    timestamps: true
})

const UserModel  = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User", UserSchema);

export default UserModel;