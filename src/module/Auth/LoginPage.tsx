import { useState } from "react";
import { Link } from "react-router";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ email, password });
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
            <button type="submit" className="btn btn-primary w-100 py-2">
              Entrar
            </button>
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
