First Steps
===========

## Creating your very first Octave CMS page

Start local web server if you did not yet:

    $ bin/console s:r
    
and type `http://img.octavecms.com/admin`. Sign in with user name and password you created during setting up the CMS.

You should see standard Sonata dashboard now.

![Sonata dashboard](http://img.octavecms.com/assets/images/developers-guide/01-sonata-dashboard.png)
 
On the left hand-side menu choose `CMS->Sitemap`.

Drag-and-drop the `Flexible` icon from the toolbar onto `Site tree`.

![Sitemap](http://img.octavecms.com/assets/images/developers-guide/02-create-page.png)

Enter page title (`Home`) and path(`/`).

![Sitemap](http://img.octavecms.com/assets/images/developers-guide/03-create-page-choose-name.png)

Change page status to active.

![Page editor](http://img.octavecms.com/assets/images/developers-guide/04-create-page-set-active.png)

Drag-and-drop the `Editor` icon from the toolbar onto ...

![Page editor](http://img.octavecms.com/assets/images/developers-guide/05-create-page-add-block.png)

and type `Hello world!` into the editor's window. 
Click the `Publish` button.
Make sure you don't have any controllers listening on  `/` route and open `http://img.octavecms.com/` in your browser.

Viola! Your first Octave CMS page is live. 

![Hello world](http://img.octavecms.com/assets/images/developers-guide/06-hello-world.png)

Now it's time to get deep into [details](cms-in-details.md).

