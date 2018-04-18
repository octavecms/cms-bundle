Page Templates
==============

## Page types

You may have already noticed that there are three types of pages in Octave CMS:

* Flexible page
* Text page
* Custom page

We hope you're already familiar with the **Flexible page** type. 
If not, we suggest you start your journey from learning the Octave CMS [Blocks](/docs/developers-guide/cms-in-details/blocks.md) and then return back here. 

## Flexible page

With the **Flexible page** type content editors (and developers too) can create custom web site pages. 
Drag-and-drop of blocks allows to create unique combination of features on any web page.

Let's have a closer look at default template of **Flexible page**. 
The template is located here: `vendor/octave/cms-bundle/src/Resources/views/FlexiblePage/show.html.twig`. 

```twig
{% extends 'OctaveCMSBundle:BasePageTemplate:base_page_template.html.twig' %}
{% block body %}
{{ content | raw }}
{% endblock %}
```

Inside the template you see a standard TWIG commands for extending of base template and replacing its `block body` with the local content. 
You probably want to ask "What is local content?". 
Well, it is content of the blocks you add to a page. 
One one page it could be text, on another text, image, and much more. 
The content could be anything you are allowing content editor to add to a page.
TWIG variable `content` contains output of every block on that page in HTML format.  

But what if you need to add something else to a page without allowing content editors to remove or alter that accidentally? 
Say page header and footer? 
These two components along with a couple of other usually exist on every website page and stay unmodified. 

Then, it is time to override default template with yours.

### Overriding Flexible page template   

First, create an empty file `app/Resources/OcatveCMSBundle/views/FlexiblePage/show.html.twig` and copy the below line into that:  
 
```twig
{{ content | raw }}
```

Now, let's add some code that should appear on every page. 
Normally, you would develop a base template and then extend that to create a custom template for every page. 
For simplicity's sake we will put all the code into one template.

```twig
<html>
    <head>
        <title>Overriding Flexible page template</title>
    </head>
    
    <body>
    
        <header>
            <navigation>
                <a href="#">about</a> | <a href="#">services</a> | <a href="#">contact us</a>  
            </navigation>
        </header>
        
        <article>
            {{ content | raw }}
        </article>
        
        <footer>Copyright (c), 2018</footer>
        
    </body>
</html>
```



## Text page

`vendor/octave/cms-bundle/src/Resources/views/TextPage/show.html.twig`

```yaml
#app/config/config.yml
octave_cms:
    # ...
    text_page_templates:
        default:
            label: 'Default'
            path: 'OctaveCMSBundle:TextPage:show.html.twig'
```



## Custom page

Custom page now has template

## Overriding default page templates
