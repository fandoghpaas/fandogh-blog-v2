---
title: استفاده از Redis در پروژه‌های Django
author: سکوی ابری فندق
author_image_url: /img/fandogh.png
tags: [fandogh_paas, docker, dockerfile, django,redis, cache, جانگو, ردیس]
image: /img/thumbs/blog-thumb-django-redis.png
---

یکی از مواردی که در مورد وب‌سایت‌های Dynamic یا به زبان فارسی، پویا باید در نظر گرفته شود خود موضوع پویایی‌ است. در دنیای جدید، پشت وب‌سایت‌ها و اپلیکیشن‌ها، میزان قابل توجهی عملیات سروری نهفته است. از پرس‌و‌جوهای )Query( سمت دیتابیس گرفته تا Render شدن تمپلیت‌ها و محاسبات ریاضی و منطقی پیچیده.<br/><br/>
شاید در سیستم‌هایی با مقیاس‌های کوچک و متوسط که ترافیک ورودی خیلی زیادی ندارند، احساس نیاز به این ویژگی را درک نکرده باشند؛ اما رفته رفته در مقیاس‌های بالاتر از متوسط، زمانی که ترافیک‌ ورودی رو به افزایش و درخواست‌های تکراری، با پردازش‌های هزینه‌بر و سنگین سمت سرور بیشتر شوند، این نیاز احساس می‌شود.

![Django Redis](/img/blog/django-redis-banner.svg "Django Redis")

<!--truncate-->

## تعریف Cache

به صورت کلی تعریف Cache به این صورت است:

:::important تعریف Cache
به عملیات ذخیره نتیجه عملیات پر هزینه‌ بر روی سرور برای جلوگیری از اجرای دوباره و دوباره آن در هر بار درخواست، عمل **Cache** کردن می‌گوییم.
:::

برای شفاف‌تر شدن موضوع، به شکل زیر توجه کنید:

![No Cache Diagram](/img/blog/no-cache-diagram.svg "No Cache Diagram")

در تصویر بالا با فرض اینکه سازوکاری برای **`Cache`** کردن وجود نداشته باشد، همانطور که مشاهده می‌کنید، هر درخواست )توجه داشته باشید درخواست‌ها یکسان در نظر گرفته شده‌اند( از سمت کاربر مستقیما به سمت دیتابیس منتقل شده و عملیات هزینه‌بر دیتابیسی انجام شده و پاسخ به کاربران بازگردانده می‌شود.

شاید در تصویر مورد نظر ۳ کاربر مشکل خاصی ایجاد نکند؛ اما **تصور کنید به جای ۳ کاربر، ۳ هزار کاربر همزمان یک درخواست مشابه را به سمت سرورهای شما روانه سازند!  
نتیجه فاجعه‌بار خواهد بود!**

حال برای رفع این مشکل سازوکار `Cache` را به عنوان راه حلی میانی به دیاگرام بالا اضافه می‌کنیم:

![Cache Diagram](/img/blog/cache-diagram.svg "Cache Diagram")

همانطور که در تصویر بالا مشاهده می‌کنید، اولین درخواست که از کاربر **Client 1** برای سرور فرستاده می‌شود، سرور ابتدا `Cache` را بررسی می‌کند، از آنجایی که نتیجه در `Cache` وجود ندارد، این درخواست به سمت دیتابیس ارسال شده و پاسخ بازگردانده شده ابتدا در `Cache` ذخیره، سپس به کاربر ارجاع داده می‌شود.

حال کاربرهای **Client 2** و **Client 3** که همان درخواست‌ها را ارسال می‌کنند، `Cache` مستقیما وارد عمل شده و بدون آنکه دیتابیس را درگیر کند، پاسخ مناسب را باز می‌گرداند.


## مزایای استفاده از Cache
با توجه به توضیحات ابتدایی که در مورد قابلیت `Cache` ارائه شد، می‌توان مزایای آن را به صورت زیر شرح داد:

### افزایش کارایی سیستم
از آنجایی که `Cache` از **RAM** به عنوان محل ذخیره‌سازی داده‌ها استفاده می‌کند و همینطور به دلیل اینکه سرعت بازیابی داده‌ها از طریق **RAM** از دیسک‌های مغناطیسی یا **SSD‌ها** بیشتر است، در نتیجه سرعت بهره‌ وری افزایش چشم‌گیری داشته و این امر در انتها باعث افزایش کارایی سیستم خواهد شد.

### کاهش هزینه دیتابیس‌
هر **Instance** از `Cache` قابلیت **اجرای چند صد هزار IOPS یا همان )input/output operations per second(** را دارد که برابر با قابلیت اجرای IOPS چندین Instance از دیتابیس است!<br/>
همین امر موجب می‌شود بار و هزینه دیتابیس‌ها به صورت چشمگیری کاهش داشته باشند.

### کاهش بار متمرکز بر روی Backend
از آنجایی که لزوما کلیه عملیات از نوع دیتابیسی نبوده و ممکن است پردازش‌های منطقی سنگینی هم در میان باشد، وجود لایه میانی‌ای به نام `Cache` می‌تواند تاثیر بسزایی در کاهش فشار بر روی درخواست‌های ارجاع داده شده سمت سرور را داشته باشد.<br/>
**این امر باعث می‌شود در ترافیک‌های بالا که فشار بر روی Backend افزایش میابد، سرور تا حد ممکن افت کیفیت در پاسخگویی نداشته باشد.**

### قابل پیشبینی بودن کارایی سیستم
ممکن است در طول چرخه حیات یک سیستم، شرایط خاصی بوجود بیاید که پیشبینی کارکرد و بهینگی کارایی سیستم امری سخت شود.<br/>
برای مثال شرایطی مانند روز انتخابات یا روز انتخاب واحد یا جمعه سیاه و … که در طول سال ممکن است به تعداد انگشتان یک دست هم رخ ندهند!<br/>
اگر در این شرایط از یک سازوکار مناسب `Caching` استفاده کرده باشید، تا حد زیادی می‌توانید کارایی سیستم را زیر بار احتمالی پیشبینی کنید.

### حذف نقاط پر مراجعه از دیتابیس
برای شفاف‌تر شدن این تیتر، پروفایل یک celebrity خاص را در نظر بگیرید، به طور متوسط یک پروفایل بخشی از آن دسته داده‌ها که پتانسیل تغییر بالایی داشته باشد نیست؛ اما مراجعه به آن به تکرار صورت می‌گیرد.<br/>
حال اگر سازوکاری مناسب برای دسترسی و پردازش این اطلاعات وجود نداشته باشد، احتمال خیلی زیاد، بار بسیار زیادی بر روی دیتابیس قرار می‌گیرد!<br/>
قطعا در یک اپلیکیشن قسمت‌های مشابه زیادی وجود دارد که می‌تواند باعث چنین پیشامدی شود.<br/>
شما می‌توانید با استفاده از سازوکار `Caching` این موارد را به صورت کامل پوشش دهید تا بار بزرگی از روی دوش دیتابیس برداشته شود.

## استفاده از Redis به عنوان Cache Layer  

حال اجازه بدهید موضوع ‌`Cache` کردن را با استفاده از یک مثال عملیاتی بهتر توضیح دهیم. برای استفاده از قابلیت `Cache` و ایجاد این لایه میانی در سیستم اپلیکیشن، روش‌ها و سرویس‌های متفاوتی وجود دارد.<br/>
یکی از محبوب‌ترین سرویس‌ها در حوزه `Caching` سرویس **[Redis][redis_site]** است که در این بلاگ پست برای آموزش در نظر گرفته‌ایم.

### Redis چیست؟
با توجه به تعریف سایت [Redis][redis_site] این سرویس به شرح زیر معرفی شده است:

:::important تعریف Redis
سرویس **Redis** یا **Remote Dictionary Server** یک ساختمان داده مبتنی بر حافظه داخلی و دیتابیس مبتنی بر **key-value** به صورت توزیع شده و همچنین یک سیستم **Cache** و **Message Broker** با قابلیت تاب آوری انتخابی است.
همچنین سرویس **Redis** گستره زیادی از تعریف داده‌ها مانند رشته‌ها )Strings(، لیست، Maps، Sets، HyperLogLogs و … را پشتیبانی می‌کند.
:::

حال که با تعریف سرویس `Redis` آشنا شدید، وقت آن رسیده تا از این سرویس محبوب به صورت عملیاتی استفاده کنیم تا بیشتر با مزایای آن آشنا شویم.

## ایجاد پروژه تست

برای ایجاد یک پروژه تست با قابلیت `Cache` به سرویس‌های زیر نیاز خواهیم داشت:
-   [Redis][redis_anchor]
-   [MySQL][mysql_anchor]
-   [پروژه جانگو )Django Project(][django_anchor]

### ایجاد سرویس Redis بر روی سکوی ابری فندق
برای ایجاد سرویس `Redis` می‌توانیم از قابلیت [سرویس‌های مدیریت شده سکوی ابری فندق][redis_managed_services_url] استفاده کنیم.<br/>
ابتدا با استفاده از `fandogh cli` و مانیفست زیر، یک سرویس مدیریت شده `Redis` ایجاد می کنیم.

```bash
fandogh service apply -f redis_deployment.yml
```

```yaml title="redis_deployment.yml"
kind: ManagedService
name: redis
spec:
  service_name: redis
  version: 5.0.3
  parameters:
    - name: redis_password
      value: pass123
    - name: redis_dashboard_enabled
      value: 'true'
    - name: redis_dashboard_username
      value: user
    - name: redis_dashboard_password
      value: dashboardpassword
  resources:
      memory: 512Mi
```

بعد از اجرای دستور بالا یک سرویس مدیریت شده `Redis` در فضانام ما ایجاد می‌شود که:
* نام آن redis است.

:::tip آموزشی
service_name نشانگر نام سرویس است؛ به وسیله این اسم، سایر سرویس‌های فضانام شما می توانند با این سرویس در ارتباط باشند. )در نظر داشته باشید port پیش فرض برای redis برابر با 6379 است(.
:::

* رمز آن برابر با **pass123** و نام کاربری سرویس همان **redis** است.
* قابلیت داشبور در آن فعال شده و نام کاربری برابر با `user` و رمز عبور `dashboardpassword` است.


### ایجاد سرویس MySQL بر روی سکوی ابری فندق
مانند قسمت قبل، برای ساخت سرویس دیتابیس `MySQL` نیز می‌توانیم از [سرویس مدیریت شده][mysql_managed_services_url] موجود بر روی سکو استفاده کنیم.<br/>
کافی است با استفاده از `fandogh cli` و مانیفست زیر، یک سرویس مدیریت شده `MySQL` ایجاد کنیم:

```bash
fandogh service apply -f mysql_deployment.yml
```

```yaml title="mysql_deployment.yml"
kind: ManagedService
name: mysql
spec:
  service_name: mysql
  version: latest
  parameters:
    - name: phpmyadmin_enabled
      value: 'true'
  resources:
      memory: 512Mi
```

بعد از اجرای دستور بالا یک سرویس مدیریت شده `MySQL` در فضانام ما ایجاد می‌شود که:
-   نام آن mysql است

:::tip نکته آموزشی
service_name نشانگر نام سرویس است که به وسیله آن، سایر سرویس‌های فضانام شما می توانند با این سرویس در ارتباط باشند. )در نظر داشته باشید port پیش فرض برای mysql برابر با 3306 است(.
:::

-   داشبورد مدیریت PhpMyAdmin در آن فعال است  
-   و از آنجایی که رمزی به آن نداده‌ایم، **نام کاربری و رمز عبور به صورت پیشفرض root/root خواهد بود**.

بعد از آنکه سرویس `MySQL` به درستی مستقر شد، با استفاده از آدرس نمایش داده شده، مانند تصویر زیر وارد داشبورد **PhpMyAdmin** شده و یک دیتابیس با نام `django_redis_database` ایجاد می‌کنیم.

![MySQL Dashboard](/img/blog/django-redis-mysql-dashboard.png "MySQL Dashboard")

### ایجاد پروژه و سرویس Django
برای آنکه پروژه جانگو بتواند به سرویس `Redis` و `MySQL` متصل شود، باید تنظیمات مربوطه را در پروژه قرار دهیم.

ابتدا پکیج مربوط به [django-redis][django_redis_url] و همینطور رابط [mysqlclient][mysql_client] را در فایل requirements.txt قرار می‌دهیم:

```yaml title=”requirements.txt”
...
django-redis==4.12.1
mysqlclient==1.3.13
...
```

سپس در تنظیمات پروژه جنگو در فایل **`settings.py`** مقادیر زیر را وارد می کنیم:

```py title=”settings.py”
…
CACHES = {
	"default": {
		"BACKEND": "django_redis.cache.RedisCache",
		"LOCATION": "redis://redis:pass123@redis:6379",
		"OPTIONS": {
		"CLIENT_CLASS": "django_redis.client.DefaultClient"
		},
	}
}

...

DATABASES = {
	'default': {
		'ENGINE': 'django.db.backends.mysql',
		'NAME': os.environ.get('MYSQL_NAME', 'django_redis_database'),
		'USER': os.environ.get('MYSQL_USER', 'root'),
		'PASSWORD': os.environ.get('MYSQL_PASSWORD'),
		'HOST': os.environ.get('MYSQL_HOST', 'localhost'),
		'PORT': '3306',
	}
}
...

CACHE_TTL = 600
```

:::caution مهم
مقدار **CACHE_TTL** بیانگر مدت زمان اعتبار داده‌ **Cache** شده بر روی سرویس **Redis** است که به **صورت ثانیه** محاسبه شده و بعد از این مدت زمان، داده‌ها از Redis پاک خواهند شد.
:::

:::note توجه
برای آنکه از طولانی شدن این آموزش جلوگیری شود، روند ساخت پروژه را حذف کردیم؛ اما شما می‌توانید پروژه را به صورت کامل از طریق آدرس [گیت‌هاب][github] دریافت و مشاهده کنید.
:::

### ایجاد سرویس جانگو
حال در مسیر root پروژه جانگو، با استفاده از قابلیت [اجرای مستقیم کد][django_source_deployment] دستور زیر را وارد می‌کنیم:

```bash
fandogh source init
```

بعد از وارد کردن این دستور، fandogh-cli از شما اطلاعات زیر را درخواست می‌کند:

```bash
Service Name: django
```

در اولین درخواست نام سرویس از شما خواسته می‌شود که ما در این آموزش اسم سرویس را `django` در نظر گرفتیم.

در مرحله بعد از شما درخواست می‌شود که نوع کد را مشخص کنید:

```bash {2} title="انتخاب فریم ورک"
-[1] Static Website
-[2] Django Project
-[3] Laravel Project
-[4] ASP.NET core Project
-[5] Nodejs Project
-[6] Spring Boot
Please choose one of the project types above: 2
```

همانطور که مشاهده می‌کنید تنها با قرار دادن شماره می‌توانید مشخص کنید که سرویسی که قصد ساختن آن را دارید از چه فریم ورکی استفاده می‌کند. در اینجا شماره ۲ فریم ورک جانگو مورد نظر ما است.

```bash title="مشخص کردن context"
The context directory [.]:
```

در این مرحله context یا همان workspace پروژه ما درخواست می شود؛ از آنجایی که ما در مسیر root پروژه قرار داریم، با فشردن دکمه Enter از این مرحله عبور می‌کنیم.

```bash title="انتخاب نسخه زبان پایتون"
Python version [3.7]:
```

شما می توانید نسخه پایتونی که استفاده می‌کنید را مشخص کنید؛ سکوی ابری فندق به صورت پیشفرض این نسخه را ۳.۷ در نظر می‌گیرد که برای پروژه ما هم استفاده شده است، پس نیازی به وارد کردن نسخه دیگر نیست و با فشردن دکمه Enter به مرحله بعد می رویم.

```bash title="انتخاب WSGI"
Possible wsgi modules are:
- simple_django_redis.wsgi
WSGI module:
WSGI module: simple_django_redis.wsgi
```

سکوی ابری فندق به صورت خودکار WSGI‌های موجود در پروژه جانگویی را تشخیص و به شما پیشنهاد می‌دهد؛ در صورتی که ماژول به درستی نمایش داده شده است، کافی است همان اسم را وارد نمایید در غیر این صورت باید نام ماژول WSGI مورد نظر را وارد نمایید.

```bash title="انتخاب مسیر static و media"
Static Path [static]:
Media Path []:
```

از آنجایی که پروژه ما تنها برای تست بوده و فایل یا قالب خاصی را سرو نمی‌کند، می‌توانیم دو گزینه بعدی را با ‌Enter تایید کنیم.

```bash
Your source has been initialized.
Please consider to run `fandogh source run` command whenever you are going to deploy your changes
```

در این مرحله **fandogh-cli** یک مانیفست با نام `fandogh.yml` در محل پروژه ایجاد کرده است که می‌توانید محتوای آن را مشاهده کنید.

:::caution نکته
قبل از آنکه سرویس را ایجاد کنیم، نیاز داریم تا چند **Environment Variable** مربوط به **MySQL** را در آن وارد کنیم.
:::

به همین منظور مانیفست `fandogh.yml` را با Editor دلخواه باز کرده و مقادیر زیر را در آن قرار دهید نا مانیفست شما شبیه مانیفست زیر شود:

```yaml title=”fandogh.yml”
kind: ExternalService
name: django
spec:
  image_pull_policy: Always
  port: 80
  source:
    context: .
    media_path: ''
    project_type: django
    python_version: '3.7'
    static_path: static
    wsgi: simple_django_redis.wsgi
  env:
  - name: MYSQL_PASSWORD
  value: root
  - name: MYSQL_HOST
  value: mysql
```

حالا همه چیز برای ساخت سرویس `Django` ما فراهم است. با استفاده از دستور زیر روند ساخت سرویس را تکمیل می‌کنیم:

```bash title="ساخت ایمیج و سرویس جانگو"
fandogh source run
```

این دستور به صورت خودکار پروژه را فشرده، موارد غیر ضروری که نباید آپلود شوند را حذف و بعد از آپلود پروژه، آن را داکرایز کرده و از روی پروژه داکرایز شده به صورت خودکار یک ایمیج با تگ latest ایجاد می‌کند.

بعد از آنکه ایمیج ساخته شده با موفقیت به رجیستری سکوی ابری فندق ارسال شد، روند ساخت و استقرار سرویس از روی ایمیجی که به تازگی ساخته شده است شروع می‌شود.

این روند بسته به حجم پروژه و ایمیج ممکن است چند دقیقه زمان ببرد اما همانطور که می‌بینید، هیچ نیازی به انجام عملیاتی خاصی از سوی کاربر وجود نخواهد داشت.

بعد از آنکه سرویس به درستی مستقر شد، می‌توانید از طریق آدرسی که در اختیار شما قرار داده شده است، می‌توانید سرویس خود را در مرورگر مشاهده بفرمایید.<br/>
ساختار آدرس سرویس به شکل زیر خواهد بود:

```http
https://django-NAMESPACE_NAME.fandogh.cloud
```

:::tip آموزشی
توجه داشته باشید منظور از NAMESPACE_NAME همان نام فضانام شما است.
:::

## استفاده از دستور cache در پروژه جانگو
اگر به فایل `views.py` موجود در پیکیج `store` دقت کرده باشید، دو view در این فایل ساخته شده است:

### view_products
این بخش در هر بار فراخوانی آدرس زیر، لیست تمام محصولات را مستقیما از دیتابیس **MySQL** فراخوانی می‌کند.

```http
https://django-namespace_name.fandogh.cloud/store/
```

```py title="response with query on DB"
...
@api_view(['GET'])
def view_products(request):
    response = {}
    start_time = time.time()
    products = Product.objects.all()
    results = [product.to_json() for product in products]
    response['response_time'] = (time.time() - start_time)
    response['from_database'] = True
    response['from_cache'] = False
    response['results'] = results
    return Response(response, status=status.HTTP_200_OK)
```

همانطور که در View بالا مشاهده می‌کنید، سرور هر درخواست را به صورت مستقیم از دیتابیس پرس‌و‌جو کرده و نتیجه را در کنار چند داده جانبی مانند `from_cache` و `from_database` و `response_time` به کاربر بازمی‌گرداند.<br/>
اگر آدرس بالا را در مرورگر خود وارد کنید با نتیجه‌ای شبیه تصویر زیر مواجه می‌شوید:

![No Cache Response](/img/blog/no-cached-response.png "No Cache Response")

در اینجا همانطور که مشاهده می‌کنید میزان زمانی که صرف پردازش این درخواست شده است مشخص است.

```http title="مدت زمان پاسخگویی بدون cache"
"response_time": 0.0214864134185791
```

### view_cached_products
این بخش نقطه اصلی سرویس مورد نظر ما است که با هر بار فراخوانی آدرس زیر عمل می‌کند.

```http
https://django-namespace_name.fandogh.cloud/store/cached/
```

```py title="response with cache"
...
@api_view(['GET'])
def view_cached_products(request):
    response = {}
    start_time = time.time()
    if 'product' in cache:
        products = cache.get('product')
        response['response_time'] = (time.time() - start_time)
        response['from_database'] = False
        response['from_cache'] = True
        response['results'] = products
        return Response(response, status=status.HTTP_200_OK)
    else:
        products = Product.objects.all()
        results = [product.to_json() for product in products]
        cache.set('product', results, timeout=CACHE_TTL)
        response['response_time'] = (time.time() - start_time)
        response['from_database'] = True
        response['from_cache'] = False
        response['results'] = results
        return Response(response, status=status.HTTP_201_CREATED)
```

در این view ابتدا سرور بررسی می‌کند که آیا کلید **product** داخل `Cache` سرویس ما که همان `Redis` است وجود دارد یا خیر.<br/>
اگر این کلید وجود داشته باشد، آنگاه داده‌های متناظر را مستقیما از روی `Cache`، با استفاده از دستور زیر فراخوانی می‌کند؛ این عمل باعث می‌شود درخواست سمت دیتابیس نرفته و در نتیجه بار از روی دیتابیس `MySQL` برداشته شود.

```py title=”get data from cache”
cache.get('product')
```

حال اگر کلید **product** داخل `Cache` وجود نداشته باشد، ابتدا لیست تمام محصولات به صورت `Query` از دیتابیس فراخوانی، سپس این مقادیر با دستور زیر در `Cache` ذخیره شده و در انتها نتیجه برای کاربر ارسال می‌شود.

```py title=”set data to cache”
cache.set('product', results, timeout=CACHE_TTL)
```

:::tip نکته آموزشی
این دستور نتیجه **Query** انجام شده بر روی دیتابیس **MySQL** که در متغیر **results** ذخیره شده است را، با کلید متناظر **product** برای مدت زمان `CACHE_TTL` در سرویس **Redis** ذخیره می‌کند تا در درخواست‌های بعدی این داده‌ها از روی **Cache** فراخوانی شوند.
:::

:::important مهم
توجه داشته باشید در برخی مواقع شما نیاز دارید داده برای همیشه در حالت **Cache** شده قرار بگیرد، چرا که احتمال تغییر آن بسیار اندک است و عموما به صورت دستی این تغییرات طبق شرایط خاصی که شما تعیین می‌کنید بر روی **Cache** اعمال می‌شود.
در این مواقع، مقدار **timeout** را می‌توانید برابر با **None** قرار دهید.
:::

:::caution توجه
اگر به اشتباه مقدار **timeout** را برابر با **0** قرار دهید، بدین معنی خواهد بود که داده مورد نظر هیچگاه `Cache` نشود.
:::

در تصویر زیر می‌توانید تفاوت زمان صرف شده برای پاسخدهی به درخواست کاربر با استفاده از سازوکار `Cache` را مشاهده کنید.

![Cached Response](/img/blog/cached-response.png "Cached Response")

همانطور که در تصویر مشخص است، زمان صرف شده برای پاسخدهی به مراتب کمتر از حالت بدون `Cache` است که در آن مستقیما داده‌ها از دیتابیس خوانده می‌شوند.

```http title="مدت زمان پاسخگویی بدون cache"
"response_time": 0.0214864134185791
```

```http title="مدت زمان پاسخگویی با cache"
"response_time": 0.005903005599975586
```

## پایان

در این بلاگ پست با صرف چند دقیقه زمان، هم توانیستم ساختار `Microservices` را تجربه کنیم و هم آنکه توانستیم ویژگی `Cache` را برای سرویس‌ `Backend` فعال کنیم تا هم سرعت، عملکرد و بهینگی سیستم افزایش یابد و هم هزینه‌های محتمل در آینده کاهش پیدا کنند.

:::tip راهنمایی
همچنین شما می‌توانید پروژه کامل این بلاگ پست را از روی [مخزن گیت هاب](https://github.com/fandoghpaas/showcases/tree/main/simple-django-redis) سکوی ابری فندق دریافت و مشاهده کنید.
:::


[redis_site]: https://redis.io/
[django_redis_url]: https://github.com/jazzband/django-redis
[mysql_client]: https://pypi.org/project/mysqlclient/
[django_source_deployment]: https://docs.fandogh.cloud/docs/source-deployments/source-django
[github]: https://github.com/fandoghpaas/showcases/tree/main/simple-django-redis
[managed_services_url]: https://docs.fandogh.cloud/docs/managed-services/managed-services-intro
[redis_managed_services_url]: https://docs.fandogh.cloud/docs/managed-services/redis-managed-service
[mysql_managed_services_url]: https://docs.fandogh.cloud/docs/managed-services/mysql-managed-service
[redis_anchor]: #ایجاد-سرویس-redis-بر-روی-سکوی-ابری-فندق
[mysql_anchor]:  #ایجاد-سرویس-mysql-بر-روی-سکوی-ابری-فندق
[django_anchor]: #ایجاد-پروژه-و-سرویس-django

