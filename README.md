Effective CMS
===

Introducing all-new CMS Symfony bundle by Vide Infra. 
Building web sites on [Symfony framework](https://symfony.com/) never been so easy until now.
The most powerful and easy to use CMS built on top of tools you already know and love [Symfony PHP framework](https://symfony.com/),  
[Sonata Project](https://sonata-project.org/), and [Doctrine ORM](http://www.doctrine-project.org/).

## CMS at a Glance

Vide Infra CMS is both content management and web site development tool. 
It's quite simple tool both content editors and developers can benefit on. 
The tool gives developers freedom to combine standard Symfony framework development approach 
by handling web site page rendering in controllers with management of web site structure with the help of CMS.
Drag-and-drop editors allow to change visual representation of a page and web site tree in a seconds.


### CMS benefits to web site editor:
* drag-ann-drop web site structure management
* drag-and-drop for building web page out of collection of features (blocks)
* media library
* content versions
* access rights

### CMS benefits to developer:
* out of the box controllers and editors for creating new web site features in a few minutes
* adding new features to a web site pages without writing even a line of code  
* focus on development, not content management 
* start building new features right away - no excess learning required

## Installation

If you are not familiar with the CMS yet we would suggest you to install our [demo site](https://github.com/cms) first.   

### Requirements 

Requirements are the same as for standard Symfony-based project. 
Minimal Symfony, PHP, and MySQL versions:

* Symfony >= 3.4
* PHP >= 7.1
* Tested on MySQL 5.6 server but should work with other databases as well thanks to Doctrine

### Create a database

Create a database if you don't have one already. 
CMS stores all the content and web site structure in the database. 

### Require CMS bundle with composer

If you already have Symfony-based project, change to project's root folder and require CMS bundle: 

    $ composer requre cms-bundle 
 
To create a new Symfony project with CMS bundle installed:
 
    $ composer create-project XXX/ --prefer-dist 

### Configure Symfony framework

Enable Twig template engine:
 
```yaml
# app/config/config.yml
framework:
    ...
    templating:
        engines: ['twig']
```

### Enable the bundle

Enable the bundle and the bundles the CMS relies on by adding the following lines in AppKernel.php file:

```php
// app/AppKernel.php

public function registerBundles()
{
    $bundles = array(
    
        // ...                
        
        // CMS bundles
        new VideInfra\SitemapBundle\VideInfraSitemapBundle(),
        new VideInfra\CMSBundle\VideInfraCMSBundle(),
        new VideInfra\TextBundle\VideInfraTextBundle(),
        new VideInfra\ToolsBundle\VideInfraToolsBundle()

    );
}
```

### Configure the bundle

Add CMS and Text bundle related configuration parameters into config.yml file: 
```yaml
# app/config/config.yml
vide_infra_cms:
    media_upload_path: /uploads/
    media_resized_path: /uploads/resized/
    simple_text_templates:
        default:
            label: 'Default'
            path: 'VideInfraCMSBundle:SimpleText:show.html.twig'
```

```yaml
# app/config/config.yml
vide_infra_text:
    default_locale: '%locale%'
    locales: ['%locale%']
    groups:
        footer:
            label: 'Footer'
```
> **Note:** _For more information on CMS and Text Editor bundles refer to [CMS developer's guide](docs/developers-guide.md)._

### Install and configure Sonata Project bundles

Require the bundles

    $ composer require sonata-project/admin-bundle
    $ composer require sonata-project/user-bundle

Enable Sonata bundles in AppKernel.php:

```php
// app/AppKernel.php

public function registerBundles()
{
    $bundles = array(
    
    // ...
    
    // Sonata bundles
    new Sonata\CoreBundle\SonataCoreBundle(),
    new Sonata\BlockBundle\SonataBlockBundle(),
    new Knp\Bundle\MenuBundle\KnpMenuBundle(),
    new Sonata\AdminBundle\SonataAdminBundle(),
    new Sonata\DoctrineORMAdminBundle\SonataDoctrineORMAdminBundle(),
    new Sonata\UserBundle\SonataUserBundle(),
    new Sonata\EasyExtendsBundle\SonataEasyExtendsBundle(),
```

Configure Sonata Project bundles:
```yaml
# app/config/config.yml
sonata_admin:
    dashboard:
        groups:
            CMS:
                label: CMS

            sonata_user:
                label: Users
    templates:
        layout:  ':Admin:standard_layout.html.twig' 
        
sonata_block:
    default_contexts: [cms]
    blocks:
        sonata.admin.block.admin_list:
            contexts: [admin]
            
sonata_user:
    security_acl: true
    manager_type: orm
    class:
        user: Application\Sonata\UserBundle\Entity\User
        group: Application\Sonata\UserBundle\Entity\Group
```

> **Note:** _For more information on Sonata Admin bundle configuration refer to [Sonata Admin Bundle documentation page](https://symfony.com/doc/master/bundles/SonataAdminBundle/index.html)._

Add CMS menu group to SonataAdminBundle configuration:
```yaml
# app/config/config.yml
sonata_admin:
    ...
    dashboard:
        groups:
            ...
            CMS:
                label: CMS
```



### Enable and configure additional bundles

Enable additional that are required by the CMS bundle:
```php
// app/AppKernel.php

public function registerBundles()
{
    $bundles = array(
    
    // ...

    new FOS\UserBundle\FOSUserBundle(),
    new A2lix\TranslationFormBundle\A2lixTranslationFormBundle(),
    new Knp\DoctrineBehaviors\Bundle\DoctrineBehaviorsBundle(),
    new Ivory\CKEditorBundle\IvoryCKEditorBundle(),
            
```

Add configuration for FOS User bundle:

```yaml
# app/config/config.yml
fos_user:
    db_driver: orm
    firewall_name: main
    user_class: Application\Sonata\UserBundle\Entity\User
    from_email:
        address: "%mailer_sender%"
        sender_name: "%mailer_sender_name%"

    group:
        group_class:   Application\Sonata\UserBundle\Entity\Group
        group_manager: sonata.user.orm.group_manager

    service:
        user_manager: sonata.user.orm.user_manager
```

```yaml
# app/config/parameters.yml
parameters:

    # ...

    mailer_sender: exampl@example.com
    mailer_sender_name: CMS
```

### Update DB schema

    $ bin/console doctrine:schema:update --force

### Configure routes

```yaml
# app/config/routing.yml
vig.cms.bundle:
    resource: "@VideInfraCMSBundle/Resources/config/routing.yml"

admin:
    resource: '@SonataAdminBundle/Resources/config/routing/sonata_admin.xml'
    prefix: /admin

_sonata_admin:
    resource: .
    type: sonata_admin
    prefix: /admin
    
fos_user:
    resource: "@FOSUserBundle/Resources/config/routing/all.xml"
    prefix: /admin

sonata_user_admin_security:
    resource: '@SonataUserBundle/Resources/config/routing/admin_security.xml'
    prefix: /admin

sonata_user_admin_resetting:
    resource: '@SonataUserBundle/Resources/config/routing/admin_resetting.xml'
    prefix: /admin/resetting
```

### Configure roles

```yaml
# app/config/security.yml
role_hierarchy:
    ROLE_ADMIN:
        - ROLE_USER
        - ROLE_BLOCK_PAGE_CREATE
        - ROLE_CUSTOM_PAGE_CREATE
        - ROLE_SIMPLE_TEXT_PAGE_CREATE
```



If you have any problems installing CMS and all other bundles, we suggest you to install CMS demo site and refer to its configuration.
