module.exports = {
  title: 'بلاگ سکوی ابری فندق',
  tagline: 'اولین سکوی ابری عمومی ایران',
  url: 'https://blog.fandogh.cloud',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  favicon: 'img/fandogh.png',
  organizationName: 'Fandogh PaaS', // Usually your GitHub org/user name.
  projectName: 'fandogh-blog', // Usually your repo name.
  plugins: [
    [
      '@docusaurus/plugin-client-redirects',
      {
        fromExtensions: ['html', 'htm'],
        redirects: [
          {
            from: ['/articles/hard-decision', '/articles/hard-decision.html'],
            to: '/blog/2020/11/02/hard-decision'
          },
          {
            from: ['/articles/how-write-docker-file', '/articles/how-write-docker-file.html'],
            to: '/blog/2018-05-20-how-write-docker-file'
          },
          {
            from: ['/articles/fandogh-introduction.html', '/articles/fandogh-introduction'],
            to: '/blog/2018-06-23-fandogh-introduction',
          },
          {
            from: ['/articles/how-to-use-custom-domain.html', '/articles/how-to-use-custom-domain'],
            to: '/blog/2018-07-23-how-to-use-custom-domain',
          },
          {
            from: ['/articles/django-projects.html', '/articles/django-projects'],
            to: '/blog/2018-07-24-django-projects',
          },
          {
            from: ['/articles/namespace-storage.html', '/articles/namespace-storage'],
            to: '/blog/2018-08-04-namespace-storage',
          },
          {
            from: ['/articles/zero-downtime.html', '/articles/zero-downtime'],
            to: '/blog/2018-08-08-zero-downtime',
          },
          {
            from: ['/articles/workshop.html', '/articles/workshop'],
            to: '/blog/2018-10-28-workshop',
          },
          {
            from: ['/articles/mattermost-deployment-post.html', '/articles/mattermost-deployment-post'],
            to: '/blog/2018-12-22-mattermost-deployment-post',
          },
          {
            from: ['/articles/how-to-gitlab-ci.html', '/articles/how-to-gitlab-ci'],
            to: '/blog/2019-02-08-how-to-gitlab-ci',
          },
          {
            from: ['/articles/cloud-infra-simple.html', '/articles/cloud-infra-simple'],
            to: '/blog/2019-10-09-cloud-infra-simple',
          },
          {
            from: ['/docs', '/docs/neext'],
            to: '/blog',
          }
        ],
      },
    ],
  ],
  themeConfig: {
    hideableSidebar: true,
    prism: {
      theme: require('prism-react-renderer/themes/github'),
      darkTheme: require('prism-react-renderer/themes/dracula'),
    },
    image: 'img/fandogh.png',
    metadatas: [{name: 'twitter:card', content: 'summary'}, 
                {name: 'description', content: 'سکوی ابری فندق اولین سکوی ابری عمومی ایران'},
                {name: 'og:image', content: 'https://doc-demo-sorena.fandogh.cloud/img/fandogh.png'}],
    ogImage: 'img/fandogh.png',
    twitterImage: 'img/fandogh.png',
    colorMode:{
      defaultMode: 'dark',
      switchConfig: {
        darkIcon: '🌙',
        lightIcon: '🌕',
      }
    },
    navbar: {
      hideOnScroll: true,
      title: 'سکوی ابری فندق',
      logo: {
        alt: 'Fandogh PaaS',
        src: 'img/fandogh.svg',
      },
      items: [
        {
          href: 'https://github.com/fandoghpaas/fandogh-blog-v2',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      logo: {
        alt: 'Fandogh PaaS Logo',
        src: 'img/fandogh.png',
        href: 'https://www.fandogh.cloud',
      },
      style: 'dark',
      links: [
        {
          title: 'بیشتر',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/fandoghpaas/fandogh-blog-v2',
            },
            {
              label: 'email',
              href: 'mailto:support@fandogh.cloud'
            },
            {
              label: 'twitter',
              href: 'https://twitter.com/fandoghpaas'
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Fandogh PaaS, Inc.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
       {
        blog: {
          showReadingTime: true,
          editUrl:
             'https://github.com/fandoghpaas/fandogh-blog-v2/edit/main/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
