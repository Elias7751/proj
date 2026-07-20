import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, PresentationControls, ContactShadows } from '@react-three/drei';
import { motion } from 'framer-motion';
import { ShoppingBag, Store, Zap, Shield, Smartphone, ArrowLeft, CheckCircle, MapPin, CreditCard, Bell } from 'lucide-react';
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

// Navbar Component
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-container">
        <Link to="/" className="logo">
          <span className="text-gradient">Sellink</span>
        </Link>
        <div className="nav-links">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>الرئيسية</Link>
          <Link to="/customer-guide" className={location.pathname === '/customer-guide' ? 'active' : ''}>دليل العميل</Link>
          <Link to="/merchant-guide" className={location.pathname === '/merchant-guide' ? 'active' : ''}>دليل التاجر</Link>
        </div>
      </div>
    </nav>
  );
};

// Footer Component
const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-grid">
        <div className="footer-col">
          <div className="logo mb-4">
            <span className="text-gradient">Sellink</span>
          </div>
          <p className="footer-text">
            المنصة الأولى للتجارة الإلكترونية التي تربط بين أفضل المتاجر والعملاء بأسرع وقت وأعلى جودة.
          </p>
        </div>
        <div className="footer-col">
          <h3>روابط سريعة</h3>
          <ul>
            <li><Link to="/">الرئيسية</Link></li>
            <li><Link to="/customer-guide">دليل العميل</Link></li>
            <li><Link to="/merchant-guide">دليل التاجر</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h3>قانوني</h3>
          <ul>
            <li><Link to="/privacy-policy">سياسة الخصوصية</Link></li>
            <li><Link to="/terms-conditions">الشروط والأحكام</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h3>تواصل معنا</h3>
          <ul>
            <li>support@sellink.com</li>
            <li>+967 777 000 000</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} جميع الحقوق محفوظة لمنصة Sellink.</p>
      </div>
    </div>
  </footer>
);

