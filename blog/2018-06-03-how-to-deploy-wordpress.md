---
title: deploy کردن وردپرس با فندق
author: سکوی ابری فندق
author_image_url: /img/fandogh.png
tags: [fandogh_paas, docker, paas, wordpress, mysql]
image: /img/thumbs/blog-thumb-wordpress.png
---

برای راه‌اندازی یک وب سایت وردپرسی بر روی فندق نیاز به ۲ سرویس داریم.
اگربا مفهوم [سرویس ها](https://docs.fandogh.cloud/docs/services/services)
آشنا نیستید مستندات مربوط به سرویس را مطالعه کنید.

<!--truncate-->

اولین سرویس میشه پایگاه داده که از MySQL استفاده میکنیم. شما به راحتی می توانید از [سرویس های مدیریت شده فندق](https://docs.fandogh.cloud/docs/managed-services/mysql-managed-service) استفاده کنید.
کافیه وارد داشبورد بشید از قسمت سرویس ها، ساخت سرویس را بزنید و سرویس MySQL را انتخاب کنید.



![Fandogh Managed Services](/img/blog/wordpress/dashboard_services.jpg "Wordpress Banner")

اطلاعاتی که برای ساخت MySQL نیاز است را وارد کنید. حتما در نظر داشته باشید که به سرویس MySQL میزان رم مورد نیازش را بدید. اگر میزان رم این سرویس کم باشه سرویس مرتب restart میشه و عملا امکان کار کردن با اون را نخواهید داشت.

![Mysql Service](/img/blog/wordpress/mysql_service.png "Mysql Service")

بعد از اینکه سرویس MySQL راه‌اندازی شد فقط کافیه که بر روی لینکی که خود فندق به ما میده کلیک کنیم و از طریق PHPMyAdmin وارد داشبورد بشویم. یادتون باشه که نام کاربری به صورت پیش فرض root هست و پسورد اون چیزی هست که خودتون انتخاب کردید.

![Mysql Service](/img/blog/wordpress/wordpress_mysql_service.png "Mysql Service")

در این قسمت باید یک دیتابیس جدید برای سرویس wordpress خودمون ایجاد کنیم. تنظمیاتی که مد نظرتون هست را انتخاب کنید و بر روی ساخت کلیک کنید.

![Mysql Service](/img/blog/wordpress/mysql_php_myadmin.png "Mysql PhpMyAdmin")

بعد از اینکه دیتابیس ساخته شد باید سراغ ساخت سرویس wordpress بریم. برای اینکار دوباره به قسمت سرویس ها در داشبورد
برمیگردیم و گزینه ساخت سرویس را میزنیم و از گزینه های موجود بر روی Fandogh Wizard کلیک میکنیم. در صفحه ای
که باز میشه ابتدا باید مشخص کنیم که این سرویس ازنوع external هست و اون را انتخاب می کنیم. نام سرویس و منابع مورد
نیاز برای سرویس را مشخص میکنیم. پورتی که ایمیج وردپرس برای ما مشخص کرده ۸۰ هست و اون را در قسمت port وارد
میکنیم. پس از اعمال تغییرات مورد نظر چیزی شبیه به تصویر زیر باید داشته باشید.

![](/img/blog/wordpress/service_wizard_name.png)

بر روی بعدی کلیک کنید تا ادامه تنظیمات را مشخص کنیم.
در این قسمت باید مبدا ایمیج را مشخص کنیم. در این پست ما از خود docker hub به عنوان registry [ایمیج](https://hub.docker.com/_/wordpress) استفاده می کنیم. بر روی گزینه Docker hub کلیک میکنیم و اسم ایمیج به همراه ورژن ایمیج را وارد میکنیم.

![](/img/blog/wordpress/wizard_image_section.png )

بر روی بعدی کلیک کنید.

همانطور که در صفحه ایمیج wordpress در docker hub مشخص شده باید یک سری Environment Variable را مشخص کنیم.

این مقادیر شامل:

WORDPRESS_DB_HOST همان اسم سرویس MySQL ای است که از قبل ساختیم.

WORDPRESS_DB_USER نام کاربری سرویس MySQL است که به صورت پیش فرض برابر با root می باشد.

WORDPRESS_DB_PASSWORD رمز عبوری که از قبل مشخص کردیم را وارد میکنیم.

WORDPRESS_DB_NAME و در نهایت اسم دیتابیسی که در سرویس MySQL ساختیم را مشخص می کنیم.

![](/img/blog/wordpress/wizard_envs.png )
بر روی بعدی کلیک کنید.

در این قسمت باید فولدر هایی که قصد داریم به [فضای ذخیره‌سازی](https://docs.fandogh.cloud/docs/volumes/dedicated-volume) mount شوند را مشخص کنیم. در صفحه [داکرهاب وردپرس](https://hub.docker.com/_/wordpress) دو مسیر برای مشخص شدند که عبارتند از:

- /var/www/html/wp-content/themes/
- /var/www/html/wp-content/plugins/

باید این دو مسیر را به shared volume و یا dedicated volume مانت کنیم. برای اینکار کافیه این مسیر ها را به همراه اسمی که مد نظرمون هست وارد کنیم.

![](/img/blog/wordpress/wizard_mount.png )

پس از وارد کردن موارد فوق بر روی گزینه اتمام ساخت کلیک کنید.

اگر تمام تنظیمات را به درستی اعمال کرده باشید در نهایت پس از ساخت سرویس بر روی لینکی که فندق به شما می دهد کلیک کنید تا صفحه نصب ورد پرس را مشاهده کنید.

![](/img/blog/wordpress/wordpress_installation.png )
برای راحتی کار شما می توانید مانیفست زیر را کپی کنید و در یک فایل ذخیره کنید و اون را apply کنید تا سایت وردپرسی شما در دسترس قرار بگیرد. همینطور در نظر داشته باشید که به جای سرویس Mysql می توانید از سرویس MariaDB هم استفاده کنید.

```

kind: ManagedService
name: wordpressmysqldb
spec:
  service_name: mysql
  version: 8.0
  parameters:
    - name: phpmyadmin_enabled
      value: true
    - name: mysql_root_password
      value: root_password
    - name: mysql_database
      value: wordpressdb
  resources:
      memory: 512Mi

---

kind: ExternalService
name: wordpress
spec:
  image: library/wordpress:latest
  image_pull_policy: Always
  replicas: 1
  port: 80
  path: /
  allow_http: false
  volume_mounts:  
     - mount_path: /var/www/html/wp-content/themes/
       sub_path: themes
     - mount_path: /var/www/html/wp-content/plugins/
       sub_path: plugins
  env:
    - name: WORDPRESS_DB_HOST
      value: wordpressmysqldb
    - name: WORDPRESS_DB_USER
      value: root
    - name: WORDPRESS_DB_PASSWORD
      value: root_password
    - name: WORDPRESS_DB_NAME
      value: wordpressdb
  
```
