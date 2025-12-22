import React, { useEffect, useState } from 'react';
import { settingsAPI } from '../services/api';

const Footer = () => {
  const [system, setSystem] = useState({
    businessName: '',
    address: '',
    phone: '',
    email: '',
    description: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await settingsAPI.getPublic();
        const s = res?.data?.settings?.system || {};
        setSystem({
          businessName: s.businessName || '',
          address: s.address || '',
          phone: s.phone || '',
          email: s.email || '',
          description: s.description || '',
        });
      } catch (e) {
        // keep defaults
      }
    };
    load();
  }, []);

  return (
    <footer className="bg-dark text-white mt-5 py-4">
      <div className="container text-center">
        {system.businessName && <p className="mb-1 fw-bold">{system.businessName}</p>}
        {system.description && <p className="mb-2">{system.description}</p>}
        {(system.address || system.phone || system.email) && (
          <p className="mb-2">
            {system.address && <span>{system.address}</span>}
            {system.address && (system.phone || system.email) && <span> | </span>}
            {system.phone && <span>{system.phone}</span>}
            {system.phone && system.email && <span> | </span>}
            {system.email && <span>{system.email}</span>}
          </p>
        )}
        <p className="mb-0">© {new Date().getFullYear()} Website Quản Lý Sân Bóng Mini</p>
      </div>
    </footer>
  );
};

export default Footer;