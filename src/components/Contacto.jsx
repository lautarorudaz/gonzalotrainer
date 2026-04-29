import './Contacto.css';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function Contacto() {
    const ref = useScrollReveal();
    return (
        <section className="contacto" id="contacto">
            <div className="contacto__inner">
                <p className="contacto__eyebrow">¿Listo para empezar?</p>
                <h2 className="contacto__title">HABLEMOS</h2>
                <p className="contacto__desc">
                    Escribime por WhatsApp o Instagram y coordino una evaluación gratuita con vos.
                </p>
                <div className="contacto__btns">
                    <a href="https://wa.me/TUNUMERO" target="_blank" rel="noreferrer" className="contacto__btn contacto__btn--wa">
                        WhatsApp
                    </a>
                    <a href="https://instagram.com/TUUSUARIO" target="_blank" rel="noreferrer" className="contacto__btn contacto__btn--ig">
                        Instagram
                    </a>
                </div>
            </div>
        </section>
    );
}