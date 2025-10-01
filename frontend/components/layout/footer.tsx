import styles from './footer.module.css'

interface layoutProps {
    theme:string;
}

export default function Footer({theme}: layoutProps) {
    return (
        <>
            <div className={theme === "light" ? styles.light : theme === "dark" ? styles.dark : styles.purple}>
                <footer className={styles.dark}>
                    <div className={styles.container}>
                        Copyright Number, 20731993, 17/08/2025
                    </div>
                </footer>
            </div>
        </>
    )
}