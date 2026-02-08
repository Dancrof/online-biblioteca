export interface IRent {
    id: number;
    usuarioId: number;
    librosIds: number[];
    fechaInicio: string;
    fechaFin: string;
    estado: boolean;
}