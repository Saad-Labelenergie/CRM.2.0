import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock } from "lucide-react";
import { auth, db } from '../../lib/firebase';
import { useNavigate } from "react-router-dom";
import logo from '/images/Logo Label Energie.jpg';
import { collection, query, getDocs, where } from "firebase/firestore";
import { hashPassword } from '../../lib/utils/password';

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Update the error state type
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Hash the password
      const hashedPassword = await hashPassword(password);

      // Query Firestore for user with matching email and hashed password
      const usersRef = collection(db, "users");
      const q = query(
        usersRef, 
        where("email", "==", email),
        where("password", "==", hashedPassword)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("Email ou mot de passe incorrect");
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      if (userData.status !== "active") {
        throw new Error("Compte désactivé");
      }

      localStorage.setItem("currentUser", JSON.stringify(userData));
      navigate("/");

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
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
            Entrez votre email et mot de passe
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
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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