VideInfraCMSBundle
===

## Installation

### Step 1: Download VideInfaCMSBundle using composer

Add a custom git repository to your composer.json

```json
"repositories": [
        {
            "type": "git",
            "url": "https://git.videinfra.net/vig-bundles/cms.git"
        }
    ],
```

Require the bundle

```json
"require": {
    ... 
    "vig/cms-bundle": "^1.0.0"
}
```

And run `composer update`.

### Step 2: Enable the bundle

Enable the bundle in the kernel:

```php
<?php
// app/AppKernel.php

public function registerBundles()
{
    $bundles = array(
        // ...                
        new A2lix\TranslationFormBundle\A2lixTranslationFormBundle(),
        new Knp\DoctrineBehaviors\Bundle\DoctrineBehaviorsBundle(),
        new Ivory\CKEditorBundle\IvoryCKEditorBundle(),
        
        new VideInfra\CMSBundle\VideInfraCMSBundle(),
        // ...
    );
}
```

### Step 3: Configure Sonata Admin Bundle

Follow instructions at [Sonata Admin Bundle documentation page](https://symfony.com/doc/master/bundles/SonataAdminBundle/index.html).

### Step 4: Configure the VideInfraCMSBundle

```yaml
# app/config/config.yml
vide_infra_cms:
    media_upload_path: /uploads/
    simple_text_templates:
        default:
            label: 'Default'
            path: 'VideInfraCMSBundle:SimpleText:show.html.twig'
```

Define CMS group in your SonataAdminBundle configuration:
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

### Step 5: Update DB schema

`php bin/console doctrine:schema:update --force` 

### Step 6: Configure routes

```yaml
# app/config/routing.yml
vig.cms.bundle:
    resource: "@VideInfraCMSBundle/Resources/config/routing.yml"
```

### Step 7: Configure roles

```yaml
# app/config/security.yml
role_hierarchy:
    ROLE_ADMIN:
        - ROLE_USER
        - ROLE_BLOCK_PAGE_CREATE
        - ROLE_CUSTOM_PAGE_CREATE
        - ROLE_SIMPLE_TEXT_PAGE_CREATE
```