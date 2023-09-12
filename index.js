var express = require('express');
var router = express.Router();

var users=require('../routes/users')
var passport=require('passport')
var localStrategy=require('passport-local')
const mongoose=require ('mongoose')
passport.use(new localStrategy(users.authenticate()))
const postModel=require('./post')
const story=require('./story')

mongoose.connect('mongodb://0.0.0.0/Insta_clone').then(result=>{
     console.log("connected to database");
}).catch(err=>{
   console.log(err);
})

router.get('/register',(req,res,next)=>{
     res.render('register');
})

router.get('/login',(req,res,next)=>{
  res.render('login');
})

router.post('/register',(req,res,next)=>{
var newUser={

 username:req.body.username,
 fullName:req.body.fullName,
 profilePic:req.body.profilePic,
 bio:req.body.bio,
};
   users
   .register(newUser,req.body.password)
    .then((result)=>{
       passport.authenticate('local')(req,res,()=>{
             res.redirect('/');
       });
    })
    .catch((err)=>{
        res.send(err);
    });

});



router.post(
    '/login',
    passport.authenticate('local',{
       successRedirect:'/',
       failureRedirect:'/login',
    }),
    (req,res,next)=>{}
);


router.get('/logout',(req,res,next)=>{
      if(req.isAuthenticated())
        req.logout((err)=>{
             if(err) res.send(err);
             else res.redirect('/');
        });
      else{
         res.redirect('/');
      }  
});


function isloggedIn(req,res,next){
    if(req.isAuthenticated()) return next();
    else res.redirect('/login');
}

router.post('/createPost',isloggedIn, async (req,res,next)=>{
           var newpost= new postModel({
             media:req.body.media,
             caption:req.body.caption,
             mediaType:'image',
             user:req.user
           })

           await newpost.save()
           res.send(newpost)
})

router.get('/like/:postId',isloggedIn,async (req,res,next)=>{
    var currentPost= await postModel.findById(req.params.postId);

    var isalreadyLiked=currentPost.Likes.includes(req.user._id)
    console.log(isalreadyLiked);
    if(isalreadyLiked){
      currentPost.Likes.pull(req.user._id);
    }else{
      currentPost.Likes.push(req.user._id);
    }

    await currentPost.save();
    res.redirect('/')
})




/* GET home page. */
router.get('/',isloggedIn, async function(req, res, next) {
     
     const stories=await story.find().populate('user')
     var allPosts=await  postModel.find().populate('user')
     res.render('index',{allPosts,user:req.user,stories});
   
});

router.get('/follow/:userId',isloggedIn,async (req,res,next)=>{
   var currentUser=await users.findById(req.user._id);
   var oppositeUser=await users.findById(req.params.userId)

   var isAlreadyFollowed=oppositeUser.followers.includes(currentUser._id)
   if(isAlreadyFollowed){
      oppositeUser.followers.pull(currentUser._id)
      currentUser.following.pull(oppositeUser._id)
   }else{
        oppositeUser.followers.push(currentUser._id)
        currentUser.following.push(oppositeUser._id)
   }
   oppositeUser.save()
   currentUser.save()

   res.redirect('/')
})

router.post('/createStory',isloggedIn,async (req,res,next)=>{
        var newStory=new story({
           media:req.body.media,
           caption:req.body.caption,
           user:req.user._id
        })

        await newStory.save()
        res.redirect('/')
})

module.exports = router;
