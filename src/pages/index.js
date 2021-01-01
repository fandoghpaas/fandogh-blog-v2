import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';
import OriginalFooter from '@theme-original/Footer';


const blog_posts = [
  {
   title: 'استفاده از MinIO در پروژه‌های Django',
   imageUrl: '/img/blog/django-minio.svg',
   slug: 'در این بلاگ پست به این موضوع می‌پردازیم که Object Storageها چه هستند و با ذکر یک مثال واقعی، استفاده از آن‌ها را در یک پروژه جانگو شرح می‌دهیم.',
   url: '/blog/2021/01/01/minio-in-django-projects'
  },
  {
   title: 'داستان یک تصمیم سخت',
   imageUrl: '/img/blog/fandoghpaas-community-banner.svg',
   slug: 'همانطور که همه در جریان هستیم، شرایط فعلی اقتصادی کشور عزیزمان ایران تبدیل به گلوگاهی بسیار تنگ و سخت برای تمام اقشار جامعه شده است و کمتر کسی پیدا می‌شود که از این شرایط رضایت داشته باشد.',
   url: '/blog/2020/11/02/hard-decision'
  },
  {
   title: 'زیرساخت ابری به زبان ساده',
   imageUrl: '/img/blog/fandogh-paas-banner.svg',
   slug: 'در این پست تلاش کردیم به صورت خلاصه زیرساخت‌های ابری رو برای عموم توضیح بدیم.',
   url: '/blog/2019/10/09/cloud-infra-simple'
  }
]


function Blog({imageUrl, url, title, slug}) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={clsx('col col--4', styles.feature)}>
      <a className={styles.card_blog} href={url} target="_blank">
        {imgUrl && (
          <div className="text--center">
            <img className={styles.blogImage} src={imgUrl} alt={title} />
          </div>
        )}
        <h3 className={styles.cardBlogTitle}>{title}</h3>
        <p>{slug}</p>
        <a className={styles.readMoreButton} href={url} target="_blank">مطالعه پست</a>
      </a>
    </div>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;
  return (
    <Layout
      title="صفحه اصلی"
      description={`${siteConfig.tagline}`}>
      <main className={styles.blogMainContainer}>
        <div className={styles.blogHeader}>
          <p>آخرین بلاگ پست ها</p>
          <div className={styles.blogDivider}></div>
          <a href="/blog">مشاهده همه</a>
        </div>
        {blog_posts && blog_posts.length > 0 && (
          <section className={styles.features}>
            <div className="container">
              <div className={clsx('row', styles.inner_container)}>
                {blog_posts.map((props, idx) => (
                  <Blog key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}

export default Home;

