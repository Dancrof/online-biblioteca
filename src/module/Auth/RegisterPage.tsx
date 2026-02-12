import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { register as registerService } from "../../Services/AuthService";
import { EMAIL_REGEX } from "../../Config/constant";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [cedula, setCedula] = useState("");
  const [nombreCompleo, setNombreCompleo] = useState("");
  const [apellidoCompleto, setApellidoCompleto] = useState("");
  const [telefono, setTelefono] = useState("");
  const [dirreccion, setDirreccion] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Maneja el envío del formulario de registro
   * @param e Evento de envío del formulario
   */
  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!EMAIL_REGEX.test(correo)) {
      setError("Correo electrónico no válido.");
      return;
    }

    setSubmitting(true);
    try {
      await registerService({
        cedula: cedula.trim(),
        nombreCompleo: nombreCompleo.trim(),
        apellidoCompleto: apellidoCompleto.trim(),
        telefono: telefono.trim(),
        dirreccion: dirreccion.trim(),
        correo: correo.trim().toLowerCase(),
        contrasena,
      });
      navigate("/auth", { replace: true });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al registrarse. Intenta de nuevo.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-lg border-0" style={{ width: "100%", maxWidth: 480 }}>
        <div className="card-body p-4">
          <h3 className="text-center mb-4 fw-bold">Crear cuenta</h3>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label">Cédula</label>
                <input
                  type="text"
                  className="form-control"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  required
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Teléfono</label>
                <input
                  type="text"
                  className="form-control"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Nombre completo</label>
                <input
                  type="text"
                  className="form-control"
                  value={nombreCompleo}
                  onChange={(e) => setNombreCompleo(e.target.value)}
                  required
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Apellido completo</label>
                <input
                  type="text"
                  className="form-control"
                  value={apellidoCompleto}
                  onChange={(e) => setApellidoCompleto(e.target.value)}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label">Dirección</label>
                <input
                  type="text"
                  className="form-control"
                  value={dirreccion}
                  onChange={(e) => setDirreccion(e.target.value)}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label">Correo electrónico</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-envelope" />
                  </span>
                  <input
                    type="email"
                    className="form-control"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="col-12">
                <label className="form-label">Contraseña</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-lock" />
                  </span>
                  <input
                    type="password"
                    className="form-control"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    minLength={6}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 mt-3"
              disabled={submitting}
            >
              {submitting ? "Creando cuenta..." : "Registrarse"}
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
            ¿Ya tienes cuenta?{" "}
            <Link to="/auth" className="fw-semibold text-decoration-none">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
