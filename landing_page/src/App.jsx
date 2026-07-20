import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, PresentationControls, ContactShadows } from '@react-three/drei';
import { motion } from 'framer-motion';
import { ShoppingBag, Store, Zap, Shield, Smartphone, ArrowLeft } from 'lucide-react';
import './index.css';

// 3D Abstract Shape Component
const AbstractShape = () => {
  const meshRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.y = Math.sin(t / 4) / 2;
    meshRef.current.rotation.z = t / 3;
    meshRef.current.position.y = Math.sin(t / 1.5) / 5;
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} scale={1.5}>
        <torusKnotGeometry args={[1, 0.3, 128, 32]} />
        <meshPhysicalMaterial
          color="#6366F1"
          roughness={0.1}
          metalness={0.8}
          clearcoat={1}
          clearcoatRoughness={0.1}
          emissive="#EC4899"
          emissiveIntensity={0.2}
        />
      </mesh>
    </Float>
  );
};

function App() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* 3D Background */}
      <div className="canvas-container">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />

          <PresentationControls
            global
            config={{ mass: 2, tension: 500 }}
            snap={{ mass: 4, tension: 1500 }}
            rotation={[0, 0.3, 0]}
            polar={[-Math.PI / 3, Math.PI / 3]}
            azimuth={[-Math.PI / 1.4, Math.PI / 2]}
          >
            <group position={[3, 0, 0]}>
              <AbstractShape />
            </group>
          </PresentationControls>

          <ContactShadows position={[0, -2.5, 0]} opacity={0.5} scale={20} blur={2} far={4.5} />
          <Environment preset="city" />
        </Canvas>
      </div>

      {/* Navbar */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-container">
          <a href="#" className="logo">
            <span className="text-gradient">Sellink</span>
          </a>
          <div className="nav-links">
            <a href="#features">المميزات</a>
            <a href="#apps">التطبيقات</a>
            <a href="http://localhost:5173" target="_blank" rel="noreferrer" className="btn btn-outline" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
              لوحة التحكم
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1>
              مستقبل التجارة الإلكترونية <br />
              <span className="text-gradient">في متناول يدك</span>
            </h1>
            <p>
              منصة Sellink تجمع بين أفضل المتاجر وأسرع خدمات التوصيل.
              سواء كنت مشترياً يبحث عن الأفضل، أو تاجراً يطمح للنمو، نحن هنا من أجلك.
            </p>
            <div className="hero-buttons">
              <a href="#download-customer" className="btn btn-primary">
                <ShoppingBag size={20} />
                حمل تطبيق العميل
              </a>
              <a href="#download-store" className="btn btn-outline glass">
                <Store size={20} />
                انضم كتاجر
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            لماذا تختار <span className="text-gradient">Sellink</span>؟
          </motion.h2>

          <div className="features-grid">
            {[
              { icon: <Zap size={40} />, title: 'سرعة فائقة', desc: 'تصفح آلاف المنتجات بسرعة البرق بفضل تقنياتنا المتطورة.' },
              { icon: <Shield size={40} />, title: 'أمان وموثوقية', desc: 'جميع المتاجر موثقة ونظام التقييم يضمن لك أفضل تجربة.' },
              { icon: <Smartphone size={40} />, title: 'تطبيقات متكاملة', desc: 'تطبيق للعميل وتطبيق للتاجر لتسهيل عملية البيع والشراء.' }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card glass"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-content">
          <div className="logo">
            <span className="text-gradient">Sellink</span>
          </div>
          <div className="footer-text">
            © {new Date().getFullYear()} جميع الحقوق محفوظة لمنصة Sellink.
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
