import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { register as registerService } from "../../Services/AuthService";
import {
  CEDULA_REGEX,
  EMAIL_REGEX,
  ONLY_NUMBERS_REGEX,
  PHONE_MAX_LENGTH,
  PHONE_REGEX,
} from "../../Config/constant";

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

  const handleCedulaChange = (value: string) => {
    if (value === "" || ONLY_NUMBERS_REGEX.test(value)) {
      setCedula(value.slice(0, 10));
    }
  };

  const handleTelefonoChange = (value: string) => {
    const sanitized = value
      .replace(/[^\d+]/g, "")
      .replace(/(?!^)\+/g, "")
      .slice(0, PHONE_MAX_LENGTH);

    if (sanitized === "" || PHONE_REGEX.test(sanitized) || sanitized === "+") {
      setTelefono(sanitized);
    }
  };

  /**
   * Maneja el envío del formulario de registro
   * @param e Evento de envío del formulario
   */
  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const cedulaNormalizada = cedula.trim();
    const telefonoNormalizado = telefono.trim();

    if (!CEDULA_REGEX.test(cedulaNormalizada)) {
      setError("La cédula debe tener exactamente 10 números (puede iniciar con 0). Ej: 0850054347.");
      return;
    }

    if (!PHONE_REGEX.test(telefonoNormalizado)) {
      setError("El teléfono debe tener formato válido, por ejemplo: +593979979736 (máx. 13 caracteres).");
      return;
    }

    if (!EMAIL_REGEX.test(correo)) {
      setError("Correo electrónico no válido.");
      return;
    }

    setSubmitting(true);
    try {
      await registerService({
        cedula: cedulaNormalizada,
        nombreCompleo: nombreCompleo.trim(),
        apellidoCompleto: apellidoCompleto.trim(),
        telefono: telefonoNormalizado,
        dirreccion: dirreccion.trim(),
        correo: correo.trim().toLowerCase(),
        contrasena,
      });
      navigate("/auth", {
        replace: true,
        state: { success: "Usuario registrado con éxito. Ahora puedes iniciar sesión." },
      });
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
                  onChange={(e) => handleCedulaChange(e.target.value)}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  required
                  placeholder="Ej: 0888888888"
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Teléfono</label>
                <input
                  type="text"
                  className="form-control"
                  value={telefono}
                  onChange={(e) => handleTelefonoChange(e.target.value)}
                  inputMode="tel"
                  pattern="\+?[0-9]{1,12}"
                  maxLength={PHONE_MAX_LENGTH}
                  required
                  placeholder="Ej: +593999999999"
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
                  placeholder="Ej: Juan Carlos"
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
                  placeholder="Ej: Quintero Zabaleta"
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
                  placeholder="Ej: Av. Amazonas 1234"
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
                    placeholder="Ej: correo@ejemplo.com"
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
                    placeholder="Ej: ********"
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
