---
title: چرخه CI/CD با استفاده از گیت‌لب و فندق
author: سکوی ابری فندق
author_image_url: /img/fandogh.png
tags: [fandogh_paas, docker, paas, gitlab, ci_cd]
image: /img/thumbs/blog-thumb-gitlabci.png
---

داشتن چرخه CI/CD خودکار در یک پروژه امروزه تبدیل به یک ضرورت شده و اغلب تیم‌ها با استفاده از ابزار‌های موجود در مراحل ابتدایی پروژه چرخه CI/CD را راه‌اندازی می‌کنند و از مزایای آن بهره می‌برند.
در این بلاگ پست به طور کوتاه نحوه راه‌اندازی gitlab-ci در یک پروژه  را بررسی می‌کنیم، سناریو مورد نظر ما به این ترتیب است که :

![Gitlab CI/CD](/img/blog/gitlab-ci-cd.png "Gitlab CI/CD")

<!--truncate-->

 1. با هر بار push به برنچ develop یک چرخه ci/cd آغاز می‌شود.
 2. در استیج اول تست‌ها اجرا شوند.
 3. در استیج دوم سورس پروژه توسط داکر بیلد می‌شود و روی رجیستری گیت‌لب push می‌شود.
 4. در استیج سوم باید ایمیج ساخته شده روی فندق دیپلوی شود.

## Gitlab registry چیست؟
گیت‌لب امکانات زیادی در اختیار توسعه‌دهنده‌ها قرار می‌دهد که یکی از آنها یک [registry خصوصی داکر][docker_doc] ایمیج‌ها است.<br/><br/>
شما می‌توانید به اندازه محدودیت‌ اکانت رایگان، ایمیج بسازید و روی آن ایمیج تگ‌های مختلف ایجاد کنید، مثلا در این مثال ما یک ایمیج با تگ staging می‌سازیم تا بتوانیم آن ایمیج را به طور خودکار توسط فندق دریافت کنیم و اجرا کنیم.

## Gitlab-ci چیست؟
یکی دیگر از امکانات رایگان گیت‌لب، ابزاری است به نام gitlab-ci که به کمک آن می‌توانید سناریو‌های مختلف برای ci/cd ایجاد کنید.

:::note توجه
ci/cd مخفف continues integration/continues delivery می‌باشد، به این معنی که به طور مستمر و خودکار  کامپوننت‌های نرم‌افزاری تولید شده، تست شوند، دیپلوی شوند و بعد از دیپلوی با هم Integrate شوند.<br/>
داشتن یک چرخه ci/cd ضمن اینکه بسیاری از امور تکراری را حذف می‌کند که موجب افزایش سرعت توسعه و تحویل می‌شود ، کیفیت تولید نرم‌افزار را با اجرا مداوم تست‌ها بالا می‌برد.<br/>
طراحی یک چرخه ci/cd کارا می‌تواند زمینه را برای اجرای بسیاری از سیاست‌های کیفی کد تولید شده فراهم کند، که بدون وجود آن باید به طور دستی انجام شود.
:::

