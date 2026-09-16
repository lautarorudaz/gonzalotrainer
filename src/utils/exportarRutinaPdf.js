const ETAPAS = ['Movilidad', 'Activación', 'Central'];

const COLORES = {
    oscuro: [24, 24, 24],
    acento: [190, 238, 45],
    gris: [104, 104, 104],
    linea: [222, 222, 218],
    fondo: [247, 247, 245],
};

function textoSeguro(valor, reemplazo = '-') {
    const texto = String(valor ?? '').trim();
    return texto || reemplazo;
}

function nombreArchivo(valor) {
    return textoSeguro(valor, 'rutina')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase();
}

export async function crearRutinaPdf(rutina, alumno = {}) {
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
    const ancho = pdf.internal.pageSize.getWidth();
    const alto = pdf.internal.pageSize.getHeight();
    const margen = 16;
    const anchoContenido = ancho - margen * 2;
    let y = 18;

    const nuevaPagina = () => {
        pdf.addPage();
        y = 18;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        pdf.setTextColor(...COLORES.gris);
        pdf.text(textoSeguro(rutina.nombre, 'Mi rutina').toUpperCase(), margen, y);
        y += 9;
    };

    const asegurarEspacio = (necesario) => {
        if (y + necesario > alto - 16) nuevaPagina();
    };

    pdf.setFillColor(...COLORES.oscuro);
    pdf.rect(0, 0, ancho, 58, 'F');
    pdf.setFillColor(...COLORES.acento);
    pdf.rect(margen, 14, 18, 2.5, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(23);
    pdf.text(textoSeguro(rutina.nombre, 'MI RUTINA').toUpperCase(), margen, 31, { maxWidth: anchoContenido });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(205, 205, 205);
    const alumnoNombre = `${textoSeguro(alumno.nombre, '')} ${textoSeguro(alumno.apellido, '')}`.trim();
    pdf.text(alumnoNombre || 'Plan de entrenamiento', margen, 43);
    pdf.setFontSize(8);
    pdf.text(`Exportado el ${new Date().toLocaleDateString('es-AR')}`, margen, 50);
    y = 70;

    (rutina.semanas || []).forEach((semana, semanaIdx) => {
        asegurarEspacio(22);
        pdf.setFillColor(...COLORES.acento);
        pdf.roundedRect(margen, y, anchoContenido, 12, 2, 2, 'F');
        pdf.setTextColor(...COLORES.oscuro);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(13);
        pdf.text(`SEMANA ${semanaIdx + 1}`, margen + 5, y + 8);
        y += 19;

        (semana.dias || []).forEach((dia, diaIdx) => {
            asegurarEspacio(25);
            pdf.setTextColor(...COLORES.oscuro);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(15);
            pdf.text(textoSeguro(dia.nombre, `Día ${diaIdx + 1}`), margen, y);
            y += 3;
            pdf.setDrawColor(...COLORES.linea);
            pdf.line(margen, y, ancho - margen, y);
            y += 8;

            ETAPAS.forEach(etapa => {
                const ejercicios = dia.ejercicios?.[etapa] || [];
                if (ejercicios.length === 0) return;

                asegurarEspacio(14);
                pdf.setTextColor(...COLORES.gris);
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(8);
                pdf.text(etapa.toUpperCase(), margen, y);
                y += 6;

                ejercicios.forEach((ejercicio, ejercicioIdx) => {
                    const aclaracion = textoSeguro(ejercicio.aclaracion, '');
                    const lineasNombre = pdf.splitTextToSize(textoSeguro(ejercicio.nombre, 'Ejercicio'), anchoContenido - 12);
                    const lineasNota = aclaracion ? pdf.splitTextToSize(aclaracion, anchoContenido - 12) : [];
                    const altoFila = Math.max(18, 13 + (lineasNombre.length - 1) * 4 + lineasNota.length * 3.5);
                    asegurarEspacio(altoFila + 3);

                    pdf.setFillColor(...COLORES.fondo);
                    pdf.roundedRect(margen, y, anchoContenido, altoFila, 2, 2, 'F');
                    pdf.setFillColor(...COLORES.oscuro);
                    pdf.circle(margen + 6, y + 7, 3.2, 'F');
                    pdf.setTextColor(255, 255, 255);
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(7);
                    pdf.text(String(ejercicioIdx + 1), margen + 6, y + 7.8, { align: 'center' });

                    pdf.setTextColor(...COLORES.oscuro);
                    pdf.setFontSize(10);
                    pdf.text(lineasNombre, margen + 12, y + 6.5);
                    const nombreAlto = lineasNombre.length * 4;
                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(8);
                    pdf.setTextColor(...COLORES.gris);
                    const detalle = `Series: ${textoSeguro(ejercicio.series)}   |   Reps: ${textoSeguro(ejercicio.repeticiones)}   |   Peso indicado: ${ejercicio.peso ? `${ejercicio.peso} kg` : '-'}`;
                    pdf.text(detalle, margen + 12, y + 8 + nombreAlto);
                    if (lineasNota.length > 0) {
                        pdf.setFont('helvetica', 'italic');
                        pdf.text(lineasNota, margen + 12, y + 12 + nombreAlto);
                    }
                    y += altoFila + 3;
                });
                y += 3;
            });
            y += 7;
        });
        y += 4;
    });

    const paginas = pdf.getNumberOfPages();
    for (let pagina = 1; pagina <= paginas; pagina += 1) {
        pdf.setPage(pagina);
        pdf.setDrawColor(...COLORES.linea);
        pdf.line(margen, alto - 11, ancho - margen, alto - 11);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.setTextColor(...COLORES.gris);
        pdf.text('FORCE TRAINING', margen, alto - 6);
        pdf.text(`${pagina} / ${paginas}`, ancho - margen, alto - 6, { align: 'right' });
    }

    return pdf;
}

export async function exportarRutinaPdf(rutina, alumno) {
    const pdf = await crearRutinaPdf(rutina, alumno);
    pdf.save(`${nombreArchivo(rutina.nombre)}.pdf`);
}
