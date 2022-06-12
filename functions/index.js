/* eslint-disable camelcase */
/* eslint-disable max-len */
/* eslint-disable no-undef */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors({origin: true}));

// firebase admin

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

/* ----------------------------Register----------------------*/
app.post("/register", (req, res) => {
  (async () => {
    try {
      const data = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        alergi: req.body.alergi};
      await db.collection("register").doc().set(data);
      return res.json({status: "success", data: {register: data}});
    } catch (error) {
      console.log(error);
      res.status(500).send({status: "Failed", msg: error});
    }
  })();
});

// Login
app.post("/login", (req, res) => {
  // eslint-disable-next-line camelcase
  (async () => {
    try {
      /* do {
        const email = req.body.email;
        const password =req.body.password;
        await db.collection("register").doc().set(email, password);
      }
      while (
        query = db.collection("register").where("email", "==", email, "&&", "password", "==", password));
      return res.json({status: "success", data: {register: data}});*/
      const email = req.body.email;
      const password =req.body.password;
      const query = db.collection("register").where("email", "==", email, "&&", "password", "==", password);
      const querySnapshot = await query.get();
      if (querySnapshot.size > 0) {
        res.json({status: "Sukses Login", loginResult: querySnapshot.docs[0].data()});
      } else {
        res.json({status: "Not found"});
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({status: "Failed", msg: error});
    }
  })();
});

/* ----------------------------HISTORY----------------------*/
// create API_History
app.post("/history", (req, res) => {
  (async () => {
    try {
      await db.collection("history").doc(`/${Date.now()}/`).create({
        id: Date.now(),
        nama_makanan: req.body.nama_makanan,
        komposisi: req.body.komposisi,
        rekomendasi: req.body.rekomendasi,

      });

      return res.status(200).send({status: "Success", msg: "Data Saved"});
    } catch (error) {
      console.log(error);
      res.status(500).send({status: "Failed", msg: error});
    }
  })();
});

// Get Data API_History
app.get("/history/data", (req, res) => {
  (async () => {
    try {
      const query = db.collection("history");
      const response = [];
      await query.get().then((querySnapshot) => {
        const docs = querySnapshot.docs;
        for (const doc of docs) {
          const selectedItem = {
            id_historys: doc.id,
            historys: doc.data(),
          };
          response.push(selectedItem);
        }
        return response;
      });
      return res.status(200).send(response);
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

// GET data from API register and API history
app.get("/api/read/:history_id", (req, res) => {
  (async () => {
    try {
      const document = db.collection("history").doc(req.params.history_id);
      const item = await document.get();
      const response = item.data();
      return res.status(200).send(response);
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});


// get data
/* app.get("/hello", (req, res) => {
  return res.status(200).send("hello world");
});*/

exports.app = functions.region("asia-southeast2").https.onRequest(app);


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
