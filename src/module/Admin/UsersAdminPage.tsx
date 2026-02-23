import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import type { IUser } from '../../interfaces/IUser';
import type { IPaginate } from '../../interfaces/IPaginate';
import { PaginationPage } from '../Pagination/PaginationPage';
import { getUsers, deleteUser, putUsuarioAdmin, postUser } from '../../Services/UserService';
import {
  getAdminCreateUserErrorMessage,
  getAdminDeleteUserErrorMessage,
  getAdminUpdateUserErrorMessage,
} from '../../Services/Segurity/Errors';

type UserFormValues = Omit<IUser, 'id'>;
type UserEditValues = Pick<IUser, 'rol' | 'estado'>;

const emptyUser: UserFormValues = {
  cedula: '',
  nombreCompleo: '',
  apellidoCompleto: '',
  telefono: '',
  dirreccion: '',
  correo: '',
  contrasena: '',
  estado: true,
  rol: 'user',
};

/**
 * Panel de administración de usuarios.
 * Permite crear, editar el rol/estado y eliminar usuarios.
 */
export const UsersAdminPage = () => {
  const [paginateUsers, setPaginateUsers] = useState<IPaginate<IUser>>({
    data: [],
    first: 1,
    prev: null,
    next: 1,
    last: 1,
    pages: 1,
    items: 0,
  });
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditingRole, setIsEditingRole] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    defaultValues: emptyUser,
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { isSubmitting: isSubmittingEdit },
  } = useForm<UserEditValues>({
    defaultValues: { rol: 'user', estado: true },
  });

  const users = paginateUsers.data ?? [];

  /**
   * Carga usuarios y construye paginación en memoria
   */
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      const allUsers = data || [];
      const items = allUsers.length;
      const perPage = 8;
      const pages = Math.max(1, Math.ceil(items / perPage));
      const page = Math.min(currentPage, pages);
      const start = (page - 1) * perPage;
      const pageData = allUsers.slice(start, start + perPage);

      setPaginateUsers({
        data: pageData,
        first: 1,
        prev: page > 1 ? page - 1 : null,
        next: page < pages ? page + 1 : pages,
        last: pages,
        pages,
        items,
      });
      setCurrentPage(page);
    } catch {
      setPaginateUsers({
        data: [],
        first: 1,
        prev: null,
        next: 1,
        last: 1,
        pages: 1,
        items: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  /**
   * Cargar usuarios al montar
   */
  useEffect(() => {
    queueMicrotask(() => loadUsers());
  }, [loadUsers]);

  /**
   * Resetear formulario cuando cambia selection
   */
  useEffect(() => {
    if (isCreating) {
      reset(emptyUser);
    } else if (selectedUser) {
      reset(selectedUser);
      resetEdit({ rol: selectedUser.rol || 'user', estado: selectedUser.estado });
    } else {
      reset(emptyUser);
    }
  }, [selectedUser, isCreating, reset, resetEdit]);

  /**
   * Crear nuevo usuario
   */
  const onCreateSubmit = async (data: UserFormValues) => {
    setSubmitError(null);
    try {
      await postUser(data);
      setIsCreating(false);
      reset(emptyUser);
      await loadUsers();
    } catch (err) {
      const message = getAdminCreateUserErrorMessage(err);
      setSubmitError(message);
    }
  };

  /**
   * Actualizar rol y estado del usuario
   */
  const onEditRoleSubmit = async (data: UserEditValues) => {
    if (!selectedUser) return;
    setSubmitError(null);
    try {
      await putUsuarioAdmin(selectedUser.id, data);
      setIsEditingRole(false);
      await loadUsers();
      setSelectedUser(null);
    } catch (err) {
      const message = getAdminUpdateUserErrorMessage(err);
      setSubmitError(message);
    }
  };

  /**
   * Eliminar usuario
   */
  const handleDelete = async (user: IUser) => {
    if (
      !window.confirm(
        `¿Eliminar al usuario ${user.nombreCompleo} ${user.apellidoCompleto}? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }
    setSubmitError(null);
    try {
      const success = await deleteUser(user.id);
      if (success) {
        await loadUsers();
        if (selectedUser?.id === user.id) {
          setSelectedUser(null);
        }
      } else {
        setSubmitError('No se pudo eliminar el usuario.');
      }
    } catch (err) {
      const message = getAdminDeleteUserErrorMessage(err);
      setSubmitError(message);
    }
  };

  /**
   * Cambiar página
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadUsers();
  };

  return (
    <div className="admin-panel">
      <div className="admin-panel__container">
        <h1>Gestión de Usuarios</h1>

        {submitError && (
          <div className="alert alert-danger" role="alert">
            {submitError}
          </div>
        )}

        <div className="row g-4">
          {/* Panel de creación/edición */}
          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <h5>{isCreating ? 'Nuevo Usuario' : selectedUser ? 'Editar Rol/Estado' : 'Seleccionar o Crear'}</h5>
              </div>
              <div className="card-body">
                {isCreating ? (
                  <form onSubmit={handleSubmit(onCreateSubmit)} className="form-stack">
                    <div className="mb-3">
                      <label className="form-label">Cédula</label>
                      <input
                        {...register('cedula', {
                          required: 'La cédula es requerida',
                        })}
                        type="text"
                        className={`form-control ${errors.cedula ? 'is-invalid' : ''}`}
                      />
                      {errors.cedula && <div className="invalid-feedback">{errors.cedula.message}</div>}
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Nombre</label>
                      <input
                        {...register('nombreCompleo', {
                          required: 'El nombre es requerido',
                        })}
                        type="text"
                        className={`form-control ${errors.nombreCompleo ? 'is-invalid' : ''}`}
                      />
                      {errors.nombreCompleo && <div className="invalid-feedback">{errors.nombreCompleo.message}</div>}
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Apellido</label>
                      <input
                        {...register('apellidoCompleto', {
                          required: 'El apellido es requerido',
                        })}
                        type="text"
                        className={`form-control ${errors.apellidoCompleto ? 'is-invalid' : ''}`}
                      />
                      {errors.apellidoCompleto && <div className="invalid-feedback">{errors.apellidoCompleto.message}</div>}
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Correo</label>
                      <input
                        {...register('correo', {
                          required: 'El correo es requerido',
                        })}
                        type="email"
                        className={`form-control ${errors.correo ? 'is-invalid' : ''}`}
                      />
                      {errors.correo && <div className="invalid-feedback">{errors.correo.message}</div>}
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Teléfono</label>
                      <input
                        {...register('telefono')}
                        type="text"
                        className="form-control"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Dirección</label>
                      <input
                        {...register('dirreccion')}
                        type="text"
                        className="form-control"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Contraseña</label>
                      <input
                        {...register('contrasena', {
                          required: 'La contraseña es requerida',
                        })}
                        type="password"
                        className={`form-control ${errors.contrasena ? 'is-invalid' : ''}`}
                      />
                      {errors.contrasena && <div className="invalid-feedback">{errors.contrasena.message}</div>}
                    </div>

                    <div className="d-flex gap-2 justify-content-between">
                      <button type="submit" disabled={isSubmitting} className="btn btn-primary flex-grow-1">
                        {isSubmitting ? 'Creando...' : 'Crear Usuario'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCreating(false)}
                        className="btn btn-secondary"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : selectedUser && isEditingRole ? (
                  <form onSubmit={handleSubmitEdit(onEditRoleSubmit)} className="form-stack">
                    <div className="mb-3">
                      <label className="form-label">Rol</label>
                      <select
                        {...registerEdit('rol')}
                        className="form-select"
                      >
                        <option value="user">Usuario</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-check">
                        <input
                          {...registerEdit('estado')}
                          type="checkbox"
                          className="form-check-input"
                        />
                        <span className="form-check-label">Activo</span>
                      </label>
                    </div>

                    <div className="d-flex gap-2 justify-content-between">
                      <button
                        type="submit"
                        disabled={isSubmittingEdit}
                        className="btn btn-primary flex-grow-1"
                      >
                        {isSubmittingEdit ? 'Actualizando...' : 'Guardar Cambios'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingRole(false);
                          resetEdit();
                        }}
                        className="btn btn-secondary"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : selectedUser ? (
                  <div className="user-details">
                    <div className="mb-2">
                      <strong>Cédula:</strong>
                      <p>{selectedUser.cedula}</p>
                    </div>
                    <div className="mb-2">
                      <strong>Nombre:</strong>
                      <p>{selectedUser.nombreCompleo} {selectedUser.apellidoCompleto}</p>
                    </div>
                    <div className="mb-2">
                      <strong>Correo:</strong>
                      <p>{selectedUser.correo}</p>
                    </div>
                    <div className="mb-2">
                      <strong>Teléfono:</strong>
                      <p>{selectedUser.telefono || 'N/A'}</p>
                    </div>
                    <div className="mb-2">
                      <strong>Dirección:</strong>
                      <p>{selectedUser.dirreccion || 'N/A'}</p>
                    </div>
                    <div className="mb-3">
                      <strong>Rol:</strong>
                      <p className="badge bg-info">{selectedUser.rol || 'user'}</p>
                    </div>
                    <div className="mb-3">
                      <strong>Estado:</strong>
                      <p className={`badge ${selectedUser.estado ? 'bg-success' : 'bg-danger'}`}>
                        {selectedUser.estado ? 'Activo' : 'Inactivo'}
                      </p>
                    </div>
                    <div className="d-flex gap-2 flex-column">
                      <button
                        onClick={() => setIsEditingRole(true)}
                        className="btn btn-warning"
                      >
                        <i className="bi bi-pencil me-2" />
                        Editar Rol/Estado
                      </button>
                      <button
                        onClick={() => handleDelete(selectedUser)}
                        className="btn btn-danger"
                      >
                        <i className="bi bi-trash me-2" />
                        Eliminar
                      </button>
                      <button
                        onClick={() => setSelectedUser(null)}
                        className="btn btn-secondary"
                      >
                        Limpiar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsCreating(true)}
                    className="btn btn-success w-100"
                  >
                    <i className="bi bi-plus-circle me-2" />
                    Crear Nuevo Usuario
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Lista de usuarios */}
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header">
                <h5>Lista de Usuarios ({paginateUsers.items})</h5>
              </div>
              <div className="card-body">
                {loading ? (
                  <p className="text-center text-muted">Cargando...</p>
                ) : users.length === 0 ? (
                  <p className="text-center text-muted">No hay usuarios disponibles.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Cédula</th>
                          <th>Nombre</th>
                          <th>Correo</th>
                          <th>Rol</th>
                          <th>Estado</th>
                          <th>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td>{user.cedula}</td>
                            <td>{user.nombreCompleo} {user.apellidoCompleto}</td>
                            <td className="text-truncate" title={user.correo}>
                              {user.correo}
                            </td>
                            <td>
                              <span className="badge bg-info">{user.rol || 'user'}</span>
                            </td>
                            <td>
                              <span className={`badge ${user.estado ? 'bg-success' : 'bg-danger'}`}>
                                {user.estado ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                            <td>
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsCreating(false);
                                  setIsEditingRole(false);
                                }}
                                className={`btn btn-sm ${
                                  selectedUser?.id === user.id ? 'btn-primary' : 'btn-outline-primary'
                                }`}
                              >
                                Ver
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {!loading && users.length > 0 && (
                  <div className="pt-3">
                    <PaginationPage
                      first={paginateUsers.first}
                      prev={paginateUsers.prev}
                      next={paginateUsers.next}
                      last={paginateUsers.last}
                      pages={paginateUsers.pages}
                      currentPage={currentPage}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .admin-panel__container {
          padding: 20px;
        }

        .admin-panel h1 {
          margin-bottom: 20px;
          font-size: 28px;
          font-weight: 600;
        }

        .form-stack {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .user-details {
          font-size: 14px;
        }

        .user-details p {
          margin: 5px 0;
          color: #555;
        }

        .user-details strong {
          display: block;
          color: #333;
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
};

export default UsersAdminPage;
