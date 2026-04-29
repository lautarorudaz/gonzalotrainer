import './Metodologia.css';
import { useScrollReveal } from '../hooks/useScrollReveal';

const pasos = [
    { num: '01', titulo: 'Evaluación inicial', desc: 'Analizamos tu punto de partida, objetivos y disponibilidad para diseñar tu plan.' },
    { num: '02', titulo: 'Rutina personalizada', desc: 'Armamos una rutina 100% adaptada a vos, con progresión semana a semana.' },
    { num: '03', titulo: 'Seguimiento constante', desc: 'Revisamos tu evolución, ajustamos la carga y respondemos tus dudas.' },
    { num: '04', titulo: 'Resultados reales', desc: 'Sin atajos. Método consistente que genera cambios sostenibles en el tiempo.' },
];

export default function Metodologia() {
    const ref = useScrollReveal();
    return (
        <section className="metodologia" id="metodologia">
            <div className="metodologia__inner">
                <p className="metodologia__eyebrow">Cómo trabajo</p>
                <h2 className="metodologia__title">MI METODOLOGÍA</h2>
                <div className="metodologia__grid">
                    {pasos.map((p) => (
                        <div className="metodologia__card" key={p.num}>
                            <span className="metodologia__num">{p.num}</span>
                            <h3>{p.titulo}</h3>
                            <p>{p.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}