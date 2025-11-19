import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email:{
            type:String,
            required:true,
            unique:true
        },
        fullName:{
            type:String,
            required:true
        },
        password:{
            type:String,
            required:true,
            minlength:6
        },
        profilePic:{
            type:String,
            default:""
        },
        bio: {
            type: String,
            default: ""
        },
        website: {
            type: String,
            default: ""
        },
        location: {
            type: String,
            default: ""
        },
        wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GameUpload",
      },
    ],

    },
    {
        timestamps:true
    }
)

const User = mongoose.model("User",userSchema)

export default User;