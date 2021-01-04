---
title: استفاده از MinIO در پروژه‌های Django
author: سکوی ابری فندق
author_image_url: /img/fandogh.png
tags: [fandogh_paas, docker, dockerfile, django, djangoـprojects, s3, minio, object_storage]
image: /img/thumbs/blog-thumb-django-minio.png
---

اگر تجربه کار بر روی پروژه‌هایی با میزان ترافیک بالا را داشته باشید، یکی از مسائلی که به احتمال خیلی زیاد با آن روبه‌رو شده‌اید، مسئله Storage یا همان ذخیره‌سازی است.<br/>
اکثر اپلیکیشن‌ها در ابتدای مسیر از پیچیدگی دوری می‌کنند و برای موضوع ذخیره سازی از File Storage‌ها یا به عبارتی دیگر از همان دیسک سرور‌ها استفاده ‌می‌کنند؛ اما این موضوع رفته رفته با گذشت زمان مشکلات زیادی را به بار می‌آورد.<br/>

![Django Minio](/img/blog/django-minio.svg "Django Minio")

<!--truncate-->
برای مثال:
-   اگر فایل‌ها از حدی بیشتر شوند، ارتقا حجم دیسک سرورها کاری دشوار و گاها همراه با خطر از بین رفتن داده‌ها خواهد بود.
-   اگر قرار باشد سرویس دیگری که بر روی یک سرور دیگر قرار دارد، به این داده‌ها دسترسی داشته باشد، باید یک سرویس میانی مانند *nginx* ایجاد کنیم تا این اطلاعات را برای سرویس‌های دیگر دسترس پذیر کند.
-   ساختار سلسله مراتبی **File Storage** سرعت بازیابی اطلاعات را کاهش داده و این مورد باعث افت بازدهی اپلیکیشن شما خواهد شد و …

حال شاید برای شما این پرسش ایجاد شود که اگر کار با **File Storageها** تا این میزان افت کیفیت به همراه دارد، راه حل چیست؟
خبر خوب این است که راه حل دیگری به نام **Object Storage** سال‌ها پیش در دنیای نرم‌افزار معرفی شد که باعث بهبود کیفیت پروژه‌های مایکروسرویسی گردید.

از معروف ترین‌ این مدل سیستم ذخیره‌سازی می‌توان به `AWS S3` یا همان `Amazon Simple Storage Service` و `MinIO` اشاره کرد که قابلیت‌های بسیاری را در اختیار کاربران قرار می‌دهند.

# S3 Object Storage به زبان ساده

