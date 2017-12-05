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
    ... some repositories
    "vig/cms-bundle": "1.0.0"
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

### Step 3: Configure the VideInfraTextBundle

```yaml
vide_infra_cms:
    media_upload_path: /uploads/
    simple_text_templates:
        default:
            label: 'Default'
            path: '::default.html.twig'

        template2:
            label: 'Empty'
            path: '::empty.html.twig'    
```

Define CMS group in your SonataAdminBundle configuration:
```yaml
sonata_admin:
    ...
    dashboard:
        groups:
            ...
            CMS:
                label: CMS
```

### Step 4: Update DB schema

`php bin/console doctrine:schema:update --force` 

### Step 5: Configure routes

```yaml
vig.cms.bundle:
    resource: "@VideInfraCMSBundle/Resources/config/routing.yml"
```

### Step 6: Configure roles

```yaml
role_hierarchy:
    ROLE_ADMIN:
        - ROLE_USER
        - ROLE_BLOCK_PAGE_CREATE
        - ROLE_CUSTOM_PAGE_CREATE
        - ROLE_SIMPLE_TEXT_PAGE_CREATE
```