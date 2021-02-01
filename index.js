const express = require('express')
const app = express()
const { auth } = require('./server/middleware/auth')
const { User } = require('./server/models/User')
const bodyParser = require('body-parser')
const cookieParser  = require('cookie-parser')
const config = require('./server/config/key')

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));

// application/json
app.use(bodyParser.json());
app.use(cookieParser());


const mongoose = require('mongoose')
const { urlencoded } = require('body-parser')
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then( ()=> console.log('MongDB Connected...'))
  .catch( err => console.log(err))


app.get('/', (req, res) => {
  res.send("Hello World! I\'m learn about Js")
})

app.get('/api/hello', (req,res) => {
  res.send("안녕하세요~~!")
})

app.post('/api/users/register', (req,res) => {
    // 회원가입할 떄 입력한 정보들을 Client에서 가져오면
    // 그것들을 데이터 베이스에 넣어준다.

    const user = new User(req.body)

    user.save((err, userInfo) => {
        if(err) return res.json({success: false, err})
        return res.status(200).json({
            success: true
        })
    })
})

app.post('/api/users/login', (req,res) => {
  // 요청된 이메일이 데이터베이스에 있는지 확인.s
    User.findOne({ email: req.body.email }, (err, user) => {
      if (!user) {
        return res.json({ 
          loginSuccess: false,
          message: "제공된 이메일에 해당하는 유저가 없습니다."
        })
      }
      // 있다면 비밀번호가 맞는 비밀번호 인지 확인.
      user.comparePassword(req.body.password, (err, isMatch) => {
        if (!isMatch) {
          return res.json({ loginSuccess: false, message: "비밀번호가 일치하지 않습니다." }), console.log(isMatch)
        }

         // 비밀번호까지 맞다면 토큰을 생성하기.
        user.generateToken((err, user) => {
          if(err) return res.status(400).send(err)
          
          // 토큰을 저장한다.  어디에?  쿠키, 로컬, 세션
            res.cookie("x_auth", user.token)
              .status(200)
              .json({loginSuccess: true, userId: user._id})
        })

      })


    })
 
})


// role 관련 규칙은 프로젝트마다 달라짐
// role 0 -> 일반유저    role 0이 아니면 관리자 
app.get('/api/users/auth', auth , (req, res) => {

  // 여기까지 미들웨어를 통과해 왔다는 얘기는 Authentication 이 True 라는 말.

    res.status(200).json({
      _id: req.user._id,
      idAdmin: req.user.role === 0 ? false : true,
      isAuth: true,
      email: req.user.email,
      name: req.user.name,
      lastname: req.user.lastname,
      role: req.user.role,
      image: req.user.image,
    })
})

app.get('/api/users/logout', auth , (req,res) => {
    User.findOneAndUpdate({ _id: req.user._id },
      { token: ""} 
      ,(err,user) => {
        if(err) return res.json({ success: false , err});
        return res.status(200).send({
          success: true
        }) 
      })
})



const port = 4000

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
}) 