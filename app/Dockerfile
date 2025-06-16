FROM php:8.2-apache

# Обновление и установка зависимостей
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    && docker-php-ext-install pdo_pgsql gd zip && a2enmod rewrite

# Установка Composer
RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" \
    && php composer-setup.php --install-dir=/usr/local/bin --filename=composer \
    && php -r "unlink('composer-setup.php');"

# Копирование файлов и установка зависимостей
COPY ./app /var/www/html
WORKDIR /var/www/html
COPY ./app/composer.json /var/www/html/
RUN composer install --no-dev --optimize-autoloader

# Создание директории для загрузок
RUN mkdir -p /var/www/html/uploads && chmod 777 /var/www/html/uploads