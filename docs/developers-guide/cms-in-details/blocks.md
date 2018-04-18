Blocks
======

## Default blocks

Octave CMS comes with the following default blocks:

* Image
* Image gallery
* Line input
* Text editor
* Rich text editor

Blocks' PHP code is located at `vendor/octave/cms-bundle/src/Page/Block` and default TWIG templates are under `vendor/octave/cms-bundle/src/Resources/views/Blocks`.

Let's go ahead and modify **Rich Text Editor** block's template.

### Overriding default block templates

Create `app/Resources/OctaveCMSBundle/views/Blocks` folder in your project. 
That's where Octave CMS will search for block templates first. 
If there is no such folder or there are no relevant block templates in that folder, Octave CMS will fallback to default template location at `vendor/octave/cms-bundle/src/Resources/views/Blocks`.

Default **Rich Text Editor** block's template outputs the text (`<div>{{ content | raw }}</div>`) you entered when editing the page. 
Let's add current page title to the block's output. 

Create an empty file `rich_text_editor.html.twig` in `app/Resources/OctaveCMSBundle/views/Blocks` folder. 
Copy the below lines into the file and save it.    

```html
<h2>{{ octave_current_page() }}</h2>
<div>{{ content | raw }}</div>
```

Refresh the project home page in your browser. Here we go:

![Home page](http://img.octavecms.com/assets/images/developers-guide/07-hello-wolrd-page-title.png)

## Creating a block

Let's imagine we want to publish articles on our website. 
An article has a headline, a date, a short intro, and some body copy. 
  
### Block configuration file

First, create `src/AppBundle/Form`, `src/AppBundle/Page/Blocks`, and `app/Resources/views/Blocks` folders. 
Then create a block configuration file `ArticleType.php` in `src/AppBundle/Form` and copy the below code into the file. 

```php
<?php

namespace AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\DateType;
use Symfony\Component\Form\FormBuilderInterface;
use Octave\CMSBundle\Form\DataTransformer\JSONDataTransformer;
use Ivory\CKEditorBundle\Form\Type\CKEditorType;

class ArticleType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('headline', TextType::class)
            ->add('date', DateType::class)
            ->add('overview', TextareaType::class)
            ->add('text', CKEditorType::class);

        $builder->addModelTransformer(new JSONDataTransformer());
    }
}
```

The above code specifies which controls the block will have, their names and types. 
Based on that information Octave CMS will create a form as soon as we add this block to a page. 

### Block code

Now, let's add some code that takes care of how the block will be rendered in user's browser.
Create a file `ArticleBlock.php` in `src/AppBundle/Page/Blocks` folder. Copy the below code into the file.

```php
<?php

namespace AppBundle\Page\Block;

use AppBundle\Form\ArticleType;
use Octave\CMSBundle\Entity\Block;
use Octave\CMSBundle\Page\Block\AbstractBlock;

class ArticleBlock extends AbstractBlock
{
    const NAME = 'article';
    const LABEL = 'Article';

    /** @var string */
    private $template;

    /**
     * EditorBlock constructor.
     * @param string $template
     */
    public function __construct($template)
    {
        $this->template = $template;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return self::NAME;
    }

    /**
     * @return string
     */
    public function getLabel()
    {
        return self::LABEL;
    }

    /**
     * @return string
     */
    public function getIcon()
    {
        return 'fa fa-file-o';
    }

    /**
     * @return string
     */
    public function getFormType()
    {
        return ArticleType::class;
    }

    /**
     * @return string
     */
    public function getContentTemplate()
    {
        return $this->template;
    }

    /**
     * @param Block $block
     * @return mixed
     */
    public function getContent(Block $block)
    {
        $blockData = json_decode($block->getContent(), true);
        $articleDate = new \DateTime($blockData['date']['date']);
        $blockData['date'] = $articleDate;
        return $blockData;
    }
}
```

### Block template

Create a block template file `article.html.twig` in `app/Resources/views/Blocks` folder. 
Copy the below lines into the file.  

```html
<h2>{{ content.headline }}</h2>
<i>{{ content.date | date('Y-m-d') }}</i>
<p><b><i>{{ content.summary }}</i></b></p>
<p>{{ content.text | raw }}</p>
```

### Registering block

Register your new block in `services.yml` file:

```yaml
    # ...
    
    app.article.page.block:
        class: AppBundle\Page\Block\ArticleBlock
        arguments:
            - ':Blocks:article.html.twig'
        tags:
            - { name: octave.block.type }
```

That's it! The block is now configured and can be added to a page. 

![Article block](http://img.octavecms.com/assets/images/developers-guide/08-article-block.png?a=1)

## Conclusion

A few words on what we've done here. 
First, we've created a block configuration by creating `FormBuilder` object (`src/AppBundle/Form/ArticleType.php`) and adding parameters to it. 
Like you normally do when you are building a form with the help of Symfony's FormBuilder object. 

```php
        $builder
            ->add('headline', TextType::class)
            ->add('date', DateType::class)
            ->add('overview', TextareaType::class)
            ->add('text', CKEditorType::class);
```

The form then is rendered by CMS Page Editor when this block is added to a page. 

>**Note**: _For full list of available Symfony Form types refer to [documentation](https://symfony.com/doc/current/reference/forms/types.html)._

Then, we've created a block class file in `src/AppBudnle/Page/Blocks/ArticleBlock.php`. 
In most cases, when creating a block you set block name, label, and make necessary tweaks to parameter values (in `getContent` method) prior to sending them to the block template. 

```php
    public function getContent(Block $block)
    {
        $blockData = json_decode($block->getContent(), true);
        $articleDate = new \DateTime($blockData['date']['date']);
        $blockData['date'] = $articleDate;
        return $blockData;
    }
```
