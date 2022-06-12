const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')

const TWO_HOURS =1000 * 60 * 60 * 2
const {
    PORT = 3000,
    NODE_ENV = 'development',

    SESS_NAME = 'sid',
    SESS_SECRET = 'nil',
    SESS_LIFETIME = TWO_HOURS
} = process.env

const IN_PROD = NODE_ENV === 'production'
const users = [
    { id: 1, name: 'Nikita',email: 'nikita0709@gmail.com' , password: 'secret'},
    { id: 2, name: 'Sneha',email: 'sneha1209gmail.com' , password: 'secret'},
    { id: 3, name: 'Riya',email:  'riya127@gmail.com' , password: 'secret'},
]
const app = express()
app.use(bodyParser.urlencoded({
    extended:true
}))

app.use(session({
    name: SESS_NAME,
    resave:false,
    saveUninitialized:false,
    secret: SESS_SECRET,
    cookie:{
        maxAge:SESS_LIFETIME,
        sameSite: true,
        secure: IN_PROD      // true if node env = production
        
    }
}))

const redirectLogin = (req,res,next) =>{
    if(!req.session.userId){
        res.redirect('/login')
    }
    else{
        next()
    }
}

const redirectHome = (req,res,next) =>{
    if(req.session.userId){
        res.redirect('/dashboard')
    }
    else{
        next()
    }
}

app.use((req,res,next)=>{
    const {userId}= req.session
    if(userId){
        res.locals.user = users.find(user => user.id === userId)
    }
    next()
})

app.get('/',(req,res)=>{
      const {userId} = req.session
      console.log(userId)
      res.send(`
        <h1>WELCOME</h1>
        ${userId ?`
           <a href = '/dashboard'>Dashboard</a>
           <form method = 'post' action ='/logout'>
               <button>Logout</button>
            </form>
            `:`
            <a href = '/login'>Login</a>
            <a href = '/register'>Register</a>
       `}
    `)
})

app.get('/dashboard',redirectLogin,(req,res)=>{
    const { user } = res.locals
    // console.log(user)
    res.send(`
        <h1>Welcome back</h1>
        <a href ='/'>Main Page</a>
        <ul>
           <li> Name: ${user.name}</li>
           <li> Email: ${user.email}</li>
        </ul>
    `)
})

app.get('/login',redirectHome,(req,res)=>{
    res.send(`
         <h1>Login</h1>
         <form method = 'post' action ='/login'>
             <input type ='email' name ='email' placeholder = 'Email' required />
             <input type ='password' name ='password' placeholder = 'Password' required />
             <input type ='submit'>
         </form>
         <a href = '/register'>Register</a>
    `)

})

app.get('/register',redirectHome,(req,res)=>{
    res.send(`
    <h1>Register</h1>
    <form method = 'post' action ='/register'>
        <input type ='name' name ='name' placeholder = 'Name' required />
        <input type ='email' name ='email' placeholder = 'Email' required />
        <input type ='password' name ='password' placeholder = 'Password' required />
        <input type ='submit'/>
    </form>
    <a href = '/login'>Login</a>
`) 
})

app.post('/login',redirectHome,(req,res)=>{
    const {email,password} = req.body

    if(email && password){
        const user = users.find(
            user => user.email === email && user.password === password
        )
        if(user){
            req.session.userId = user.id
            return res.redirect('/dashboard')
        }
    }
    res.redirect('/login')
})

app.post('/register',redirectHome,(req,res)=>{
    if (name && email && password){
        const exits = user.some(
            user => user.email === email
        )

        if(!exits){
            const user ={
                id:users.length + 1,
                name,
                email,
                password
            }
            users.push(user)
            req.session.userId = user.id
            return res.redirect('/dashboard')
        }
    }
    res.redirect('/register')
})

app.post('/logout',redirectLogin,(req,res)=>{
    req.session.destroy(err=>{
        if(err){
            return res.redirect('/dashboard')
        }
        res.clearCookie(SESS_NAME)
        res.redirect('/login')
    })
})

app.listen(PORT,()=>{console.log(`http://localhost:${PORT}`)})