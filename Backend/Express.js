import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import admin from "firebase-admin";
import { readFile } from "fs/promises";

// Initialisation Firebase admin (via un fichier de clé JSON, optionnel si t'es en local)
const serviceAccount = JSON.parse(
  await readFile(new URL('./serviceAccountKey.json', import.meta.url))
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("email", "==", email).get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "Email ou mot de passe incorrect" });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    const match = await bcrypt.compare(password, userData.password);
    if (!match) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    if (userData.status !== "active") {
      return res.status(403).json({ message: "Compte désactivé" });
    }

    delete userData.password;
    return res.status(200).json({ user: userData });

  } catch (error) {
    console.error("Erreur serveur :", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`✅ Serveur d'authentification lancé sur http://localhost:${PORT}`);
});
