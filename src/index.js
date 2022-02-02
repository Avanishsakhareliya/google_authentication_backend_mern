const express = require("express");
let nodemailer = require('nodemailer');
require("./Connect/Connect")
const Authentication = require("./schema/schema");
const { OAuth2Client } = require('google-auth-library')
const jwt = require("jsonwebtoken")
var cors = require('cors')
const bcrypt = require('bcrypt');
const router = express();
router.use(express.json())
router.use(cors())

let transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: "avanishsakhareliya.bvminfotech@gmail.com",
        pass: "bvm@12345",
        clientId: "180742456059-ckh0kpd2rsqnrn777evc6c0ic1g98npu.apps.googleusercontent.com",
        clientSecret: "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 "
    }
});

console.log("transporter--------------->", transporter);
transporter.verify(function (error, success) {
    if (error) {
        console.log(error);
    } else {
        console.log("Server is ready to take our messages!", success);
    }
})
const TOKEN_KEY = "avanishsakhreliyaashvinbhai";

const client = new OAuth2Client("180742456059-55cfhqchucn7s4ng7usuquk6qfcai5ri.apps.googleusercontent.com", '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', 'http://localhost:3000/');


router.post("/email", (req, res) => {
    const { text } = req.body
    var mail = {
        from: "avanishsakhareliya.bvminfotech@gmail.com",
        to: "gauravparekh.bvminfotech@gmail.com",
        message: "Welcome to Gmail",
        text: text
    }
    console.log("mail-------------------->>", mail);
    transporter.sendMail(mail, (err, data) => {
        if (err) {
            console.log(err);

        } else {
            console.log(data);
            res.send(data);
        }
    })
})

router.get("/", (req, res) => {
    res.send("hello")
})

router.post("/signup", async (req, res) => {
    try {
        const { username, email, password, c_password } = req.body


        console.log("email", email);
        var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        if (email.match(validRegex)) {
            console.log("Valid email address!");

            let user_email = await Authentication.findOne({ email });

            if (user_email) {
                return res.status(400).json({ massage: 'User with the provided email already exist.' });
            }
            else {

                if (password === c_password) {
                    const saltRounds = 10;
                    const pass = await bcrypt.hash(password, saltRounds);
                    const c_pass = await bcrypt.hash(c_password, saltRounds);
                    var tokens = jwt.sign({ email }, TOKEN_KEY, {
                        expiresIn: 86400 // expires in 24 hours
                    });

                    const userdata = await Authentication.create({
                        username, email, password: pass, c_password: c_pass, token: tokens
                    })
                    userdata.save();
                    res.send(userdata)
                } else {
                    console.log("pass not matcdh");
                }
            }
        }
        else {
            console.log("Invalid email address!");
            return res.status(400).send({ massage: 'invalid email address ! please enter valid.' });
        }

    }
    catch (err
    ) {
        console.log(err)
    }
})
router.post("/login", async (req, res) => {

    try {
        const { email, password } = req.body
        const finduser = await Authentication.findOne({ email });
        console.log("finduser", finduser);
        if (finduser) {
            const comper = await bcrypt.compare(password, finduser.password);
            var tokens = jwt.sign({ email }, TOKEN_KEY, {
                expiresIn: 86400 // expires in 24 hours
            });
            finduser.token = tokens

            await finduser.save();
            if (comper) {
                res.json({ massage: "successfull login", token: finduser.token })
            } else {
                res.json({ massage: "invalid data" })
            }
        }
        else {
            res.json({ massage: "invalid user" })
        }
    }
    catch (err) {
        console.log(err)
    }
})

// router.post("/api/googlelogin", async (req, res) => {
//     try {

//         const { token } = req.body
//         console.log("token----------->",token)
//         console.log("client--------->",client)
//         const ticket = await client.verifyIdToken({
//             idToken: 123123,
//             audience: "180742456059-55cfhqchucn7s4ng7usuquk6qfcai5ri.apps.googleusercontent.com"
//         });
//         console.log("ticket", ticket);
//         // const { name, email, picture } = ticket.getPayload();
//         // const user = await db.user.upsert({
//         //     where: { email: email },
//         //     update: { name, picture },
//         //     create: { name, email, picture }
//         // })
//         // req.session.userId = user.id
//         // res.status(201)
//         // res.json(user)
//     } catch (error) {
//         console.log(error);
//     }
// })

router.post("/api/googlelogin", async (req, res) => {
    try {

        const { token } = req.body
        console.log("token----------->", token)
        //  console.log("userObj----------->",userObj)
        console.log("client--------->", client)
        const ticket = await client.verifyIdToken({
            idToken: token.id_token,
            audience: "180742456059-55cfhqchucn7s4ng7usuquk6qfcai5ri.apps.googleusercontent.com"
        });
        console.log("ticket-------->", ticket);
        // console.log("clieny id-------->", client._clientId);

        const { name, email, picture } = ticket.getPayload();
        const user = await Authentication.create({
            email, username: name, password: "", c_password: "", picture
        })
        // user.save()

        console.log("user-----------> ", user);
        // req.session.userId = user.id
        // res.status(201)
        // res.json(user)

    } catch (error) {
        console.log(error);
    }
})
router.use(async (req, res, next) => {
    const user = await db.user.findFirst({ where: { id: req.session.userId } })
    req.user = user
    next()
})

router.listen(4000, () => {
    console.log("port is listing");
})
