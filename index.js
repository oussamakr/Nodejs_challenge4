const nodemailer = require("nodemailer");
const express = require("express");
const ejs = require("ejs");
const path = require("path");
const multer = require("multer");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

const dotenv = require("dotenv");
dotenv.config();

app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.json());

const port = process.env.Port || 4000;

app.listen(port, () => {
  console.log(`le serveur est en ecoute sur le port ${port}`);
});

// configuartion pour gerés les fichiers telechargés
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });

// creation de transporateur
const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.my_Email,
    pass: process.env.Password,
  },
});

// Routing
app.post("/send", upload.array("attachments", 10), (req, res) => {
  const { to, subject, firstname, lastname } = req.body;
  const attachments = req.files;

  // path de page html a envoyer
  const html_page = path.join(__dirname, "templates", "html_pg.html");

  // mettre en place les variable a utiliser avec ejs
  ejs.renderFile(html_page, { firstname, lastname }, (error, html) => {
    if (error) {
      console.log(error);
      return res.status(400).send(error);
    }
    const mailOptions = {
      from: "oussama.krayen@outlook.com",
      to: to,
      subject: subject,
      html: html,
      attachments: attachments,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        res.status(400).send(error);
      } else {
        console.log("E-mail envoyé: " + info.response);
        res.status(200).send(info.response);
      }
    });
  });
});

// Création d’une API qui permet d’envoyer un e-mail (sous le format texte)
// const nodemailer = require("nodemailer");

// const dotenv = require("dotenv");
// dotenv.config();

// const transporter = nodemailer.createTransport({
//   host: "smtp.office365.com",
//   port: 587,
//   secure: false,
//   requireTLS: true,
//   auth: {
//     user: process.env.my_Email,
//     pass: process.env.Password,
//   },
// });

// // Définir les options du message
// const mailOptions = {
//   from: "oussama.krayen@outlook.com",
//   to: "oussama.benkrayen@esprit.tn",
//   subject: 'Test d"envoi d"email depuis Outlook',
//   text: "Ceci est un test d'envoi d'email avec Node.js et nodemailer!",
// };

// // Envoyer le message
// transporter.sendMail(mailOptions, (error, info) => {
//   if (error) {
//     console.log(error);
//   } else {
//     console.log("E-mail envoyé: " + info.response);
//   }
// });