// Home Page
const Home = () => (
  <>
    <div className="canvas-container">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <PresentationControls global config={{ mass: 2, tension: 500 }} snap={{ mass: 4, tension: 1500 }} rotation={[0, 0.3, 0]} polar={[-Math.PI / 3, Math.PI / 3]} azimuth={[-Math.PI / 1.4, Math.PI / 2]}>
          <group position={[3, 0, 0]}><AbstractShape /></group>
        </PresentationControls>
        <ContactShadows position={[0, -2.5, 0]} opacity={0.5} scale={20} blur={2} far={4.5} />
        <Environment preset="city" />
      </Canvas>
    </div>

    <section className="hero">
      <div className="container">
        <motion.div className="hero-content" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1>مستقبل التجارة الإلكترونية <br /><span className="text-gradient">في متناول يدك</span></h1>
          <p>منصة Sellink تجمع بين أفضل المتاجر وأسرع خدمات التوصيل. سواء كنت مشترياً يبحث عن الأفضل، أو تاجراً يطمح للنمو، نحن هنا من أجلك.</p>
          <div className="hero-buttons">
            <Link to="/customer-guide" className="btn btn-primary"><ShoppingBag size={20} /> تطبيق العميل</Link>
            <Link to="/merchant-guide" className="btn btn-outline glass"><Store size={20} /> تطبيق التاجر</Link>
          </div>
        </motion.div>
      </div>
    </section>

    <section className="features">
      <div className="container">
        <motion.h2 className="section-title" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>لماذا تختار <span className="text-gradient">Sellink</span>؟</motion.h2>
        <div className="features-grid">
          {[
            { icon: <Zap size={40} />, title: 'سرعة فائقة', desc: 'تصفح آلاف المنتجات بسرعة البرق بفضل تقنياتنا المتطورة.' },
            { icon: <Shield size={40} />, title: 'أمان وموثوقية', desc: 'جميع المتاجر موثقة ونظام التقييم يضمن لك أفضل تجربة.' },
            { icon: <Smartphone size={40} />, title: 'تطبيقات متكاملة', desc: 'تطبيق للعميل وتطبيق للتاجر لتسهيل عملية البيع والشراء.' }
          ].map((feature, index) => (
            <motion.div key={index} className="feature-card glass" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.2 }}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </>
);

// Customer Guide Page
const CustomerGuide = () => (
  <div className="page-container">
    <div className="container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <h1>دليل <span className="text-gradient">العميل</span></h1>
        <p>كل ما تحتاجه للبدء في التسوق عبر منصة Sellink</p>
      </motion.div>

      <div className="steps-grid">
        {[
          { icon: <Smartphone />, title: '1. تحميل التطبيق', desc: 'قم بتحميل تطبيق Sellink للعملاء من متجر التطبيقات وإنشاء حساب جديد برقم هاتفك.' },
          { icon: <MapPin />, title: '2. تحديد الموقع', desc: 'حدد موقعك بدقة لكي نعرض لك المتاجر المتاحة للتوصيل في منطقتك.' },
          { icon: <ShoppingBag />, title: '3. تصفح وتسوق', desc: 'تصفح آلاف المنتجات من مختلف المتاجر وأضف ما يعجبك إلى سلة المشتريات.' },
          { icon: <CreditCard />, title: '4. إتمام الطلب', desc: 'اختر طريقة الدفع المناسبة (الدفع عند الاستلام متاح) وقم بتأكيد طلبك.' },
          { icon: <Bell />, title: '5. تتبع الطلب', desc: 'ستصلك إشعارات لحظية بحالة طلبك حتى يصل إلى باب منزلك.' }
        ].map((step, index) => (
          <motion.div key={index} className="step-card glass" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
            <div className="step-icon">{step.icon}</div>
            <div className="step-content">
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

// Merchant Guide Page
const MerchantGuide = () => (
  <div className="page-container">
    <div className="container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <h1>دليل <span className="text-gradient">التاجر</span></h1>
        <p>انطلق بتجارتك نحو آفاق جديدة مع تطبيق Sellink Business</p>
      </motion.div>

      <div className="steps-grid">
        {[
          { icon: <Store />, title: '1. إنشاء المتجر', desc: 'حمل تطبيق Sellink Business، قم بإنشاء حسابك، وأدخل بيانات متجرك (الاسم، الشعار، الموقع).' },
          { icon: <CheckCircle />, title: '2. انتظار الموافقة', desc: 'سيقوم فريق الإدارة بمراجعة طلبك وتوثيق متجرك في أسرع وقت.' },
          { icon: <ShoppingBag />, title: '3. إضافة المنتجات', desc: 'بعد الموافقة، ابدأ بإضافة منتجاتك مع الصور والأسعار والتفاصيل الجذابة.' },
          { icon: <Bell />, title: '4. استقبال الطلبات', desc: 'ستصلك إشعارات فورية عند قيام أي عميل بالطلب من متجرك.' },
          { icon: <Zap />, title: '5. إدارة المبيعات', desc: 'قم بتحديث حالة الطلبات (قيد التجهيز، جاري التوصيل) وتابع أرباحك من خلال لوحة التحكم.' }
        ].map((step, index) => (
          <motion.div key={index} className="step-card glass" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
            <div className="step-icon">{step.icon}</div>
            <div className="step-content">
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

// Privacy Policy Page
const PrivacyPolicy = () => (
  <div className="page-container">
    <div className="container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <h1>سياسة <span className="text-gradient">الخصوصية</span></h1>
        <p>آخر تحديث: 20 يوليو 2026</p>
      </motion.div>

      <div className="policy-content glass">
        <h2>1. جمع المعلومات</h2>
        <p>نحن في Sellink نقوم بجمع المعلومات التي تقدمها لنا مباشرة عند إنشاء حساب، مثل الاسم، رقم الهاتف، والعنوان. كما نجمع بيانات الموقع الجغرافي لتقديم خدمة التوصيل بدقة.</p>

        <h2>2. استخدام المعلومات</h2>
        <p>نستخدم معلوماتك لتوفير خدماتنا وتحسينها، معالجة طلباتك، التواصل معك بخصوص الطلبات، وإرسال الإشعارات الهامة المتعلقة بحسابك.</p>

        <h2>3. مشاركة المعلومات</h2>
        <p>لا نقوم ببيع معلوماتك الشخصية لأي طرف ثالث. نشارك فقط المعلومات الضرورية (مثل الاسم والعنوان) مع المتاجر ومندوبي التوصيل لإتمام طلبك بنجاح.</p>

        <h2>4. أمن البيانات</h2>
        <p>نتخذ إجراءات أمنية صارمة لحماية بياناتك من الوصول غير المصرح به أو التعديل أو الإفصاح. نستخدم تشفير البيانات وتأمين الاتصالات.</p>

        <h2>5. حقوقك</h2>
        <p>يحق لك في أي وقت الوصول إلى بياناتك الشخصية، تعديلها، أو طلب حذف حسابك بالكامل من خلال إعدادات التطبيق.</p>
      </div>
    </div>
  </div>
);

// Terms and Conditions Page
const TermsConditions = () => (
  <div className="page-container">
    <div className="container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <h1>الشروط <span className="text-gradient">والأحكام</span></h1>
        <p>آخر تحديث: 20 يوليو 2026</p>
      </motion.div>

      <div className="policy-content glass">
        <h2>1. قبول الشروط</h2>
        <p>باستخدامك لمنصة وتطبيقات Sellink، فإنك توافق على الالتزام بجميع الشروط والأحكام المذكورة هنا. إذا كنت لا توافق على أي جزء منها، يرجى عدم استخدام المنصة.</p>

        <h2>2. حساب المستخدم</h2>
        <p>أنت مسؤول عن الحفاظ على سرية معلومات حسابك وكلمة المرور. المنصة غير مسؤولة عن أي خسارة ناتجة عن فشلك في حماية بيانات الدخول الخاصة بك.</p>

        <h2>3. التزامات التاجر</h2>
        <p>يجب على التجار تقديم معلومات دقيقة عن المنتجات والأسعار. يمنع منعاً باتاً بيع أي منتجات غير قانونية أو مقلدة. يحق لإدارة المنصة إيقاف أي متجر يخالف هذه الشروط.</p>

        <h2>4. سياسة الإرجاع والاسترداد</h2>
        <p>تخضع سياسة الإرجاع لشروط كل متجر على حدة. المنصة تعمل كوسيط بين العميل والتاجر، وتلتزم بتقديم الدعم لحل أي نزاعات قد تنشأ بين الطرفين.</p>

        <h2>5. التعديلات</h2>
        <p>نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إشعار المستخدمين بأي تغييرات جوهرية، واستمرارك في استخدام المنصة يعني قبولك للشروط المعدلة.</p>
      </div>
    </div>
  </div>
);

// Main App Component
function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/customer-guide" element={<CustomerGuide />} />
            <Route path="/merchant-guide" element={<MerchantGuide />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-conditions" element={<TermsConditions />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
