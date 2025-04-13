// pages/index.js
import Head from 'next/head';
import { FaEnvelope, FaPhone, FaTree, FaSwimmer, FaMapMarkerAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import styles from '../styles/Home.module.css';

export default function Home() {
    return (
        <div className={styles.container}>
            <Head>
                <title>Pa's Place - Coming Soon</title>
                <meta name="description" content="Pa's Place - A haven for youth in Kelso, Pennington" />
                <link rel="icon" href="/favicon.ico" />
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Head>

            <main className={styles.main}>
                <motion.div
                    className={styles.contentWrapper}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                >
                    <motion.div
                        className={styles.logoContainer}
                        initial={{ y: -50 }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.8, type: "spring" }}
                    >
                        <h1 className={styles.title}>Pa's Place</h1>
                        <p className={styles.subtitle}>A haven for youth in Kelso, Pennington</p>
                    </motion.div>

                    <motion.div
                        className={styles.card}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                    >
                        <h2 className={styles.comingSoon}>Website Under Development</h2>
                        <p className={styles.description}>
                            We're working on something special to showcase our youth haven. Our full website will be launching soon!
                        </p>

                        <div className={styles.features}>
                            <div className={styles.feature}>
                                <FaTree className={styles.featureIcon} />
                                <span>Nature</span>
                            </div>
                            <div className={styles.feature}>
                                <FaSwimmer className={styles.featureIcon} />
                                <span>Beach</span>
                            </div>
                            <div className={styles.feature}>
                                <FaMapMarkerAlt className={styles.featureIcon} />
                                <span>Kelso</span>
                            </div>
                        </div>

                        <div className={styles.contactInfo}>
                            <h3>Contact Us</h3>
                            <div className={styles.contactRow}>
                                <p>
                                    <FaEnvelope className={styles.icon} />
                                    <span>Email: </span>
                                    <a href="mailto:lukebriangilmore@outlook.com">lukebriangilmore@outlook.com</a>
                                </p>
                            </div>
                            <div className={styles.contactRow}>
                                <p>
                                    <FaPhone className={styles.icon} />
                                    <span>Phone: </span>
                                    <a href="tel:+27734365056">Luke: 073 436 5056</a>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                <div className={styles.background}>
                    <div className={styles.gradient}></div>
                </div>
            </main>

            <footer className={styles.footer}>
                <p>© {new Date().getFullYear()} Pa's Place. All rights reserved.</p>
            </footer>
        </div>
    );
}