const mongoose=require('mongoose');
const plm=require('passport-local-mongoose')

const userSchema= mongoose.Schema({
    username:{
       type:String,
       require:true,
       unique:true
    },
    profilePic:{
       type:String
    },
    fullName:[{
            type:String,
            require:true
    }],
    following:[{
      type:mongoose.Schema.Types.ObjectId,
      ref:'user'
    }],
    followers:[{
      type:mongoose.Schema.Types.ObjectId,
      ref:'user'
    }],
    bio:{
      type:String
    }
})

userSchema.virtual('firstName',{
  get:()=>{
    return this.firstName.split(' ')[0]
  }
})

userSchema.virtual('lastName',{
  get:()=>{
    return this.lastName.split(' ')[1]
  }
})

userSchema.plugin(plm)

module.exports= mongoose.model('user',userSchema)