import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { getUsuarioById, patchUsuario, type ProfileUpdatePayload } from "../../Services/UserService";
import { EMAIL_REGEX } from "../../Config/constant";
import "./Styles/CreateUser.css";

type ProfileForm = ProfileUpdatePayload & { nuevaContrasena?: string };

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user: authUser, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileForm>();

  const nuevaContrasena = watch("nuevaContrasena");
  const canSubmit = isDirty || (nuevaContrasena != null && String(nuevaContrasena).trim().length > 0);

  useEffect(() => {
    if (!authUser?.id) {
      navigate("/auth", { replace: true });
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const profile = await getUsuarioById(authUser.id);
      if (cancelled) return;
      if (profile) {
        reset({
          nombreCompleo: profile.nombreCompleo ?? "",
          apellidoCompleto: profile.apellidoCompleto ?? "",
          telefono: profile.telefono ?? "",
          dirreccion: profile.dirreccion ?? "",
          correo: profile.correo ?? "",
          nuevaContrasena: "",
        });
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [authUser?.id, navigate, reset]);

  const onSubmit = async (data: ProfileForm) => {
    setSubmitError(null);
    if (!authUser?.id) return;
    const payload: ProfileUpdatePayload = {
      nombreCompleo: data.nombreCompleo?.trim(),
      apellidoCompleto: data.apellidoCompleto?.trim(),
      telefono: data.telefono?.trim(),
      dirreccion: data.dirreccion?.trim(),
      correo: data.correo?.trim().toLowerCase(),
    };
    if (data.nuevaContrasena?.trim()) {
      payload.contrasena = data.nuevaContrasena.trim();
    }
    try {
      const updated = await patchUsuario(authUser.id, payload);
      if (updated) {
        updateUser({
          nombreCompleo: updated.nombreCompleo,
          apellidoCompleto: updated.apellidoCompleto,
          telefono: updated.telefono,
          dirreccion: updated.dirreccion,
          correo: updated.correo,
        });
        navigate("/books", { replace: true });
      } else {
        setSubmitError("No se pudo actualizar el perfil.");
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error al guardar. Intenta de nuevo.");
    }
  };

  if (loading) {
    return (
      <main className="create-user">
        <div className="container-lg py-4">
          <p className="text-muted">Cargando perfil…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="create-user">
      <div className="container-lg py-4">
        <div className="d-flex align-items-center gap-3 mb-4">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate(-1)}
            aria-label="Volver"
          >
            <i className="bi bi-arrow-left" />
          </button>
          <h1 className="create-user__title mb-0">
            <i className="bi bi-person-circle me-2" />
            Mi perfil
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="create-user__form">
          <div className="row g-4">
            <div className="col-12 col-md-6">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <label className="form-label fw-semibold">Nombre completo</label>
                  <input
                    type="text"
                    className={`form-control ${errors.nombreCompleo ? "is-invalid" : ""}`}
                    placeholder="Ej: Juan Carlos"
                    {...register("nombreCompleo", {
                      required: "El nombre es obligatorio",
                      minLength: { value: 2, message: "Mínimo 2 caracteres" },
                    })}
                  />
                  {errors.nombreCompleo && (
                    <div className="invalid-feedback d-block">{errors.nombreCompleo.message}</div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <label className="form-label fw-semibold">Apellido completo</label>
                  <input
                    type="text"
                    className={`form-control ${errors.apellidoCompleto ? "is-invalid" : ""}`}
                    placeholder="Ej: Quintero Zabaleta"
                    {...register("apellidoCompleto", {
                      required: "El apellido es obligatorio",
                      minLength: { value: 2, message: "Mínimo 2 caracteres" },
                    })}
                  />
                  {errors.apellidoCompleto && (
                    <div className="invalid-feedback d-block">{errors.apellidoCompleto.message}</div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <label className="form-label fw-semibold">Teléfono</label>
                  <input
                    type="text"
                    className={`form-control ${errors.telefono ? "is-invalid" : ""}`}
                    placeholder="Ej: 0999999999"
                    {...register("telefono", {
                      required: "El teléfono es obligatorio",
                      minLength: { value: 10, message: "Mínimo 10 caracteres" },
                    })}
                  />
                  {errors.telefono && (
                    <div className="invalid-feedback d-block">{errors.telefono.message}</div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <label className="form-label fw-semibold">Correo electrónico</label>
                  <input
                    type="email"
                    className={`form-control ${errors.correo ? "is-invalid" : ""}`}
                    placeholder="usuario@ejemplo.com"
                    {...register("correo", {
                      required: "El correo es obligatorio",
                      pattern: { value: EMAIL_REGEX, message: "Correo no válido" },
                    })}
                  />
                  {errors.correo && (
                    <div className="invalid-feedback d-block">{errors.correo.message}</div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-body">
                  <label className="form-label fw-semibold">Dirección</label>
                  <input
                    type="text"
                    className={`form-control ${errors.dirreccion ? "is-invalid" : ""}`}
                    placeholder="Ej: Sucre y Maldonado"
                    {...register("dirreccion", {
                      required: "La dirección es obligatoria",
                      minLength: { value: 5, message: "Mínimo 5 caracteres" },
                    })}
                  />
                  {errors.dirreccion && (
                    <div className="invalid-feedback d-block">{errors.dirreccion.message}</div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-body">
                  <label className="form-label fw-semibold">Nueva contraseña (opcional)</label>
                  <input
                    type="password"
                    className={`form-control ${errors.nuevaContrasena ? "is-invalid" : ""}`}
                    placeholder="Dejar vacío para no cambiar"
                    {...register("nuevaContrasena", {
                      minLength: { value: 6, message: "Mínimo 6 caracteres" },
                    })}
                  />
                  {errors.nuevaContrasena && (
                    <div className="invalid-feedback d-block">{errors.nuevaContrasena.message}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {submitError && (
            <div className="alert alert-danger mt-3 mb-0" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2" />
              {submitError}
            </div>
          )}

          <div className="d-flex gap-2 justify-content-end mt-4">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate(-1)}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !canSubmit}
            >
              {isSubmitting ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};
