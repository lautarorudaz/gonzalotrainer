import './QuienSoy.css';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function QuienSoy() {
    const ref = useScrollReveal();
    return (
        <section className="quien-soy" id="quien-soy">
            <div className="quien-soy__inner">
                <div className="quien-soy__image-wrap">
                    <div className="quien-soy__image-placeholder">
                        <span>FOTO<br />PROFESOR</span>
                    </div>
                </div>
                <div className="quien-soy__content">
                    <p className="quien-soy__eyebrow">Sobre mí</p>
                    <h2 className="quien-soy__title">¿QUIÉN SOY?</h2>
                    <p className="quien-soy__text">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Soy entrenador personal con más de X años de experiencia
                        ayudando a personas a alcanzar sus objetivos.
                    </p>
                    <p className="quien-soy__text">
                        Mi enfoque combina la ciencia del entrenamiento con la
                        personalización real. Cada alumno es único y merece un
                        plan diseñado exclusivamente para él.
                    </p>
                    <div className="quien-soy__stats">
                        <div className="quien-soy__stat">
                            <span className="quien-soy__stat-num">+50</span>
                            <span className="quien-soy__stat-label">Alumnos</span>
                        </div>
                        <div className="quien-soy__stat">
                            <span className="quien-soy__stat-num">+5</span>
                            <span className="quien-soy__stat-label">Años de experiencia</span>
                        </div>
                        <div className="quien-soy__stat">
                            <span className="quien-soy__stat-num">100%</span>
                            <span className="quien-soy__stat-label">Personalizado</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}