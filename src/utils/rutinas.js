export const ETAPAS = ['Movilidad', 'Activación', 'Central'];

export function rutinaVacia(nombre = '') {
    return {
        nombre,
        semanas: [semanaVacia()],
    };
}

export function semanaVacia() {
    return { dias: [diaVacio()] };
}

export function diaVacio() {
    return {
        nombre: '',
        ejercicios: {
            Movilidad: [],
            Activación: [],
            Central: [],
        },
    };
}

export function ejercicioVacio() {
    return {
        ejercicioId: '',
        nombre: '',
        series: '',
        repeticiones: '',
        peso: '',
        aclaracion: '',
    };
}