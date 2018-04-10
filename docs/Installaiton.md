Octave CMS Installation
=======================

## Database setup

Create a database if you don't have one already. 
Octave CMS stores all the content and web site structure in the database. 

## Require CMS bundle with composer

If you already have Symfony-based project, change to project's root folder and require CMS bundle: 

    $ composer reqiure cms-bundle 
 
## Register bundles

Enable the bundle and the bundles the CMS relies on by adding the following lines in `app/AppKernel.php` file:

```php

public function registerBundles()
{
    $bundles = array(
    
        // ...               
        
        // CMS bundles
        new Octave\SitemapBundle\OcatveSitemapBundle(),
        new Ocatve\CMSBundle\OcatveCMSBundle(),
        
        // Sonata bundles & dependencies
        new Sonata\CoreBundle\SonataCoreBundle(),
        new Sonata\BlockBundle\SonataBlockBundle(),
        new Knp\Bundle\MenuBundle\KnpMenuBundle(),
        new Sonata\AdminBundle\SonataAdminBundle(),
        new Sonata\DoctrineORMAdminBundle\SonataDoctrineORMAdminBundle(),
        new FOS\UserBundle\FOSUserBundle(),
        new A2lix\TranslationFormBundle\A2lixTranslationFormBundle(),
        new Knp\DoctrineBehaviors\Bundle\DoctrineBehaviorsBundle(),
        new Ivory\CKEditorBundle\IvoryCKEditorBundle(),

    );
}
```

## Configure framework and bundles

### config.yml

Open `app/config/config.yml` file and add the below lines into the file.

Enable Twig template engine and translator service:
 
```yaml
framework:
    ...
    translator: { fallbacks: ['%locale%'] }
    templating:
        engines: ['twig']
```

Add CMS and Text bundle related configuration parameters: 
```yaml
# Octave CMS Configuration
vide_infra_cms:
    media_upload_path: /uploads/
    media_resized_path: /uploads/resized/
    simple_text_templates:
        default:
            label: 'Default'
            path: 'VideInfraCMSBundle:SimpleText:show.html.twig'
```

> **Note:** _For more information on CMS and Text Editor bundles refer to [CMS developer's guide](docs/developers-guide.md)._

Configure Sonata Project bundles:
```yaml
# Sonata Configuration
sonata_admin:
    dashboard:
        groups:

            CMS:
                label: CMS

            sonata_user:
                label: Users
        
sonata_block:
    default_contexts: [cms]
    blocks:
        sonata.admin.block.admin_list:
            contexts: [admin]
            
```

> **Note:** _For more information on Sonata Admin bundle configuration refer to [Sonata Admin Bundle documentation page](https://symfony.com/doc/master/bundles/SonataAdminBundle/index.html)._

Add configuration for FOS User bundle:
```yaml
fos_user:
    db_driver: orm
    firewall_name: main
    user_class: AppBundle\Entity\User
    from_email:
        address: "%mailer_sender%"
        sender_name: "%mailer_sender_name%"

```

> **Note:** _For more information on configuring FOS User Bundle refer to [documentation](https://symfony.com/doc/current/bundles/FOSUserBundle/index.html)._

Configure A2LiX translation bundle:

```yaml
a2lix_translation_form:
    locales: '%locales%'
```

### parameters.yml

Now open `app/config/parameters.yml` file and enter database connection details:

```yaml
parameters:
    database_host: 127.0.0.1
    database_port: null
    database_name: cms
    database_user: root
    database_password: null

```

and FOS User bundle parameters:
```yaml
parameters:
    # ...
    mailer_sender: exampl@example.com
    mailer_sender_name: CMS
```

## Configure routes

Open `app/config/routing.yml` file and add the following lines:

```yaml
# ...

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
```

## Configure framework security

Open `app/config/security.yml` file and replace content of the file with the one below. 

```yaml
security:

    providers:
        fos_userbundle:
            id: fos_user.user_provider.username

    firewalls:
        # disables authentication for assets and the profiler, adapt it according to your needs
        dev:
            pattern: ^/(_(profiler|wdt)|css|images|js)/
            security: false

        main:
            http_basic: ~

    role_hierarchy:
        ROLE_ADMIN:
            - ROLE_USER
            - ROLE_BLOCK_PAGE_CREATE
            - ROLE_CUSTOM_PAGE_CREATE
            - ROLE_SIMPLE_TEXT_PAGE_CREATE

    encoders:
        FOS\UserBundle\Model\UserInterface: bcrypt

    access_control:
      - { path: ^/admin, role: [ROLE_ADMIN] }
```

## Create User class

This class will be used for supporting HTTP basic authentication into CMS back-end.

```php
<?php

// src/AppBundle/Entity/User.php

namespace AppBundle\Entity;

use FOS\UserBundle\Model\User as BaseUser;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="octave_user")
 */

class User extends BaseUser
{
    /**
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    protected $id;

    public function __construct()
    {
        parent::__construct();
    }
}
```

## Create database

Create CMS database structure. Run the following command: 

    $ bin/console doctrine:schema:update --force

## Install assets

Install bnunles' static assets by running the following command:

    $ bin/console assets:install
    
    
## Create a user CMS 

Create CMS user by running `fos:user:create` command:

    $ bin/console fos:user:create admin admin@example.com adminpassword

Assign `ROLE_ADMIN` to the user you just created:
    
    $ bin/console fos:user:promote admin ROLE_ADMIN
    
    
## It's all set

Now it is time to start local server:

    $ bin/console server:run
    
and get into the CMS - open browser of your choice and navigate to `http://localhost:8000/admin`. Type in username and password of th euser you created before. That's it!
