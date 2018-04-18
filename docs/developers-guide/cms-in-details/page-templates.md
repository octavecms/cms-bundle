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



The default **Flexible page** template is located here: `vendor/octave/cms-bundle/src/Resources/views/FlexiblePage/show.html.twig`. 


```yaml
#app/config/config.yml
octave_cms:
    # ...
    flexible_page_template:
        path: 'OctaveCMSBundle:FlexiblePage:show.html.twig'
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
