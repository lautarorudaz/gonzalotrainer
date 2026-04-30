import { useScrollReveal } from '../hooks/useScrollReveal';
import './Hero.css';

export default function Hero() {
    const ref = useScrollReveal();
    return (
        <section className="hero reveal" ref={ref}>
            <div className="hero__content">
                <p className="hero__eyebrow">Entrenamiento personalizado</p>
                <h1 className="hero__title">
                    TRANSFORMA<br />TU CUERPO<br /><span>Y TU MENTE</span>
                </h1>
                <p className="hero__desc">
                    Un método diseñado para vos. Rutinas personalizadas, seguimiento real
                    y resultados que duran.
                </p>
                <a href="#contacto" className="hero__btn">Empezá hoy</a>
            </div>
            <div className="hero__image-wrap">
                <div className="hero__image-placeholder">
                    <span>FOTO<br />PROFESOR</span>
                </div>
                <div className="hero__tag">+ 50 alumnos activos</div>
            </div>
        </section>
    );
}