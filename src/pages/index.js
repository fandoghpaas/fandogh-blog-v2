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
  },
  {
   title: 'چرخه CI/CD با استفاده از گیت‌لب و فندق',
   imageUrl: '/img/blog/gitlab-ci-cd-logo.png',
   slug: (<>
     داشتن چرخه CI/CD خودکار در یک پروژه امروزه تبدیل به یک ضرورت شده و اغلب تیم‌ها با استفاده از ابزار‌های موجود در مراحل ابتدایی پروژه چرخه CI/CD را راه‌اندازی می‌کنند و از مزایای آن بهره می‌برند.
   </>),
   url: '/blog/2019/02/08/how-to-gitlab-ci'
  },
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

