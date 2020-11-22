---
title: استفاده از برنامه Mattermost به عنوان یک سرویس
author: سکوی ابری فندق
author_image_url: /img/fandogh.png
tags: [fandogh_paas, docker, paas, mattermost]
image: /img/blog/fandogh-paas-banner.svg
---

![Mattermost](/img/blog/mattermost_messenger.png "Mattermost")
  
  برنامه Mattermost یک سرویس پیام‌رسان است که عمده استفاده از آن برای شرکت‌ها بوده و از محبوبیت بالایی برخوردار است. این برنامه این قابلیت را دارد که به صورت رایگان بر روی سرورهای شخصی مورد استفاده قرار گیرد، به همین منظور ما هم تصمیم گرفتیم یک پست براتون آماده کنیم و در مورد نحوه دیپلوی کردن این سرویس بر روی فندق توضیح مختصری بدیم.<br/>برای **deploy** کردن این سرویس کافی است به ترتیب زیر عمل کنید.

<!--truncate-->

۱- ابتدا با دستور زیر وارد حساب کاربری خود شوید.
  
```bash
fandogh login
```

۲- سپس با استفاده از دستور زیر یک دیتابیس برای برنامه mattermost ایجاد نمایید.

```bash
fandogh managed-service deploy postgresql 10.4 \
 -c service_name=chat-db \
 -c adminer_enabled=true \
 -c postgres_password=postgres
```

۳- سپس از طریق لینکی که در اختیارتان قرار داده می‌شود وارد صفحه **adminer** شوید و دیتابیس مورد نیاز را بر روی PostgreSQL قرار دهید و نام کاربری که postgres می‌باشد و رمز عبور را که در دستور بالا به عنوان مقدار برای postgres_password انتخاب کرده‌اید قرار دهید.<br/>
بعد از آنکه وارد شدید، یک دیتابیس با نام دلخواه ایجاد کنید٬ ما در اینجا برای مثال نام دیتابیس را mm در نظر گرفته‌ایم.
<br/>

۴- در انتها بعد از آنکه کار با دیتابیس RUN تمام شد٬ مشخصات زیر را کپی کرده و بر روی سیستم خود در یک فایل جدید با فرمت **yml.** ذخیره نمایید.
<br/>

:::tip راهنمایی
توجه داشته باشید که DB_HOST همان نام دیتابیس است که در قدم دوم انتخاب کرده‌اید.
:::

```yaml title="svc_deployment.yml"
kind: ExternalService
name: chat
spec:
  image: mattermost/mattermost-prod-app:5.6.1
  port: 8000
  env:
    - name: DB_HOST
      value: chat-db
    - name: DB_PORT
      value: 5432
    - name: MM_USERNAME
      value: postgres
    - name: MM_PASSWORD
      value: postgres
    - name: MM_DBNAME
      value: mm
  volume_mounts:
    - mount_path: /mattermost/data
      sub_path: chat/data
      volume_name: chat-volume
    - mount_path: /mattermost/logs
      sub_path: chat/logs
      volume_name: chat-volume
    - mount_path: /mattermost/plugins
      sub_path: chat/plugins
      volume_name: chat-volume
```

:::caution نکته
MM_PASSWORD در این فایل تنها برای آزمایش می‌باشد و باید یک password مناسب‌تری را انتخاب نمایید
:::

۵-  سپس با استفاده از **cli** به آدرسی که فایل **yml.** را در آنجا ذخیره کرده‌اید بروید و دستور زیر را اجرا نمایید.

```bash
fandogh service apply -f {path_to_yml_file}/your_file.yml
```

بعد از اینکه این دستور را اجرا کردید، سرور بقیه کارها را انجام می‌دهد و در کمتر از یک دقیقه برنامه شما بر روی URL که cli به شما می‌دهد قابل دسترسی می‌باشد و می‌توانید آن را با همکاران و دوستان خود به اشتراک بگذارید.

:::caution نکته
صورتی که از قابلیت **سرویس رایگان** استفاده می‌کنید، باید خط‌های مربوط به  volume_name را از مانیفست بالا حذف کنید در غیر این صورت با خطا مواجه خواهید شد
:::

:::caution نکته
فایل های شما در حالت **حساب رایگان** بر روی **Shared Storage** مربوط به namesapce شما ذخیره می‌شود که این فضا محدود است و بین تمام سرویس های شما اشتراک گذاری شده است
:::