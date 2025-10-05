import Link from 'next/link';
import styles from './navbar.module.css';

interface layoutProps {
    theme:string;
}

export default function NavBar({theme}: layoutProps) {
    // TODO: highlight current tab

    return (
        <>
            <div className={theme === "light" ? styles.light : theme === "dark" ? styles.dark : styles.purple}>
                <nav className={styles.container}>
                    <Link href="/" className={styles.link}>Home</Link>
                    <Link href="/about" className={styles.link}>About</Link>
                    <Link href="/escaperoom" className={styles.link}>Escape Room</Link>
                </nav>
            </div>
        </>
    )
}