import '../styles/global.css';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Metodologia from '../components/Metodologia';
import QuienSoy from '../components/QuienSoy';
import Contacto from '../components/Contacto';
import Footer from '../components/Footer';

export default function Landing() {
    return (
        <>
            <Navbar />
            <main>
                <Hero />
                <Metodologia />
                <QuienSoy />
                <Contacto />
            </main>
            <Footer />
        </>
    );
}