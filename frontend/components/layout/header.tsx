import NavBar from './navbar';
import styles from './header.module.css';

interface layoutProps {
    theme: string;
}

export default function Header({theme}: layoutProps) {
    return (
        <>
            <div className={theme === "light" ? styles.light : theme === "dark" ? styles.dark : styles.purple}>
                <header>
                <div className={styles.container}>
                    <h1 className={styles.title}>CSE3CWA Assignment</h1>
                    <h3 className={styles.studentNo}>20731993</h3>
                </div>
                    <NavBar theme={theme}></NavBar>
                </header>
            </div>
        </>
    )
}