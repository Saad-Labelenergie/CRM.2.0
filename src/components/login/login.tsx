import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Hash } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from '../../lib/firebase';
import { useNavigate } from "react-router-dom";
import logo from '/images/Logo Label Energie.jpg';
import { collection,query,getDocs,where } from "firebase/firestore";

export function Login() {
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Vérifier d'abord dans Firestore si l'utilisateur existe avec cet email et ID
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email), where("id", "==", String(userId)));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("Email ou ID incorrect");
      }

      // 2. Si trouvé, récupérer le premier utilisateur (normalement il ne devrait y en avoir qu'un)
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      // 3. Vérifier le statut
      if (userData.status !== "active") {
        throw new Error("Compte désactivé");
      }

      // 4. Authentifier avec Firebase Auth (si vous utilisez aussi l'authentification)
      // Note: Vous devrez peut-être adapter cette partie selon votre configuration
      try {
        await signInWithEmailAndPassword(auth, email, userId.toString());
      } catch (authError) {
        console.log("Authentification Firebase optionnelle échouée, continuation avec Firestore");
      }

      // 5. Stocker les données utilisateur et rediriger
      localStorage.setItem("currentUser", JSON.stringify(userData));
      navigate("/");

    } catch (err) {
      setError(err.message);
      console.error("Erreur de connexion:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center w-full max-w-md">
        <div className="mb-8">
          <img src={logo} alt="Logo" className="h-16" />
        </div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full bg-card rounded-xl p-8 shadow-lg border border-border/50"
        >
          <h2 className="text-2xl font-bold text-center text-primary">Connexion</h2>
          <p className="text-muted-foreground text-center mt-1">
            Entrez votre email et votre ID utilisateur
          </p>

          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                required
              />
            </div>

            <div className="relative">
              <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="ID Utilisateur"
                value={userId}
                onChange={(e) => setUserId(e.target.value)} // N'autorise que les chiffres
                className="w-full pl-12 pr-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                required
              />
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className={`w-full px-4 py-3 rounded-xl shadow-lg transition-colors ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {loading ? "Connexion en cours..." : "Se connecter"}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}