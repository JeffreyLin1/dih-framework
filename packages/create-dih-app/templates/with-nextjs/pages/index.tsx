import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>DIH App</title>
        <meta name="description" content="Created with DIH" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://github.com/jeffreylin1/dih-framework">DIH Framework!</a>
        </h1>

        <p className={styles.description}>
          Get started by exploring these examples
        </p>

        <div className={styles.buttonContainer}>
          <Link href="/chat" className={styles.button}>
            Chat Example
          </Link>
          <Link href="/tools" className={styles.button}>
            Tools Example
          </Link>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2>Documentation &rarr;</h2>
            <p>Find in-depth information about DIH Framework features and API.</p>
          </div>

          <div className={styles.card}>
            <h2>Examples &rarr;</h2>
            <p>Discover and deploy example DIH Framework projects.</p>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://github.com/jeffreylin1/dih-framework"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by DIH Framework
        </a>
      </footer>
    </div>
  );
} 