import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

export const LoginPage = () => {

  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Maneja el envío del formulario de inicio de sesión
   * @param e Evento de envío del formulario
   */
  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ correo: email.trim().toLowerCase(), contrasena: password });
      navigate("/books", { replace: true });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al iniciar sesión. Intenta de nuevo.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-lg border-0" style={{ width: "100%", maxWidth: 420 }}>
        <div className="card-body p-4">
          <h3 className="text-center mb-4 fw-bold">Iniciar sesión</h3>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="mb-3">
              <label className="form-label">Correo electrónico</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  className="form-control"
                  placeholder="usuario@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-3">
              <label className="form-label">Contraseña</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Remember me */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="remember" />
                <label className="form-check-label" htmlFor="remember">
                  Recuérdame
                </label>
              </div>

              <a href="#" className="text-decoration-none small">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Button */}
            <button type="submit" className="btn btn-primary w-100 py-2" disabled={submitting}>
              {submitting ? "Entrando..." : "Entrar"}
            </button>

            {error && (
              <div className="alert alert-danger mt-3 py-2" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2" />
                {error}
              </div>
            )}
          </form>

          <hr className="my-4" />

          <p className="text-center mb-0">
            ¿No tienes cuenta?{" "}
            <Link to="/auth/register" className="fw-semibold text-decoration-none">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
