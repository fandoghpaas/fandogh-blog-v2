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
    announcementBar: {
      id: 'support_us', // Any value that will identify this message.
      content: 'مستندات سکوی ابری فندق بروزرسانی شد.',
      backgroundColor: '#fafbfc', // Defaults to `#fff`.
      textColor: '#091E42', // Defaults to `#000`.
      isCloseable: true, // Defaults to `true`.
    },
    googleAnalytics: {
      trackingID: 'UA-141789564-1', // UA-120059029-1
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
          href: 'https://github.com/fandoghpaas/fandogh-docs',
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
              href: 'https://github.com/fandoghpaas/fandogh-docs',
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
             'https://github.com/fandoghpaas/fandogh-blog/edit/master/website/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
