import './CompartirModal.css';

export default function CompartirModal({ alumno, onClose }) {
    const url = `${window.location.origin}/login`;
    const mensaje = `¡Hola ${alumno.nombre}! Acá tenés el link para ingresar a ver tu rutina:\n${url}\n\nTu usuario es: ${alumno.email}`;

    const handleWhatsApp = () => {
        let whatsappUrl = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
        if (alumno.numero) {
            const num = alumno.numero.replace(/\D/g, '');
            if (num) {
                whatsappUrl = `https://wa.me/${num}?text=${encodeURIComponent(mensaje)}`;
            }
        }
        window.open(whatsappUrl, '_blank');
        onClose();
    };

    const handleCopiar = () => {
        navigator.clipboard.writeText(mensaje);
        alert('Mensaje y link copiados al portapapeles');
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal compartir-modal" onClick={e => e.stopPropagation()}>
                <div className="modal__header">
                    <h2>Compartir rutina</h2>
                    <button className="modal__close" onClick={onClose}>✕</button>
                </div>
                <div className="compartir-modal__content">
                    <p>Compartir acceso con <strong>{alumno.nombre}</strong>:</p>
                    <div className="compartir-modal__actions">
                        <button className="compartir-btn whatsapp" onClick={handleWhatsApp}>
                            Por WhatsApp
                        </button>
                        <button className="compartir-btn copiar" onClick={handleCopiar}>
                            Copiar link
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
