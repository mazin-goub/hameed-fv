import React, { useEffect, useState } from "react";
import logo from "../assets/logorm3.webp"; // ضع هنا مسار اللوجو

interface OpeningPageProps {
  onFinish: () => void; // وظيفة لتغيير الصفحة بعد الانتهاء
}

const OpeningPage: React.FC<OpeningPageProps> = ({ onFinish }) => {
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimate(false);
      onFinish();
    }, 3000); // مدة الأنيميشن 3 ثواني
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className={`opening-page ${animate ? "animate" : ""}`}>
      <img src={logo} alt="Logo" className="logo" />
    </div>
  );
};

export default OpeningPage;