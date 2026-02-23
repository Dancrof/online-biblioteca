import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import type { IUser } from '../../interfaces/IUser';
import './Styles/CreateUser.css';
import { postUser } from '../../Services/UserService';
import { encoderPassword } from '../../Services/Segurity/Encrypt';
import { getCreateUserErrorMessage } from '../../Services/Segurity/Errors';
import {
  CEDULA_REGEX,
  EMAIL_REGEX,
  PHONE_MAX_LENGTH,
  PHONE_REGEX,
} from '../../Config/constant';

/**
 * Formulario de creación de usuario
 */
type CreateUserForm = Omit<IUser, 'id'> & { contrasena: string };

/**
 * Valores por defecto del formulario de creación de usuario
 */
const defaultValues: CreateUserForm = {
  cedula: '',
  nombreCompleo: '',
  apellidoCompleto: '',
  telefono: '',
  dirreccion: '',
  correo: '',
  contrasena: '',
  estado: true,
};

/**
 * Componente para crear un usuario
 * @returns El componente de creación de usuario
 */
export const CreateUser = () => {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);

  /**
   * Formulario de creación de usuario
   */
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserForm>({ defaultValues });

  /**
   * Manejador del formulario de creación de usuario
   * @param data - Los datos del formulario
   */
  const onSubmit = async (data: CreateUserForm) => {
    setSubmitError(null);
    const body = {
      cedula: data.cedula.trim(),
      nombreCompleo: data.nombreCompleo.trim(),
      apellidoCompleto: data.apellidoCompleto.trim(),
      telefono: data.telefono.trim(),
      dirreccion: data.dirreccion.trim(),
      correo: data.correo.trim().toLowerCase(),
      contrasena: await encoderPassword(data.contrasena),
      estado: data.estado,
    };
    try {
      const created = await postUser(body);
      if (created?.id) {
        navigate('/users');
      } else {
        setSubmitError('No se pudo crear el usuario.');
      }
    } catch (err) {
      const message = getCreateUserErrorMessage(err);
      setSubmitError(message);
    }
  };

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
            <i className="bi bi-person-plus-fill me-2" />
            Nuevo usuario
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="create-user__form">
          <div className="row g-4">
            <div className="col-12 col-md-6">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-card-text text-primary me-2" />
                    Cédula
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.cedula ? 'is-invalid' : ''}`}
                    placeholder="Ej: 0999999999"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    {...register('cedula', {
                      required: 'La cédula es obligatoria',
                      pattern: {
                        value: CEDULA_REGEX,
                        message: 'La cédula debe tener exactamente 10 números',
                      },
                    })}
                  />
                  {errors.cedula && (
                    <div className="invalid-feedback d-block">{errors.cedula.message}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-telephone-fill text-primary me-2" />
                    Teléfono
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.telefono ? 'is-invalid' : ''}`}
                    placeholder="Ej: +593979979736"
                    inputMode="tel"
                    pattern="\+?[0-9]{1,12}"
                    maxLength={PHONE_MAX_LENGTH}
                    {...register('telefono', {
                      required: 'El teléfono es obligatorio',
                      pattern: {
                        value: PHONE_REGEX,
                        message: 'Teléfono no válido. Ej: +593979979736',
                      },
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
                  <label className="form-label fw-semibold">
                    <i className="bi bi-person-vcard-fill text-primary me-2" />
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.nombreCompleo ? 'is-invalid' : ''}`}
                    placeholder="Ej: Juan Carlos"
                    {...register('nombreCompleo', {
                      required: 'El nombre es obligatorio',
                      minLength: { value: 2, message: 'Mínimo 2 caracteres' },
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
                  <label className="form-label fw-semibold">
                    <i className="bi bi-person-badge-fill text-primary me-2" />
                    Apellido completo
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.apellidoCompleto ? 'is-invalid' : ''}`}
                    placeholder="Ej: Quintero Zabaleta"
                    {...register('apellidoCompleto', {
                      required: 'El apellido es obligatorio',
                      minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                    })}
                  />
                  {errors.apellidoCompleto && (
                    <div className="invalid-feedback d-block">{errors.apellidoCompleto.message}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-body">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-geo-alt-fill text-primary me-2" />
                    Dirección
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.dirreccion ? 'is-invalid' : ''}`}
                    placeholder="Ej: Sucre y Maldonado"
                    {...register('dirreccion', {
                      required: 'La dirección es obligatoria',
                      minLength: { value: 5, message: 'Mínimo 5 caracteres' },
                    })}
                  />
                  {errors.dirreccion && (
                    <div className="invalid-feedback d-block">{errors.dirreccion.message}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-envelope-fill text-primary me-2" />
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    className={`form-control ${errors.correo ? 'is-invalid' : ''}`}
                    placeholder="usuario@ejemplo.com"
                    {...register('correo', {
                      required: 'El correo es obligatorio',
                      pattern: {
                        value: EMAIL_REGEX,
                        message: 'Correo no válido',
                      },
                    })}
                  />
                  {errors.correo && (
                    <div className="invalid-feedback d-block">{errors.correo.message}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-lock-fill text-primary me-2" />
                    Contraseña
                  </label>
                  <input
                    type="password"
                    className={`form-control ${errors.contrasena ? 'is-invalid' : ''}`}
                    placeholder="Mínimo 6 caracteres"
                    {...register('contrasena', {
                      required: 'La contraseña es obligatoria',
                      minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                    })}
                  />
                  {errors.contrasena && (
                    <div className="invalid-feedback d-block">{errors.contrasena.message}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-body">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-toggle-on text-primary me-2" />
                    Estado
                  </label>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      {...register('estado')}
                    />
                    <label className="form-check-label">Usuario activo</label>
                  </div>
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
              <i className="bi bi-x-lg me-2" />
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Guardando…
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg me-2" />
                  Guardar usuario
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};
