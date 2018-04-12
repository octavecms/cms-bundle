Developer's Guide
=================

## Basic concepts

Octave CMS comes with basic page templates and collection of features called blocks.  
Page templates are regular TWIG files. 
Blocks are PHP classes with inclusion of CMS specific methods to respond to CMS requests and your logic for building up a web page. 
Blocks also use TWIG templates. You can modify both page and block templates in the way you usually do - extend them, use variables and control structures.
Content editors drag-and-drop blocks on CMS pages to create a unique  

## First steps

### Creating your very first Octave CMS page

Start local web server if you did not yet:

    $ bin/console s:r
    
and type `http://localhost:8000/admin`. Sign in with user name and password you created during setting up the CMS.




## CMS in details

### Default blocks

Octave CMS comes with the following blocks:

* Image
* Image gallery
* Rich text editor
* Text editor

#### Overriding default block templates



### Default page templates

#### Overriding default page templates

### Creating your own blocks