سرویس‌های ذخیره سازی `S3` که بر روی بستر اینترنت در دسترس هستند، قابلیت ذخیره سازی و دستیابی به هر میزان داده **)data(** که شما مد نظر داشته باشید و در هر مکان و زمان را برایتان فراهم می‌کنند.

این امر مقیاس‌پذیری مایکروسرویس‌ها را بهبود و سرعت می‌بخشد.
هر ‌`Object Storage` بر خلاف سیستم `File Storage` داده‌ها را به صورت سلسله مراتبی و فولدر بندی شده ذخیره نمی‌کند بلکه:

1.  داده‌ها را به صورت بلاک‌های مرتبط در آورده
2.  به هر فایل داده، یک `Metadata` کامل اختصاص می‌دهد. `)می‌توانید Metadata را یک شناسنامه کامل از مشخصات فایل در نظر بگیرید(.`
3.  و در انتها به هر فایل یک `ID` جداگانه تخصیص می‌دهد که دسترسی به آن فایل را بسیار ساده می‌کند.

# مزایای S3 Object Storage

از مزایای `S3 Object Storage` می‌توان به موارد زیر اشاره کرد:

-   **آنالیز بهتر داده‌ها:** از آنجایی که ثبت داده‌ها در این سیستم بر اساس **Metadata** است، آنالیز و دسترسی به محتوا کاری بسیار راحت خواهد بود.
-   **مقیاس‌پذیری نامحدود:** شما می‌توانید به هر اندازه که نیاز دارید و بدون محدودیت فضا را افزایش دهید.    
-   **دسترسی سریع به داده‌ها:** با توجه به اینکه داده‌ها در **Object Storage** با **Metadataها** گروه بندی می‌شوند و بر خلاف **File Storage** نیازی به فولدر بندی وجود ندارد، سرعت دسترسی به داده‌ها در این سیستم بسیار بالا است.
-   **کاهش هزینه:** با توجه به مقیاس پذیر بودن سرویس **Object Storage**، هزینه نگهداری اطلاعات کمتر خواهد بود.
-   **بهینه سازی منابع:** از آنجایی که داده‌ها بر اساس **Metadata** ذخیره می‌شوند، محدودیت‌های کمتری برای بهبود و ویرایش وجود دارد.

# استفاده از Object Storage در جانگو

برای آنکه با عملکرد **Object Storageها** در دنیای واقعی بیشتر آشنا شویم، در این بخش نحوه اتصال یک پروژه `Django Project` به سرویس `MinIO` که یک **S3 Object Storage** رایگان است را برایتان شرح داده‌ایم.


## ۱- ایجاد سرویس MinIO

ابتدا با استفاده از `fandogh-cli` یک سرویس مدیریت شده `MinIO` را ایجاد می‌کنیم:

:::tip راهنمایی
توجه داشته باشید این در این پست برای آموزش از CLI فندق استفاده می‌شود اما شما می‌توانید موارد مطرح شده را از طریق داشبورد مدیریتی سکوی ابری فندق هم انجام دهید.
:::

```bash title=”MinIO Managed Service Deployment”
fandogh managed-service deploy minio latest \
-c service_name=minio \
-c minio_access_key=12charchters \
-c minio_secret_key=12charchters \
-c volume_name=VOLUME_NAME \
-m 512Mi
```

با دستور بالا [طبق مستندات][minio_doc] یک سرویس مدیریت شده MinIO با نام `minio` در فضانام شما ساخته خواهد شد.

## ۲- نصب پکیج `django-minio-storage`

برای اینکه بتوانیم از پروژه جانگویی به سرویس `minio` که در بخش قبل ایجاد کردیم دسترسی داشته باشیم، باید ابتدا ابزار مناسب آن را در اختیار پروژه قرار دهیم.<br/>
برای این کار پکیج مناسب که در اینجا `django-minio-storage` است را در فایل `requirements.txt` قرار می‌دهیم.

```bash title="requirements.txt"
...
django-minio-storage==0.3.10
...
```

:::note توجه
هنگام نگارش این پست، آخرین نسخه رسمی django-minio-storage طبق سایت PyPi، نسخه ۰.۳.۱۰ بوده است؛ قبل از استفاده از این آموزش، حتما آخرین نسخه موجود را بررسی و در صورت مغایرت با مقدار بالا، مقدار جدید را جایگزین نمایید.
:::

سپس با دستور زیر پیکیج‌ها را نصب می‌کنیم:

```bash title=”install requirements.txt”
pip install -r requirements.txt
```

## ۳- نصب پکیج `django-minio-storage` و تنظیمات آن در جانگو

بعد از آنکه پکیج‌ها را به درستی و با موفقیت نصب کردید، در فایل `settings.py` در بخش `INSTALLED_APPS` این پیکیج را اضافه کنید:

```bash title=”settings.py”
INSTALLED_APPS: [
....
“minio_storage”,
....
]
```

سپس در انتهای همان فایل مقادیر زیر را وارد نمایید:

```bash title=”settings.py”
DEFAULT_FILE_STORAGE = "minio_storage.storage.MinioMediaStorage"
STATICFILES_STORAGE = "minio_storage.storage.MinioStaticStorage"
MINIO_STORAGE_ENDPOINT = os.environ.get('MINIO_STORAGE_ENDPOINT', ‘minio:9000’)
MINIO_STORAGE_ACCESS_KEY = os.environ.get('MINIO_STORAGE_ACCESS_KEY', None)
MINIO_STORAGE_SECRET_KEY = os.environ.get('MINIO_SECRET_KEY', None)
MINIO_STORAGE_USE_HTTPS = False
MINIO_STORAGE_MEDIA_BUCKET_NAME = 'media'
MINIO_STORAGE_STATIC_BUCKET_NAME = 'static'
MINIO_STORAGE_AUTO_CREATE_MEDIA_BUCKET = True
MINIO_STORAGE_AUTO_CREATE_STATIC_BUCKET = True
```
توجه داشته باشید مقادیر `MINIO_STORAGE_ENDPOINT`، `MINIO_STORAGE_ACCESS_KEY` و `MINIO_STORAGE_SECRET_KEY` به صورت پیشفرض از **environment vriable‌های** موجود در سیستم عامل سرویس شما فراخوانی خواهند شد و در صورت نبود هر یک از این مقادیر، مقدار ثابتی که به عنوان آرگومان دوم قرار داده شده است فراخوانی خواهد شد.

:::note توجه
توجه داشته باشید ما مقدار `MINIO_STORAGE_ENDPOINT` را برابر با اسم سرویس قرار داده‌ایم؛ چرا که هم سرویس minio و هم سرویس جانگو، هر دو در یک فضانام قرار دارند و سرویس جانگو از طریق اسم سرویس minio به آن متصل می‌شود.
اما اگر سرویس minio خارج از فضانام سکوی ابری فندق باشد، باید آدرس کامل را به به جای مقدار minio قرار دهید.
:::

## ۴- ایجاد Data Model
حال در فایل `models.py` پروژه جانگو یک مدل آزمایشی با نام `Image` ایجاد می‌کنیم که با گرفتن یک فایل و تولید شناسه خودکار، آن را در `Bucket` با نام `media`  و پوشه `fandogh` ذخیره می‌کند.

```bash title=”models.py”
....
class Image(models.Model):
"""
This is just for uploaded image
"""
objects = models.Manager()
id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
image = models.ImageField(upload_to='fandogh')

def delete(self, *args, **kwargs):
"""
Delete must be overridden because the inherited delete method does not call `self.file.delete()`.
"""
self.image.delete()
super(Image, self).delete(*args, **kwargs)
```

## ۵- استقرار سرویس جانگو بر روی سکوی ابری فندق

در انتها سرویس خود را با استفاده از دستور زیر بر روی سکوی ابری فندق مستقر نمایید:

```bash title=”fandogh source init”
fandogh source init --name django
```

سپس

```bash title=”fandogh source run”
fandogh source run
```

بعد از آنکه سرویس به صورت کامل بر روی سکو مستقر شد، با مراجعه به آدرس سرویس `minio` که سکو به شما داده است، می‌توانید مشاهده کنید که Bucketای برای شما ساخته نشده است و علت آن هم این است که هنوز داده‌ای در اپلیکیشن ذخیره نشده است.

## ۶- ذخیره تصویر آزمایشی

حال بعد از با وارد شدن به آدرس سرویس جانگویی و بخش admin یک تصویر آزمایشی را داخل سایت بارگذاری می‌کنیم:

![Django Admin Panel](/img/blog/django-minio-upload-image.png "Django Admin Panel")  

حال بعد از ذخیره، می‌توانیم با مراجعه به داشبورد `MinIO` مشاهده کنیم که همانند تصویر زیر، فایل مورد نظر ما در باکت `media` و فولدری با نام `fandogh` ذخیره شده است:

![Django Minio Panel](/img/blog/django-minio-panel.png "Django Minio Panel")

# پایان

همانطور که مشاهده کردید، تنها با چند دقیقه صرف زمان و چند خط تغییرات توانستیم به راحتی اپلیکیشن جانگو را به یک سرویس `MinIO` متصل کنیم و دیگر نگرانی‌ بابت ذخیره‌سازی اطلاعات و دسترسی به آن‌ها نداشته باشیم.

:::tip راهنمایی
همچنین شما می‌توانید پروژه کامل این بلاگ پست را از روی [مخزن گیت هاب][github] سکوی ابری فندق دریافت و مشاهده کنید.
:::


[minio_doc]: https://docs.fandogh.cloud/docs/managed-services/minio
[github]: https://github.com/fandoghpaas/showcases/tree/main/simple-django-minio