سرویس gitlab-ci به طور کامل از طریق یک فایل کانفیگ به نام `gitlab-ci.yml.` )به نقطه ابتدای نام فایل توجه کنید( و تنظیمات پنل گیتلب قابل کنترل و برنامه‌ریزی است که در مراحل آینده دقیق‌تر مورد بررسی قرار می‌گیرند.

## قدم اول: ساخت SECRET برای گرفتن image
برای اینکه فندق بتواند ایمیج‌های شما را جهت اجرا از روی رجیستری خصوصی شما از گیت‌لب دریافت کند لازم است که یک SECRET در فندق ایجاد کنید که بعدا برای manifest هایی که می‌نویسیم مورد استفاده قرار می‌گیرند.<br/><br/>
برای این منظور [ابتدا باید یک deploy token در پنل گیت‌لب بسازیم][gitlab_token]، که در نهایت  یک username و یک deploy-token در اختیار شما قرار می‌دهد.<br/>
اگر داکر روی سیستم نصب دارید می‌توانید همین الان تست کنید ببینید که اطلاعات داده شده درست کار می‌کنند یا نه مطابق [این قسمت][gitlab_images] در مستندات گیت‌لب پیش برید.
با داشتن username و deploy-token ای که گیت‌لب طی فرایند ساخت deploy-token  در اختیار شما قرار داد می‌توانیم [یک سیکرت در فندق بسازیم][fandogh_secret]:

```bash
fandogh  secret create  \
          --name gitlab-cred \
          -t docker-registry \
          -f server=registry.gitlab.com \
          -f username=USERNAME \
          -f password=DEPLOY_TOKEN
```

:::important مهم
**نکته**: توجه داشته باشید به جای USERNAME نباید username گیت‌لب خودتان را
قرار دهید، بلکه یوزرنیمی که گیت‌لب حین ساخت deploy-token در اختیارتان
گذاشت را باید استفاده کنید.
:::

:::note توجه
نامی که برای سیکرت انتخاب کردید را به یاد داشته باشید بعدا به آن
نیاز داریم.
:::

حالا اگر لیست SECRET ها را چک کنید `fandogh secret list‍` باید نام سیکرت تازه ساخته شده را به شما نمایش دهد.

## قدم دوم: نوشتن manifestهای مورد نیاز
برای پیروی از اصول [IaC][IaC_link] فندق طوری طراحی شده که شما می‌توانید نحوه دیپلوی یک سرویس را توسط یک فایل توصیف کنید، برای اطلاعات بیشتر [مستندات مانیفست سرویس][service_manifest] را مطالعه کنید.<br/><br/>
برای شروع نیاز داریم که مانیفست‌های مورد نیاز را بنویسیم و در داخل ریپو پروژه قرار دهیم، ممکن است لازم باشد برای محیط‌های مختلف مثل production یا staging مانیفست‌های مختلف بنویسید.

:::tip راهنمایی
یکی از قابلیت‌های مهم مانیفست [قابلیت داشتن متغیر][env] است، یعنی می‌توان هر
قسمتی از مانیفست را به جای اینکه مستقیما مقدار داد از یک متغیر استفاده
کرد و مقدار دهی به متغیر را هنگام دیپلوی انجام داد.
:::

به عنوان مثال مانیفست زیر یک نمونه ExternalService است:

```yaml title="svc_deployment.yml"
kind: ExternalService
name: hello-world
spec:
  image: ${IMAGE_URL}:${TAG}
  image_pull_policy: Always
  image_pull_secret: $SEC_NAME
  env:
    - name: DEBUG
      value: 1
    - name: API_KEY
      value: ${API_KEY}

  domains:
     - name: hello-world.my-company.com
     - name: hw.my-company.com
```

نکات مهم در مورد این مانیفست:

 - چون این فایل قرار است داخل ریپوی پروژه قرار بگیرد، یکسری از اطلاعات را [تبدیل به متغیر کردیم][env_two] که عبارتند از:

	 - IMAGE_URL: ادرس محل قرار گرفتن ایمیج را متغیر در نظر گرفتیم که اگر بعدا داکر رجیستریی که پروژه در آن پوش می‌شود تغییر کرد، نیاز به تغییر مانیفست نباشد.
	 - TAG: تگی که باید از رجیستری pull شود نیز در این مانیفست یک متغیر است که باید هنگام دیپلوی مشخص شود.
	 - SEC_NAME: برای اینکه فندق بتواند ایمیج را از رجیستری خصوصی شما بخواند نیاز به اطلاعات لاگین دارد، به همین منظور ما در قدم قبلی یک سیکرت ساختیم که حاوی این اطلاعات بود، چون ممکن است شما رجیستری خود را جا به جا کنید یا چند رجیستری داشته باشید، نام این سیکرت را به صورت متغیر در آوردیم که هنگام دیپلوی بتوان با نام‌های مختلف بسته به داکر رجیستری انتخابی دیپلوی انجام داد.
	 - یکی از پارامتر‌های env هم به نام API_KEY هم به عنوان مثال به متغیر تبدیل شده که در این مثال نشان دهیم می‌توانیم در محیط‌های مختلف پروژه را با env variable های متفاوت دیپلوی کنید.
	 - روشی که ما در این بلاگ پست بررسی می‌کنیم همیشه ایمیج‌های جدید را تحت عنوان یک TAG ثابت در رجیستری پوش می‌کند، بنابر این بین ورژن‌های مختلف تگ ایمیج تغییری نمی‌کند، بنابراین حتما باید `image_pull_policy` مقدار `Always‍` داشته باشد.

در پایان این مرحله شما باید مانیفست‌های مورد نیاز خود را بنویسید و در ریپوی پروژه قرار دهید.
به عنوان مثال ما این فایل‌ها را در مسیر `deployment/fandogh-manifests` قرار می‌دهیم.

## قدم سوم: نوشتن اسکریپت‌های لازم
قبل از اینکه بتوانیم به سراغ فایل کانفیگ `gitlab-ci.yml.` برویم یک سری اسکریپت نیاز داریم که امور مورد نیاز ما مثل بیلد کردن پروژه، تست کردن پروژه و از همینطور پابلیش کردن روی فندق را انجام دهند.
ما برای این منظور، در این مثال، دو فایل زیر را ایجاد می‌کنیم و داخل ریپوی پروژه قرار می‌دهیم:
 1. برای اجرای تست‌های پروژه: `deployment/scripts/run-tests.sh`
 2. برای دیپلوی کردن پروژه: `deployment/scripts/deploy-to-fandogh.sh`

:::note توجه
این اسکریپت‌ها حین اجرا ممکن است نیاز به یک‌سری پارامتر داشته باشند، نگران نباشید این موضوع را جلوتر توضیح میدهیم.<br/>
توجه داشته باشید این اسکریپت‌ها باید executable باشند، می‌توانید با دستور `chmod` آنها رو قابل اجرا کنید.
:::

برای اسکریپت تست باید با توجه به تست فریمورکی که استفاده می‌کنید)استفاده می‌کنید؟( اسکریپت مورد نیاز را بنویسید.<br/>
مثلا برای لاراول اگر از PhpUnit استفاده می‌کنید می‌توانید به این شکل اسکریپت رو بنویسید:

```bash
#!/bin/bash
php vendor/phpunit/phpunit/phpunit
```

یا برای جنگو:

```bash
#!/bin/bash
python manage.py test
```

حالا به یک اسکریپت دیگر برای دیپلوی روی فندق احتیاج داریم، با فرض اینکه [Fandogh CLI][fandogh_cli_github] وجود دارد می‌توانیم به این شکل اسکریپت را نوشت:

```bash
#!/bin/bash
fandogh service apply \
 -f ../fandogh-manifests/service-manifest.yaml \
 -p IMAGE_URL \
 -p TAG \
 -p SEC_NAME \
 -p API_KEY
```

این اسکریپ مطابق مانیفستی که برای مثال در قدم دوم آماده کردیم نوشته شده، همون طور که می‌بینید از طریق `p-` پارامتر‌های مورد نیاز مانیفست مشخص شده‌اند.<br/><br/>
ما می‌توانیم در تنظیمات پنل gitlab-ci تمام پارامترهایی که در بالا استفاده کردیم را فراهم کنیم تا در زمان اجرا در envای که اسکریپت در آن اجرا می‌شود وجود داشته باشند، و همان طور که [در مستندات قید شده][env_two] fandogh cli در صورتی که این پارامتر‌ها را در env پیدا کنید استفاده می‌کند.

## قدم چهارم آماده کردن gitlab-ci.yml.

در این مرحله باید یک فایل دقیقا با نام **gitlab-ci.yml.** )به نقطه ابتدای نام فایل توجه کنید( در اولین سطح repository گیت خود ایجاد کنید.<br/><br/>
این فایل حاوی تنظیمات مورد نیاز جهت پیکربندی سناریو CI/CD می‌باشد، توضیحات کامل مربوط به قسمت‌های مختلف فایل را می‌توانید [در اینجا][gitlab_yaml] مطالعه کنید، مثال‌های بسیار هم [خود گیت‌لب از قبل آماده کرده][gitlab_samples] که می‌توانید بررسی کنید و در صورتی که به مورد استفاده شما نزدیک است ویرایش کرده و استفاده کنید.<br/><br/>
ما برای سناریویی که در این بلاگ پست دنبال می‌کنیم، یک فایل gitlab-ci می‌نویسیم:
ابتدا باید stage های مورد نیاز را لیست کنیم، هر stage به طور مجزا اجرا می‌شود و استیج‌ها نسبت به هم مستقل هستند:

```yaml
stages:  
 - test  
 - push  
 - deploy
```

همانطور که گفته شد، هر stage به طور مجزا اجرا می‌شود و در صورتی که با موفقیت به اتمام برسد stage بعدی آغاز می‌شود، هر stage را می‌توان به شکل یک Docker container نگاه کرد که آغاز می‌شود به طور کامل اجرا می‌شود و به انتها می‌رسد.<br/><br/>
ما باید در فایل  gitlab-ci به طور کامل توصیف کنیم که در هر stage محیط اجرا به چه شکل است و چه عملیاتی باید انجام شود.

### Test stage

به عنوان مثال اگر عملیات تست قرار است تست‌های یک پروژه جنگو را اجرا کند باید به این شکل stage تست را پیکربندی کرد:

```yaml
test:  
	stage: test  
	image: python:3.5  
	variables:  
		ENV_VAR1: VALUE1  
		ENV_VAR2: VALUE2  
		ENV_VAR3: VALUE3  
	script:  
		- pip install -r test-requirements.txt  
		- ./deployment/scripts/run-tests.sh
	only:  
		- develop
```

نکته مهم در مورد پیکربندی هر stage انتخاب image است، اگر اجرای تست‌های شما نیاز به پایتون دارد، باید از ایمیج مناسب پایتون استفاده کنید. مثلا ما اینجا از `python:3.5` استفاده کردیم که در داکرهاب موجود است، شما هم می‌توانید ایمیج دلخواه خود را از داکرهاب پیدا کنید و از آن استفاده کنید.
به عنوان مثالی دیگر می‌توانیم stage تست یک پروژه Laravel را به این شکل بنویسیم:

```yaml
test:
	stage: test
	image: php:7.1
	variables:
		ENV_VAR1: VALUE1
		ENV_VAR2: VALUE2
		ENV_VAR3: VALUE3
	script:
		- cp .env.example .env
		- composer install
		- php artisan key:generate
		- php artisan migrate
		- vendor/bin/phpunit
	only:
      - develop
```

### Build and push stage
در این استیج می‌خواهیم، از روی سورس پروژه یک داکر ایمیج build کنیم و در رجیستری gitlab پوش کنیم.<br/><br/>
stage بعدی به این شکل پیکربندی می‌شود:

```yaml
push:  
	stage: push  
	image: docker:latest  
	services:  
		- docker:dind  
	script:  
		- docker login -u $CI_DEPLOY_USER -p $CI_DEPLOY_PASSWORD $CI_REGISTRY  
		- docker build --pull -t $IMAGE_URL:$TAG .  
		- docker push $IMAGE_URL:$TAG  
  only:  
		- develop
```

در این stage ما از ایمیج docker استفاده کردیم چون به docker برای بیلد و پوش کردن تصویر احتیاج داشتیم.<br/><br/>
اگر به قسمت اسکریپت‌ها دقت کنید در سه مرحله، ابتدا لاگین کردیم سپس ایمیج را build کردیم و در نهایت به داخل رجیستری پوش کردیم.<br/><br/>
یک نکته مهم در خصوص خط اول اسکریپت‌ها یعنی docker login وجود دارد، همان طور که مستندات گیت‌لب در [اینجا توضیح داده][gitlab_deploy_token] پارامتر‌های `$CI_DEPLOY_USER` `CI_DEPLOY_PASSWORD` و `CI_REGISTRY` به طور خودکار توسط گیت‌لب ست می‌شوند، بنابراین نیازی نیست شما آنها را مشخص کنید.<br/><br/>
اما در خصوص نحوه مقدار دهی به متغیر‌هایی مثل `IMAGE_URL‍‍` و `TAG‍` که در این استیج مورد استفاده قرار گرفته‌اند و یا دیگر متغیر‌هایی که در استیج‌های دیگر مورد استفاده قرار گرفته‌اند جلو‌تر بیشتر توضیح می‌دهیم.

### Deploy on fandogh stage
آخرین stage مورد نیاز stageای است برای دیپلوی کردن سرویس روی فندق که به این شکل پیکربندی می‌شود:

```yaml
deploy:  
	stage: deploy  
	image: python:3.5  
	variables:  
		COLLECT_ERROR: 1  
	script:  
		- pip install fandogh_cli --upgrade  
		- fandogh login --username $FAN_USR --password $FAN_PASS  
		- ./deployment/scripts/deploy-to-fandogh.sh 
	only:  
  - develop
```

در این stage ما **باید** از image مربوط به `python:3.5‍` استفاده کنیم چون نیاز داریم در محیط اجرای این stage حتما fandogh-cli را نصب کنیم.<br/><br/>
بنابر این به عنوان اولین قدم در اسکریپت‌ها با استفاده از pip اخرین نسخه از fandogh_cli را نصب کردیم سپس با دستور `fandogh login‍` در فندق لاگین می‌کنیم و در نهایت اسکریپت مربوط به دیپلوی رو فندق را اجرا می‌کنیم.<br/><br/>
به چند نکته مهم توجه داشته باشید:
 - حتما باید در قسمت variables به متغیر COLLECT_ERROR مقدار دهی کنید، درغیر اینصورت Fandogh CLI در اولین اجرا قبل از هر کاری برای جمع‌آوری خطاها از شما اجازه می‌گیرد که این موضوع موجب اشکال در اجرای خودکار دستورات می‌شود. در این پیکربندی بخصوص من مقدار این متغیر را 1 در نظر گرفتم که خطاها برای فندق ارسال شود، در صورت تمایل می‌توانید مقدار 0 برای آن در نظر بگیرید.
 - نکته دوم متغیر‌های `FAN_USR` و `FAN_PASS`  است که در مرحله آخر ‌آن‌ها را در پنل گیت‌لب مشخص می‌کنیم.

با اضافه کردن این بخش عملا کل پیکربندی gitlab-ci به اتمام رسید و فایل کامل به این شکل است:

```yaml
stages:
 - test
 - push
 - deploy

test:
	stage: test
	image: php:7.1
	variables:
		ENV_VAR1: VALUE1
		ENV_VAR2: VALUE2
		ENV_VAR3: VALUE3
	script:
		- cp .env.example .env
		- composer install
		- php artisan key:generate
		- php artisan migrate
		- vendor/bin/phpunit
	only:
 		- develop

push:
	stage: push
	image: docker:latest
	services:
		- docker:dind
	script:
		- docker login -u gitlab-ci-token -p $CI_BUILD_TOKEN $CI_REGISTRY
		- docker build --pull -t $IMAGE_URL:$TAG .
		- docker push $IMAGE_URL:$TAG
  only:
		- develop


deploy:
	stage: deploy
	image: python:3.5
	variables:	
		COLLECT_ERROR: 1
	script:
		- pip install fandogh_cli --upgrade
		- fandogh login --username $FAN_USR --password $FAN_PASS
		- ./deployment/scripts/deploy-to-fandogh.sh
	only:
		- develop
```

:::caution نکته
**نکته خیلی مهم** حتما با استفاده از ابزاری مثل [json2yaml](https://www.json2yaml.com/) صحت فرمت yaml خود را بررسی کنید، چون خطاهای عجیب و غریبی ممکن است در صورت اشتباه بودن فرمت yaml رخ دهد.<br/> 
نکته مهم دیگر اینکه تمام این stage ها فقط زمانی اجرا می‌شوند که کامیت
جدیدی روی برنچ develop صورت بگیرد، شما می‌توانید با تغییر نام برنچ
سناریو‌های دیگر مثل ریلیز خودکار را هم پیاده‌ کنید.
:::

## قدم آخر ست‌کردن Environment variableها
در تمام stage ها ممکن است از متغیر‌هایی استفاده کرده باشید که نیاز باشد قبل از اجرای آن stage آن متغیر‌ها مشخص شده باشند.<br/><br/>
به این منظور به گیت‌لب لاگین کنید و در قسمت settings مربوط به repository به بخش CI/CD رفته و سپس Environment Variables را انتخاب کنید.<br/><br/>
در این جا می‌توانید تمام متغیر‌های مورد نیاز خود را مشخص کنید، در این مثالی که با هم انجام دادیم لازم است این متغیر‌ها را مشخص کنیم:
- FAN_USR : نام کاربری شما در فندق
- FAN_PASS: رمزعبور شما در فندق
- IMAGE_URL: آدرس ایمیجی در گیت‌لب رجیستری، مثلا ‍`registry.gitlab.com/myusername/backend`
- TAG: تگی که برای بیلد‌های CI/CD خود مدنظر دارید، مثلا staging
- SEC_NAME: نامی که برای سیکرتی که در قدم اول ساختید، مثلا ما اینجا اسمش رو `gitlab-cred` گذاشتیم.
و هر پارامتر دیگری که حین دیپلوی یا اجرای تست‌ها مورد نیاز باشد.<br/><br/>
امیدوارم از این آموزش استفاده کرده باشید، در صورتی که نیاز که برای راه‌اندازی چرخه CI/CD خود روی فندق به مشکل برخوردید حتما با ما تماس بگیرید.



[docker_doc]: https://docs.docker.com/registry/introduction/
[gitlab_token]: https://docs.gitlab.com/ee/user/project/deploy_tokens/
[gitlab_images]: https://docs.gitlab.com/ee/user/project/deploy_tokens/#read-container-registry-images
[fandogh_secret]: https://docs-v2.fandogh.cloud/docs/secrets/secret
[IaC_link]: https://en.wikipedia.org/wiki/Infrastructure_as_code
[service_manifest]: https://docs-v2.fandogh.cloud/docs/services/service-manifest
[env]: https://docs-v2.fandogh.cloud/docs/services/service-manifest#%D9%82%D8%A7%D8%A8%D9%84%DB%8C%D8%AA-%D8%A7%D8%B3%D8%AA%D9%81%D8%A7%D8%AF%D9%87-%D8%A7%D8%B2-%D9%85%D8%AA%D8%BA%DB%8C%D8%B1-%D8%AF%D8%B1-manifest
[env_two]: https://docs-v2.fandogh.cloud/docs/services/service-manifest#%D9%82%D8%A7%D8%A8%D9%84%DB%8C%D8%AA-%D8%A7%D8%B3%D8%AA%D9%81%D8%A7%D8%AF%D9%87-%D8%A7%D8%B2-%D9%85%D8%AA%D8%BA%DB%8C%D8%B1-%D8%AF%D8%B1-manifest
[fandogh_cli_github]: https://github.com/fandoghpaas/fandogh-cli
[gitlab_yaml]: https://docs.gitlab.com/ee/ci/yaml/
[gitlab_samples]: https://docs.gitlab.com/ee/ci/examples/
[gitlab_deploy_token]: https://gitlab.com/help/user/project/deploy_tokens/index#gitlab-deploy-token
