import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from './header.module.css';
import logoImg from '@/../public/logo.png';
import Image from 'next/image';

function Header() {
  const [shrinkLogo, setShrinkLogo] = useState(false);
  const [shadow, setShadow] = useState(false);
  const [selectedLink, setSelectedLink] = useState('home');
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  let scrollTimeout;

  const router = useRouter();
  const servicesRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      setShrinkLogo(window.scrollY > 0);
      setShadow(true);
      scrollTimeout = setTimeout(() => {
        setShadow(false);
      }, 150);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  useEffect(() => {
    const path = router.pathname;
    if (path.startsWith('/services')) {
      setSelectedLink('services');
    } else {
      switch (path) {
        case '/aboutUs':
          setSelectedLink('about');
          break;
        case '/reach-out':
          setSelectedLink('reach-out');
          break;
        default:
          setSelectedLink('home');
          break;
      }
    }
  }, [router.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (servicesRef.current && !servicesRef.current.contains(event.target)) {
        setServicesDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLinkClick = (link) => {
    setSelectedLink(link);
    // If a service link is clicked, close the dropdown
    if (link === 'services') {
      setServicesDropdownOpen(false);
    }
  };

  const toggleServicesDropdown = () => {
    setSelectedLink('services');
    setServicesDropdownOpen((prev) => !prev);
  };

  return (
      <header
          className={`fixed top-0 left-0 w-full z-50 transition-shadow duration-300 ${
              shrinkLogo && shadow ? 'shadow-md' : 'shadow-none'
          }`}
      >
        <div
            className={`${styles.container} mx-auto px-4 py-6 bg-transparent flex items-center justify-between`}
        >
          <div
              className="flex items-center transition-all duration-300"
              style={{ height: shrinkLogo ? '105px' : '125px' }}
          >
            <Link href="/" className="flex items-center">
              <div
                  className="relative"
                  style={{
                    width: shrinkLogo ? '105px' : '125px',
                    height: shrinkLogo ? '105px' : '125px',
                  }}
              >
                <Image
                    src={logoImg}
                    alt="Logo"
                    layout="fill"
                    objectFit="contain"
                    className="transition-all duration-300"
                />
              </div>
              <h1
                  className={`${styles.logoText} font-bold text-white transition-all duration-300 ${
                      shrinkLogo ? 'text-xl' : 'text-2xl'
                  }`}
              >
                Pa's Place
              </h1>
            </Link>
          </div>
          <nav className="flex items-center">
            <Link
                href="/"
                className={`${styles.navLink} ${
                    selectedLink === 'home' ? styles.selected : ''
                } mx-4`}
                onClick={() => handleLinkClick('home')}
            >
              Home
            </Link>
            <Link
                href="/aboutUs"
                className={`${styles.navLink} ${
                    selectedLink === 'about' ? styles.selected : ''
                } mx-4`}
                onClick={() => handleLinkClick('about')}
            >
              About
            </Link>

            {/* Services Dropdown */}
            <div className="relative mx-4" ref={servicesRef}>
              <button
                  type="button"
                  className={`${styles.navLink} ${
                      selectedLink === 'services' ? styles.selected : ''
                  } flex items-center`}
                  onClick={toggleServicesDropdown}
              >
                <span>Services</span>
                <span
                    className={`ml-1 transform transition-transform duration-300 ${
                        servicesDropdownOpen ? 'rotate-180' : 'rotate-0'
                    }`}
                >
                {/* Down arrow icon with drop shadow */}
                  <svg
                      className="w-4 h-4"
                      style={{ filter: 'drop-shadow(0px 1px 2px black)' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                  >
                  <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </span>
              </button>
              {servicesDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-40 bg-white text-black rounded-md shadow-lg transition-opacity duration-300">
                    <Link
                        href="/services/service1"
                        className="block px-4 py-2 hover:bg-gray-200"
                        onClick={() => handleLinkClick('services')}
                    >
                      Service 1
                    </Link>
                    <Link
                        href="/services/service2"
                        className="block px-4 py-2 hover:bg-gray-200"
                        onClick={() => handleLinkClick('services')}
                    >
                      Service 2
                    </Link>
                    <Link
                        href="/services/service3"
                        className="block px-4 py-2 hover:bg-gray-200"
                        onClick={() => handleLinkClick('services')}
                    >
                      Service 3
                    </Link>
                  </div>
              )}
            </div>

            <Link
                href="/reach-out"
                className={`${styles.navLink} ${
                    selectedLink === 'reach-out' ? styles.selected : ''
                } mx-4`}
                onClick={() => handleLinkClick('reach-out')}
            >
              Reach-Out
            </Link>
          </nav>
        </div>
      </header>
  );
}

export default Header;
